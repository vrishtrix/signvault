<script lang="ts">
	import { restoreSession, type AuthUser } from "$lib/auth";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const publicRoutes = ["/login", "/signup"];

	let user = $state<AuthUser | null>(null);
	let checked = $state(false);

	$effect(() => {
		restoreSession().then((u) => {
			user = u;
			checked = true;

			const path = $page.url.pathname;
			const isPublic = publicRoutes.some((r) => path.startsWith(r));

			if (!u && !isPublic) {
				goto("/login");
			} else if (u && isPublic) {
				goto("/dashboard");
			}
		});
	});
</script>

{#if !checked}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
	</div>
{:else}
	{@render children()}
{/if}
