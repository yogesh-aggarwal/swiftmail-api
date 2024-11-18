import mongoose from "mongoose"
import { MessageDBModel } from "./message"
import { Message } from "./message.types"
import { Thread } from "./thread.types"

// Mongoose schemas
const threadFlagsSchema = new mongoose.Schema({
	is_muted: { type: Boolean, required: true },
	is_read: { type: Boolean, required: true },
	is_starred: { type: Boolean, required: true },
	is_archived: { type: Boolean, required: true },
	is_spam: { type: Boolean, required: true },
	is_trash: { type: Boolean, required: true },
	is_sent: { type: Boolean, required: true },
})

// Main Thread Schema
const threadSchema = new mongoose.Schema<Thread>({
	user_id: { type: String, required: true },
	date_updated: { type: Number, required: true },
	date_created: { type: Number, required: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
	summary: { type: String, required: true },
	thread_id: { type: String, required: true },
	flags: { type: threadFlagsSchema, required: true },
	priority: [{ type: String }],
	categories: [{ type: String }],
	labels: [{ type: String }],
	digests: [{ type: String }],
})

export const ThreadDBModel = mongoose.model<Thread>("Thread", threadSchema)

// ----------------------------------------------------------------------------

export class ThreadModel {
	static async getById(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findById(threadId)
		} catch (error) {
			console.error("Error fetching thread by ID:", error)
			return null
		}
	}

	static async getMessagesByThread(
		threadId: string,
		page: number,
		pageSize: number = 10
	): Promise<Message[]> {
		try {
			const skip = (page - 1) * pageSize
			return await MessageDBModel.find({ thread_id: threadId })
				.sort({ date_created: 1 })
				.skip(skip)
				.limit(pageSize)
		} catch (error) {
			console.error("Error fetching messages by thread:", error)
			return []
		}
	}

	static async createThread(
		userId: string,
		title: string,
		description: string,
		summary: string,
		threadId: string
	): Promise<Thread> {
		const now = Date.now()
		const thread = new ThreadDBModel({
			user_id: userId,
			date_updated: now,
			date_created: now,
			title,
			description,
			summary,
			thread_id: threadId,
			flags: {
				is_muted: false,
				is_read: false,
				is_starred: false,
				is_archived: false,
				is_spam: false,
				is_trash: false,
				is_sent: false,
			},
			priority: [],
			categories: [],
			labels: [],
			digests: [],
		})

		return await thread.save()
	}

	// Flag modification methods
	static async updateFlags(
		threadId: string,
		updates: Partial<Thread["flags"]>
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{ $set: { flags: updates } },
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating thread flags:", error)
			return null
		}
	}

	static async markAsRead(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_read: true })
	}

	static async markAsUnread(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_read: false })
	}

	static async toggleStarred(thread: Thread): Promise<Thread | null> {
		return this.updateFlags(thread._id.toString(), {
			is_starred: !thread.flags.is_starred,
		})
	}

	static async markAsArchived(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_archived: true })
	}

	static async markAsUnarchived(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_archived: false })
	}

	static async markAsSpam(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_spam: true, is_trash: false })
	}

	static async markAsNotSpam(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_spam: false })
	}

	static async markAsTrash(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_trash: true, is_spam: false })
	}

	static async restoreFromTrash(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_trash: false })
	}

	static async markAsMuted(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_muted: true })
	}

	static async markAsUnmuted(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_muted: false })
	}

	static async markAsSent(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_sent: true })
	}

	static async updatePriority(
		threadId: string,
		priority: string[] | string | null,
		action: "set" | "add" | "remove" | "clear" = "set"
	): Promise<Thread | null> {
		try {
			const updateObj: any = { date_updated: Date.now() }

			switch (action) {
				case "set":
					// Directly set the priority array
					updateObj.$set = { priority: Array.isArray(priority) ? priority : [] }
					break
				case "add":
					// Add single priority to array if not present
					updateObj.$addToSet = { priority: priority }
					break
				case "remove":
					// Remove single priority from array
					updateObj.$pull = { priority: priority }
					break
				case "clear":
					// Clear all priorities
					updateObj.$set = { priority: [] }
					break
			}

			return await ThreadDBModel.findByIdAndUpdate(threadId, updateObj, {
				new: true,
			})
		} catch (error) {
			console.error("Error updating thread priority:", error)
			return null
		}
	}

	static async updateCategories(
		threadId: string,
		categories: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						categories,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating thread categories:", error)
			return null
		}
	}

	static async updateLabels(
		threadId: string,
		labels: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						labels,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating thread labels:", error)
			return null
		}
	}

	static async updateDigests(
		threadId: string,
		digests: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						digests,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating thread digests:", error)
			return null
		}
	}

	// Label methods
	static async addLabel(
		threadId: string,
		label: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$addToSet: { labels: label },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error adding thread label:", error)
			return null
		}
	}

	static async removeLabel(
		threadId: string,
		label: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$pull: { labels: label },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error removing thread label:", error)
			return null
		}
	}

	// Category methods
	static async addCategory(
		threadId: string,
		category: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$addToSet: { categories: category },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error adding thread category:", error)
			return null
		}
	}

	static async removeCategory(
		threadId: string,
		category: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$pull: { categories: category },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error removing thread category:", error)
			return null
		}
	}

	// Digest methods
	static async addDigest(
		threadId: string,
		digest: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$addToSet: { digests: digest },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error adding thread digest:", error)
			return null
		}
	}

	static async removeDigest(
		threadId: string,
		digest: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$pull: { digests: digest },
					$set: { date_updated: Date.now() },
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error removing thread digest:", error)
			return null
		}
	}

	// Bulk operations
	static async clearLabels(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						labels: [],
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error clearing thread labels:", error)
			return null
		}
	}

	static async clearCategories(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						categories: [],
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error clearing thread categories:", error)
			return null
		}
	}

	static async clearDigests(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findByIdAndUpdate(
				threadId,
				{
					$set: {
						digests: [],
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error clearing thread digests:", error)
			return null
		}
	}
}

// ----------------------------------------------------------------------------
