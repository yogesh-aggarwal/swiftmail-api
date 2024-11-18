import { auth } from "firebase-admin"
import { Socket } from "socket.io"

export async function wsAuthMiddleware(
	socket: Socket,
	next: (err?: Error) => void
) {
	const token = socket.handshake.query.token as string
	if (!token) {
		return next(new Error("Authentication token is required."))
	}

	try {
		// Verify the Firebase token
		const decodedToken = await auth().verifyIdToken(token)
		;(socket as any).userID = decodedToken.uid // Store user info in socket object
		next()
	} catch (error) {
		return next(new Error("Authentication failed: " + error.message))
	}
}
