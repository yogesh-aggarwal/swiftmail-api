import { customAlphabet } from "nanoid"
import { v4 as uuidv4 } from "uuid"

/**
 * Generates a unique ID using nanoid with a custom alphabet
 * @param length Length of the ID to generate (default: 21)
 * @returns A unique string ID
 */
export function generateNanoid(length: number = 21): string {
	// Using a custom alphabet that's URL-safe and unambiguous
	const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", length)
	return nanoid()
}

/**
 * Generates a UUID v4
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
	return uuidv4()
}
