import cors from "cors"
import express from "express"
import http from "http"

import { restRouter } from "@/rest/routes/router"
import { WSServer } from "@/ws/core/server"
import mongoose from "mongoose"
import { MONGO_URI, PORT } from "./core/constants"
import { InitializeFirebase } from "./core/firebase"

//----------------------------------------------------------------------------------------------
// Express App
//----------------------------------------------------------------------------------------------

const app = express()

//----------------------------------------------------------------------------------------------
// Middlewares
//----------------------------------------------------------------------------------------------

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: ["http://localhost:5173"] }))

//----------------------------------------------------------------------------------------------
// Routes
//----------------------------------------------------------------------------------------------

app.get("/", (_, res) => {
	res.redirect("/health")
})
app.get("/health", (_, res) => {
	res.status(200).send("OK")
})

app.use("/api", restRouter)

//----------------------------------------------------------------------------------------------
// WebSocket Server
//----------------------------------------------------------------------------------------------

const server = http.createServer(app)
WSServer.initialize({
	cors: "*",
	server: server,
	endpoint: "/ws",
})

//----------------------------------------------------------------------------------------------
// MongoDB connection
//----------------------------------------------------------------------------------------------

mongoose.connect(MONGO_URI, { dbName: "swiftmail" }).then(() => {
	console.log("Connected to MongoDB")

	// Initialize Firebase
	InitializeFirebase()

	// Server listen
	server.listen(PORT, () => {
		console.log(`Server is running at 0.0.0.0:${PORT}`)
	})
})

//----------------------------------------------------------------------------------------------
