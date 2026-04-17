<script lang="ts">
	import { goto } from "$app/navigation";
	import { signup } from "$lib/auth";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { signupSchema } from "$lib/schemas/auth";
	import FileSignature from "@lucide/svelte/icons/file-signature";
	import Mail from "@lucide/svelte/icons/mail";

	let error = $state("");
	let fieldErrors = $state<Record<string, string>>({});
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = "";
		fieldErrors = {};

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const data = Object.fromEntries(formData);
		const parsed = signupSchema.safeParse(data);

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0] as string;
				fieldErrors[field] ??= issue.message;
			}
			return;
		}

		loading = true;

		const result = await signup(
			parsed.data.name,
			parsed.data.email,
			parsed.data.password,
		);

		if (result.success) {
			goto("/dashboard");
		} else {
			error = result.error ?? "Signup failed";
		}

		loading = false;
	}
</script>

<div
	class="container mx-auto relative flex h-screen items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<div
		class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex"
	>
		<div class="absolute inset-0 bg-zinc-900"></div>
		<div class="relative z-20 flex items-center text-lg font-medium gap-2">
			<div
				class="flex size-8 items-center justify-center rounded-lg bg-primary"
			>
				<FileSignature class="size-4 text-primary-foreground" />
			</div>
			SignVault
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					&ldquo;Setting up was effortless. Within minutes, our entire
					team was sending and signing documents with full
					cryptographic protection.&rdquo;
				</p>
				<footer class="text-sm">
					Marcus Rivera, CTO at Vantage Labs
				</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div
			class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5"
		>
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">
					Create an account
				</h1>
				<p class="text-sm text-muted-foreground">
					Enter your details below to create your account
				</p>
			</div>
			<div class="grid gap-6">
				<form onsubmit={handleSubmit}>
					<div class="grid gap-4">
						{#if error}
							<p class="text-sm text-destructive text-center">
								{error}
							</p>
						{/if}
						<div class="grid gap-2">
							<Label for="name">Full Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="John Doe"
								autocomplete="name"
							/>
							{#if fieldErrors.name}
								<p class="text-sm text-destructive">{fieldErrors.name}</p>
							{/if}
						</div>
						<div class="grid gap-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="name@example.com"
								autocapitalize="none"
								autocomplete="email"
								autocorrect="off"
							/>
							{#if fieldErrors.email}
								<p class="text-sm text-destructive">{fieldErrors.email}</p>
							{/if}
						</div>
						<div class="grid gap-2">
							<Label for="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
							/>
							{#if fieldErrors.password}
								<p class="text-sm text-destructive">{fieldErrors.password}</p>
							{/if}
						</div>
						<div class="grid gap-2">
							<Label for="confirm-password"
								>Confirm Password</Label
							>
							<Input
								id="confirm-password"
								name="confirm-password"
								type="password"
							/>
							{#if fieldErrors["confirm-password"]}
								<p class="text-sm text-destructive">{fieldErrors["confirm-password"]}</p>
							{/if}
						</div>
						<Button type="submit" class="w-full" disabled={loading}>
							{loading ? "Creating account..." : "Create Account"}
						</Button>
					</div>
				</form>
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background px-2 text-muted-foreground"
							>Or continue with</span
						>
					</div>
				</div>
				<Button variant="outline" type="button">
					<Mail />
					Sign up with SSO
				</Button>
			</div>
			<p class="px-8 text-center text-sm text-muted-foreground">
				Already have an account?
				<a
					href="/login"
					class="underline underline-offset-4 transition-colors hover:text-primary"
				>
					Sign in
				</a>
			</p>
			<p class="px-8 text-center text-xs text-muted-foreground">
				By creating an account, you agree to our
				<a
					href="/terms"
					class="underline underline-offset-4 transition-colors hover:text-primary"
				>
					Terms of Service
				</a>
				and
				<a
					href="/privacy"
					class="underline underline-offset-4 transition-colors hover:text-primary"
				>
					Privacy Policy
				</a>.
			</p>
		</div>
	</div>
</div>
