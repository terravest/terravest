export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787/api";

// --- TİP TANIMLARI (INTERFACES) ---

export interface User {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
    usd_balance: number;
}

export interface Property {
    id: number;
    title: string;
    description: string;
    location: string;
    price: number;
    token_price: number; // price_per_token
    total_tokens: number;
    available_tokens: number;
    rental_yield: number;
    image_url: string;
}

export interface Order {
    id: number;
    user_id: number;
    amount: number; // USD Tutar
    payment_address: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

// --- REQUEST HELPER ---

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
        throw new Error(data.error || "Something went wrong");
    }
    return data;
};

// --- API METODLARI ---

export const api = {
    // --- AUTH ---
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: any) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    getProfile: () => request("/auth/me"),

    changePassword: async (newPassword: string) => {
        return request("/auth/change-password", {
            method: 'PUT',
            body: JSON.stringify({ newPassword })
        });
    },

    // --- MARKETPLACE (PUBLIC) ---
    getProperties: () => request("/properties"),
    getPropertyDetail: (id: number) => request(`/properties/${id}`),

    // --- USER PORTFOLIO & WALLET ---
    getPortfolio: () => request("/portfolio"),

    // 1. PARA YATIRMA (DEPOSIT)
    // NOT: DepositModal içinde manuel fetch kullanıldığı için bu fonksiyon opsiyoneldir.
    // Ancak kullanılırsa doğru rota "/deposit" (tekil) olmalı.
    createDeposit: (amount: number, userId: number) =>
        request("/deposit", {
            method: "POST",
            body: JSON.stringify({ amount, userId })
        }),

    // Yatırma işlemini Blockchain TX kodu ile doğrula
    verifyPayment: (data: { orderId: number; txHash: string }) =>
        request("/verify-payment", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    // 2. YATIRIM YAPMA (BUY WITH BALANCE)
    buyAsset: (data: { property_id: number; token_amount: number }) =>
        request("/buy", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    // 3. SATIŞ YAPMA (SELL TO BALANCE)
    sellAsset: (data: { property_id: number; token_amount: number }) =>
        request("/sell", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    // 4. ÖDÜL TOPLAMA (CLAIM)
    claimRewards: () =>
        request("/claim", { method: "POST" }),

    // 5. GEÇMİŞ İŞLEMLERİ ÇEKME (TRANSACTION HISTORY)
    getTransactions: async (userId: string | number) => {
        if (!userId) {
            console.warn("⚠️ getTransactions çağrıldı ama UserID yok!");
            return [];
        }

        console.log(`📡 Geçmiş çekiliyor... UserID: ${userId}`);
        const token = localStorage.getItem('token');

        // ✅ URL: "/deposits" (Çoğul) olmalı. GET isteği.
        const url = `${API_URL}/deposits?userId=${userId}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const json = await res.json();

        if (!json.success) {
            console.error("API Hatası:", json.error);
            throw new Error(json.error || "Failed to fetch transactions");
        }

        return json.data;
    },

    // --- ADMIN ACTIONS ---
    createProperty: (data: any) => request("/properties", { method: "POST", body: JSON.stringify(data) }),
    deleteProperty: (id: number) => request("/properties", { method: "DELETE", body: JSON.stringify({ id }) }),
    getAdminProperties: () => request("/admin/properties"),
    getAdminOrders: () => request("/admin/deposits"),
    approveOrder: (orderId: number) => request("/admin/approve", { method: "POST", body: JSON.stringify({ order_id: orderId }) }),
    getAllDeposits: () => request("/admin/deposits"),

    manualApproveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", {
            method: "POST",
            body: JSON.stringify({ depositId })
        }),
};