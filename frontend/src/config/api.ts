// Runtime + Build-time hybrid yaklaşım
export const API_BASE_URL = (() => {
    // 1. Önce build-time environment variable'ı kontrol et
    const buildTimeUrl = import.meta.env.VITE_API_URL;
    
    // 2. Runtime'da window üzerinden değer kontrol et (Cloudflare Pages için)
    const runtimeUrl = typeof window !== 'undefined' 
      ? (window as any).__ENV__?.VITE_API_URL 
      : undefined;
    
    // 3. Fallback logic
    const url = runtimeUrl || buildTimeUrl || 'https://terravest-api.terravest.workers.dev/api';
    
    // 4. Localhost kontrolü (güvenlik)
    if (url.includes('127.0.0.1') || url.includes('localhost')) {
      console.warn('⚠️ API URL localhost kullanıyor, production URL\'e geçiliyor');
      return 'https://terravest-api.terravest.workers.dev/api';
    }
    
    return url;
  })();
  
  // Debug için (production'da kaldırılabilir)
  console.log('🌍 API Base URL:', API_BASE_URL);