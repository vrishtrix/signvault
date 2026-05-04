import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getServerDb } from "$lib/server/surreal";
import { readFile } from "fs/promises";
import { StringRecordId } from "surrealdb";

export const GET: RequestHandler = async ({ params }) => {
	const db = await getServerDb();

	const [sigReqs] = await db.query<
		[{ document_id: { tb: string; id: string }; status: string }[]]
	>(`SELECT document_id, status FROM signature_request WHERE id = $id`, {
		id: new StringRecordId(`signature_request:${params.token}`),
	});

	if (!sigReqs || sigReqs.length === 0)
		throw error(404, "Signature request not found");

	const sigReq = sigReqs[0];

	const [docs] = await db.query<[{ file_path: string }[]]>(
		`SELECT file_path FROM document WHERE id = $id`,
		{ id: sigReq.document_id },
	);

	if (!docs || docs.length === 0) throw error(404, "Document not found");

	const pdfBytes = await readFile(docs[0].file_path);

	return new Response(pdfBytes, {
		headers: {
			"Content-Type": "application/pdf",
			"Cache-Control": "private, no-store",
		},
	});
};
