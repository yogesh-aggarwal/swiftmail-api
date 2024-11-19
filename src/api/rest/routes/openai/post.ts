import { OPENAI_API_KEY } from "@/core/constants"
import { Request, Response } from "express"
import OpenAI from "openai"

export async function PostOpenAIRoute(req: Request, res: Response) {
	const { system_prompt, user_prompt } = req.body

	if (!system_prompt || !user_prompt) {
		return res.status(400).json({
			message: "Both system_prompt and user_prompt are required",
			data: null,
		})
	}

	try {
		const openai = new OpenAI({
			apiKey: OPENAI_API_KEY,
		})

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: system_prompt },
				{ role: "user", content: user_prompt },
			],
		})

		res.status(200).json({
			message: "success",
			data: completion.choices[0].message,
		})
	} catch (error) {
		console.error("OpenAI API Error:", error)
		res.status(500).json({
			message: "Failed to process OpenAI request",
			data: null,
		})
	}
}
