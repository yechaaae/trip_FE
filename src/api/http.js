// src/api/http.js
import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080", // ⭐ 백엔드 주소
  timeout: 5000,
});

// 요청 인터셉터 (토큰 필요할 때 확장 가능)
http.interceptors.request.use(
  (config) => {
    // 예: localStorage 토큰 자동 삽입 가능
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 API Error:", error);
    return Promise.reject(error);
  }
);

export default http;
