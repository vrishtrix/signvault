<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import Clock from "@lucide/svelte/icons/clock";
	import FileSignature from "@lucide/svelte/icons/file-signature";
	import Fingerprint from "@lucide/svelte/icons/fingerprint";
	import Lock from "@lucide/svelte/icons/lock";
	import Menu from "@lucide/svelte/icons/menu";
	import PenTool from "@lucide/svelte/icons/pen-tool";
	import Send from "@lucide/svelte/icons/send";
	import ShieldCheck from "@lucide/svelte/icons/shield-check";
	import Star from "@lucide/svelte/icons/star";
	import Upload from "@lucide/svelte/icons/upload";
	import Users from "@lucide/svelte/icons/users";
	import X from "@lucide/svelte/icons/x";

	let mobileMenuOpen = $state(false);

	const features = [
		{
			icon: Fingerprint,
			title: "Cryptographic Signatures",
			description:
				"Every signature is secured with industry-standard cryptographic algorithms. Tamper-proof and legally binding.",
		},
		{
			icon: Send,
			title: "Send & Sign in Seconds",
			description:
				"Upload your document, add signers, and send. Recipients sign from any device — no account required.",
		},
		{
			icon: Lock,
			title: "End-to-End Encryption",
			description:
				"Documents are encrypted at rest and in transit. Only authorized parties can access your files.",
		},
		{
			icon: Users,
			title: "Multi-Party Signing",
			description:
				"Route documents to multiple signers in any order. Track progress in real-time with automated reminders.",
		},
		{
			icon: Clock,
			title: "Audit Trail",
			description:
				"Every action is logged with timestamps and IP addresses. Full transparency for compliance and disputes.",
		},
		{
			icon: ShieldCheck,
			title: "Compliance Ready",
			description:
				"Meets eIDAS, ESIGN, and UETA requirements. Accepted in courts across 180+ countries.",
		},
	];

	const steps = [
		{
			step: 1,
			icon: Upload,
			title: "Upload Your Document",
			description:
				"Drag and drop any PDF, Word, or image file. We support all major document formats.",
		},
		{
			step: 2,
			icon: Users,
			title: "Add Signers",
			description:
				"Enter email addresses and assign signature fields. Set the signing order if needed.",
		},
		{
			step: 3,
			icon: PenTool,
			title: "Sign & Send",
			description:
				"Signers receive an email and sign in seconds. You get notified when it's done.",
		},
	];

	const plans = [
		{
			name: "Free",
			price: "$0",
			period: "forever",
			description: "For individuals getting started",
			features: [
				"3 documents per month",
				"1 sender",
				"Basic audit trail",
				"Email support",
			],
			cta: "Get Started Free",
			popular: false,
		},
		{
			name: "Pro",
			price: "$15",
			period: "per month",
			description: "For professionals and small teams",
			features: [
				"Unlimited documents",
				"Up to 5 team members",
				"Advanced audit trail",
				"Custom branding",
				"API access",
				"Priority support",
			],
			cta: "Start Free Trial",
			popular: true,
		},
		{
			name: "Enterprise",
			price: "Custom",
			period: "per year",
			description: "For organizations at scale",
			features: [
				"Everything in Pro",
				"Unlimited team members",
				"SSO & SAML",
				"Dedicated account manager",
				"Custom integrations",
				"99.99% SLA",
			],
			cta: "Contact Sales",
			popular: false,
		},
	];

	const testimonials = [
		{
			quote: "SignVault cut our contract turnaround from days to minutes. The cryptographic verification gives our legal team complete confidence.",
			author: "Sarah Chen",
			role: "General Counsel",
			company: "Meridian Capital",
		},
		{
			quote: "We process thousands of NDAs every quarter. SignVault's API and multi-party signing made it completely seamless.",
			author: "James Okoro",
			role: "Head of Operations",
			company: "Vertex Labs",
		},
		{
			quote: "The audit trail alone is worth it. Every signature is verifiable, timestamped, and legally bulletproof.",
			author: "Maria Gonzalez",
			role: "Compliance Director",
			company: "NovaBridge Financial",
		},
	];
</script>

<svelte:head>
	<title>SignVault — Cryptographic Document Signing</title>
	<meta
		name="description"
		content="Sign, send, and verify documents with cryptographic security. Legally binding e-signatures trusted by thousands of businesses."
	/>
</svelte:head>

