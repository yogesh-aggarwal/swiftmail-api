import { GetMessageRoute } from "./[id]"

import { Router } from "express"

export const messageRouter = Router()

messageRouter.get("/:id", GetMessageRoute)
