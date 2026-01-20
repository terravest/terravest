export type Lang = 'en' | 'es-419' | 'pt-BR' | 'fr';

const SUPPORTED_LANGS: Lang[] = ['en', 'es-419', 'pt-BR', 'fr'];

export function normalizeLang(raw?: string | null): Lang {
	if (!raw) return 'en';
	const value = raw.trim().toLowerCase();
	if (value === 'en') return 'en';
	if (value === 'fr') return 'fr';
	if (value === 'es' || value === 'es-419' || value === 'es_latam' || value === 'es-la') return 'es-419';
	if (value === 'pt' || value === 'pt-br' || value === 'pt_br') return 'pt-BR';
	return 'en';
}

export function getLangFromRequest(request: Request, body?: any): Lang {
	const url = new URL(request.url);
	const queryLang = url.searchParams.get('lang');
	return normalizeLang(body?.lang ?? queryLang);
}

type ErrorKey =
	| 'VALIDATION_FAILED'
	| 'INVALID_JSON'
	| 'INVALID_CREDENTIALS'
	| 'EMAIL_NOT_VERIFIED'
	| 'BOT_VERIFICATION_FAILED'
	| 'INVALID_USERNAME_FORMAT'
	| 'USERNAME_RESERVED'
	| 'INVALID_EMAIL_FORMAT'
	| 'PASSWORD_TOO_SHORT'
	| 'IDENTIFIER_REQUIRED'
	| 'PASSWORD_REQUIRED'
	| 'USERNAME_TAKEN'
	| 'EMAIL_TAKEN'
	| 'REGISTER_FAILED'
	| 'RESET_TOKEN_INVALID'
	| 'EMAIL_VERIFICATION_INVALID'
	| 'PROPERTY_NOT_FOUND'
	| 'INSUFFICIENT_BALANCE'
	| 'NOT_ENOUGH_TOKENS'
	| 'BUY_FAILED'
	| 'SELL_INVALID_AMOUNT'
	| 'SELL_PROPERTY_NOT_FOUND'
	| 'SELL_INSUFFICIENT_TOKENS'
	| 'TRANSACTION_VERIFICATION_FAILED'
	| 'WITHDRAW_INVALID_AMOUNT'
	| 'WITHDRAW_MINIMUM_AMOUNT'
	| 'WITHDRAW_INVALID_ADDRESS'
	| 'WITHDRAW_INSUFFICIENT_BALANCE'
	| 'CLAIM_NOT_AVAILABLE'
	| 'METHOD_NOT_ALLOWED'
	| 'RATE_LIMIT_EXCEEDED';

type MessageKey =
	| 'EMAIL_VERIFICATION_SUCCESS'
	| 'EMAIL_VERIFICATION_SENT';

