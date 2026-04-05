import {
	PUBLIC_SURREAL_URL,
	PUBLIC_SURREAL_NAMESPACE,
	PUBLIC_SURREAL_DATABASE,
} from "$env/static/public";
import type { RequestEvent } from "@sveltejs/kit";
import { Surreal, type RecordId } from "surrealdb";

export interface ServerUser {
	id: RecordId;
	name: string;
	email: string;
}

export async function getAuthenticatedUser(
	event: RequestEvent,
): Promise<ServerUser | null> {
	const authHeader = event.request.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return null;

	const token = authHeader.slice(7);
	const db = new Surreal();

	try {
		await db.connect(PUBLIC_SURREAL_URL);
		await db.use({
			namespace: PUBLIC_SURREAL_NAMESPACE,
			database: PUBLIC_SURREAL_DATABASE,
		});
		await db.authenticate(token);
		const user = await db.auth<ServerUser>();
		return user ?? null;
	} catch {
		return null;
	} finally {
		await db.close();
	}
}
