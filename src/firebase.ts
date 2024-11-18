import { credential } from "firebase-admin"
import { initializeApp, ServiceAccount } from "firebase-admin/app"
import credentials from "../credentials.json"

export function InitializeFirebase() {
	initializeApp({ credential: credential.cert(credentials as ServiceAccount) })
}
