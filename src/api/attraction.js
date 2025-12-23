// src/api/attraction.js

import { api } from "./axiosConfig";

/**
 * ⭐ 공통 GET 요청 함수
 * - params: 쿼리 파라미터 객체
 * - url: 요청 경로
 */
const get = (url, params = {}) => {
  return api.get(url, { params });
};

// ================================================================
// 1) 지역별 관광지 목록 조회
// ================================================================
export const getAttractionList = (areaCode, contentTypeId, pageNo = 1, numOfRows = 20, keyword = "") => {
  const params = {
    contentTypeId,
    pageNo,
    numOfRows,
    keyword,
  };

  // ⭐ 전체가 아닐 때만 areaCode 추가
  if (areaCode !== null) {
    params.areaCode = areaCode;
  }

  return api.get("/attraction/list", { params });
};

// ================================================================
// 2) 관광지 상세 조회
// ================================================================
export const getAttractionDetail = (contentId) => {
  return api.get(`/attraction/detail/${contentId}`);
};

// ================================================================
// 3) 관광지 이미지 조회
// ================================================================
export const getAttractionImage = (contentId) => {
  return get("/attraction/image", { contentId });
};

// ================================================================
// 앞으로 추가될 확장 함수 템플릿
// ================================================================

// 지역 코드 조회
export const getAreaCode = (areaCode) => get("/attraction/area", { areaCode });

// 소개 정보 조회
export const getIntroInfo = (contentId, contentTypeId) => get("/attraction/intro", { contentId, contentTypeId });

// 반복 정보 조회
export const getRepeatInfo = (contentId, contentTypeId) => get("/attraction/info", { contentId, contentTypeId });

// 키워드 검색
export const searchAttractions = (keyword, areaCode, contentTypeId) =>
  get("/attraction/search", { keyword, areaCode, contentTypeId });
