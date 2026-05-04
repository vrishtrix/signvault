import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getServerDb } from "$lib/server/surreal";
import { signPDF } from "$lib/server/sign-pdf";
import { readFile, writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { resolve as resolvePath } from "path";
import {
	SIGNING_CERT_PATH,
	SIGNING_CERT_PASSWORD,
} from "$env/static/private";
import { StringRecordId } from "surrealdb";

export const GET: RequestHandler = async ({ params }) => {
	const db = await getServerDb();

	const [sigReqs] = await db.query<
		[
			{
				id: { tb: string; id: string };
				document_id: { tb: string; id: string };
				requester_id: { tb: string; id: string };
				recipient_email: string;
				status: string;
				created_at: string;
			}[],
		]
	>(`SELECT * FROM signature_request WHERE id = $id`, {
		id: new StringRecordId(`signature_request:${params.token}`),
	});

	if (!sigReqs || sigReqs.length === 0) {
		throw error(404, "Signature request not found");
	}

	const sigReq = sigReqs[0];
	if (sigReq.status !== "pending") {
		throw error(
			410,
			`This signature request has already been ${sigReq.status}`,
		);
	}

	const [docs] = await db.query<
		[{ id: { tb: string; id: string }; title: string }[]]
	>(`SELECT id, title FROM document WHERE id = $id`, {
		id: sigReq.document_id,
	});

	const [requesters] = await db.query<[{ name: string; email: string }[]]>(
		`SELECT name, email FROM user WHERE id = $id`,
		{ id: sigReq.requester_id },
	);

	return json({
		id: sigReq.id,
		status: sigReq.status,
		recipient_email: sigReq.recipient_email,
		created_at: sigReq.created_at,
		document: docs?.[0] ?? null,
		requester: requesters?.[0] ?? null,
	});
};

export const POST: RequestHandler = async ({ params, request }) => {
	const db = await getServerDb();

	const [sigReqs] = await db.query<
		[
			{
				id: { tb: string; id: string };
				document_id: { tb: string; id: string };
				requester_id: { tb: string; id: string };
				recipient_email: string;
				status: string;
			}[],
		]
	>(`SELECT * FROM signature_request WHERE id = $id`, {
		id: new StringRecordId(`signature_request:${params.token}`),
	});

	if (!sigReqs || sigReqs.length === 0)
		throw error(404, "Signature request not found");

	const sigReq = sigReqs[0];
	if (sigReq.status !== "pending")
		throw error(410, "Already signed");

	const [docs] = await db.query<
		[{ id: { tb: string; id: string }; file_path: string; title: string }[]]
	>(`SELECT id, file_path, title FROM document WHERE id = $id`, {
		id: sigReq.document_id,
	});

	if (!docs || docs.length === 0) throw error(404, "Document not found");
	const doc = docs[0];

	const body = await request.json();
	const { signatureImage, llx, lly, urx, ury, pageNumber } = body;

	if (!signatureImage) throw error(400, "Signature image required");

	const pdfBuffer = await readFile(doc.file_path);

	let sigImagePath: string | undefined;
	try {
		if (signatureImage) {
			const base64Data = signatureImage.replace(
				/^data:image\/\w+;base64,/,
				"",
			);
			const imgBuffer = Buffer.from(base64Data, "base64");
			sigImagePath = `${tmpdir()}/signvault-sig-${Date.now()}.png`;
			await writeFile(sigImagePath, imgBuffer);
		}

		const certPath = resolvePath(SIGNING_CERT_PATH);
		const signedPdf = await signPDF(pdfBuffer, certPath, SIGNING_CERT_PASSWORD, {
			visible: true,
			llx: llx ?? 0,
			lly: lly ?? 0,
			urx: urx ?? 100,
			ury: ury ?? 50,
			pageNumber: pageNumber ?? 1,
			bgImagePath: sigImagePath,
			bgScale: -1,
			renderMode: "GRAPHIC_AND_DESCRIPTION",
			hashAlgorithm: "SHA256",
			l2Text: `Digitally signed by ${sigReq.recipient_email}`,
			reason: "Document signature via SignVault",
		});

		const signedPath = doc.file_path.replace(/\.pdf$/, "_signed.pdf");
		await writeFile(signedPath, signedPdf);

		await db.query(
			`UPDATE document SET status = 'signed', signed_file_path = $signed_path WHERE id = $id`,
			{ id: doc.id, signed_path: signedPath },
		);

		await db.query(
			`UPDATE signature_request SET status = 'signed' WHERE id = $id`,
			{ id: sigReq.id },
		);

		await db.query(
			`CREATE audit_log CONTENT {
				document_id: $doc_id,
				user_id: $user_id,
				action_type: 'sign',
				details: $details
			}`,
			{
				doc_id: doc.id,
				user_id: sigReq.requester_id,
				details: `Document signed by ${sigReq.recipient_email}`,
			},
		);

		return json({ status: "signed", token: params.token });
	} finally {
		if (sigImagePath) await unlink(sigImagePath).catch(() => {});
	}
};
