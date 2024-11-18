import { configDotenv } from "dotenv"
configDotenv()

export const IS_DEBUG = false
export const PORT = process.env.PORT || 3000

export const MILLIS_IN_A_DAY = 1000 * 60 * 60 * 24
