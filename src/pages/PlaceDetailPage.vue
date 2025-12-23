<template>
  <div class="detail-page" v-if="place">
    <!-- HEADER -->
    <section class="header-section">
      <h1>{{ place.title }}</h1>
      <div class="meta">
        <span class="badge rating">⭐ {{ reviewStats.avgRating.toFixed(1) }}</span>
        <span class="badge review">리뷰 {{ reviewStats.reviewCount }}</span>
      </div>
    </section>

    <!-- IMAGE -->
    <section class="image-section" v-if="images.length">
      <Swiper
        :modules="[Navigation, Pagination]"
        :slides-per-view="1"
        :space-between="20"
        :navigation="true"
        :pagination="{ clickable: true }"
      >
        <SwiperSlide v-for="(img, idx) in images" :key="idx">
          <img :src="img.originimgurl || img.smallimageurl" />
        </SwiperSlide>
      </Swiper>
      <div class="img-count">{{ images.length }}장</div>
    </section>

    <!-- ACTION BAR -->
    <section class="action-bar">
      <div class="action-col">
        <div class="action-btn" @click="toggleSave">
          <img :src="saved ? savedIcon : saveIcon" />
          <span>저장</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="action-col">
        <div class="action-btn" @click="goWriteReview">
          <img :src="reviewIcon" />
          <span>리뷰</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="action-col">
        <div class="action-btn" @click="sharePlace">
          <img :src="shareIcon" />
          <span>공유</span>
        </div>
      </div>
    </section>

    <!-- BASIC INFO -->
    <section class="info-section">
      <h2>기본 정보</h2>

      <div class="info-item">
        <span class="label">주소</span>
        <p class="value">{{ place.addr1 }}</p>
      </div>

      <div class="info-item" v-if="place.tel">
        <span class="label">전화</span>
        <p class="value">{{ place.tel }}</p>
      </div>

      <div class="info-item" v-if="place.homepage">
        <span class="label">홈페이지</span>
        <p class="value" v-html="place.homepage"></p>
      </div>
    </section>

    <!-- MAP -->
    <section class="map-section" v-if="place.mapx && place.mapy">
      <h2>위치</h2>
      <div id="map" class="map"></div>
    </section>

    <!-- OVERVIEW -->
    <section class="overview-section" v-if="place.overview">
      <h2>상세 소개</h2>
      <p v-html="cleanOverview"></p>
    </section>

    <!-- REVIEWS -->
    <section class="reviews-section">
      <div class="reviews-header" @click="toggleReview">
        <div class="left">
          <h2>리뷰</h2>
          <span class="count">{{ reviewStats.reviewCount }}</span>
        </div>

        <span class="toggle-arrow" :class="{ open: isReviewOpen }"></span>
      </div>

      <div v-show="isReviewOpen" class="reviews-body">
        <div class="sort">
          <button
            :class="{ active: reviewSort === 'latest' }"
            @click="
              reviewSort = 'latest';
              fetchReviews({ reset: true });
            "
          >
            최신순
          </button>
          <button
            :class="{ active: reviewSort === 'rating' }"
            @click="
              reviewSort = 'rating';
              fetchReviews({ reset: true });
            "
          >
            별점순
          </button>
          <button
            :class="{ active: reviewSort === 'popular' }"
            @click="
              reviewSort = 'popular';
              fetchReviews({ reset: true });
            "
          >
            인기순
          </button>
        </div>

        <div v-if="reviews.length === 0 && !reviewLoading" class="empty">아직 작성된 리뷰가 없습니다.</div>

        <div v-for="r in reviews" :key="r.boardId" class="review-card" @click="goReviewDetail(r.boardId)">
          <div class="top">
            <h3 class="title">{{ r.title }}</h3>
            <span class="rating">⭐ {{ r.rating }}</span>
          </div>

          <div class="meta">
            <span>{{ r.nickName }}</span>
            <span class="dot">·</span>
            <span>{{ r.registDate }}</span>
          </div>
        </div>

        <button v-if="reviewPage < reviewTotalPages" class="more-btn" @click="loadMoreReviews">더 보기</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getAttractionDetail, getAttractionImage } from "@/api/attraction";
import { getReviewStats } from "@/api/board";
import { getPlaceReviews } from "@/api/board";

import saveIcon from "@/assets/icons/icon-save.png";
import savedIcon from "@/assets/icons/icon-saved.png";
import reviewIcon from "@/assets/icons/icon-write.png";
import shareIcon from "@/assets/icons/icon-share.png";

/* ======================
   BASIC SETUP
====================== */
const route = useRoute();
const router = useRouter();
const contentId = route.params.id;
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

/* ======================
   STATE
====================== */
const place = ref(null);
const images = ref([]);
const saved = ref(false);
const bookmarkId = ref(null);

