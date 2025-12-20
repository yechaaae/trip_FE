import { api } from "./axiosConfig";

// ==============================
// 관광지 리뷰 목록
// ==============================
export const getPlaceReviews = (
  contentId,
  { page = 1, size = 5, sort = "latest" }
) => {
  return api.get("/api/board/place-reviews", {
    params: {
      contentId,
      page,
      size,
      sort,
    },
  });
};


// ==============================
// 리뷰 통계 (관광지 기준)
// ==============================
export const getReviewStats = (contentId) => {
  return api.get(`/api/board/review/stats/${contentId}`);
};
