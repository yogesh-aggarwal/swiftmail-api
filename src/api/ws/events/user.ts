import { FIRESTORE } from "@/firebase"
import { WSBaseEvent } from "./event"

export class WSUserEvent extends WSBaseEvent {
	private userSubscription: () => void | null = null

	async on() {
		this.socket.on("user", () => {
			this.userSubscription = FIRESTORE.collection("Users")
				.doc(this.userID)
				.onSnapshot((doc) => {
					if (!doc.exists) {
						return null
					}

					const user = doc.data()
					this.socket.emit("user", user)
				})
		})
	}

	async off() {
		this.socket.off("user", () => {
			this.userSubscription?.()
		})
	}

	async cleanup() {
		this.userSubscription?.()
	}
}
