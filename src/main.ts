import cors from "cors"
import express from "express"
import http from "http"

import { rootRouter } from "@/rest/routes/router"
import { WSServer } from "@/ws/core/server"
import mongoose from "mongoose"
import { PORT } from "./constants"
import { MONGO_URI } from "./core/constants"
import { InitializeFirebase } from "./firebase"

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

app.use("/api", rootRouter)

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
