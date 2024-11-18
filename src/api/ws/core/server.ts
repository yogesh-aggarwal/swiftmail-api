import http from "http"
import { Server } from "socket.io"

import { wsAuthMiddleware } from "../middlewares/auth"
import { WSClient } from "./client"

export class WSServer {
	private static server: Server | null = null

	static initialize(options: {
		endpoint: string
		cors: "*" | string | string[]
		server: http.Server
	}) {
		this.server = new Server(options.server, {
			path: options.endpoint,
			cors: {
				origin: options.cors,
				methods: ["GET", "POST"],
			},
		})

		this.server.use(wsAuthMiddleware)
		this.server.on("connection", (socket) => new WSClient(socket))
	}
}
