import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_SECURE,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
} from "$env/static/private";
import { createMessage } from "@upyo/core";
import { SmtpTransport } from "@upyo/smtp";

let transport: SmtpTransport | null = null;

function getTransport(): SmtpTransport {
	if (transport) return transport;

	const auth =
		SMTP_USER && SMTP_PASS
			? { user: SMTP_USER, pass: SMTP_PASS }
			: undefined;

	transport = new SmtpTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: SMTP_SECURE === "true",
		auth,
	});

	return transport;
}

export async function sendSignatureRequestEmail(opts: {
	recipientEmail: string;
	documentTitle: string;
	requesterName: string;
	signingUrl: string;
}) {
	const message = createMessage({
		from: SMTP_FROM,
		to: opts.recipientEmail,
		subject: `${opts.requesterName} has requested your signature on "${opts.documentTitle}"`,
		content: {
			text: [
				`Hi,`,
				``,
				`${opts.requesterName} has requested your signature on the document "${opts.documentTitle}".`,
				``,
				`Please click the link below to review and sign the document:`,
				`${opts.signingUrl}`,
				``,
				`If you did not expect this request, you can safely ignore this email.`,
				``,
				`— SignVault`,
			].join("\n"),
		},
	});

	const receipt = await getTransport().send(message);
	if (!receipt.successful) {
		throw new Error(
			`Failed to send email: ${receipt.errorMessages.join(", ")}`,
		);
	}
	return receipt;
}
