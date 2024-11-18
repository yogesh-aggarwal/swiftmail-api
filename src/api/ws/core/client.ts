import { Socket } from "socket.io"
import { WSBaseEvent } from "../events/event"
import { WSUserEvent } from "../events/user"

export class WSClient {
	socket: Socket | null
	userID: string

	constructor(socket: Socket) {
		this.socket = socket
		this.userID = (socket as any).userID

		this.handleConnect()
		this.socket.on("disconnect", () => this.handleDisconnect())

		this.bindAdditionalEvents()
	}

	private handleConnect() {
		console.log(`User connected with UID: ${this.userID}`)
	}

	private handleDisconnect() {
		console.log(`User disconnected with UID: ${this.userID}`)
	}

	private bindAdditionalEvents() {
		const events: (typeof WSBaseEvent)[] = [
			// Common events
			WSUserEvent,
		]

		// Bind events to the socket
		for (const Event of events) new Event(this.socket, this.userID)
	}
}
