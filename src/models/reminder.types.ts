import mongoose from "mongoose"
import { z } from "zod"

// Enums
export enum ReminderType {
    FOLLOW_UP = "follow-up",
    FORGETTING = "forgetting",
    SNOOZED = "snoozed",
}

export enum ReminderState {
    NOT_STARTED = "not_started",
    IN_QUEUE = "in_queue",
    WORKING = "working",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}

// Zod schemas for type validation
export const ReminderTypeSchema = z.nativeEnum(ReminderType)
export const ReminderStateSchema = z.nativeEnum(ReminderState)

// Main Reminder schema
export const Reminder = z.object({
    _id: z.instanceof(mongoose.Types.ObjectId),
    user_id: z.string(),
    date_created: z.number(),
    date_updated: z.number(),
    scheduled_at: z.number(),
    time_zone: z.string(),
    message_id: z.string(),
    thread_id: z.string(),
    type: ReminderTypeSchema,
    state: ReminderStateSchema,
})

export type Reminder = z.infer<typeof Reminder> 