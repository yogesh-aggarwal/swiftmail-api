import mongoose from "mongoose"
import { User } from "./user.types"

// Mongoose schemas
const userMetadataSchema = new mongoose.Schema({
	last_seen: { type: Number, required: true },
	date_created: { type: Number, required: true },
	date_updated: { type: Number, required: true },
})

const userOAuthCredentialsSchema = new mongoose.Schema({
	access_token: { type: String, required: true },
	refresh_token: { type: String, required: true },
})

const userCredentialsSchema = new mongoose.Schema({
	google_oauth: { type: userOAuthCredentialsSchema, required: false },
})

const userAIPreferencesSchema = new mongoose.Schema({
	model: { type: String, required: true },
	custom_rules: [{ type: String }],
	self_description: { type: String, required: true },
})

const userInboxPreferencesSchema = new mongoose.Schema({
	priority: [{ type: String }],
	priority_rules: [{ type: String }],
	labels: [{ type: String }],
	label_rules: [{ type: String }],
	categories: [{ type: String }],
	category_rules: [{ type: String }],
	spam_words: [{ type: String }],
	spam_rules: [{ type: String }],
	unsubscribe_words: [{ type: String }],
	unsubscribe_rules: [{ type: String }],
})

const userPreferencesSchema = new mongoose.Schema({
	ai: { type: userAIPreferencesSchema, required: true },
	inbox: { type: userInboxPreferencesSchema, required: true },
})

const userDataSchema = new mongoose.Schema({
	preferences: { type: userPreferencesSchema, required: true },
})

// Main User Schema
const userSchema = new mongoose.Schema<User>({
	id: { type: String, required: true },
	metadata: { type: userMetadataSchema, required: true },
	dp: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	data: { type: userDataSchema, required: true },
	credentials: { type: userCredentialsSchema, required: true },
})

export const UserDBModel = mongoose.model<User>("User", userSchema)

// ----------------------------------------------------------------------------

export class UserModel {
	static async getFromEmail(email: string): Promise<User | null> {
		try {
			return await UserDBModel.findOne({ email })
		} catch (error) {
			console.error("Error fetching user from email:", error)
			return null
		}
	}

	static async createUser(
		id: string,
		email: string,
		name: string,
		dp: string
	): Promise<User> {
		const now = Date.now()
		const user = new UserDBModel({
			id: new mongoose.Types.ObjectId(id),
			metadata: {
				last_seen: now,
				date_created: now,
				date_updated: now,
			},
			email,
			dp,
			name,
			data: {
				preferences: {
					ai: {
						model: "gpt4omini",
						custom_rules: [],
						self_description: "",
					},
					inbox: {
						priority: ["Low", "Medium", "High"],
						priority_rules: [],
						labels: ["Personal", "Work", "Shopping"],
						label_rules: [],
						categories: [
							"Primary",
							"Social",
							"Promotions",
							"Updates",
							"Forums",
						],
						category_rules: [],
						spam_words: [],
						spam_rules: [],
						unsubscribe_words: [],
						unsubscribe_rules: [],
					},
				},
			},
			credentials: {
				google_oauth: null,
			},
		})

		return await user.save()
	}
}

// ----------------------------------------------------------------------------
