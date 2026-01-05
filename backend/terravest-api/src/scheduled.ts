import { Env } from "./index";

export async function distributeRent(env: Env) {
    console.log("🔄 Starting Monthly Rent Distribution...");

    try {
        // 1. Kira getirisi olan Aktif Mülkleri Bul
        const { results: properties } = await env.terravest_db.prepare(
            "SELECT * FROM properties WHERE status = 'active' AND monthly_yield > 0"
        ).all();

        if (!properties || properties.length === 0) {
            console.log("No active properties with yield found.");
            return;
        }

        // 2. Her mülk için döngüye gir
        for (const prop of properties) {
            const propId = prop.id;
            const rentAmount = prop.monthly_yield as number;
            const totalTokens = prop.total_tokens as number;

            // Token başına düşen kira (Örn: $5000 kira / 10000 token = $0.5 hisse başı)
            const dividendPerToken = rentAmount / totalTokens;

            // 3. Bu mülkün hissedarlarını bul
            const { results: holders } = await env.terravest_db.prepare(
                "SELECT user_id, token_amount FROM token_holdings WHERE property_id = ?"
            ).bind(propId).all();

            if (!holders || holders.length === 0) continue;

            // 4. Her hissedara payını dağıt
            for (const holder of holders) {
                const share = (holder.token_amount as number) * dividendPerToken;

                if (share > 0) {
                    // Kullanıcının 'unclaimed_rewards' bakiyesine ekle
                    await env.terravest_db.prepare(
                        "UPDATE users SET unclaimed_rewards = unclaimed_rewards + ? WHERE id = ?"
                    ).bind(share, holder.user_id).run();
                }
            }
            console.log(`✅ Distributed $${rentAmount} for property: ${prop.title}`);
        }

        console.log("🎉 Rent distribution completed successfully.");

    } catch (error) {
        console.error("❌ Error distributing rent:", error);
    }
}