<nav
	class="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a
			href="/"
			class="flex items-center gap-2 font-semibold text-lg tracking-tight"
		>
			<div
				class="flex size-8 items-center justify-center rounded-lg bg-primary"
			>
				<FileSignature class="size-4 text-primary-foreground" />
			</div>
			SignVault
		</a>

		<div class="hidden items-center gap-8 md:flex">
			<a
				href="#features"
				class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>Features</a
			>
			<a
				href="#how-it-works"
				class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>How It Works</a
			>
			<a
				href="#pricing"
				class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>Pricing</a
			>
		</div>

		<div class="hidden items-center gap-3 md:flex">
			<Button variant="ghost" size="sm" href="/login">Log In</Button>
			<Button size="sm" href="/signup">Get Started</Button>
		</div>

		<button
			class="md:hidden"
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
		>
			{#if mobileMenuOpen}
				<X class="size-5" />
			{:else}
				<Menu class="size-5" />
			{/if}
		</button>
	</div>

	{#if mobileMenuOpen}
		<div
			class="border-t border-border/40 bg-background px-6 py-4 md:hidden"
		>
			<div class="flex flex-col gap-4">
				<a
					href="#features"
					class="text-sm text-muted-foreground"
					onclick={() => (mobileMenuOpen = false)}>Features</a
				>
				<a
					href="#how-it-works"
					class="text-sm text-muted-foreground"
					onclick={() => (mobileMenuOpen = false)}>How It Works</a
				>
				<a
					href="#pricing"
					class="text-sm text-muted-foreground"
					onclick={() => (mobileMenuOpen = false)}>Pricing</a
				>
				<Separator />
				<div class="flex flex-col gap-2">
					<Button
						variant="outline"
						size="sm"
						class="w-full"
						href="/login">Log In</Button
					>
					<Button size="sm" class="w-full" href="/signup"
						>Get Started</Button
					>
				</div>
			</div>
		</div>
	{/if}
</nav>

<main>
	<section class="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
		<div
			class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background"
		></div>

		<div class="mx-auto max-w-6xl px-6 text-center">
			<Badge variant="outline" class="mb-6 gap-1.5 px-3 py-1">
				<ShieldCheck class="size-3" />
				Bank-grade cryptographic security
			</Badge>

			<h1
				class="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
			>
				Sign documents with
				<span
					class="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
				>
					cryptographic proof
				</span>
			</h1>

			<p
				class="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl"
			>
				The modern way to sign, send, and verify documents. Legally
				binding signatures backed by cryptography — not just images.
			</p>

			<div
				class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
			>
				<Button
					size="lg"
					class="w-full sm:w-auto gap-2 px-8 text-base"
					href="/signup"
				>
					Start Signing Free
					<ArrowRight class="size-4" />
				</Button>
				<Button
					variant="outline"
					size="lg"
					class="w-full sm:w-auto px-8 text-base"
				>
					Watch Demo
				</Button>
			</div>

			<p class="mt-4 text-sm text-muted-foreground">
				No credit card required. Free plan available.
			</p>

			<div class="mx-auto mt-16 max-w-4xl">
				<div
					class="rounded-xl border border-border/60 bg-card p-2 shadow-2xl shadow-primary/5"
				>
					<div
						class="rounded-lg border border-border/40 bg-muted/30 p-8 md:p-12"
					>
						<div
							class="flex items-center justify-between border-b border-border/40 pb-4"
						>
							<div class="flex items-center gap-3">
								<div
									class="size-3 rounded-full bg-red-400"
								></div>
								<div
									class="size-3 rounded-full bg-yellow-400"
								></div>
								<div
									class="size-3 rounded-full bg-green-400"
								></div>
							</div>
							<span class="text-xs text-muted-foreground"
								>NDA_Agreement_2026.pdf</span
							>
						</div>
						<div class="mt-6 space-y-3 text-left">
							<div
								class="h-3 w-3/4 rounded bg-muted-foreground/10"
							></div>
							<div
								class="h-3 w-full rounded bg-muted-foreground/10"
							></div>
							<div
								class="h-3 w-5/6 rounded bg-muted-foreground/10"
							></div>
							<div
								class="h-3 w-2/3 rounded bg-muted-foreground/10"
							></div>
							<div
								class="mt-8 h-3 w-full rounded bg-muted-foreground/10"
							></div>
							<div
								class="h-3 w-4/5 rounded bg-muted-foreground/10"
							></div>
							<div
								class="h-3 w-3/4 rounded bg-muted-foreground/10"
							></div>
						</div>
						<div
							class="mt-10 flex items-end justify-between border-t border-border/40 pt-6"
						>
							<div>
								<p class="text-xs text-muted-foreground">
									Signed by
								</p>
								<p class="mt-1 font-medium text-sm">
									Alex Johnson
								</p>
								<p class="text-xs text-muted-foreground">
									March 13, 2026 · 2:34 PM
								</p>
							</div>
							<div
								class="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5"
							>
								<CheckCircle class="size-4 text-green-600" />
								<span class="text-sm font-medium text-green-600"
									>Verified</span
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="border-y border-border/40 bg-muted/20 py-12">
		<div class="mx-auto max-w-6xl px-6">
			<p class="text-center text-sm font-medium text-muted-foreground">
				Trusted by teams at companies worldwide
			</p>
			<div
				class="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
			>
				{#each ["Meridian Capital", "Vertex Labs", "NovaBridge", "Archway Legal", "Pinnacle Health"] as company}
					<span
						class="text-lg font-semibold tracking-tight text-muted-foreground/50"
						>{company}</span
					>
				{/each}
			</div>
		</div>
	</section>

	<section id="features" class="scroll-mt-20 py-20 md:py-32">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mx-auto max-w-2xl text-center">
				<Badge variant="outline" class="mb-4">Features</Badge>
				<h2 class="text-3xl font-bold tracking-tight md:text-4xl">
					Everything you need to sign with confidence
				</h2>
				<p class="mt-4 text-muted-foreground text-lg">
					More than just e-signatures. SignVault provides
					cryptographic proof that your documents are authentic,
					unaltered, and legally binding.
				</p>
			</div>

			<div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as feature}
					<div
						class="group rounded-xl border border-border/40 bg-card p-6 transition-all hover:border-border hover:shadow-md"
					>
						<div
							class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
						>
							<feature.icon class="size-5" />
						</div>
						<h3 class="mt-4 text-lg font-semibold">
							{feature.title}
						</h3>
						<p
							class="mt-2 text-sm text-muted-foreground leading-relaxed"
						>
							{feature.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section
		id="how-it-works"
		class="scroll-mt-20 border-y border-border/40 bg-muted/20 py-20 md:py-32"
	>
		<div class="mx-auto max-w-6xl px-6">
			<div class="mx-auto max-w-2xl text-center">
				<Badge variant="outline" class="mb-4">How It Works</Badge>
				<h2 class="text-3xl font-bold tracking-tight md:text-4xl">
					Three steps to a signed document
				</h2>
				<p class="mt-4 text-lg text-muted-foreground">
					No complicated setup. No learning curve. Just upload,
					assign, and sign.
				</p>
			</div>

			<div class="mt-16 grid gap-8 md:grid-cols-3">
				{#each steps as step}
					<div class="relative text-center">
						<div
							class="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm"
						>
							<step.icon class="size-7 text-primary" />
						</div>
						<div class="mt-1 flex items-center justify-center">
							<span
								class="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
							>
								{step.step}
							</span>
						</div>
						<h3 class="mt-3 text-lg font-semibold">{step.title}</h3>
						<p
							class="mt-2 text-sm text-muted-foreground leading-relaxed"
						>
							{step.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="py-20 md:py-32">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mx-auto max-w-2xl text-center">
				<Badge variant="outline" class="mb-4">Testimonials</Badge>
				<h2 class="text-3xl font-bold tracking-tight md:text-4xl">
					Loved by teams everywhere
				</h2>
			</div>

			<div class="mt-16 grid gap-8 md:grid-cols-3">
				{#each testimonials as testimonial}
					<div
						class="flex flex-col rounded-xl border border-border/40 bg-card p-6"
					>
						<div class="mb-4 flex gap-1">
							{#each Array(5) as _}
								<Star
									class="size-4 fill-primary text-primary"
								/>
							{/each}
						</div>
						<blockquote
							class="flex-1 text-sm leading-relaxed text-muted-foreground"
						>
							"{testimonial.quote}"
						</blockquote>
						<div class="mt-6 flex items-center gap-3">
							<div
								class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
							>
								{testimonial.author[0]}
							</div>
							<div>
								<p class="text-sm font-medium">
									{testimonial.author}
								</p>
								<p class="text-xs text-muted-foreground">
									{testimonial.role}, {testimonial.company}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section
		id="pricing"
		class="scroll-mt-20 border-y border-border/40 bg-muted/20 py-20 md:py-32"
	>
		<div class="mx-auto max-w-6xl px-6">
			<div class="mx-auto max-w-2xl text-center">
				<Badge variant="outline" class="mb-4">Pricing</Badge>
				<h2 class="text-3xl font-bold tracking-tight md:text-4xl">
					Simple, transparent pricing
				</h2>
				<p class="mt-4 text-lg text-muted-foreground">
					Start free. Upgrade when you're ready. No hidden fees.
				</p>
			</div>

			<div class="mt-16 grid gap-8 md:grid-cols-3">
				{#each plans as plan}
					<div
						class="relative flex flex-col rounded-xl border bg-card p-8 {plan.popular
							? 'border-primary shadow-lg shadow-primary/10'
							: 'border-border/40'}"
					>
						{#if plan.popular}
							<div
								class="absolute -top-3 left-1/2 -translate-x-1/2"
							>
								<Badge class="px-3">Most Popular</Badge>
							</div>
						{/if}

						<div>
							<h3 class="text-lg font-semibold">{plan.name}</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								{plan.description}
							</p>
						</div>

						<div class="mt-6">
							<span class="text-4xl font-bold">{plan.price}</span>
							<span class="text-sm text-muted-foreground">
								/ {plan.period}</span
							>
						</div>

						<ul class="mt-8 flex-1 space-y-3">
							{#each plan.features as feature}
								<li class="flex items-center gap-2 text-sm">
									<CheckCircle
										class="size-4 shrink-0 text-primary"
									/>
									{feature}
								</li>
							{/each}
						</ul>

						<Button
							variant={plan.popular ? "default" : "outline"}
							class="mt-8 w-full"
						>
							{plan.cta}
						</Button>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="py-20 md:py-32">
		<div class="mx-auto max-w-6xl px-6">
			<div
				class="rounded-2xl border border-border/40 bg-linear-to-br from-primary/5 via-background to-primary/5 px-8 py-16 text-center md:px-16"
			>
				<h2 class="text-3xl font-bold tracking-tight md:text-4xl">
					Ready to sign smarter?
				</h2>
				<p class="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
					Join thousands of businesses using SignVault for secure,
					verifiable document signing.
				</p>
				<div
					class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
				>
					<Button
						size="lg"
						class="w-full sm:w-auto gap-2 px-8 text-base"
						href="/signup"
					>
						Get Started Free
						<ArrowRight class="size-4" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						class="w-full sm:w-auto px-8 text-base"
					>
						Talk to Sales
					</Button>
				</div>
			</div>
		</div>
	</section>
</main>

<footer class="border-t border-border/40 bg-muted/20">
	<div class="mx-auto max-w-6xl px-6 py-12">
		<div class="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
			<div class="sm:col-span-2 md:col-span-1">
				<a
					href="/"
					class="flex items-center gap-2 font-semibold text-lg tracking-tight"
				>
					<div
						class="flex size-8 items-center justify-center rounded-lg bg-primary"
					>
						<FileSignature class="size-4 text-primary-foreground" />
					</div>
					SignVault
				</a>
				<p class="mt-3 text-sm text-muted-foreground leading-relaxed">
					Cryptographic document signing for modern teams.
				</p>
			</div>

			<div>
				<h4 class="text-sm font-semibold">Product</h4>
				<ul class="mt-3 space-y-2">
					<li>
						<a
							href="#features"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Features</a
						>
					</li>
					<li>
						<a
							href="#pricing"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Pricing</a
						>
					</li>
					<li>
						<a
							href="/api"
							class="text-sm text-muted-foreground hover:text-foreground"
							>API</a
						>
					</li>
					<li>
						<a
							href="/integrations"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Integrations</a
						>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="text-sm font-semibold">Company</h4>
				<ul class="mt-3 space-y-2">
					<li>
						<a
							href="/about"
							class="text-sm text-muted-foreground hover:text-foreground"
							>About</a
						>
					</li>
					<li>
						<a
							href="/blog"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Blog</a
						>
					</li>
					<li>
						<a
							href="/careers"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Careers</a
						>
					</li>
					<li>
						<a
							href="/contact"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Contact</a
						>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="text-sm font-semibold">Legal</h4>
				<ul class="mt-3 space-y-2">
					<li>
						<a
							href="/privacy"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Privacy Policy</a
						>
					</li>
					<li>
						<a
							href="/terms"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Terms of Service</a
						>
					</li>
					<li>
						<a
							href="/security"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Security</a
						>
					</li>
					<li>
						<a
							href="/compliance"
							class="text-sm text-muted-foreground hover:text-foreground"
							>Compliance</a
						>
					</li>
				</ul>
			</div>
		</div>

		<Separator class="my-8" />

		<div
			class="flex flex-col items-center justify-between gap-4 sm:flex-row"
		>
			<p class="text-sm text-muted-foreground">
				&copy; 2026 SignVault. All rights reserved.
			</p>
			<div class="flex gap-6">
				<a
					href="/twitter"
					class="text-sm text-muted-foreground hover:text-foreground"
					>Twitter</a
				>
				<a
					href="/github"
					class="text-sm text-muted-foreground hover:text-foreground"
					>GitHub</a
				>
				<a
					href="/linkedin"
					class="text-sm text-muted-foreground hover:text-foreground"
					>LinkedIn</a
				>
			</div>
		</div>
	</div>
</footer>
