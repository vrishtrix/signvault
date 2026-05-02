import { tmpdir } from "os";
import { writeFile, readFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { resolve as resolvePath } from "path";

const JAR_DIR = resolvePath(
	import.meta.dirname ?? new URL(".", import.meta.url).pathname,
	"jsignpdf-3.0.1",
);
const JAR_PATH = resolvePath(JAR_DIR, "JSignPdf.jar");

export interface SignPDFOptions {
	visible?: boolean;
	llx?: number;
	lly?: number;
	urx?: number;
	ury?: number;
	pageNumber?: number;
	bgImagePath?: string;
	imgPath?: string;
	bgScale?: number;
	reason?: string;
	location?: string;
	contact?: string;
	l2Text?: string;
	renderMode?:
		| "DESCRIPTION_ONLY"
		| "GRAPHIC_AND_DESCRIPTION"
		| "SIGNAME_AND_DESCRIPTION";
	hashAlgorithm?: "SHA1" | "SHA256" | "SHA384" | "SHA512" | "RIPEMD160";
	appendSignature?: boolean;
	fontSize?: number;
	timeout?: number;
}

export async function signPDF(
	pdf: Buffer,
	p12Path: string,
	password: string,
	options?: SignPDFOptions,
): Promise<Buffer> {
	const dir = tmpdir();
	const uniq = `signvault-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const infile = `${dir}/${uniq}.pdf`;
	const outfile = infile.replace(/\.pdf$/, "_signed.pdf");
	const timeout = options?.timeout ?? 15000;

	await writeFile(infile, pdf);

	const command = [
		`java -jar "${JAR_PATH}"`,
		`--keystore-type PKCS12`,
		`--keystore-file "${p12Path}"`,
		`--keystore-password "${password}"`,
		options?.appendSignature && `--append`,
		options?.hashAlgorithm &&
			`--hash-algorithm ${options.hashAlgorithm}`,
		options?.reason && `--reason "${options.reason}"`,
		options?.contact && `--contact "${options.contact}"`,
		options?.location && `--location "${options.location}"`,
		options?.l2Text && `--l2-text "${options.l2Text}"`,
		options?.visible && `--visible-signature`,
		options?.llx != null && `-llx ${options.llx}`,
		options?.lly != null && `-lly ${options.lly}`,
		options?.urx != null && `-urx ${options.urx}`,
		options?.ury != null && `-ury ${options.ury}`,
		options?.fontSize && `--font-size ${options.fontSize}`,
		options?.renderMode && `--render-mode ${options.renderMode}`,
		options?.pageNumber && `--page ${options.pageNumber}`,
		options?.bgImagePath && `--bg-path "${options.bgImagePath}"`,
		options?.imgPath && `--img-path "${options.imgPath}"`,
		options?.bgScale != null && `--bg-scale ${options.bgScale}`,
		`--out-directory "${dir}"`,
		`"${infile}"`,
	]
		.filter(Boolean)
		.join(" ");

	return new Promise<Buffer>((resolve, reject) => {
		exec(command, { timeout }, async (err) => {
			const data = !err && (await readFile(outfile).catch(() => null));
			await Promise.all([
				unlink(infile).catch(() => {}),
				data && unlink(outfile).catch(() => {}),
			]);

			if (err) return reject(err);
			if (!data || !data.length)
				return reject(new Error("Signing produced empty result"));
			resolve(data);
		});
	}).catch((e: NodeJS.ErrnoException & { killed?: boolean }) => {
		if (e.code === "127")
			throw new Error("Java not installed");
		if (e.code === "126")
			throw new Error("Permission denied for java");
		if (e.killed) throw new Error("Signing timed out");

		const msg = (e.message ?? "").match(
			/java\.io\.IOException: (.*)\n/,
		)?.[1];
		throw new Error(msg ?? `Signing failed: ${e.message}`);
	});
}
