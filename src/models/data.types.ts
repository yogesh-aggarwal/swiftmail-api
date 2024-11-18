import mongoose from "mongoose"
import { z } from "zod"

// Enum
export enum DataType {
    EMAIL_RECEIVED = "email_received",
    EMAIL_SENT = "email_sent",
}

// Zod schema for enum validation
export const DataTypeSchema = z.nativeEnum(DataType)

// Main Data schema
export const Data = z.object({
    _id: z.instanceof(mongoose.Types.ObjectId),
    date_created: z.number(),
    user_id: z.string(),
    type: DataTypeSchema,
    data: z.record(z.string(), z.any()),
})
export type Data = z.infer<typeof Data> 