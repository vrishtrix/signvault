import {
	PUBLIC_SURREAL_DATABASE,
	PUBLIC_SURREAL_NAMESPACE,
	PUBLIC_SURREAL_URL,
} from "$env/static/public";
import { Surreal } from "surrealdb";

let db: Surreal | null = null;

export async function getDb(): Promise<Surreal> {
	if (db && db.isConnected) return db;

	db = new Surreal();
	await db.connect(PUBLIC_SURREAL_URL);
	await db.use({
		namespace: PUBLIC_SURREAL_NAMESPACE,
		database: PUBLIC_SURREAL_DATABASE,
	});
	return db;
}
