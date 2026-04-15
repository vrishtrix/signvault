<script lang="ts">
	import { goto } from "$app/navigation";
	import { signin } from "$lib/auth";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { loginSchema } from "$lib/schemas/auth";
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
		const parsed = loginSchema.safeParse(data);

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0] as string;
				fieldErrors[field] ??= issue.message;
			}
			return;
		}

		loading = true;

		const result = await signin(parsed.data.email, parsed.data.password);

		if (result.success) {
			goto("/dashboard");
		} else {
			error = result.error ?? "Invalid email or password";
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
					&ldquo;SignVault has transformed how we handle document
					signing. The cryptographic security gives us complete peace
					of mind with every signature.&rdquo;
				</p>
				<footer class="text-sm">Sarah Chen, Head of Legal</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div
			class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5"
		>
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">
					Welcome back
				</h1>
				<p class="text-sm text-muted-foreground">
					Enter your email and password to sign in to your account
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
							<div class="flex items-center">
								<Label for="password">Password</Label>
								<a
									href="/forgot-password"
									class="ml-auto inline-block text-sm underline"
								>
									Forgot your password?
								</a>
							</div>
							<Input
								id="password"
								name="password"
								type="password"
							/>
							{#if fieldErrors.password}
								<p class="text-sm text-destructive">{fieldErrors.password}</p>
							{/if}
						</div>
						<Button type="submit" class="w-full" disabled={loading}>
							{loading ? "Signing in..." : "Login"}
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
					Sign in with SSO
				</Button>
			</div>
			<p class="px-8 text-center text-sm text-muted-foreground">
				Don't have an account?
				<a
					href="/signup"
					class="underline underline-offset-4 transition-colors hover:text-primary"
				>
					Sign up
				</a>
			</p>
		</div>
	</div>
</div>
