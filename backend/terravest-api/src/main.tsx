import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
// 1. IMPORTLARI EKLE
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. CLIENT OLUŞTUR
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 dakika boyunca veriyi "taze" kabul et (tekrar çekme)
            refetchOnWindowFocus: true, // Pencereye dönünce yenile
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 3. PROVIDER İLE SARMALA */}
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)