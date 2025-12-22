import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// 내 뱃지 목록 조회
export const getMyBadges = async () => {
  return await api.get("/api/badge/my");
};

// 특정 유저 뱃지 목록 조회
export const getUserBadges = async (userId) => {
  return await api.get(`/api/badge/user/${userId}`);
};
