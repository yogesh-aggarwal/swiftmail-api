import { Router } from "express"

import { messageRouter } from "./message/router"
import { openaiRouter } from "./openai/router"
import { threadRouter } from "./thread/router"

export const restRouter = Router()

restRouter.use("/message", messageRouter)
restRouter.use("/thread", threadRouter)
restRouter.use("/openai", openaiRouter)
