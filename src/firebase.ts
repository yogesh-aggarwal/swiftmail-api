import { auth, credential } from "firebase-admin"
import { initializeApp, ServiceAccount } from "firebase-admin/app"
import credentials from "../credentials.json"

initializeApp({ credential: credential.cert(credentials as ServiceAccount) })

export const AUTH = auth()
