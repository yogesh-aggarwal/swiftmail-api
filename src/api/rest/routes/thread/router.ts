import { UpdateThreadCategoriesRoute } from "./categories"
import { DeleteThreadRoute } from "./delete"
import { GetThreadRoute } from "./get"
import { UpdateThreadLabelsRoute } from "./labels"
import { GetThreadMessagesRoute } from "./messages"
import { UpdateThreadReadStatusRoute } from "./read-status"
import { SearchThreadsByMessageContentRoute } from "./searchThreads"
import { UpdateThreadStarredStatusRoute } from "./star-status"

import { Router } from "express"

export const threadRouter = Router()

threadRouter.get("/search", SearchThreadsByMessageContentRoute)
threadRouter.get("/:id", GetThreadRoute)
threadRouter.delete("/:id/trash", DeleteThreadRoute)
threadRouter.patch("/:id/read", UpdateThreadReadStatusRoute)
threadRouter.patch("/:id/star", UpdateThreadStarredStatusRoute)
threadRouter.patch("/:id/labels", UpdateThreadLabelsRoute)
threadRouter.patch("/:id/categories", UpdateThreadCategoriesRoute)
threadRouter.get("/:id/messages", GetThreadMessagesRoute)
