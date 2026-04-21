import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "$lib/server/auth";
import { getServerDb } from "$lib/server/surreal";
import { mkdir, writeFile } from "node:fs/promises";

const UPLOAD_DIR = "uploads";

export const POST: RequestHandler = async (event) => {
	const user = await getAuthenticatedUser(event);
	if (!user) throw error(401, "Unauthorized");

	const formData = await event.request.formData();
	const file = formData.get("file") as File | null;
	const title = formData.get("title") as string | null;

	if (!file) throw error(400, "No file provided");
	if (!title?.trim()) throw error(400, "Title is required");

	const ext = file.name.split(".").pop() ?? "pdf";
	const filename = `${crypto.randomUUID()}.${ext}`;
	const filePath = `${UPLOAD_DIR}/${filename}`;

	await mkdir(UPLOAD_DIR, { recursive: true });
	await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));

	const db = await getServerDb();
	const [doc] = await db.query<[{ id: { tb: string; id: string } }[]]>(
		`CREATE document CONTENT {
			owner_id: $owner_id,
			title: $title,
			file_path: $file_path,
			status: 'draft'
		}`,
		{
			owner_id: user.id,
			title: title.trim(),
			file_path: filePath,
		},
	);

	await db.query(
		`CREATE audit_log CONTENT {
			document_id: $doc_id,
			user_id: $user_id,
			action_type: 'upload',
			ip_address: $ip,
			details: $details
		}`,
		{
			doc_id: doc[0].id,
			user_id: user.id,
			action_type: "upload",
			ip: event.getClientAddress(),
			details: `Uploaded file: ${file.name}`,
		},
	);

	return json({ id: doc[0].id, title: title.trim(), status: "draft" });
};

export const GET: RequestHandler = async (event) => {
	const user = await getAuthenticatedUser(event);
	if (!user) throw error(401, "Unauthorized");

	const db = await getServerDb();
	const [documents] = await db.query<
		[{ id: { tb: string; id: string }; title: string; status: string; uploaded_at: string }[]]
	>(
		`SELECT id, title, status, uploaded_at FROM document WHERE owner_id = $owner_id ORDER BY uploaded_at DESC`,
		{ owner_id: user.id },
	);

	return json(documents ?? []);
};
