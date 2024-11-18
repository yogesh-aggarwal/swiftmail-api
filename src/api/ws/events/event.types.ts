import { Socket } from "socket.io"

export interface IWSEvent {
	socket: Socket
	userID: string

	on(): Promise<void>
	off(): Promise<void>

	cleanup(): Promise<void>
}
