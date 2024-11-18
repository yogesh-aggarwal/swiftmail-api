import { ThreadModel } from "@/models/thread"
import { Request, Response } from "express"

export async function UpdateThreadCategoriesRoute(req: Request, res: Response) {
	const id = req.params.id
	const { categories } = req.body

	try {
		let data = null

		data = await ThreadModel.updateCategories(id, categories)
		if (!data) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "Categories updated successfully",
			data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
