// frontend/src/config/api.ts

// Production ortamı için URL'i elle sabitliyoruz.
// Bu değişiklik "localhost" hatasını %100 bitirecektir.
export const API_BASE_URL = "https://terravest-api.terravest.workers.dev/api";

// Log ile kontrol edelim (F12 Console'da görebilirsiniz)
console.log("🔗 API URL Yüklendi:", API_BASE_URL);