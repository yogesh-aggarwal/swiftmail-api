import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function DeleteThreadRoute(req: Request, res: Response) {
	const id = req.params.id

	try {
		const success = await ThreadModel.deleteThread(id)
		if (!success) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "Thread deleted successfully",
			data: null,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
