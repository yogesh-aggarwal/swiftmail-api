import { Router } from "express"
import { PostOpenAIRoute } from "./post"

export const openaiRouter = Router()

openaiRouter.post("/", PostOpenAIRoute) 