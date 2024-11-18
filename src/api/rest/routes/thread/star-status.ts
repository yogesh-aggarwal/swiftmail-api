import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function UpdateThreadStarredStatusRoute(
	req: Request,
	res: Response
) {
	const id = req.params.id
	const { is_starred } = req.body

	try {
		const thread = await ThreadModel.getById(id)
		if (!thread) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		const data = is_starred
			? await ThreadModel.markAsStarred(id)
			: await ThreadModel.markAsUnstarred(id)

		if (!data) {
			return res
				.status(500)
				.json({ message: "Failed to update star status", data: null })
		}

		res.status(200).json({
			message: "Starred status updated successfully",
			data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
