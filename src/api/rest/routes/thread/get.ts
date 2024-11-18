import { ThreadDBModel } from "@/models/thread"
import { Request, Response } from "express"

export async function GetThreadRoute(req: Request, res: Response) {
	const id = req.params.id

	try {
		const data = await ThreadDBModel.findOne({ id: id })

		if (!data) {
			return res.status(404).json({ message: "Thread not found", data: null })
		}

		res.status(200).json({
			message: "success",
			data: data,
		})
	} catch (error) {
		res.status(500).json({ message: "Internal server error", data: null })
	}
}