const MESSAGES: Record<Lang, Record<ErrorKey, string>> = {
	en: {
		VALIDATION_FAILED: 'Validation failed.',
		INVALID_JSON: 'Invalid JSON body.',
		INVALID_CREDENTIALS: 'Invalid credentials.',
		EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
		BOT_VERIFICATION_FAILED: 'Bot verification failed.',
		INVALID_USERNAME_FORMAT: 'Invalid username format.',
		USERNAME_RESERVED: 'Username is reserved.',
		INVALID_EMAIL_FORMAT: 'Invalid email format.',
		PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
		IDENTIFIER_REQUIRED: 'Email or username is required.',
		PASSWORD_REQUIRED: 'Password is required.',
		USERNAME_TAKEN: 'Username already taken.',
		EMAIL_TAKEN: 'Email already registered.',
		REGISTER_FAILED: 'Failed to register user.',
		RESET_TOKEN_INVALID: 'Invalid or expired reset token.',
		EMAIL_VERIFICATION_INVALID: 'Invalid or expired verification link.',
		PROPERTY_NOT_FOUND: 'Property not found.',
		INSUFFICIENT_BALANCE: 'Insufficient balance.',
		NOT_ENOUGH_TOKENS: 'Not enough tokens available.',
		BUY_FAILED: 'Purchase failed. Please try again.',
		SELL_INVALID_AMOUNT: 'Token amount must be a positive number.',
		SELL_PROPERTY_NOT_FOUND: 'Property not found or price not set.',
		SELL_INSUFFICIENT_TOKENS: 'Insufficient tokens to sell.',
		TRANSACTION_VERIFICATION_FAILED: 'Transaction verification failed. Please contact support.',
		WITHDRAW_INVALID_AMOUNT: 'Amount must be a positive number.',
		WITHDRAW_MINIMUM_AMOUNT: 'Minimum withdrawal amount is $50.00.',
		WITHDRAW_INVALID_ADDRESS: 'Invalid Bitcoin address.',
		WITHDRAW_INSUFFICIENT_BALANCE: 'Insufficient balance.',
		CLAIM_NOT_AVAILABLE: 'No claimable rewards yet.',
		METHOD_NOT_ALLOWED: 'Method not allowed.',
		RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later.'
	},
	
	'es-419': {
		VALIDATION_FAILED: 'La validación falló.',
		INVALID_JSON: 'Cuerpo JSON inválido.',
		INVALID_CREDENTIALS: 'Credenciales inválidas.',
		EMAIL_NOT_VERIFIED: 'Verifica tu correo antes de iniciar sesión.',
		BOT_VERIFICATION_FAILED: 'Falló la verificación anti-bot.',
		INVALID_USERNAME_FORMAT: 'Formato de usuario inválido.',
		USERNAME_RESERVED: 'El nombre de usuario está reservado.',
		INVALID_EMAIL_FORMAT: 'Formato de correo inválido.',
		PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
		IDENTIFIER_REQUIRED: 'Se requiere correo o usuario.',
		PASSWORD_REQUIRED: 'La contraseña es obligatoria.',
		USERNAME_TAKEN: 'El nombre de usuario ya está en uso.',
		EMAIL_TAKEN: 'El correo ya está registrado.',
		REGISTER_FAILED: 'No se pudo registrar el usuario.',
		RESET_TOKEN_INVALID: 'Token de restablecimiento inválido o vencido.',
		EMAIL_VERIFICATION_INVALID: 'Enlace de verificación inválido o vencido.',
		PROPERTY_NOT_FOUND: 'Propiedad no encontrada.',
		INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
		NOT_ENOUGH_TOKENS: 'No hay suficientes tokens disponibles.',
		BUY_FAILED: 'La compra falló. Intenta de nuevo.',
		SELL_INVALID_AMOUNT: 'La cantidad de tokens debe ser un número positivo.',
		SELL_PROPERTY_NOT_FOUND: 'Propiedad no encontrada o sin precio.',
		SELL_INSUFFICIENT_TOKENS: 'No tienes suficientes tokens para vender.',
		TRANSACTION_VERIFICATION_FAILED: 'Falló la verificación de la transacción. Contacta soporte.',
		WITHDRAW_INVALID_AMOUNT: 'El monto debe ser un número positivo.',
		WITHDRAW_MINIMUM_AMOUNT: 'El retiro mínimo es de $50.00.',
		WITHDRAW_INVALID_ADDRESS: 'Dirección de Bitcoin inválida.',
		WITHDRAW_INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
		CLAIM_NOT_AVAILABLE: 'Aún no hay recompensas para reclamar.',
		METHOD_NOT_ALLOWED: 'Método no permitido.',
		RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes, intenta de nuevo más tarde.'
	},
	'pt-BR': {
		VALIDATION_FAILED: 'A validação falhou.',
		INVALID_JSON: 'Corpo JSON inválido.',
		INVALID_CREDENTIALS: 'Credenciais inválidas.',
		EMAIL_NOT_VERIFIED: 'Verifique seu e-mail antes de entrar.',
		BOT_VERIFICATION_FAILED: 'Falha na verificação anti-bot.',
		INVALID_USERNAME_FORMAT: 'Formato de usuário inválido.',
		USERNAME_RESERVED: 'Nome de usuário reservado.',
		INVALID_EMAIL_FORMAT: 'Formato de e-mail inválido.',
		PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 8 caracteres.',
		IDENTIFIER_REQUIRED: 'E-mail ou usuário é obrigatório.',
		PASSWORD_REQUIRED: 'A senha é obrigatória.',
		USERNAME_TAKEN: 'Nome de usuário já em uso.',
		EMAIL_TAKEN: 'E-mail já registrado.',
		REGISTER_FAILED: 'Não foi possível registrar o usuário.',
		RESET_TOKEN_INVALID: 'Token de redefinição inválido ou expirado.',
		EMAIL_VERIFICATION_INVALID: 'Link de verificação inválido ou expirado.',
		PROPERTY_NOT_FOUND: 'Imóvel não encontrado.',
		INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
		NOT_ENOUGH_TOKENS: 'Não há tokens suficientes disponíveis.',
		BUY_FAILED: 'A compra falhou. Tente novamente.',
		SELL_INVALID_AMOUNT: 'A quantidade de tokens deve ser um número positivo.',
		SELL_PROPERTY_NOT_FOUND: 'Imóvel não encontrado ou sem preço definido.',
		SELL_INSUFFICIENT_TOKENS: 'Tokens insuficientes para vender.',
		TRANSACTION_VERIFICATION_FAILED: 'Falha na verificação da transação. Fale com o suporte.',
		WITHDRAW_INVALID_AMOUNT: 'O valor deve ser um número positivo.',
		WITHDRAW_MINIMUM_AMOUNT: 'O saque mínimo é de $50,00.',
		WITHDRAW_INVALID_ADDRESS: 'Endereço de Bitcoin inválido.',
		WITHDRAW_INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
		CLAIM_NOT_AVAILABLE: 'Ainda não há recompensas para resgatar.',
		METHOD_NOT_ALLOWED: 'Método não permitido.',
		RATE_LIMIT_EXCEEDED: 'Muitas solicitações, tente novamente mais tarde.'
	},
	fr: {
		VALIDATION_FAILED: 'La validation a échoué.',
		INVALID_JSON: 'Corps JSON invalide.',
		INVALID_CREDENTIALS: 'Identifiants invalides.',
		EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre e-mail avant de vous connecter.',
		BOT_VERIFICATION_FAILED: 'Échec de la vérification anti-bot.',
		INVALID_USERNAME_FORMAT: 'Format de nom d’utilisateur invalide.',
		USERNAME_RESERVED: 'Ce nom d’utilisateur est réservé.',
		INVALID_EMAIL_FORMAT: 'Format d’e-mail invalide.',
		PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
		IDENTIFIER_REQUIRED: 'L’e-mail ou le nom d’utilisateur est requis.',
		PASSWORD_REQUIRED: 'Le mot de passe est requis.',
		USERNAME_TAKEN: 'Nom d’utilisateur déjà utilisé.',
		EMAIL_TAKEN: 'E-mail déjà enregistré.',
		REGISTER_FAILED: 'Impossible de créer le compte.',
		RESET_TOKEN_INVALID: 'Token de réinitialisation invalide ou expiré.',
		EMAIL_VERIFICATION_INVALID: 'Lien de vérification invalide ou expiré.',
		PROPERTY_NOT_FOUND: 'Bien immobilier introuvable.',
		INSUFFICIENT_BALANCE: 'Solde insuffisant.',
		NOT_ENOUGH_TOKENS: 'Pas assez de tokens disponibles.',
		BUY_FAILED: 'Achat impossible. Veuillez réessayer.',
		SELL_INVALID_AMOUNT: 'La quantité de tokens doit être un nombre positif.',
		SELL_PROPERTY_NOT_FOUND: 'Bien introuvable ou prix non défini.',
		SELL_INSUFFICIENT_TOKENS: 'Tokens insuffisants pour vendre.',
		TRANSACTION_VERIFICATION_FAILED: 'Échec de la vérification de la transaction. Contactez le support.',
		WITHDRAW_INVALID_AMOUNT: 'Le montant doit être un nombre positif.',
		WITHDRAW_MINIMUM_AMOUNT: 'Le retrait minimum est de 50,00 $.',
		WITHDRAW_INVALID_ADDRESS: 'Adresse Bitcoin invalide.',
		WITHDRAW_INSUFFICIENT_BALANCE: 'Solde insuffisant.',
		CLAIM_NOT_AVAILABLE: 'Aucune récompense à réclamer pour le moment.',
		METHOD_NOT_ALLOWED: 'Méthode non autorisée.',
		RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez réessayer plus tard.'
	}
};

const SUCCESS_MESSAGES: Record<Lang, Record<MessageKey, string>> = {
	en: {
		EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully.',
		EMAIL_VERIFICATION_SENT: 'Verification email sent.'
	},
	'es-419': {
		EMAIL_VERIFICATION_SUCCESS: 'Correo verificado correctamente.',
		EMAIL_VERIFICATION_SENT: 'Se envió el correo de verificación.'
	},
	'pt-BR': {
		EMAIL_VERIFICATION_SUCCESS: 'E-mail verificado com sucesso.',
		EMAIL_VERIFICATION_SENT: 'E-mail de verificação enviado.'
	},
	fr: {
		EMAIL_VERIFICATION_SUCCESS: 'E-mail vérifié avec succès.',
		EMAIL_VERIFICATION_SENT: 'E-mail de vérification envoyé.'
	}
};

export function getErrorMessage(lang: Lang, key: ErrorKey): string {
	const resolvedLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
	return MESSAGES[resolvedLang][key] || MESSAGES.en[key];
}

export function getSuccessMessage(lang: Lang, key: MessageKey): string {
	const resolvedLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
	return SUCCESS_MESSAGES[resolvedLang][key] || SUCCESS_MESSAGES.en[key];
}
