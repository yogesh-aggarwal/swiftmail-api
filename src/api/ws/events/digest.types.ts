import { Thread } from "@/models/thread.types"

export enum WSDigestEventSubCategory {
	NeedsAttention = "Needs Attention",
	Unread = "Unread",
	EverythingElse = "Everything Else",
}

export type WSDigestEventData = {
	id: string
	name: string
	unreadCount: number
	threads: Thread[]
}

export type WSDigestEvent = {
	unreadCount: number
	digests: Record<string, WSDigestEventData>
}
