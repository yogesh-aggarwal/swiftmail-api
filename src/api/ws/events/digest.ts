import { DigestDBModel } from "@/models/digest"
import { Digest } from "@/models/digest.types"
import { ThreadDBModel } from "@/models/thread"
import { Thread } from "@/models/thread.types"
import mongoose from "mongoose"
import {
	WSDigestEventData,
	WSDigestEventSubCategory,
	WSDigestEvent as WSDigestEventType,
} from "./digest.types"
import { WSBaseEvent } from "./event"

class ThreadDigestSubCategoryDeterminer {
	thread: Thread

	constructor(thread: Thread) {
		this.thread = thread
	}

	determineSubCategory(): WSDigestEventSubCategory {
		if (this.needsAttention(this.thread))
			return WSDigestEventSubCategory.NeedsAttention
		if (!this.thread.flags.is_read) return WSDigestEventSubCategory.Unread
		return WSDigestEventSubCategory.EverythingElse
	}

	private needsAttention(thread: Thread): boolean {
		return thread.flags.is_starred || !thread.flags.is_read
	}
}

export class WSDigestEvent extends WSBaseEvent {
	private digestChangeStream: mongoose.mongo.ChangeStream | null = null
	private threadChangeStream: mongoose.mongo.ChangeStream | null = null

	async on() {
		this.socket.on("digests", async () => {
			// Initial digest data emit
			await this.prepareAndEmitDigestData()

			// Setup change stream to watch for digest updates
			this.digestChangeStream = DigestDBModel.watch(
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

			this.digestChangeStream.on("change", async () => {
				await this.prepareAndEmitDigestData()
			})

			this.threadChangeStream.on("change", async () => {
				await this.prepareAndEmitDigestData()
			})
		})
	}

	private async prepareAndEmitDigestData() {
		const digests = await DigestDBModel.find({
			user_id: this.userID,
		}).sort({ date_updated: -1 })

		const digestIds = digests.map((digest) => digest.id.toString())

		const threads = await ThreadDBModel.find({
			user_id: this.userID,
			digests: { $in: digestIds },
		}).sort({ date_updated: -1 })

		const categorizedDigests = await this.categorizeThreads(threads, digests)
		this.socket.emit("digests", categorizedDigests)
	}

	private async categorizeThreads(
		threads: Thread[],
		digests: Digest[]
	): Promise<WSDigestEventType> {
		const digestsMap: Record<string, WSDigestEventData> = {}
		let totalUnreadCount = 0

		// Initialize digest data for each digest
		for (const digest of digests) {
			digestsMap[digest.id] = {
				id: digest.id,
				name: digest.title,
				unreadCount: 0,
				threads: [],
			}
		}

		// Categorize threads into their respective digests
		for (const thread of threads) {
			for (const digestId of thread.digests) {
				if (digestsMap[digestId]) {
					digestsMap[digestId].threads.push(thread)
					if (!thread.flags.is_read) {
						digestsMap[digestId].unreadCount++
						totalUnreadCount++
					}
				}
			}
		}

		return {
			unreadCount: totalUnreadCount,
			digests: digestsMap,
		}
	}

	async off() {
		this.socket.off("digests", () => {
			this.cleanup()
		})
	}

	async cleanup() {
		if (this.digestChangeStream) {
			await this.digestChangeStream.close()
			this.digestChangeStream = null
		}
		if (this.threadChangeStream) {
			await this.threadChangeStream.close()
			this.threadChangeStream = null
		}
	}
}
