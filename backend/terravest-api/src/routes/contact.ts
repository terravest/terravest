import { Env } from "../index";
import { json, errorResponse } from "../lib/errors";
import { sendEmail } from "../lib/email-sender";
import { z } from "zod";

const ContactSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(3, "Subject is too short"),
    message: z.string().min(10, "Message is too short"),
    turnstileToken: z.string().optional(), // Eğer bot koruması eklersek diye
});

export async function handleContactForm(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
        const body = await request.json();
        const validation = ContactSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse("Invalid form data", 400);
        }

        const { name, email, subject, message } = validation.data;

        // E-posta İçeriği (Admin'e gidecek)
        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #0F172A;">New Contact Message</h2>
                <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <h3 style="color: #555;">Message:</h3>
                <p style="white-space: pre-wrap; color: #333; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
        `;

        ctx.waitUntil(
            sendEmail(env, {
                to: "terravestproject@proton.me",
                subject: `[TerraVest Contact] ${subject}`,
                html: emailHtml
            })
        );

        return json({ success: true, message: "Message sent successfully" });

    } catch (e: any) {
        console.error("Contact form error:", e);
        return errorResponse("Failed to send message", 500);
    }
}