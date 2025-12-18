import { api } from "./axiosConfig";

// ==============================
// 리뷰 통계 (관광지 기준)
// ==============================
export const getReviewStats = (contentId) => {
  return api.get(`/api/board/review/stats/${contentId}`);
};
