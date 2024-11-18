import { Router } from "express"

import { messageRouter } from "./message/router"
import { threadRouter } from "./thread/router"

export const rootRouter = Router()

rootRouter.get("/", (_, res) => {
	res.redirect("/health")
})

rootRouter.get("/health", (_, res) => {
	res.status(200).send("OK")
})

rootRouter.use("/message", messageRouter)
rootRouter.use("/thread", threadRouter)
