import { Env } from "../index";

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail(env: Env, options: EmailOptions): Promise<boolean> {
	const { to, subject, html } = options;

	if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) {
		console.error("❌ Mailgun configuration missing. Check .dev.vars or wrangler.jsonc");
		return false;
	}

	try {
		const formData = new FormData();

		const fromEmail = env.MAILGUN_FROM_EMAIL || `TerraVest <noreply@${env.MAILGUN_DOMAIN}>`;

		formData.append("from", fromEmail);
		formData.append("to", to);
		formData.append("subject", subject);
		formData.append("html", html);

		const auth = btoa(`api:${env.MAILGUN_API_KEY}`);

		const response = await fetch(
			`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
			{
				method: "POST",
				headers: {
					"Authorization": `Basic ${auth}`
				},
				body: formData
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Mailgun Error (${response.status}): ${errorText}`);
			return false;
		}

		const data = await response.json() as any;
		console.log(`✅ Email sent via Mailgun to: ${to} (ID: ${data.id})`);
		return true;

	} catch (error) {
		console.error("❌ Email sending exception:", error);
		return false;
	}
}