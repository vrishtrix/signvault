import { getCurrentUser } from "$lib/auth";
import { redirect } from "@sveltejs/kit";

export async function load() {
	const user = await getCurrentUser();
	if (!user) throw redirect(302, "/login");
	return { user };
}
