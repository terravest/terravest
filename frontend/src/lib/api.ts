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

    // Düzeltme: Backend genellikle hem eski hem yeni şifre ister, bu yüzden 'data' nesnesi alıyoruz.
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
    // Token Satın Al (Bakiyeden)
    buyToken: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Alias: PropertyDetails.tsx dosyasında 'createOrder' olarak geçiyor olabilir
    createOrder: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Alias: Bazı yerlerde 'buyProperty' olarak geçiyor olabilir
    buyProperty: (data: { propertyId: number; tokenAmount: number }) =>
        request("/buy", { method: "POST", body: JSON.stringify(data) }),

    // Token Sat (Bakiyeye Ekle)
    sellAsset: (data: { property_id: number; token_amount: number }) =>
        request("/sell", { method: "POST", body: JSON.stringify(data) }),

    // Alias: Admin.tsx uyumluluğu için
    sellProperty: (data: any) => request("/sell", { method: "POST", body: JSON.stringify(data) }),

    // Kira Getirisini Topla
    claimRewards: () => request("/claim", { method: "POST" }),

    // ============================
    // 🏦 BANKING (DEPOSIT & WITHDRAW)
    // ============================

    // Para Yatırma (Create Deposit) - Eksikti, eklendi
    createDeposit: (amount: number) =>
        request("/deposit", { method: "POST", body: JSON.stringify({ amount }) }),

    // Kullanıcının kendi yatırımlarını görmesi için
    getDeposits: () => request("/deposits", { method: "GET" }),

    // Para Çekme Talebi Oluştur
    requestWithdraw: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    // Alias: Withdrawals sayfasında 'requestWithdrawal' olarak geçiyor olabilir
    requestWithdrawal: (data: { amount: number; btc_address: string }) =>
        request("/withdraw", { method: "POST", body: JSON.stringify(data) }),

    // ✅ TEK VE DOĞRU TRANSACTION HISTORY
    // Backend token'dan user'ı bulur. Parametre göndermeye gerek yok.
    getTransactions: () => request("/transactions", { method: "GET" }),

    // ============================
    // 👑 ADMIN PANELİ
    // ============================

    // Yatırımları Listele
    getAdminDeposits: () => request("/admin/deposits", { method: "GET" }),
    // Alias: Admin.tsx dosyasında 'getAdminOrders' diye geçiyor
    getAdminOrders: () => request("/admin/deposits", { method: "GET" }),

    // Yatırım Onayla
    approveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),
    // Alias: Admin.tsx dosyasında 'manualApproveDeposit' diye geçiyor
    manualApproveDeposit: (depositId: number) =>
        request("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ depositId }) }),

    // Çekimleri Listele
    getAdminWithdrawals: () => request("/admin/withdrawals", { method: "GET" }),
    // Alias: Admin.tsx dosyasında 'getAdminSellRequests' diye geçiyor olabilir
    getAdminSellRequests: () => request("/admin/withdrawals", { method: "GET" }),

    // Çekim Onayla
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

    // Resim yükleme (form-data)
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