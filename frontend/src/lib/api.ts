const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787/api";

// --- REQUEST HELPER (Tekrar tekrar fetch yazmamak için) ---
const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "API Request Failed");
    }
    return data;
};

// --- API METODLARI ---
export const api = {
    // ============================
    // 🔐 AUTH (KİMLİK DOĞRULAMA)
    // ============================
    register: (data: any) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => request("/auth/me", { method: "GET" }),

    changePassword: (newPassword: string) =>
        request("/auth/change-password", { method: "PUT", body: JSON.stringify({ newPassword }) }),

    // ============================
    // 🏠 MARKETPLACE & PORTFOLIO
    // ============================
    getProperties: () => request("/properties", { method: "GET" }),
    getProperty: (id: string | number) => request(`/properties/${id}`, { method: "GET" }),

    getPortfolio: () => request("/portfolio", { method: "GET" }),

    // ============================
    // 💰 TRADE & ACTIONS
    // ============================
    // Token Satın Al (Bakiyeden)
    buyToken: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Token Sat (Bakiyeye Ekle)
    sellAsset: (data: { property_id: number; token_amount: number }) =>
        request("/sell", { method: "POST", body: JSON.stringify(data) }),

    // Kira Getirisini Topla
    claimRewards: () => request("/claim", { method: "POST" }),

    // ============================
    // 🏦 BANKING (DEPOSIT & WITHDRAW)
    // ============================

    // Para Çekme Talebi Oluştur
    requestWithdraw: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    // ✅ TEK VE DOĞRU TRANSACTION HISTORY
    // Backend token'dan user'ı bulur. Parametre göndermeye gerek yok.
    getTransactions: () => request("/transactions", { method: "GET" }),

    // ============================
    // 👑 ADMIN PANELİ
    // ============================

    // Yatırımları Listele ve Onayla
    getAdminDeposits: () => request("/admin/deposits", { method: "GET" }),
    approveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),

    // Çekimleri Listele ve Onayla
    getAdminWithdrawals: () => request("/admin/withdrawals", { method: "GET" }),
    approveWithdraw: (withdrawId: number, txHash: string) =>
        request("/admin/approve-withdraw", { method: "POST", body: JSON.stringify({ withdrawId, txHash }) }),
};