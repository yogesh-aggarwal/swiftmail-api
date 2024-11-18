import { ThreadDBModel } from "@/models/thread"
import { Thread } from "@/models/thread.types"
import { UserDBModel } from "@/models/user"
import { UserPreferences } from "@/models/user.types"
import mongoose from "mongoose"
import { WSBaseEvent } from "./event"
import {
	WSInboxEventInbox,
	WSInboxEventInboxCategories,
	WSInboxEventInboxCategory,
	WSInboxEventInboxSubCategory,
} from "./inbox.types"

class ThreadSubCategoryDeterminerStrategy {
	thread: Thread
	userPrefs: UserPreferences

	constructor(thread: Thread, user: UserPreferences) {
		this.thread = thread
		this.userPrefs = user
	}

	determineSubCategory(): WSInboxEventInboxSubCategory {
		if (this.needsAttention(this.thread))
			return WSInboxEventInboxSubCategory.NeedsAttention
		if (!this.thread.flags.is_read) return WSInboxEventInboxSubCategory.Unread
		return WSInboxEventInboxSubCategory.EverythingElse
	}

	private needsAttention(thread: Thread): boolean {
		return thread.flags.is_starred || !thread.flags.is_read
	}
}

export class WSInboxEvent extends WSBaseEvent {
	private threadChangeStream: mongoose.mongo.ChangeStream | null = null
	private userChangeStream: mongoose.mongo.ChangeStream | null = null
	private userPrefs: UserPreferences | null = null

	async on() {
		this.socket.on("inbox", async () => {
			// First fetch user preferences
			const user = await UserDBModel.find({ id: this.userID }).limit(1).exec()
			if (!user) throw new Error("User not found")
			this.userPrefs = user[0].data.preferences

			// Initial inbox data emit
			await this.prepareAndEmitInboxData()

			// Setup change stream to watch for thread updates
			this.threadChangeStream = ThreadDBModel.watch(
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

			// Setup change stream to watch for user preference updates
			this.userChangeStream = UserDBModel.watch(
				[
					{
						$match: {
							"fullDocument._id": this.userID,
							operationType: { $in: ["update", "replace"] },
							"updateDescription.updatedFields": {
								$regex: "^data.preferences",
							},
						},
					},
				],
				{ fullDocument: "updateLookup" }
			)

			this.threadChangeStream.on("change", async () => {
				await this.prepareAndEmitInboxData()
			})
			this.userChangeStream.on("change", async () => {
				const updatedUser = await UserDBModel.find({ id: this.userID })
					.limit(1)
					.exec()
				if (updatedUser) {
					this.userPrefs = updatedUser[0].data.preferences
					await this.prepareAndEmitInboxData()
				}
			})
		})
	}

	private async prepareAndEmitInboxData() {
		const threads = await ThreadDBModel.find({
			user_id: this.userID,
			"flags.is_trash": false,
			"flags.is_spam": false,
			"flags.is_archived": false,
		}).sort({ date_updated: -1 })

		const categorizedInbox = await this.categorizeThreads(threads)
		this.socket.emit("inbox", categorizedInbox)
	}

	private async categorizeThreads(
		threads: Thread[]
	): Promise<WSInboxEventInbox> {
		// Initialize empty category groups
		const emptyGroup = (): WSInboxEventInboxCategory => ({
			unreadCount: 0,
			subcategories: {
				[WSInboxEventInboxSubCategory.NeedsAttention]: [],
				[WSInboxEventInboxSubCategory.Unread]: [],
				[WSInboxEventInboxSubCategory.EverythingElse]: [],
			},
		})

		// Initialize empty categories
		const categories: WSInboxEventInboxCategories = {}

		// Categorize each thread
		for (const thread of threads) {
			for (const category of thread.categories) {
				if (!(category in categories)) categories[category] = emptyGroup()

				const subCategory = new ThreadSubCategoryDeterminerStrategy(
					thread,
					this.userPrefs
				).determineSubCategory()

				categories[category].subcategories[subCategory].push(thread)
				categories[category].unreadCount += thread.flags.is_read ? 0 : 1
			}
		}

		const categoryOrder = Object.keys(categories)
		const unreadCount = Object.values(categories).reduce(
			(acc, curr) => acc + curr.unreadCount,
			0
		)

		return { unreadCount, categories, categoryOrder }
	}

	async off() {
		this.socket.off("inbox", () => {
			this.cleanup()
		})
	}

	async cleanup() {
		if (this.threadChangeStream) {
			await this.threadChangeStream.close()
			this.threadChangeStream = null
		}
		if (this.userChangeStream) {
			await this.userChangeStream.close()
			this.userChangeStream = null
		}
	}
}
