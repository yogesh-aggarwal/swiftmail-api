import cors from "cors"
import express from "express"
import http from "http"

import { WSServer } from "@/ws/core/server"
import { PORT } from "./constants"
import { Initialize } from "./core/initialize"

//----------------------------------------------------------------------------------------------

Initialize()

//----------------------------------------------------------------------------------------------

const app = express()

//----------------------------------------------------------------------------------------------

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: ["http://localhost:5173"] }))

//----------------------------------------------------------------------------------------------

app.get("/", (_, res) => {
	res.redirect("/health")
})

app.get("/health", (_, res) => {
	res.status(200).send("OK")
})

//----------------------------------------------------------------------------------------------

const server = http.createServer(app)
WSServer.initialize({
	cors: "*",
	server: server,
	endpoint: "/ws",
})

server.listen(PORT, () => {
	console.log(`Server is running at 0.0.0.0:${PORT}`)
})

//----------------------------------------------------------------------------------------------
