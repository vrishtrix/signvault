import { SURREAL_USER, SURREAL_PASS } from "$env/static/private";
import {
	PUBLIC_SURREAL_URL,
	PUBLIC_SURREAL_NAMESPACE,
	PUBLIC_SURREAL_DATABASE,
} from "$env/static/public";
import { Surreal } from "surrealdb";

let db: Surreal | null = null;

export async function getServerDb(): Promise<Surreal> {
	if (db && db.isConnected) return db;

	db = new Surreal();
	await db.connect(PUBLIC_SURREAL_URL);
	await db.signin({ username: SURREAL_USER, password: SURREAL_PASS });
	await db.use({
		namespace: PUBLIC_SURREAL_NAMESPACE,
		database: PUBLIC_SURREAL_DATABASE,
	});
	return db;
}
