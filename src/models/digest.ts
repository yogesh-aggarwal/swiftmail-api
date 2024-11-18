import mongoose from "mongoose"
import { Digest } from "./digest.types"

// Mongoose schema
const digestSchema = new mongoose.Schema<Digest>({
	id: { type: String, required: true },
	user_id: { type: String, required: true },
	date_created: { type: Number, required: true },
	date_updated: { type: Number, required: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
})

export const DigestDBModel = mongoose.model<Digest>("Digest", digestSchema)

// ----------------------------------------------------------------------------

export class DigestModel {
	static async getById(digestId: string): Promise<Digest | null> {
		try {
			return await DigestDBModel.findById(digestId)
		} catch (error) {
			console.error("Error fetching digest by ID:", error)
			return null
		}
	}

	static async getByUserId(userId: string): Promise<Digest[]> {
		try {
			return await DigestDBModel.find({ user_id: userId })
		} catch (error) {
			console.error("Error fetching digests by user ID:", error)
			return []
		}
	}

	static async createDigest(
		userId: string,
		title: string,
		description: string
	): Promise<Digest> {
		const now = Date.now()
		const digest = new DigestDBModel({
			user_id: userId,
			date_created: now,
			date_updated: now,
			title,
			description,
		})

		return await digest.save()
	}

	private static async updateField<K extends keyof Digest>(
		digestId: string,
		field: K,
		value: Digest[K]
	): Promise<Digest | null> {
		try {
			return await DigestDBModel.findByIdAndUpdate(
				digestId,
				{
					$set: {
						[field]: value,
						date_updated: Date.now(),
					},
				},
				{ new: true }
			)
		} catch (error) {
			console.error(`Error updating digest ${field}:`, error)
			return null
		}
	}

	static async updateTitle(
		digestId: string,
		title: string
	): Promise<Digest | null> {
		return this.updateField(digestId, "title", title)
	}

	static async updateDescription(
		digestId: string,
		description: string
	): Promise<Digest | null> {
		return this.updateField(digestId, "description", description)
	}
}

// ----------------------------------------------------------------------------
