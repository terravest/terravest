import type { Lang } from './i18n';

type EmailContent = {
	subject: string;
	body: string;
};

const EMAIL_TEMPLATES: Record<Lang, EmailContent> = {
	en: {
		subject: 'Verify your TerraVest email',
		body: 'Please verify your email by clicking the link below.'
	},
	'es-419': {
		subject: 'Verifica tu correo de TerraVest',
		body: 'Verifica tu correo haciendo clic en el enlace de abajo.'
	},
	'pt-BR': {
		subject: 'Verifique seu e-mail da TerraVest',
		body: 'Verifique seu e-mail clicando no link abaixo.'
	},
	fr: {
		subject: 'Vérifiez votre e-mail TerraVest',
		body: 'Veuillez vérifier votre e-mail en cliquant sur le lien ci-dessous.'
	}
};

export function sendEmailVerificationPlaceholder(email: string, verificationUrl: string, language: Lang) {
	const template = EMAIL_TEMPLATES[language] || EMAIL_TEMPLATES.en;

	// TODO: Replace with SMTP provider integration.
	console.log('[EMAIL VERIFICATION PLACEHOLDER]');
	console.log(`To: ${email}`);
	console.log(`Subject: ${template.subject}`);
	console.log(`${template.body}`);
	console.log(`Verification URL: ${verificationUrl}`);
}
