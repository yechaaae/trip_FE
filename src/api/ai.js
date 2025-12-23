import axios from "axios";

// 공통 설정을 가진 axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080/api/ai", // 백엔드 포트에 맞게 수정
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTravelRecommendation = async (tripRequest) => {
  // tripRequest: { region: "랜덤", theme: "힐링", days: 1 }
  const response = await api.post("/recommend", tripRequest);
  return response.data;
};
