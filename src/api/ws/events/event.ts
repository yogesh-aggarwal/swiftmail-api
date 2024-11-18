import { Socket } from "socket.io"
import { IWSEvent } from "./event.types"

export class WSBaseEvent implements IWSEvent {
	socket: Socket
	userID: string

	constructor(socket: Socket, userID: string) {
		this.socket = socket
		this.userID = userID

		this.on()
		this.off()
	}

	async on() {}
	async off() {}
	async cleanup() {}
}
