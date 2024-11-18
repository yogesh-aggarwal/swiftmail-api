import mongoose from "mongoose"
import { Message, MessageEmailData, MessageReminders } from "./message.types"

// Mongoose schemas
const messageEmailDataSchema = new mongoose.Schema<MessageEmailData>({
	message_id: { type: String, required: true },
	thread_id: { type: String, required: true },
	from_email: { type: String, required: true },
	to_email: { type: String, required: true },
	cc_email: { type: String, required: true },
	bcc_email: { type: String, required: true },
	subject: { type: String, required: true },
	html_content: { type: String, required: true },
})

const messageRemindersSchema = new mongoose.Schema<MessageReminders>({
	follow_up: [{ type: String }],
	forgetting: [{ type: String }],
	snoozed: [{ type: String }],
})

// Main Message Schema
const messageSchema = new mongoose.Schema<Message>({
	id: { type: String, required: true },
	user_id: { type: String, required: true },
	date_updated: { type: Number, required: true },
	date_created: { type: Number, required: true },
	reminders: { type: messageRemindersSchema, required: true },
	email_data: { type: messageEmailDataSchema, required: true },
	summary: { type: String, required: true },
	embedding: [{ type: Number }],
	keywords: [{ type: String }],
	unsubscribe_link: { type: String, required: false, default: null },
})

export const MessageDBModel = mongoose.model<Message>("Message", messageSchema)

// ----------------------------------------------------------------------------

export class MessageModel {
	static async getById(messageId: string): Promise<Message | null> {
		try {
			return await MessageDBModel.findById(messageId)
		} catch (error) {
			console.error("Error fetching message by ID:", error)
			return null
		}
	}

	static async createMessage(
		userId: string,
		emailData: MessageEmailData,
		summary: string = ""
	): Promise<Message> {
		const now = Date.now()
		const message = new MessageDBModel({
			user_id: userId,
			date_created: now,
			date_updated: now,
			reminders: {
				follow_up: [],
				forgetting: [],
				snoozed: [],
			},
			email_data: emailData,
			summary,
			embedding: [],
			keywords: [],
			unsubscribe_link: null,
		})

		return await message.save()
	}

	private static async updateField<K extends keyof Message>(
		messageId: string,
		field: K,
		value: Message[K]
	): Promise<Message | null> {
		try {
			return await MessageDBModel.findByIdAndUpdate(
				messageId,
				{
					$set: {
						[field]: value,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error(`Error updating message ${field}:`, error)
			return null
		}
	}

	static async updateSummary(
		messageId: string,
		summary: string
	): Promise<Message | null> {
		return this.updateField(messageId, "summary", summary)
	}

	static async updateEmbedding(
		messageId: string,
		embedding: number[]
	): Promise<Message | null> {
		return this.updateField(messageId, "embedding", embedding)
	}

	static async updateKeywords(
		messageId: string,
		keywords: string[]
	): Promise<Message | null> {
		return this.updateField(messageId, "keywords", keywords)
	}

	static async updateUnsubscribeLink(
		messageId: string,
		unsubscribeLink: string | null
	): Promise<Message | null> {
		return this.updateField(messageId, "unsubscribe_link", unsubscribeLink)
	}
}

// ----------------------------------------------------------------------------
