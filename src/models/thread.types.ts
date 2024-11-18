import mongoose from "mongoose"
import { z } from "zod"

// Thread Flags schema
export const ThreadFlags = z.object({
    is_muted: z.boolean(),
    is_read: z.boolean(),
    is_starred: z.boolean(),
    is_archived: z.boolean(),
    is_spam: z.boolean(),
    is_trash: z.boolean(),
    is_sent: z.boolean(),
})
export type ThreadFlags = z.infer<typeof ThreadFlags>

// Main Thread schema
export const Thread = z.object({
    _id: z.instanceof(mongoose.Types.ObjectId),
    user_id: z.string(),
    date_updated: z.number(),
    date_created: z.number(),
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    thread_id: z.string(),
    flags: ThreadFlags,
})
export type Thread = z.infer<typeof Thread> 