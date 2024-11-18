import { UpdateThreadCategoriesRoute } from "./categories"
import { DeleteThreadRoute } from "./delete"
import { GetThreadRoute } from "./get"
import { UpdateThreadLabelsRoute } from "./labels"
import { UpdateThreadReadStatusRoute } from "./read-status"
import { UpdateThreadStarredStatusRoute } from "./star-status"
import { GetThreadMessagesRoute } from "./messages"

import { Router } from "express"

export const threadRouter = Router()

threadRouter.get("/:id", GetThreadRoute)
threadRouter.delete("/:id", DeleteThreadRoute)
threadRouter.patch("/:id/read", UpdateThreadReadStatusRoute)
threadRouter.patch("/:id/star", UpdateThreadStarredStatusRoute)
threadRouter.patch("/:id/labels", UpdateThreadLabelsRoute)
threadRouter.patch("/:id/categories", UpdateThreadCategoriesRoute)
threadRouter.get("/:id/messages", GetThreadMessagesRoute)
