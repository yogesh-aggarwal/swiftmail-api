import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function SearchThreadsByMessageContentRoute(
	req: Request,
	res: Response
) {
	const { query } = req.query
	if (!query) {
		return res
			.status(400)
			.json({ message: "Search term is required", data: null })
	}

	try {
		const threads = await ThreadModel.searchThreadsByMessageContent(
			query as string
		)
		if (!threads.length) {
			return res.status(404).json({ message: "No threads found", data: null })
		}

		res.status(200).json({
			message: "Threads found successfully",
			data: threads,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
