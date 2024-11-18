import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function UpdateThreadReadStatusRoute(req: Request, res: Response) {
	const id = req.params.id
	const { is_read } = req.body

	try {
		const data = is_read
			? await ThreadModel.markAsRead(id)
			: await ThreadModel.markAsUnread(id)

		if (!data) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "Read status updated successfully",
			data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
