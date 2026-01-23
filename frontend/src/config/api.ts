//export const API_BASE_URL = "https://api.terravest.homes/api";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.terravest.homes/api";
console.log("🔗 API URL Loaded:", API_BASE_URL);