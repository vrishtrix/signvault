import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/sign/${params.token}`);
	if (!res.ok) {
		return { error: "This signing link is invalid or has expired." };
	}
	const data = await res.json();
	return { request: data, token: params.token };
};
