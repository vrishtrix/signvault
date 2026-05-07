<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import FileSignature from "@lucide/svelte/icons/file-signature";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import Download from "@lucide/svelte/icons/download";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import Eraser from "@lucide/svelte/icons/eraser";
	import Check from "@lucide/svelte/icons/check";

	interface Props {
		data: {
			error?: string;
			request?: {
				id: { tb: string; id: string } | string;
				status: string;
				recipient_email: string;
				created_at: string;
				document: { title: string } | null;
				requester: { name: string; email: string } | null;
			};
			token: string;
		};
	}

	let { data }: Props = $props();

	type Step = "preview" | "place" | "draw" | "signing" | "done";
	let step = $state<Step>("preview");
	let errorMsg = $state("");

	let pdfCanvasEl = $state<HTMLCanvasElement | null>(null);
	let pdfContainerEl = $state<HTMLDivElement | null>(null);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let pdfDoc = $state<any>(null);
	let pdfScale = $state(1);
	let pdfPageWidth = $state(0);
	let pdfPageHeight = $state(0);
	let pdfLoading = $state(true);

	let selectionStart = $state<{ x: number; y: number } | null>(null);
	let selectionEnd = $state<{ x: number; y: number } | null>(null);
	let isDragging = $state(false);
	let overlayEl = $state<HTMLCanvasElement | null>(null);

	let drawCanvasEl = $state<HTMLCanvasElement | null>(null);
	let isDrawing = $state(false);
	let hasDrawn = $state(false);

	let signing = $state(false);

	$effect(() => {
		if (!data.error && data.request) {
			loadPDF();
		}
	});

	async function loadPDF() {
		pdfLoading = true;
		try {
			const pdfjsLib = await import("pdfjs-dist");
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				"pdfjs-dist/build/pdf.worker.mjs",
				import.meta.url,
			).href;

			const loadingTask = pdfjsLib.getDocument(`/api/sign/${data.token}/pdf`);
			pdfDoc = await loadingTask.promise;
			totalPages = pdfDoc.numPages;
			await renderPage(currentPage);
		} catch {
			errorMsg = "Failed to load PDF preview";
		} finally {
			pdfLoading = false;
		}
	}

	async function renderPage(pageNum: number) {
		if (!pdfDoc || !pdfCanvasEl) return;

		const page = await pdfDoc.getPage(pageNum);
		const containerWidth = pdfContainerEl?.clientWidth ?? 700;
		const unscaledViewport = page.getViewport({ scale: 1 });
		pdfScale = (containerWidth - 40) / unscaledViewport.width;
		const viewport = page.getViewport({ scale: pdfScale });

		pdfPageWidth = unscaledViewport.width;
		pdfPageHeight = unscaledViewport.height;

		pdfCanvasEl.width = viewport.width;
		pdfCanvasEl.height = viewport.height;

		const ctx = pdfCanvasEl.getContext("2d")!;
		await page.render({ canvasContext: ctx, viewport }).promise;

		if (overlayEl) {
			overlayEl.width = viewport.width;
			overlayEl.height = viewport.height;
		}

		selectionStart = null;
		selectionEnd = null;
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		renderPage(page);
	}

	function startPlacement() {
		step = "place";
		selectionStart = null;
		selectionEnd = null;
	}

	function onOverlayMouseDown(e: MouseEvent) {
		if (step !== "place" || !overlayEl) return;
		const rect = overlayEl.getBoundingClientRect();
		selectionStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		selectionEnd = null;
		isDragging = true;
	}

	function onOverlayMouseMove(e: MouseEvent) {
		if (!isDragging || !overlayEl || !selectionStart) return;
		const rect = overlayEl.getBoundingClientRect();
		selectionEnd = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		drawSelection();
	}

	function onOverlayMouseUp() {
		isDragging = false;
		if (selectionStart && selectionEnd) {
			const width = Math.abs(selectionEnd.x - selectionStart.x);
			const height = Math.abs(selectionEnd.y - selectionStart.y);
			if (width < 20 || height < 20) {
				selectionStart = null;
				selectionEnd = null;
				clearOverlay();
			}
		}
	}

	function drawSelection() {
		if (!overlayEl || !selectionStart || !selectionEnd) return;
		const ctx = overlayEl.getContext("2d")!;
		ctx.clearRect(0, 0, overlayEl.width, overlayEl.height);

		const x = Math.min(selectionStart.x, selectionEnd.x);
		const y = Math.min(selectionStart.y, selectionEnd.y);
		const w = Math.abs(selectionEnd.x - selectionStart.x);
		const h = Math.abs(selectionEnd.y - selectionStart.y);

		ctx.strokeStyle = "#2563eb";
		ctx.lineWidth = 2;
		ctx.setLineDash([6, 3]);
		ctx.strokeRect(x, y, w, h);
		ctx.fillStyle = "rgba(37, 99, 235, 0.08)";
		ctx.fillRect(x, y, w, h);
	}

	function clearOverlay() {
		if (!overlayEl) return;
		const ctx = overlayEl.getContext("2d")!;
		ctx.clearRect(0, 0, overlayEl.width, overlayEl.height);
	}

	function confirmPlacement() {
		step = "draw";
		initDrawCanvas();
	}

	function initDrawCanvas() {
		requestAnimationFrame(() => {
			if (!drawCanvasEl) return;
			drawCanvasEl.width = 500;
			drawCanvasEl.height = 200;
			const ctx = drawCanvasEl.getContext("2d")!;
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, 500, 200);
			hasDrawn = false;
		});
	}

	function onDrawStart(e: MouseEvent | TouchEvent) {
		if (!drawCanvasEl) return;
		isDrawing = true;
		hasDrawn = true;
		const ctx = drawCanvasEl.getContext("2d")!;
		const pos = getDrawPos(e);
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2.5;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
	}

	function onDrawMove(e: MouseEvent | TouchEvent) {
		if (!isDrawing || !drawCanvasEl) return;
		e.preventDefault();
		const ctx = drawCanvasEl.getContext("2d")!;
		const pos = getDrawPos(e);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
	}

	function onDrawEnd() {
		isDrawing = false;
	}

	function getDrawPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const canvas = drawCanvasEl!;
		const rect = canvas.getBoundingClientRect();
		if ("touches" in e) {
			const touch = e.touches[0] ?? e.changedTouches[0];
			return {
				x: (touch.clientX - rect.left) * (canvas.width / rect.width),
				y: (touch.clientY - rect.top) * (canvas.height / rect.height),
			};
		}
		return {
			x: (e.clientX - rect.left) * (canvas.width / rect.width),
			y: (e.clientY - rect.top) * (canvas.height / rect.height),
		};
	}

	function clearDrawing() {
		if (!drawCanvasEl) return;
		const ctx = drawCanvasEl.getContext("2d")!;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
		hasDrawn = false;
	}

	async function submitSignature() {
		if (!drawCanvasEl || !selectionStart || !selectionEnd) return;
		signing = true;
		step = "signing";
		errorMsg = "";

		try {
			const signatureImage = drawCanvasEl.toDataURL("image/png");

			const x1 = Math.min(selectionStart.x, selectionEnd.x) / pdfScale;
			const y1 = Math.min(selectionStart.y, selectionEnd.y) / pdfScale;
			const x2 = Math.max(selectionStart.x, selectionEnd.x) / pdfScale;
			const y2 = Math.max(selectionStart.y, selectionEnd.y) / pdfScale;

			const llx = x1;
			const lly = pdfPageHeight - y2;
			const urx = x2;
			const ury = pdfPageHeight - y1;

			const res = await fetch(`/api/sign/${data.token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					signatureImage,
					llx: Math.round(llx),
					lly: Math.round(lly),
					urx: Math.round(urx),
					ury: Math.round(ury),
					pageNumber: currentPage,
				}),
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: "Signing failed" }));
				throw new Error(err.message ?? "Signing failed");
			}

			step = "done";
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Signing failed";
			step = "draw";
		} finally {
			signing = false;
		}
	}

	function downloadSigned() {
		window.open(`/api/sign/${data.token}/download`, "_blank");
	}

	let placementValid = $derived(
		selectionStart !== null && selectionEnd !== null &&
		Math.abs(selectionEnd.x - selectionStart.x) >= 20 &&
		Math.abs(selectionEnd.y - selectionStart.y) >= 20,
	);
</script>

<svelte:head>
	<title>Sign Document — SignVault</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="mx-auto flex h-14 max-w-5xl items-center px-6">
			<a href="/" class="flex items-center gap-2 font-semibold text-lg tracking-tight">
				<div class="flex size-8 items-center justify-center rounded-lg bg-primary">
					<FileSignature class="size-4 text-primary-foreground" />
				</div>
				SignVault
			</a>
		</div>
	</header>

	{#if data.error}
		<div class="mx-auto mt-20 max-w-md px-6">
			<div class="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
				<AlertCircle class="mx-auto mb-4 h-12 w-12 text-destructive" />
				<h1 class="text-xl font-semibold">Unable to Load</h1>
				<p class="mt-2 text-muted-foreground">{data.error}</p>
			</div>
		</div>
	{:else if step === "done"}
		<div class="mx-auto mt-20 max-w-md px-6 text-center">
			<div class="rounded-lg border bg-card p-10">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<Check class="h-8 w-8 text-green-600" />
				</div>
				<h1 class="text-2xl font-bold">Document Signed</h1>
				<p class="mt-2 text-muted-foreground">
					Thank you! The document has been signed successfully.
				</p>
				<div class="mt-6">
					<Button size="lg" onclick={downloadSigned}>
						<Download class="mr-2 h-4 w-4" />
						Download Signed PDF
					</Button>
				</div>
			</div>
		</div>
	{:else if data.request}
		<main class="mx-auto max-w-5xl px-6 py-6">
			{#if errorMsg}
				<div class="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
					{errorMsg}
				</div>
			{/if}

			<div class="mb-4 flex items-center justify-between">
				<div>
					<h1 class="text-lg font-semibold">
						{data.request.document?.title ?? "Document"}
					</h1>
					<p class="text-sm text-muted-foreground">
						Requested by {data.request.requester?.name ?? "Unknown"}
						{#if data.request.requester?.email}
							({data.request.requester.email})
						{/if}
					</p>
				</div>

				<div class="flex items-center gap-2">
					{#if step === "preview"}
						<Button onclick={startPlacement}>
							<FileSignature class="mr-2 h-4 w-4" />
							Place Signature
						</Button>
					{:else if step === "place"}
						<span class="text-sm text-muted-foreground">
							Click and drag to select signature area
						</span>
						<Button
							onclick={confirmPlacement}
							disabled={!placementValid}
						>
							Continue
						</Button>
					{:else if step === "signing"}
						<span class="text-sm text-muted-foreground">Signing document...</span>
					{/if}
				</div>
			</div>

			<div class="rounded-lg border bg-muted/30 p-4" bind:this={pdfContainerEl}>
				{#if pdfLoading}
					<div class="flex h-96 items-center justify-center">
						<p class="text-muted-foreground">Loading PDF...</p>
					</div>
				{:else}
					<div class="relative mx-auto" style="width: fit-content;">
						<canvas bind:this={pdfCanvasEl} class="rounded shadow"></canvas>
						{#if step === "place"}
							<canvas
								bind:this={overlayEl}
								class="absolute inset-0 cursor-crosshair rounded"
								onmousedown={onOverlayMouseDown}
								onmousemove={onOverlayMouseMove}
								onmouseup={onOverlayMouseUp}
								onmouseleave={onOverlayMouseUp}
							></canvas>
						{/if}
					</div>

					{#if totalPages > 1}
						<div class="mt-3 flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onclick={() => goToPage(currentPage - 1)}
								disabled={currentPage <= 1}
							>
								<ChevronLeft class="h-4 w-4" />
							</Button>
							<span class="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onclick={() => goToPage(currentPage + 1)}
								disabled={currentPage >= totalPages}
							>
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					{/if}
				{/if}
			</div>

			{#if step === "draw"}
				<div class="mt-6 rounded-lg border bg-card p-6">
					<h2 class="mb-3 text-base font-semibold">Draw Your Signature</h2>
					<div class="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-white">
						<canvas
							bind:this={drawCanvasEl}
							class="w-full touch-none"
							style="max-width: 500px; aspect-ratio: 5/2;"
							onmousedown={onDrawStart}
							onmousemove={onDrawMove}
							onmouseup={onDrawEnd}
							onmouseleave={onDrawEnd}
							ontouchstart={onDrawStart}
							ontouchmove={onDrawMove}
							ontouchend={onDrawEnd}
						></canvas>
					</div>
					<div class="mt-4 flex items-center justify-between">
						<Button variant="outline" onclick={clearDrawing}>
							<Eraser class="mr-2 h-4 w-4" />
							Clear
						</Button>
						<div class="flex gap-2">
							<Button variant="outline" onclick={() => { step = "place"; }}>
								Back
							</Button>
							<Button
								onclick={submitSignature}
								disabled={!hasDrawn || signing}
							>
								{#if signing}
									Signing...
								{:else}
									<Check class="mr-2 h-4 w-4" />
									Sign Document
								{/if}
							</Button>
						</div>
					</div>
				</div>
			{/if}
		</main>
	{/if}
</div>
