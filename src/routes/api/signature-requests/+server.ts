import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "$lib/server/auth";
import { getServerDb } from "$lib/server/surreal";
import { sendSignatureRequestEmail } from "$lib/server/email";
import { PUBLIC_APP_URL } from "$env/static/public";
import { StringRecordId } from "surrealdb";

export const POST: RequestHandler = async (event) => {
	const user = await getAuthenticatedUser(event);
	if (!user) throw error(401, "Unauthorized");

	const body = await event.request.json();
	const { document_id, recipient_email } = body;

	if (!document_id) throw error(400, "Document ID is required");
	if (!recipient_email) throw error(400, "Recipient email is required");

	const db = await getServerDb();

	const [docs] = await db.query<
		[{ id: { tb: string; id: string }; title: string; owner_id: { tb: string; id: string } }[]]
	>(`SELECT id, title, owner_id FROM document WHERE id = $doc_id`, {
		doc_id: new StringRecordId(document_id),
	});

	if (!docs || docs.length === 0) throw error(404, "Document not found");

	const doc = docs[0];

	const [sigReqs] = await db.query<[{ id: { tb: string; id: string } }[]]>(
		`CREATE signature_request CONTENT {
			document_id: $document_id,
			requester_id: $requester_id,
			recipient_email: $recipient_email,
			status: 'pending'
		}`,
		{
			document_id: doc.id,
			requester_id: user.id,
			recipient_email,
		},
	);

	const sigReq = sigReqs[0];
	const sigReqId =
		typeof sigReq.id === "string" ? sigReq.id : sigReq.id.id;

	await db.query(
		`UPDATE document SET status = 'pending' WHERE id = $doc_id`,
		{ doc_id: doc.id },
	);

	const signingUrl = `${PUBLIC_APP_URL}/sign/${encodeURIComponent(sigReqId)}`;

	await sendSignatureRequestEmail({
		recipientEmail: recipient_email,
		documentTitle: doc.title,
		requesterName: user.name,
		signingUrl,
	});

	await db.query(
		`CREATE audit_log CONTENT {
			document_id: $doc_id,
			user_id: $user_id,
			action_type: 'share',
			ip_address: $ip,
			details: $details
		}`,
		{
			doc_id: doc.id,
			user_id: user.id,
			action_type: "share",
			ip: event.getClientAddress(),
			details: `Sent signature request to ${recipient_email}`,
		},
	);

	return json({
		id: sigReq.id,
		status: "pending",
		recipient_email,
		signing_url: signingUrl,
	});
};
