import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "$lib/server/auth";
import { getServerDb } from "$lib/server/surreal";
import { readFile } from "fs/promises";
import { StringRecordId } from "surrealdb";

export const GET: RequestHandler = async (event) => {
	const user = await getAuthenticatedUser(event);
	if (!user) throw error(401, "Unauthorized");

	const db = await getServerDb();

	const [docs] = await db.query<
		[
			{
				title: string;
				signed_file_path: string;
				owner_id: { tb: string; id: string };
			}[],
		]
	>(
		`SELECT title, signed_file_path, owner_id FROM document WHERE id = $id`,
		{ id: new StringRecordId(event.params.id) },
	);

	if (!docs || docs.length === 0) throw error(404, "Document not found");

	const doc = docs[0];
	if (!doc.signed_file_path)
		throw error(400, "Document has not been signed yet");

	const pdfBytes = await readFile(doc.signed_file_path);

	return new Response(pdfBytes, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${doc.title}_signed.pdf"`,
		},
	});
};
