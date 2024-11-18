import { Router } from "express"

import { messageRouter } from "./message/router"

export const rootRouter = Router()

rootRouter.get("/", (_, res) => {
	res.redirect("/health")
})

rootRouter.get("/health", (_, res) => {
	res.status(200).send("OK")
})

rootRouter.use("/message", messageRouter)
