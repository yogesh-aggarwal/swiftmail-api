import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function UpdateThreadLabelsRoute(req: Request, res: Response) {
	const id = req.params.id
	const { labels, action } = req.body

	try {
		let data = null

		switch (action) {
			case "add":
				data = await ThreadModel.addLabel(id, labels)
				break
			case "remove":
				data = await ThreadModel.removeLabel(id, labels)
				break
			case "clear":
				data = await ThreadModel.clearLabels(id)
				break
			default:
				data = await ThreadModel.updateLabels(id, labels)
		}

		if (!data) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "Labels updated successfully",
			data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
