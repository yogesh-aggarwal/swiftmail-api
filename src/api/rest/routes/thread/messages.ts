import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function GetThreadMessagesRoute(req: Request, res: Response) {
	const id = req.params.id

	try {
		const messages = await ThreadModel.getMessagesByThreadId(id)
		if (!messages) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		// Sort messages by date_created in ascending order
		messages.sort(
			(a, b) =>
				new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
		)

		res.status(200).json({
			message: "Messages fetched successfully",
			data: messages,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
