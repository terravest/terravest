import { API_BASE_URL } from "../config/api";

const API_URL = API_BASE_URL;

// --- REQUEST HELPER ---
const request = async (endpoint: string, options: RequestInit = {}) => {
    // 1. Token'ı güvenli bir şekilde al (Farklı isimlerle kaydedilmiş olabilir diye kontrol ediyoruz)
    const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken");

    // Debug: Konsola token durumunu yaz (F12 Console sekmesinde görebilirsin)
    // console.log(`📡 API Request: ${endpoint} | Token: ${token ? "MEVCUT ✅" : "YOK ❌"}`);

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // Token varsa header'a ekle
        ...options.headers,
    };

    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, { ...options, headers });

        // 2. OTOMATİK GÜVENLİK KONTROLÜ (401 UNAUTHORIZED)
        if (response.status === 401) {
            console.warn("⚠️ Oturum süresi dolmuş veya token geçersiz. Çıkış yapılıyor...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Kullanıcıyı login sayfasına at
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
            throw new Error("Unauthorized: Lütfen tekrar giriş yapın.");
        }

        // JSON yanıtı işle
        const contentType = response.headers.get("content-type");
        let data: any = {};

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `API Error: ${response.status}`);
        }

        return data;

    } catch (error: any) {
        // Eğer fetch işlemi hiç yapılamadıysa (Network Error)
        console.error(`🔥 API Request Failed (${endpoint}):`, error.message);
        throw error;
    }
};

// --- API METHODS ---
export const api = {
    // ============================
    // 🔐 AUTH (AUTHENTICATION)
    // ============================
    register: (data: any) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => request("/auth/me", { method: "GET" }),
    verifyEmail: (data: { token: string; lang?: string }) =>
        request("/auth/verify-email", { method: "POST", body: JSON.stringify(data) }),
    resendVerificationEmail: (data: { email: string; lang?: string }) =>
        request("/auth/resend-verification", { method: "POST", body: JSON.stringify(data) }),
    changePassword: (data: any) =>
        request("/auth/change-password", {
            method: "PUT",
            body: JSON.stringify(data)
        }),
    contact: (data: { name: string; email: string; subject: string; message: string; turnstileToken?: string }) =>
        request('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // ============================
    // 🏠 MARKETPLACE & PORTFOLIO
    // ============================
    getProperties: () => request("/properties", { method: "GET" }),
    getProperty: (id: string | number) => request(`/properties/${id}`, { method: "GET" }),
    getAdminProperties: () => request("/properties", { method: "GET" }),
    getPortfolio: () => request("/portfolio", { method: "GET" }),

    // ============================
    // 💰 TRADE & ACTIONS
    // ============================
    buyToken: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),
    createOrder: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),
    buyProperty: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    sellAsset: (data: { property_id: number; token_amount: number }) =>
        request("/sell", { method: "POST", body: JSON.stringify(data) }),
    sellProperty: (data: any) => request("/sell", { method: "POST", body: JSON.stringify(data) }),

    claimRewards: () => request("/claim", { method: "POST" }),

    // ============================
    // 🏦 BANKING (DEPOSIT & WITHDRAW)
    // ============================
    createDeposit: (amount: number) =>
        request("/deposit", { method: "POST", body: JSON.stringify({ amount }) }),
    getDeposits: () => request("/deposits", { method: "GET" }),

    requestWithdraw: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),
    requestWithdrawal: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    getTransactions: () => request("/transactions", { method: "GET" }),

    // ============================
    // 👑 ADMIN PANEL
    // ============================
    getAdminUsers: () => request("/admin/users", { method: "GET" }),
    getAdminDeposits: () => request("/admin/deposits", { method: "GET" }),
    getAdminOrders: () => request("/admin/deposits", { method: "GET" }),

    approveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),
    manualApproveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),

    getAdminWithdrawals: () => request("/admin/withdrawals", { method: "GET" }),
    getAdminSellRequests: () => request("/admin/withdrawals", { method: "GET" }),

    approveWithdraw: (withdrawId: number, txHash: string) =>
        request("/admin/approve-withdraw", { method: "POST", body: JSON.stringify({ withdrawId, txHash }) }),

    // ============================
    // 🏠 PROPERTY MANAGEMENT (ADMIN)
    // ============================
    createProperty: (data: any) =>
        request("/properties", { method: "POST", body: JSON.stringify(data) }),
    updateProperty: (id: number, data: any) =>
        request(`/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProperty: (id: number) =>
        request("/properties", { method: "DELETE", body: JSON.stringify({ id }) }),

    // ============================
    // 📤 IMAGE UPLOAD
    // ============================
    uploadImage: async (file: File) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        const contentType = response.headers.get("content-type");
        let data: any = {};
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || "Upload failed");
        }
        return data;
    },
};