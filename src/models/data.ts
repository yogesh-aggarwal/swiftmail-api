import mongoose from "mongoose"
import { Data, DataType } from "./data.types"

// Mongoose schema
const dataSchema = new mongoose.Schema<Data>({
	date_created: { type: Number, required: true },
	user_id: { type: String, required: true },
	type: {
		type: String,
		required: true,
		enum: Object.values(DataType),
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
})

export const DataDBModel = mongoose.model<Data>("Data", dataSchema)

// ----------------------------------------------------------------------------

export class DataModel {
	static async createData(
		userId: string,
		type: DataType,
		data: Record<string, any>
	): Promise<Data> {
		const dataDoc = new DataDBModel({
			date_created: Date.now(),
			user_id: userId,
			type,
			data,
		})

		return await dataDoc.save()
	}
}

// ----------------------------------------------------------------------------
