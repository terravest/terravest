import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// --- REQUEST HELPER (To avoid writing fetch repeatedly) ---
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
    // 🔐 AUTH (AUTHENTICATION)
    // ============================
    register: (data: any) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => request("/auth/me", { method: "GET" }),

    // Fix: Backend usually requires both old and new password, so we accept 'data' object.
    changePassword: (data: any) =>
        request("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),

    // ============================
    // 🏠 MARKETPLACE & PORTFOLIO
    // ============================
    getProperties: () => request("/properties", { method: "GET" }),
    getProperty: (id: string | number) => request(`/properties/${id}`, { method: "GET" }),

    // Admin sayfasındaki çağrı için alias (takma ad)
    getAdminProperties: () => request("/properties", { method: "GET" }),

    getPortfolio: () => request("/portfolio", { method: "GET" }),

    // ============================
    // 💰 TRADE & ACTIONS
    // ============================
    // Buy Token (From Balance)
    buyToken: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Alias: May be referenced as 'createOrder' in PropertyDetails.tsx file
    createOrder: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Alias: May be referenced as 'buyProperty' in some places
    buyProperty: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Sell Token (Add to Balance)
    sellAsset: (data: { property_id: number; token_amount: number }) =>
        request("/sell", { method: "POST", body: JSON.stringify(data) }),

    // Alias: For Admin.tsx compatibility
    sellProperty: (data: any) => request("/sell", { method: "POST", body: JSON.stringify(data) }),

    // Claim Rental Rewards
    claimRewards: () => request("/claim", { method: "POST" }),

    // ============================
    // 🏦 BANKING (DEPOSIT & WITHDRAW)
    // ============================

    // Deposit (Create Deposit) - Was missing, added
    createDeposit: (amount: number) =>
        request("/deposit", { method: "POST", body: JSON.stringify({ amount }) }),

    // For user to see their own deposits
    getDeposits: () => request("/deposits", { method: "GET" }),

    // Create Withdrawal Request
    requestWithdraw: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    // Alias: May be referenced as 'requestWithdrawal' on Withdrawals page
    requestWithdrawal: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    // ✅ SINGLE AND CORRECT TRANSACTION HISTORY
    // Backend finds user from token. No need to send parameter.
    getTransactions: () => request("/transactions", { method: "GET" }),

    // ============================
    // 👑 ADMIN PANELİ
    // ============================

    // List Deposits
    getAdminDeposits: () => request("/admin/deposits", { method: "GET" }),
    // Alias: Referenced as 'getAdminOrders' in Admin.tsx file
    getAdminOrders: () => request("/admin/deposits", { method: "GET" }),

    // Approve Deposit
    approveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),
    // Alias: Referenced as 'manualApproveDeposit' in Admin.tsx file
    manualApproveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),

    // List Withdrawals
    getAdminWithdrawals: () => request("/admin/withdrawals", { method: "GET" }),
    // Alias: May be referenced as 'getAdminSellRequests' in Admin.tsx file
    getAdminSellRequests: () => request("/admin/withdrawals", { method: "GET" }),

    // Approve Withdrawal
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

    // Image upload (form-data)
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

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }
        return data;
    },
};