const API_URL = "http://127.0.0.1:8787/api";

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

export const api = {
    // --- AUTH ---
    login: (data: any) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: any) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    // --- MARKETPLACE (PUBLIC) ---
    getProperties: () => request("/properties"),

    // --- USER PORTFOLIO & ACTIONS ---
    getPortfolio: () => request("/portfolio"),

    // Yatırım Yapma (Buy)
    createOrder: (data: any) => request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Satış Yapma (Sell / Withdraw)
    sellAsset: (body: { property_id: number; token_amount: number; btc_address: string }) =>
        request("/sell", { method: "POST", body: JSON.stringify(body) }),

    // Kira Çekme (Claim Rewards)
    claimRewards: (btcAddress: string) =>
        request("/claim", { method: "POST", body: JSON.stringify({ btc_address: btcAddress }) }),

    // --- ADMIN ACTIONS ---

    // 1. Mülk Yönetimi
    createProperty: (data: any) => request("/properties", { method: "POST", body: JSON.stringify(data) }),
    deleteProperty: (id: number) => request("/properties", { method: "DELETE", body: JSON.stringify({ id }) }),
    getAdminProperties: () => request("/admin/properties"),

    // 2. Sipariş Yönetimi (Deposits)
    getAdminOrders: () => request("/admin/orders"),
    approveOrder: (orderId: number) => request("/admin/approve", { method: "POST", body: JSON.stringify({ order_id: orderId }) }),

    // 3. Çekim Yönetimi (Withdrawals)
    getAdminSellRequests: () => request("/admin/sell-requests"),
    approveSellRequest: (requestId: number) =>
        request("/admin/approve-sell", { method: "POST", body: JSON.stringify({ request_id: requestId }) }),

    changePassword: async (newPassword: string) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update password');
        return data;
    },

};