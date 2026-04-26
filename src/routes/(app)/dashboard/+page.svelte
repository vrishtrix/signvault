<script lang="ts">
	import { signout } from "$lib/auth";
	import { uploadDocument, getDocuments, sendSignatureRequest, downloadSignedDocument } from "$lib/api";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Dialog from "$lib/components/ui/dialog";
	import FileSignature from "@lucide/svelte/icons/file-signature";
	import Upload from "@lucide/svelte/icons/upload";
	import FilePlus from "@lucide/svelte/icons/file-plus";
	import Clock from "@lucide/svelte/icons/clock";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import LogOut from "@lucide/svelte/icons/log-out";
	import Send from "@lucide/svelte/icons/send";
	import FileText from "@lucide/svelte/icons/file-text";
	import Download from "@lucide/svelte/icons/download";

	import type { AuthUser } from "$lib/auth";

	interface Props {
		data: { user: AuthUser };
	}

	let { data }: Props = $props();

	interface Document {
		id: { tb: string; id: string } | string;
		title: string;
		status: string;
		uploaded_at: string;
	}

	let documents = $state<Document[]>([]);
	let uploadDialogOpen = $state(false);
	let sendDialogOpen = $state(false);
	let selectedDoc = $state<Document | null>(null);

	let uploadFile = $state<File | null>(null);
	let uploadTitle = $state("");
	let uploading = $state(false);
	let uploadError = $state("");

	let recipientEmail = $state("");
	let sending = $state(false);
	let sendError = $state("");
	let sendSuccess = $state("");

	$effect(() => {
		loadDocuments();
	});

	async function loadDocuments() {
		try {
			documents = await getDocuments();
		} catch {
		}
	}

	async function handleSignout() {
		await signout();
		goto("/");
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			uploadFile = file;
			if (!uploadTitle) {
				uploadTitle = file.name.replace(/\.[^/.]+$/, "");
			}
		}
	}

	async function handleUpload() {
		if (!uploadFile) return;
		uploading = true;
		uploadError = "";

		try {
			await uploadDocument(uploadFile, uploadTitle);
			uploadDialogOpen = false;
			uploadFile = null;
			uploadTitle = "";
			await loadDocuments();
		} catch (err) {
			uploadError = err instanceof Error ? err.message : "Upload failed";
		} finally {
			uploading = false;
		}
	}

	function openSendDialog(doc: Document) {
		selectedDoc = doc;
		recipientEmail = "";
		sendError = "";
		sendSuccess = "";
		sendDialogOpen = true;
	}

	async function handleSend() {
		if (!selectedDoc || !recipientEmail) return;
		sending = true;
		sendError = "";
		sendSuccess = "";

		try {
			const docId =
				typeof selectedDoc.id === "string"
					? selectedDoc.id
					: `${selectedDoc.id.tb}:${selectedDoc.id.id}`;
			await sendSignatureRequest(docId, recipientEmail);
			sendSuccess = `Signature request sent to ${recipientEmail}`;
			recipientEmail = "";
			await loadDocuments();
		} catch (err) {
			sendError = err instanceof Error ? err.message : "Failed to send";
		} finally {
			sending = false;
		}
	}

	let pendingCount = $derived(
		documents.filter((d) => d.status === "pending").length,
	);
	let signedCount = $derived(
		documents.filter((d) => d.status === "signed").length,
	);

	function statusBadgeClass(status: string): string {
		switch (status) {
			case "draft":
				return "bg-muted text-muted-foreground";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "signed":
				return "bg-green-100 text-green-800";
			default:
				return "bg-muted text-muted-foreground";
		}
	}
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
			<a href="/" class="flex items-center gap-2 font-semibold text-lg tracking-tight">
				<div class="flex size-8 items-center justify-center rounded-lg bg-primary">
					<FileSignature class="size-4 text-primary-foreground" />
				</div>
				SignVault
			</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.email}</span>
				<Button variant="ghost" size="sm" onclick={handleSignout}>
					<LogOut class="mr-2 h-4 w-4" />
					Sign out
				</Button>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-10">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">
					Welcome back, {data.user.name}
				</h1>
				<p class="mt-1 text-muted-foreground">
					Manage your documents and signature requests.
				</p>
			</div>
			<Button onclick={() => (uploadDialogOpen = true)}>
				<Upload class="mr-2 h-4 w-4" />
				Upload Document
			</Button>
		</div>

		<div class="mb-10 grid gap-4 sm:grid-cols-3">
			<div class="rounded-lg border bg-card p-6">
				<div class="flex items-center gap-3">
					<Upload class="h-5 w-5 text-muted-foreground" />
					<h3 class="font-medium">Documents</h3>
				</div>
				<p class="mt-2 text-3xl font-bold">{documents.length}</p>
				<p class="text-sm text-muted-foreground">uploaded</p>
			</div>
			<div class="rounded-lg border bg-card p-6">
				<div class="flex items-center gap-3">
					<Clock class="h-5 w-5 text-muted-foreground" />
					<h3 class="font-medium">Pending</h3>
				</div>
				<p class="mt-2 text-3xl font-bold">{pendingCount}</p>
				<p class="text-sm text-muted-foreground">awaiting signature</p>
			</div>
			<div class="rounded-lg border bg-card p-6">
				<div class="flex items-center gap-3">
					<CheckCircle class="h-5 w-5 text-muted-foreground" />
					<h3 class="font-medium">Completed</h3>
				</div>
				<p class="mt-2 text-3xl font-bold">{signedCount}</p>
				<p class="text-sm text-muted-foreground">signed documents</p>
			</div>
		</div>

		{#if documents.length === 0}
			<div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
				<FilePlus class="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 class="text-lg font-medium">No documents yet</h2>
				<p class="mb-6 text-sm text-muted-foreground">
					Upload your first document to get started.
				</p>
				<Button onclick={() => (uploadDialogOpen = true)}>
					<Upload class="mr-2 h-4 w-4" />
					Upload Document
				</Button>
			</div>
		{:else}
			<div class="rounded-lg border">
				<table class="w-full">
					<thead>
						<tr class="border-b text-sm font-medium text-muted-foreground">
							<th class="w-full px-6 py-3 text-left font-medium">Document</th>
							<th class="whitespace-nowrap px-6 py-3 text-left font-medium">Status</th>
							<th class="whitespace-nowrap px-6 py-3 text-left font-medium">Uploaded</th>
							<th class="whitespace-nowrap px-6 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each documents as doc}
							<tr class="border-b last:border-b-0">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<FileText class="h-5 w-5 text-muted-foreground" />
										<span class="font-medium">{doc.title}</span>
									</div>
								</td>
								<td class="whitespace-nowrap px-6 py-4">
									<span class="inline-block rounded-full px-2.5 py-0.5 text-center text-xs font-medium {statusBadgeClass(doc.status)}">
										{doc.status}
									</span>
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
									{new Date(doc.uploaded_at).toLocaleDateString()}
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										{#if doc.status === "signed"}
											<Button
												variant="outline"
												size="default"
												onclick={() => {
													const docId = typeof doc.id === "string" ? doc.id : `${doc.id.tb}:${doc.id.id}`;
													downloadSignedDocument(docId);
												}}
											>
												<Download class="h-3 w-3" />
												Download
											</Button>
										{:else}
											<Button
												variant="outline"
												size="default"
												onclick={() => openSendDialog(doc)}
												disabled={doc.status === "pending"}
											>
												<Send class="h-3 w-3" />
												Send for Signature
											</Button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</main>
</div>

<Dialog.Root bind:open={uploadDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Upload Document</Dialog.Title>
			<Dialog.Description>
				Upload a document to get it ready for signing.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if uploadError}
				<p class="text-sm text-destructive">{uploadError}</p>
			{/if}
			<div class="grid gap-2">
				<Label for="doc-title">Document Title</Label>
				<Input
					id="doc-title"
					bind:value={uploadTitle}
					placeholder="e.g. NDA Agreement"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="doc-file">File</Label>
				<Input
					id="doc-file"
					type="file"
					accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
					onchange={handleFileSelect}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (uploadDialogOpen = false)}>
				Cancel
			</Button>
			<Button
				onclick={handleUpload}
				disabled={uploading || !uploadFile || !uploadTitle.trim()}
			>
				{uploading ? "Uploading..." : "Upload"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={sendDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Send for Signature</Dialog.Title>
			<Dialog.Description>
				{#if selectedDoc}
					Send "{selectedDoc.title}" to a recipient for signing.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if sendError}
				<p class="text-sm text-destructive">{sendError}</p>
			{/if}
			{#if sendSuccess}
				<p class="text-sm text-green-600">{sendSuccess}</p>
			{/if}
			<div class="grid gap-2">
				<Label for="recipient-email">Recipient Email</Label>
				<Input
					id="recipient-email"
					type="email"
					bind:value={recipientEmail}
					placeholder="recipient@example.com"
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (sendDialogOpen = false)}>
				Cancel
			</Button>
			<Button
				onclick={handleSend}
				disabled={sending || !recipientEmail.trim()}
			>
				{#if sending}
					Sending...
				{:else}
					<Send class="mr-2 h-4 w-4" />
					Send Request
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
