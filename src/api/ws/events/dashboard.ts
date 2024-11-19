import { DataDBModel } from "@/models/data"
import { DataType } from "@/models/data.types"
import mongoose from "mongoose"
import { WSDashboardEventDashboard } from "./dashboard.types"
import { WSBaseEvent } from "./event"

export class WSDashboardEvent extends WSBaseEvent {
	private dataChangeStream: mongoose.mongo.ChangeStream | null = null

	async on() {
		this.socket.on("dashboard", async () => {
			// Initial dashboard data emit
			await this.prepareAndEmitDashboardData()

			// Setup change stream to watch for data updates
			this.dataChangeStream = DataDBModel.watch(
				[
					{
						$match: {
							"fullDocument.user_id": this.userID,
							operationType: { $in: ["insert", "update", "replace", "delete"] },
						},
					},
				],
				{ fullDocument: "updateLookup" }
			)

			this.dataChangeStream.on("change", async () => {
				await this.prepareAndEmitDashboardData()
			})
		})
	}

	private async prepareAndEmitDashboardData() {
		const now = Date.now()
		const oneDayAgo = now - 24 * 60 * 60 * 1000
		const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

		// Fetch recent email data
		const recentEmails = await DataDBModel.find({
			user_id: this.userID,
			type: { $in: [DataType.EMAIL_RECEIVED, DataType.EMAIL_SENT] },
			date_created: { $gte: oneWeekAgo },
		}).sort({ date_created: -1 })

		const dashboardData: WSDashboardEventDashboard = {
			vitals: {
				unreadCount: await this.getUnreadCount(),
				averageDeliveryTime: await this.calculateAverageDeliveryTime(
					recentEmails
				),
				emailVolumeChart: await this.generateEmailVolumeChart(recentEmails),
			},
			contentStats: {
				priorityDistribution: await this.calculatePriorityDistribution(
					recentEmails
				),
				categoryDistribution: await this.calculateCategoryDistribution(
					recentEmails
				),
				labelDistribution: await this.calculateLabelDistribution(recentEmails),
				customQuery: {
					query: "last_24_hours",
					results: await this.getCustomQueryResults(oneDayAgo),
				},
			},
			peopleStats: await this.calculatePeopleStats(recentEmails),
		}

		this.socket.emit("dashboard", dashboardData)
	}

	private async getUnreadCount(): Promise<number> {
		const unreadEmails = await DataDBModel.countDocuments({
			user_id: this.userID,
			type: DataType.EMAIL_RECEIVED,
			"data.is_read": false,
		})
		return unreadEmails
	}

	private async calculateAverageDeliveryTime(
		recentEmails: any[]
	): Promise<number> {
		if (recentEmails.length === 0) return 0
		const deliveryTimes = recentEmails
			.filter((email) => email.data.delivery_time)
			.map((email) => email.data.delivery_time)
		return deliveryTimes.length > 0
			? deliveryTimes.reduce((acc, time) => acc + time, 0) /
					deliveryTimes.length
			: 0
	}

	private async generateEmailVolumeChart(recentEmails: any[]) {
		const timeRange = "week" as const
		const volumeData = recentEmails.reduce((acc: any[], email) => {
			const date = new Date(email.date_created)
			const timestamp = date.toISOString().split("T")[0]
			const existingEntry = acc.find((entry) => entry.timestamp === timestamp)

			if (existingEntry) {
				existingEntry.count++
			} else {
				acc.push({ timestamp, count: 1 })
			}
			return acc
		}, [])

		return {
			data: volumeData,
			timeRange,
		}
	}

	private async calculatePriorityDistribution(recentEmails: any[]) {
		return {
			high: recentEmails.filter((email) => email.data.priority === "high")
				.length,
			medium: recentEmails.filter((email) => email.data.priority === "medium")
				.length,
			low: recentEmails.filter((email) => email.data.priority === "low").length,
		}
	}

	private async calculateCategoryDistribution(recentEmails: any[]) {
		const categories = new Map<string, number>()
		recentEmails.forEach((email) => {
			if (email.data.categories) {
				email.data.categories.forEach((category: string) => {
					categories.set(category, (categories.get(category) || 0) + 1)
				})
			}
		})
		return Array.from(categories.entries()).map(([category, count]) => ({
			category,
			count,
		}))
	}

	private async calculateLabelDistribution(recentEmails: any[]) {
		const labels = new Map<string, number>()
		recentEmails.forEach((email) => {
			if (email.data.labels) {
				email.data.labels.forEach((label: string) => {
					labels.set(label, (labels.get(label) || 0) + 1)
				})
			}
		})
		return Array.from(labels.entries()).map(([label, count]) => ({
			label,
			count,
		}))
	}

	private async getCustomQueryResults(since: number) {
		const results = await DataDBModel.aggregate([
			{
				$match: {
					user_id: this.userID,
					date_created: { $gte: since },
					type: DataType.EMAIL_RECEIVED,
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d-%H",
							date: { $toDate: "$date_created" },
						},
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		])

		return results.map((r) => ({
			timestamp: r._id,
			count: r.count,
		}))
	}

	private async calculatePeopleStats(recentEmails: any[]) {
		const emailStats = new Map<string, { count: number; importance: number }>()

		recentEmails.forEach((email) => {
			const senderEmail = email.data.from
			if (!senderEmail) return

			const current = emailStats.get(senderEmail) || { count: 0, importance: 0 }
			emailStats.set(senderEmail, {
				count: current.count + 1,
				importance: current.importance + (email.data.importance_score || 0),
			})
		})

		return Array.from(emailStats.entries())
			.map(([email, stats]) => ({
				email,
				emailCount: stats.count,
				importanceScore: stats.count > 0 ? stats.importance / stats.count : 0,
			}))
			.sort((a, b) => b.importanceScore - a.importanceScore)
			.slice(0, 10) // Top 10 people
	}

	async off() {
		this.socket.off("dashboard", () => {
			this.cleanup()
		})
	}

	async cleanup() {
		if (this.dataChangeStream) {
			await this.dataChangeStream.close()
			this.dataChangeStream = null
		}
	}
}
