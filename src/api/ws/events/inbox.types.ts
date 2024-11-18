import { Thread } from "@/models/thread.types"

export enum WSInboxEventInboxSubCategory {
	NeedsAttention = "Needs Attention",
	Unread = "Unread",
	EverythingElse = "Everything Else",
}
export type WSInboxEventInboxCategory = {
	unreadCount: number
	subcategories: Record<WSInboxEventInboxSubCategory, Thread[]>
}
export type WSInboxEventInboxCategories = Record<
	string,
	WSInboxEventInboxCategory
>
export type WSInboxEventInbox = {
	unreadCount: number
	categories: WSInboxEventInboxCategories
	categoryOrder: string[]
}
