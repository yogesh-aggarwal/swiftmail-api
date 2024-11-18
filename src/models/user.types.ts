import { z } from "zod"

// Metadata schema
export const UserMetadata = z.object({
	last_seen: z.number(),
	date_created: z.number(),
	date_updated: z.number(),
})
export type UserMetadata = z.infer<typeof UserMetadata>

// OAuth credentials schema
export const UserOAuthCredentials = z.object({
	access_token: z.string(),
	refresh_token: z.string(),
})
export type UserOAuthCredentials = z.infer<typeof UserOAuthCredentials>

// Credentials schema
export const UserCredentials = z.object({
	google_oauth: UserOAuthCredentials.nullable(),
})
export type UserCredentials = z.infer<typeof UserCredentials>

// AI Preferences schema
export const UserAIPreferences = z.object({
	model: z.string(),
	custom_rules: z.array(z.string()),
	self_description: z.string(),
})
export type UserAIPreferences = z.infer<typeof UserAIPreferences>

// Inbox Preferences schema
export const UserInboxPreferences = z.object({
	priority: z.array(z.string()),
	priority_rules: z.array(z.string()),
	labels: z.array(z.string()),
	label_rules: z.array(z.string()),
	categories: z.array(z.string()),
	category_rules: z.array(z.string()),
	spam_words: z.array(z.string()),
	spam_rules: z.array(z.string()),
	unsubscribe_words: z.array(z.string()),
	unsubscribe_rules: z.array(z.string()),
})
export type UserInboxPreferences = z.infer<typeof UserInboxPreferences>

// User Preferences schema
export const UserPreferences = z.object({
	ai: UserAIPreferences,
	inbox: UserInboxPreferences,
})
export type UserPreferences = z.infer<typeof UserPreferences>

// User Data schema
export const UserData = z.object({
	preferences: UserPreferences,
})
export type UserData = z.infer<typeof UserData>

// Main User schema
export const User = z.object({
	id: z.string(),
	metadata: UserMetadata,
	dp: z.string(),
	email: z.string().email(),
	name: z.string(),
	data: UserData,
	credentials: UserCredentials,
})
export type User = z.infer<typeof User>
