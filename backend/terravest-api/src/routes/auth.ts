import { hash, compare } from "bcryptjs";
import { SignJWT } from "jose";

// --------------------
// Helper
// --------------------
function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

// --------------------
// REGISTER
// --------------------
export async function handleRegister(
    request: Request,
    env: any
): Promise<Response> {
    try {
        const { email, password, role } = await request.json();

        if (!email || !password) {
            return json({ error: "Email and password required" }, 400);
        }

        // Kullanıcı var mı kontrolü
        const existingUser = await env.terravest_db
            .prepare("SELECT id FROM users WHERE email = ?")
            .bind(email)
            .first();

        if (existingUser) {
            return json({ error: "User already exists" }, 409);
        }

        // Şifre Hashleme
        const passwordHash = await hash(password, 10);

        // Rol Belirleme (Varsayılan: user)
        // Güvenlik notu: Gerçek prodüksiyonda 'role' parametresini public açmak risklidir,
        // ama şu an admin testi yapmak için buna izin veriyoruz.
        const userRole = role === "admin" ? "admin" : "user";

        await env.terravest_db
            .prepare(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)"
            )
            .bind(email, passwordHash, userRole)
            .run();

        return json({ success: true, message: "User created" }, 201);
    } catch (err: any) {
        console.error("REGISTER ERROR:", err);
        return json(
            { error: "Server error", details: err?.message ?? String(err) },
            500
        );
    }
}

// --------------------
// LOGIN (JWT)
// --------------------
export async function handleLogin(
    request: Request,
    env: any
): Promise<Response> {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ error: "Email and password required" }, 400);
        }

        const user = await env.terravest_db
            .prepare(
                "SELECT id, email, password_hash, role FROM users WHERE email = ?"
            )
            .bind(email)
            .first();

        if (!user) {
            return json({ error: "Invalid credentials" }, 401);
        }

        const valid = await compare(password, user.password_hash);
        if (!valid) {
            return json({ error: "Invalid credentials" }, 401);
        }

        // 🔐 JWT oluştur (Edge-native, jose)
        const secret = new TextEncoder().encode(env.JWT_SECRET);

        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        return json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err: any) {
        console.error("LOGIN ERROR:", err);
        return json(
            { error: "Server error", details: err?.message ?? String(err) },
            500
        );
    }
}