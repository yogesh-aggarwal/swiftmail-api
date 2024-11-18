import { UserDBModel } from "@/models/user"
import mongoose from "mongoose"
import { WSBaseEvent } from "./event"

export class WSUserEvent extends WSBaseEvent {
	private userChangeStream: mongoose.mongo.ChangeStream | null = null

	async on() {
		this.socket.on("user", async () => {
			// Initial user data emit
			const initialUser = await UserDBModel.find({ _id: this.userID })
				.limit(1)
				.exec()
			if (initialUser.length > 0) {
				this.socket.emit("user", initialUser[0].toObject())
			}

			// Setup change stream to watch for updates
			this.userChangeStream = UserDBModel.watch(
				[
					{
						$match: {
							"documentKey._id": this.userID,
							operationType: { $in: ["update", "replace"] },
						},
					},
				],
				{ fullDocument: "updateLookup" }
			)

			this.userChangeStream.on("change", async () => {
				const updatedUser = await UserDBModel.find({ _id: this.userID })
					.limit(1)
					.exec()
				if (updatedUser.length > 0) {
					this.socket.emit("user", updatedUser[0].toObject())
				}
			})
		})
	}

	async off() {
		this.socket.off("user", () => {
			this.cleanup()
		})
	}

	async cleanup() {
		if (this.userChangeStream) {
			await this.userChangeStream.close()
			this.userChangeStream = null
		}
	}
}
