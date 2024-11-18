import mongoose from "mongoose"
import { Notification, NotificationStatus } from "./notification.types"

// Mongoose schema
const notificationSchema = new mongoose.Schema<Notification>({
	id: { type: String, required: true },
	user_id: { type: String, required: true },
	date_created: { type: Number, required: true },
	date_updated: { type: Number, required: true },
	title: { type: String, required: true },
	body: { type: String, required: true },
	status: {
		type: String,
		required: true,
		enum: Object.values(NotificationStatus),
	},
	date_dispatched: { type: Number, required: false, default: null },
	date_delivered: { type: Number, required: false, default: null },
	date_failed: { type: Number, required: false, default: null },
})

export const NotificationDBModel = mongoose.model<Notification>(
	"Notification",
	notificationSchema
)

// ----------------------------------------------------------------------------

export class NotificationModel {
	static async getById(notificationId: string): Promise<Notification | null> {
		try {
			return await NotificationDBModel.findById(notificationId)
		} catch (error) {
			console.error("Error fetching notification by ID:", error)
			return null
		}
	}

	static async createNotification(
		userId: string,
		title: string,
		body: string
	): Promise<Notification> {
		const now = Date.now()
		const notification = new NotificationDBModel({
			user_id: userId,
			date_created: now,
			date_updated: now,
			title,
			body,
			status: NotificationStatus.UNREAD,
			date_dispatched: null,
			date_delivered: null,
			date_failed: null,
		})

		return await notification.save()
	}

	static async updateStatus(
		notificationId: string,
		status: NotificationStatus
	): Promise<Notification | null> {
		try {
			const updates: Partial<Notification> = {
				status,
				date_updated: Date.now(),
			}

			// Update corresponding date field based on status
			switch (status) {
				case NotificationStatus.DISPATCHED:
					updates.date_dispatched = Date.now()
					break
				case NotificationStatus.DELIVERED:
					updates.date_delivered = Date.now()
					break
				case NotificationStatus.FAILED:
					updates.date_failed = Date.now()
					break
			}

			return await NotificationDBModel.findByIdAndUpdate(
				notificationId,
				{ $set: updates },
				{ new: true }
			)
		} catch (error) {
			console.error("Error updating notification status:", error)
			return null
		}
	}
}

// ----------------------------------------------------------------------------
