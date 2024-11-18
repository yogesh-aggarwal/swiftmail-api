import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function DeleteThreadRoute(req: Request, res: Response) {
	const id = req.params.id
	const { is_trash } = req.body

	try {
		const data = is_trash
			? await ThreadModel.updateTrashFlag(id)
			: await ThreadModel.updateTrashFlag(id)

		if (!data) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "Trash flag updated successfully",
			data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
