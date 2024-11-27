import { configDotenv } from "dotenv"
configDotenv()

// Helper function to load from environment variables and throw an error if the variable is not set
function loadFromEnvOrThrow(key: string) {
	const value = process.env[key]
	if (!value) {
		throw new Error(`${key} is required in environment variables`)
	}
	return value
}

// Env constants
export const PORT = loadFromEnvOrThrow("PORT")
export const MONGO_URI = loadFromEnvOrThrow("MONGO_URI")
export const OPENAI_API_KEY = loadFromEnvOrThrow("OPENAI_API_KEY")

// General constants
export const IS_DEBUG = false
export const MILLIS_IN_A_DAY = 1000 * 60 * 60 * 24
