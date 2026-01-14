// Runtime + Build-time hybrid yaklaşım
export const API_BASE_URL = (() => {
    // 1. Önce build-time environment variable'ı kontrol et (Vite tarafından build sırasında gömülmüş)
    const buildTimeUrl = import.meta.env.VITE_API_URL;
    
    // 2. Runtime'da window üzerinden değer kontrol et (Cloudflare Pages için - opsiyonel)
    const runtimeUrl = typeof window !== 'undefined' 
      ? (window as any).__ENV__?.VITE_API_URL 
      : undefined;
    
    // 3. Öncelik sırası: runtime > build-time > fallback
    const url = runtimeUrl || buildTimeUrl || 'https://terravest-api.terravest.workers.dev/api';
    
    // 4. Production güvenliği: Localhost/127.0.0.1 referanslarını kesinlikle engelle
    // Vite config production build'lerde zaten localhost kullanmıyor, ama ekstra güvenlik için
    if (url && (url.includes('127.0.0.1') || url.includes('localhost'))) {
      console.warn('⚠️ API URL localhost kullanıyor, production URL\'e geçiliyor');
      return 'https://terravest-api.terravest.workers.dev/api';
    }
    
    return url;
  })();
  
  // Debug için (production'da kaldırılabilir)
  if (import.meta.env.MODE === 'development') {
    console.log('🌍 API Base URL:', API_BASE_URL);
  }