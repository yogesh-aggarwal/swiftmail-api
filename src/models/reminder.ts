import mongoose from "mongoose"
import { Reminder, ReminderState, ReminderType } from "./reminder.types"

// Mongoose schema
const reminderSchema = new mongoose.Schema<Reminder>({
	user_id: { type: String, required: true },
	date_created: { type: Number, required: true },
	date_updated: { type: Number, required: true },
	scheduled_at: { type: Number, required: true },
	time_zone: { type: String, required: true },
	message_id: { type: String, required: true },
	thread_id: { type: String, required: true },
	type: {
		type: String,
		required: true,
		enum: Object.values(ReminderType),
	},
	state: {
		type: String,
		required: true,
		enum: Object.values(ReminderState),
	},
})

export const ReminderDBModel = mongoose.model<Reminder>(
	"Reminder",
	reminderSchema
)

// ----------------------------------------------------------------------------

export class ReminderModel {
	static async getById(reminderId: string): Promise<Reminder | null> {
		try {
			return await ReminderDBModel.findById(reminderId)
		} catch (error) {
			console.error("Error fetching reminder by ID:", error)
			return null
		}
	}

	static async createReminder(
		userId: string,
		messageId: string,
		threadId: string,
		scheduledAt: number,
		timeZone: string,
		type: ReminderType
	): Promise<Reminder> {
		const now = Date.now()
		const reminder = new ReminderDBModel({
			user_id: userId,
			date_created: now,
			date_updated: now,
			scheduled_at: scheduledAt,
			time_zone: timeZone,
			message_id: messageId,
			thread_id: threadId,
			type: type,
			state: ReminderState.NOT_STARTED,
		})

		return await reminder.save()
	}

	static async updateType(
		reminderId: string,
		type: ReminderType
	): Promise<Reminder | null> {
		try {
			return await ReminderDBModel.findByIdAndUpdate(
				reminderId,
				{
					$set: {
						type,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating reminder type:", error)
			return null
		}
	}

	static async updateState(
		reminderId: string,
		state: ReminderState
	): Promise<Reminder | null> {
		try {
			return await ReminderDBModel.findByIdAndUpdate(
				reminderId,
				{
					$set: {
						state,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating reminder state:", error)
			return null
		}
	}

	static async updateScheduledAt(
		reminderId: string,
		scheduledAt: number
	): Promise<Reminder | null> {
		try {
			return await ReminderDBModel.findByIdAndUpdate(
				reminderId,
				{
					$set: {
						scheduled_at: scheduledAt,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating reminder scheduled time:", error)
			return null
		}
	}

	static async updateTimeZone(
		reminderId: string,
		timeZone: string
	): Promise<Reminder | null> {
		try {
			return await ReminderDBModel.findByIdAndUpdate(
				reminderId,
				{
					$set: {
						time_zone: timeZone,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating reminder timezone:", error)
			return null
		}
	}
}

// ----------------------------------------------------------------------------
