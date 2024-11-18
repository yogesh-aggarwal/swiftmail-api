export const PORT = process.env.PORT
if (!PORT) {
	throw new Error("PORT is required in environment variables")
}

export const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
	throw new Error("MONGO_URI is required in environment variables")
}
