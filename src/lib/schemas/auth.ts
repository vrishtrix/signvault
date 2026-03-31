import { z } from "zod";

export const loginSchema = z.object({
	email: z.email({ error: "Please enter a valid email address" }),
	password: z.string().min(1, { error: "Password is required" }),
});

export const signupSchema = z
	.object({
		name: z.string().min(1, { error: "Name is required" }),
		email: z.email({ error: "Please enter a valid email address" }),
		password: z
			.string()
			.min(8, { error: "Password must be at least 8 characters" }),
		"confirm-password": z.string(),
	})
	.refine((data) => data.password === data["confirm-password"], {
		error: "Passwords do not match",
		path: ["confirm-password"],
	});
