import { getStoredToken } from "./auth";

function authHeaders(): HeadersInit {
	const token = getStoredToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadDocument(file: File, title: string) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("title", title);

	const res = await fetch("/api/documents", {
		method: "POST",
		headers: authHeaders(),
		body: formData,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message ?? "Upload failed");
	}

	return res.json();
}

export async function getDocuments() {
	const res = await fetch("/api/documents", {
		headers: authHeaders(),
	});

	if (!res.ok) throw new Error("Failed to fetch documents");
	return res.json();
}

export async function sendSignatureRequest(
	documentId: string,
	recipientEmail: string,
) {
	const res = await fetch("/api/signature-requests", {
		method: "POST",
		headers: {
			...authHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			document_id: documentId,
			recipient_email: recipientEmail,
		}),
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message ?? "Failed to send signature request");
	}

	return res.json();
}

export async function downloadSignedDocument(documentId: string) {
	const res = await fetch(
		`/api/documents/${encodeURIComponent(documentId)}/download`,
		{ headers: authHeaders() },
	);

	if (!res.ok) throw new Error("Failed to download");

	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download =
		res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
		"signed.pdf";
	a.click();
	URL.revokeObjectURL(url);
}
