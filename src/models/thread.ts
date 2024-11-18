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
}

// ----------------------------------------------------------------------------