//for review
const isReviewOpen = ref(false);
const reviews = ref([]);
const reviewPage = ref(1);
const reviewSize = ref(5);
const reviewTotalPages = ref(0);
const reviewTotalElements = ref(0);
const reviewSort = ref("latest");
const reviewLoading = ref(false);
const reviewStats = ref({
  avgRating: 0,
  reviewCount: 0,
});

/* ======================
   FETCH DATA
====================== */
const fetchDetail = async () => {
  const { data } = await getAttractionDetail(contentId);
  const item = data?.response?.body?.items?.item;
  place.value = Array.isArray(item) ? item[0] : item;
};

const fetchImages = async () => {
  const { data } = await getAttractionImage(contentId);
  const items = data?.response?.body?.items?.item;
  images.value = items ? (Array.isArray(items) ? items : [items]) : [];

  if (!images.value.length && place.value?.firstimage) {
    images.value.push({ originimgurl: place.value.firstimage });
  }
};

//review
const fetchReviews = async ({ reset = false } = {}) => {
  if (reviewLoading.value) return;
  reviewLoading.value = true;

  try {
    if (reset) {
      reviewPage.value = 1;
      reviews.value = [];
    }

    const { data } = await getPlaceReviews(contentId, {
      page: reviewPage.value,
      size: reviewSize.value,
      sort: reviewSort.value,
    });

    // 🔥 여기 중요 (PageResponse 기준)
    reviewTotalPages.value = data.totalPages;
    reviewTotalElements.value = data.totalElements;

    if (reviewPage.value === 1) {
      reviews.value = data.list;
    } else {
      reviews.value = [...reviews.value, ...data.list];
    }
  } catch (e) {
    console.error("리뷰 불러오기 실패", e);
  } finally {
    reviewLoading.value = false;
  }
};

const fetchReviewStats = async () => {
  const { data } = await getReviewStats(contentId);
  reviewStats.value = {
    avgRating: data.avgRating ?? 0,
    reviewCount: data.reviewCount ?? 0,
  };
};

const toggleReview = async () => {
  isReviewOpen.value = !isReviewOpen.value;

  if (isReviewOpen.value && reviews.value.length === 0) {
    await fetchReviews({ reset: true });
  }
};

const loadMoreReviews = async () => {
  if (reviewPage.value >= reviewTotalPages.value) return;
  reviewPage.value += 1;
  await fetchReviews();
};

const goReviewDetail = (boardId) => {
  router.push(`/board/${boardId}`);
};

