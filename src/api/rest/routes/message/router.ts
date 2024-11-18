import { GetMessageRoute } from "./get"
import { Router } from "express"

export const messageRouter = Router()

messageRouter.get("/:id", GetMessageRoute)
