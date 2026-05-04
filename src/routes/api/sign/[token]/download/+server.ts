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

	if (sigReqs[0].status !== "signed")
		throw error(400, "Document has not been signed yet");

	const [docs] = await db.query<
		[{ title: string; signed_file_path: string }[]]
	>(`SELECT title, signed_file_path FROM document WHERE id = $id`, {
		id: sigReqs[0].document_id,
	});

	if (!docs || docs.length === 0 || !docs[0].signed_file_path)
		throw error(404, "Signed document not found");

	const pdfBytes = await readFile(docs[0].signed_file_path);

	return new Response(pdfBytes, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${docs[0].title}_signed.pdf"`,
		},
	});
};
