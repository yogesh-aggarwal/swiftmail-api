// Helper types defined first
export type EmailVolumeData = {
	data: Array<{
		timestamp: string
		count: number
	}>
	timeRange: "day" | "week" | "month" | "year"
}

export type PriorityDistribution = {
	high: number
	medium: number
	low: number
}

export type CategoryDistribution = {
	category: string
	count: number
}

export type LabelDistribution = {
	label: string
	count: number
}

export type PeopleStats = {
	email: string
	importanceScore: number
	emailCount: number
}

// Main dashboard type using the helper types
export type WSDashboardEventDashboard = {
	vitals: {
		unreadCount: number
		averageDeliveryTime: number
		emailVolumeChart: EmailVolumeData
	}
	contentStats: {
		priorityDistribution: PriorityDistribution
		categoryDistribution: Array<CategoryDistribution>
		labelDistribution: Array<LabelDistribution>
		customQuery: {
			query: string
			results: Array<{
				timestamp: string
				count: number
			}>
		}
	}
	peopleStats: Array<PeopleStats>
}
