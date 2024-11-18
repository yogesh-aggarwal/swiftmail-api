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
	id: { type: String, required: true },
	user_id: { type: String, required: true },
	date_updated: { type: Number, required: true },
	date_created: { type: Number, required: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
	summary: { type: String, required: true },
	thread_id: { type: String, required: true },
	flags: { type: threadFlagsSchema, required: true },
	priority: { type: String, required: true },
	categories: [{ type: String }],
	labels: [{ type: String }],
	digests: [{ type: String }],
})

export const ThreadDBModel = mongoose.model<Thread>("Thread", threadSchema)

// ----------------------------------------------------------------------------

export class ThreadModel {
	// Thread Operations
	static async getById(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOne({ id: threadId })
		} catch (error) {
			console.error("Error fetching thread by ID:", error)
			return null
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
			priority: "low",
			categories: [],
			labels: [],
			digests: [],
		})

		return await thread.save()
	}

	static async updateTrashFlag(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
				{
					$set: {
						flags: { is_trash: true },
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error deleting thread:", error)
			return null
		}
	}

	// Flag Modification Methods
	static async updateFlags(
		threadId: string,
		updates: Partial<Thread["flags"]>
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async markAsStarred(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_starred: true })
	}

	static async markAsUnstarred(threadId: string): Promise<Thread | null> {
		return this.updateFlags(threadId, { is_starred: false })
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

	// Priority Methods
	static async updatePriority(
		threadId: string,
		priority: string[] | string | null,
		action: "set" | "add" | "remove" | "clear" = "set"
	): Promise<Thread | null> {
		try {
			const updateObj: any = { date_updated: Date.now() }

			switch (action) {
				case "set":
					updateObj.$set = { priority: Array.isArray(priority) ? priority : [] }
					break
				case "add":
					updateObj.$addToSet = { priority: priority }
					break
				case "remove":
					updateObj.$pull = { priority: priority }
					break
				case "clear":
					updateObj.$set = { priority: [] }
					break
			}

			return await ThreadDBModel.findOneAndUpdate({ id: threadId }, updateObj, {
				new: true,
			})
		} catch (error) {
			console.error("Error updating thread priority:", error)
			return null
		}
	}

	// Category Methods
	static async updateCategories(
		threadId: string,
		categories: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async clearCategories(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	// Label Methods
	static async updateLabels(
		threadId: string,
		labels: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async addLabel(
		threadId: string,
		label: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async clearLabels(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	// Digest Methods
	static async updateDigests(
		threadId: string,
		digests: string[]
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async addDigest(
		threadId: string,
		digest: string
	): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	static async clearDigests(threadId: string): Promise<Thread | null> {
		try {
			return await ThreadDBModel.findOneAndUpdate(
				{ id: threadId },
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

	// Message Methods
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

	static async getMessagesByThreadId(
		threadId: string,
		includeEmbedding: boolean = false
	) {
		// Conditionally include or exclude the 'embedding' field
		const selectFields = includeEmbedding ? "" : "-embedding"
		return await MessageDBModel.find({ thread_id: threadId })
			.sort({ date_created: 1 })
			.select(selectFields)
	}

	static async searchMessagesByThreadId(
		threadId: string,
		searchTerm: string
	): Promise<Message[]> {
		try {
			return await MessageDBModel.find({
				thread_id: threadId,
				$or: [
					{ "email_data.subject": { $regex: searchTerm, $options: "i" } },
					{ "email_data.html_content": { $regex: searchTerm, $options: "i" } },
					{ summary: { $regex: searchTerm, $options: "i" } },
					{ keywords: { $regex: searchTerm, $options: "i" } },
				],
			}).sort({ date_created: 1 })
		} catch (error) {
			console.error("Error searching messages by thread:", error)
			return []
		}
	}

	static async searchThreadsByMessageContent(
		searchTerm: string
	): Promise<Thread[]> {
		try {
			// Find messages that match the search term
			const messages = await MessageDBModel.find({
				$or: [
					{ "email_data.subject": { $regex: searchTerm, $options: "i" } },
					{ "email_data.html_content": { $regex: searchTerm, $options: "i" } },
					{ summary: { $regex: searchTerm, $options: "i" } },
					{ keywords: { $regex: searchTerm, $options: "i" } },
				],
			}).distinct("thread_id")

			// Find threads that have matching messages
			return await ThreadDBModel.find({ id: { $in: messages } })
		} catch (error) {
			console.error("Error searching threads by message content:", error)
			return []
		}
	}
}

// ----------------------------------------------------------------------------
