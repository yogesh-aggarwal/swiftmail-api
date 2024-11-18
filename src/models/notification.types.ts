import mongoose from "mongoose"
import { z } from "zod"

// Enum
export enum NotificationStatus {
    FAILED = "failed",
    DISPATCHED = "dispatched",
    DELIVERED = "delivered",
    READ = "read",
    UNREAD = "unread",
    DISMISSED = "dismissed",
}

// Zod schema for enum validation
export const NotificationStatusSchema = z.nativeEnum(NotificationStatus)

// Main Notification schema
export const Notification = z.object({
    _id: z.instanceof(mongoose.Types.ObjectId),
    user_id: z.string(),
    date_created: z.number(),
    date_updated: z.number(),
    title: z.string(),
    body: z.string(),
    status: NotificationStatusSchema,
    date_dispatched: z.number().nullable(),
    date_delivered: z.number().nullable(),
    date_failed: z.number().nullable(),
})

export type Notification = z.infer<typeof Notification> 