/* ======================
   BOOKMARK
====================== */
const checkSavedStatus = async () => {
  try {
    // 🚨 수정 전: api.get(...) -> api가 정의되지 않아 에러 발생
    // ✅ 수정 후: axios.get(...) 사용 및 withCredentials 옵션 추가
    const { data } = await axios.get("http://localhost:8080/api/mypage/bookmark", {
      withCredentials: true,
    });

    // contentId 타입 비교를 위해 둘 다 String 또는 Number로 통일하는 것이 안전합니다.
    const found = data.find((item) => String(item.contentId) === String(contentId));

    if (found) {
      saved.value = true;
      bookmarkId.value = found.bookmarkId;
      console.log("북마크 상태: 저장됨", bookmarkId.value);
    } else {
      saved.value = false;
      bookmarkId.value = null;
      console.log("북마크 상태: 저장되지 않음");
    }
  } catch (e) {
    console.error("북마크 확인 실패:", e);
    // 에러 발생 시(비로그인 등) 저장 안 된 상태로 간주
    saved.value = false;
  }
};
const toggleSave = async () => {
  if (!saved.value) {
    // 저장하기
    try {
      // 🔥 [수정] api -> axios로 변경, URL 수정, withCredentials 추가
      await axios.post(
        "http://localhost:8080/api/mypage/bookmark",
        {
          contentId: Number(contentId),
          title: place.value.title,
          addr1: place.value.addr1,
          firstImage: place.value.firstimage,
          latitude: Number(place.value.mapy),
          longitude: Number(place.value.mapx),
        },
        {
          withCredentials: true, // 세션 쿠키 전송 필수
        }
      );

      await checkSavedStatus();
      alert("관광지가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      // 진짜 401 에러일 때만 로그인 창으로 보내는 게 좋지만,
      // 일단 기존 로직 유지하되 에러 로그를 찍어서 확인 가능하게 함
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  } else {
    // 저장 취소
    if (!confirm("저장을 취소하시겠습니까?")) return;
    try {
      // 🔥 [수정] api -> axios 변경
      await axios.delete(`http://localhost:8080/api/mypage/bookmark/${bookmarkId.value}`, {
        withCredentials: true,
      });
      saved.value = false;
      bookmarkId.value = null;
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  }
};

/* ======================
   KAKAO MAP
====================== */
const loadKakaoMap = () =>
  new Promise((resolve) => {
    if (window.kakao?.maps) return resolve();
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_MAP_KEY}`;
    script.onload = () => window.kakao.maps.load(resolve);
    document.head.appendChild(script);
  });

const initMap = async () => {
  await loadKakaoMap();
  await nextTick();

  const mapContainer = document.getElementById("map");
  const position = new kakao.maps.LatLng(place.value.mapy, place.value.mapx);

  const map = new kakao.maps.Map(mapContainer, {
    center: position,
    level: 3,
  });

  new kakao.maps.Marker({
    map,
    position,
  });
};

/* ======================
   ACTIONS
====================== */
const goWriteReview = () => {
  // 데이터가 아직 로딩 안 됐으면 클릭 방지
  if (!place.value) return;

  router.push({
    path: "/board/write",
    query: {
      type: 2, // 2: 리뷰 작성 모드
      contentId: contentId, // 관광지 고유 ID
      title: place.value.title, // 관광지 이름 (제목 자동입력용)
      addr1: place.value.addr1, // 주소 (정보 표시용)
      mapx: place.value.mapx, // 경도 (지도 표시용)
      mapy: place.value.mapy, // 위도
    },
  });
};

const sharePlace = async () => {
  const shareUrl = window.location.href;
  const shareText = `[모아봐] ${place.value.title}\n${shareUrl}`;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareText);
      alert("관광지 링크가 복사되었습니다.");
    } else {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("관광지 링크가 복사되었습니다.");
    }
  } catch (e) {
    alert("공유에 실패했습니다.");
  }
};

/* ======================
   COMPUTED
====================== */
const cleanOverview = computed(() => (place.value?.overview ? place.value.overview.replace(/<br\s*\/?>/gi, "\n") : ""));

/* ======================
   MOUNT
====================== */
onMounted(async () => {
  await fetchDetail();
  await fetchImages();
  await fetchReviewStats();
  await checkSavedStatus();

  window.scrollTo(0, 0);
  if (place.value?.mapx && place.value?.mapy) initMap();
});
</script>

<style scoped lang="scss">
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px 100px;
}

/* HEADER */
.header-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;

  h1 {
    font-size: 34px;
    font-weight: 800;
  }

  .meta {
    margin-top: 12px;
    display: flex;
    gap: 10px;
  }

  .badge {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }

  .rating {
    background: #fff6d8;
    color: #9a6b00;
  }

  .review {
    background: #eef4ff;
    color: #2b7cff;
  }
}

/* IMAGE */
.image-section {
  position: relative;
  margin-bottom: 32px;

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  }

  .img-count {
    position: absolute;
    right: 16px;
    bottom: 14px;
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border-radius: 999px;
    font-size: 13px;
  }
}

/* ACTION BAR */
.action-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;

  background: #f5f8ff;
  border-radius: 16px;
  padding: 20px 0;
  margin-bottom: 40px;
}

.action-col {
  display: flex;
  justify-content: center;
}

.divider {
  width: 1px;
  height: 42px;
  background: #dbe4ff;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #445;

  img {
    width: 40px;
    height: 40px;
    transition: transform 0.2s ease;
  }

  img:hover {
    transform: scale(1.12);
  }
}

/* CARD SECTIONS */
.info-section,
.map-section,
.overview-section,
.reviews-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 28px;
  border: 1px solid #eef0f5;
}

/* INFO */
.info-item {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.label {
  width: 64px;
  font-size: 13px;
  font-weight: 600;
  color: #8a8f9c;
}

.value {
  font-size: 14px;
  color: #333;
}

.value a {
  color: #2b7cff;
  font-weight: 600;
  text-decoration: none;
}

.value a:hover {
  text-decoration: underline;
}

/* MAP */
.map {
  height: 360px;
  border-radius: 14px;
}

/* OVERVIEW */
.overview-section p {
  line-height: 1.8;
  font-size: 15px;
  color: #444;
}

/* REVIEWS */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eef0f5;

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count {
    font-size: 14px;
    color: #666;
  }
}

.toggle-arrow {
  width: 18px;
  height: 18px;
  border-right: 2px solid #2b7cff;
  border-bottom: 2px solid #2b7cff;
  transform: rotate(45deg);
  transition: transform 0.25s ease;
}

.toggle-arrow.open {
  transform: rotate(-135deg);
}

.reviews-body {
  padding-top: 12px;
}

.sort {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  button {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #ddd;
    background: #fff;
    font-size: 13px;
    cursor: pointer;

    &.active {
      border-color: #2b7cff;
      color: #2b7cff;
      font-weight: 700;
    }
  }
}

.empty {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.review-card {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }

  .top {
    display: flex;
    justify-content: space-between;
  }

  .meta {
    margin-top: 8px;
    font-size: 13px;
    color: #777;
  }
}

.more-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}
</style>
