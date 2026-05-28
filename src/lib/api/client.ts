import axios from "axios";
import { getStoredToken } from "@/lib/authStore";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ? "" : undefined,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// FastAPI의 422 Validation Error 및 공통 에러 정규화
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number = error.response?.status ?? 0;
    const data = error.response?.data;
    const detail = data?.detail ?? data?.message ?? data?.error;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? (detail as { msg: string }[]).map((d) => d.msg).join(", ")
          : typeof data === "string"
            ? data
            : `요청 처리 중 오류가 발생했습니다. (${status})`;
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", status, data);
    }
    return Promise.reject({ status, message });
  },
);
