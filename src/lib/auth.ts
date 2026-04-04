import {
	PUBLIC_SURREAL_ACCESS,
	PUBLIC_SURREAL_DATABASE,
	PUBLIC_SURREAL_NAMESPACE,
} from "$env/static/public";
import type { RecordId } from "surrealdb";

import { getDb } from "./surreal";

export interface AuthUser {
	id: RecordId;
	name: string;
	email: string;
}

export interface AuthResult {
	success: boolean;
	error?: string;
}

const TOKEN_KEY = "signvault_token";
const REFRESH_KEY = "signvault_refresh";

export function getStoredToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}

function storeTokens(access: string, refresh?: string) {
	localStorage.setItem(TOKEN_KEY, access);
	if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(REFRESH_KEY);
}

export async function signup(
	name: string,
	email: string,
	password: string,
): Promise<AuthResult> {
	try {
		const db = await getDb();
		const tokens = await db.signup({
			namespace: PUBLIC_SURREAL_NAMESPACE,
			database: PUBLIC_SURREAL_DATABASE,
			access: PUBLIC_SURREAL_ACCESS,
			variables: { name, email, password },
		});

		storeTokens(tokens.access, tokens.refresh);
		return { success: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Signup failed";
		return { success: false, error: message };
	}
}

export async function signin(
	email: string,
	password: string,
): Promise<AuthResult> {
	try {
		const db = await getDb();
		const tokens = await db.signin({
			namespace: PUBLIC_SURREAL_NAMESPACE,
			database: PUBLIC_SURREAL_DATABASE,
			access: PUBLIC_SURREAL_ACCESS,
			variables: { email, password },
		});

		storeTokens(tokens.access, tokens.refresh);
		return { success: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Signin failed";
		return { success: false, error: message };
	}
}

export async function signout(): Promise<void> {
	try {
		const db = await getDb();
		await db.invalidate();
	} catch {
	}
	clearTokens();
}

export async function restoreSession(): Promise<AuthUser | null> {
	const token = getStoredToken();
	if (!token) return null;

	try {
		const db = await getDb();
		await db.authenticate(token);
		const user = await db.auth<AuthUser>();
		return user ?? null;
	} catch {
		clearTokens();
		return null;
	}
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		const db = await getDb();
		const user = await db.auth<AuthUser>();
		return user ?? null;
	} catch {
		return null;
	}
}
