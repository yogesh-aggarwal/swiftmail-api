import { z } from "zod"

// Main Digest schema
export const Digest = z.object({
	id: z.string(),
	user_id: z.string(),
	date_created: z.number(),
	date_updated: z.number(),
	title: z.string(),
	description: z.string(),
})
export type Digest = z.infer<typeof Digest>
