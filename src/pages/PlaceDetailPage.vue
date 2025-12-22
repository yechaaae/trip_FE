<template>
  <div class="detail-page" v-if="place">
    <!-- HEADER -->
    <section class="header-section">
      <h1>{{ place.title }}</h1>
      <div class="meta">
        <span>⭐ {{ reviewStats.avgRating.toFixed(1) }}</span>
        <span>리뷰 {{ reviewStats.reviewCount }}</span>
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
      <!-- 저장하기 -->
      <div class="action-item" @click="toggleSave">
        <img :src="saveIcon" class="action-icon" :class="{ active: saved }" alt="저장하기" />
        <span>{{ saved ? "저장됨" : "저장하기" }}</span>
      </div>

      <!-- 리뷰쓰기 -->
      <div class="action-item" @click="goWriteReview">
        <img :src="reviewIcon" class="action-icon" alt="리뷰쓰기" />
        <span>리뷰쓰기</span>
      </div>

      <!-- 공유하기 -->
      <div class="action-item" @click="sharePlace">
        <img :src="shareIcon" class="action-icon" alt="공유하기" />
        <span>공유하기</span>
      </div>
    </section>

    <!-- BASIC INFO -->
    <section class="info-section">
      <h2>기본 정보</h2>

      <div class="info-item">
        <span class="label"> <i class="fa-solid fa-location-dot"></i> 주소 </span>
        <p class="value">{{ place.addr1 }}</p>
      </div>

      <div class="info-item" v-if="place.tel">
        <span class="label"> <i class="fa-solid fa-phone"></i> 전화 </span>
        <p class="value">{{ place.tel }}</p>
      </div>

      <div class="info-item" v-if="place.homepage">
        <span class="label"> <i class="fa-solid fa-globe"></i> 홈페이지 </span>
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
  </div>

  <!-- REVIEWS -->
  <section class="reviews-section">
    <div class="reviews-header" @click="toggleReview">
      <div class="left">
        <h2>리뷰</h2>
        <span class="count">{{ reviewStats.reviewCount }}</span>
      </div>
      <i :class="isReviewOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
    </div>

    <div v-if="isReviewOpen" class="reviews-body">
      <!-- 정렬 -->
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

      <!-- 리뷰 없음 -->
      <div v-if="reviews.length === 0 && !reviewLoading" class="empty">아직 작성된 리뷰가 없습니다.</div>

      <!-- 리뷰 카드 -->
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

      <!-- 더 보기 -->
      <button v-if="reviewPage < reviewTotalPages" class="more-btn" @click="loadMoreReviews">더 보기</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getAttractionDetail, getAttractionImage } from "@/api/attraction";
import { getReviewStats } from "@/api/board";
import { getPlaceReviews } from "@/api/board";

import saveIcon from "@/assets/icons/icon-save.png";
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
    const { data } = await api.get("/api/mypage/bookmark");
    const found = data.find((item) => item.contentId == contentId);

    if (found) {
      saved.value = true;
      bookmarkId.value = found.bookmarkId;
    } else {
      saved.value = false;
      bookmarkId.value = null;
    }
  } catch {
    // 비로그인
  }
};

const toggleSave = async () => {
  if (!saved.value) {
    try {
      await api.post("/api/mypage/bookmark", {
        contentId: Number(contentId),
        title: place.value.title,
        addr1: place.value.addr1,
        firstImage: place.value.firstimage,
        latitude: Number(place.value.mapy),
        longitude: Number(place.value.mapx),
      });
      await checkSavedStatus();
      alert("관광지가 저장되었습니다.");
    } catch (e) {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  } else {
    if (!confirm("저장을 취소하시겠습니까?")) return;
    await api.delete(`/api/mypage/bookmark/${bookmarkId.value}`);
    saved.value = false;
    bookmarkId.value = null;
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
  padding: 30px 20px;
}

.header-section {
  margin-bottom: 24px;

  h1 {
    font-size: 32px;
    font-weight: 800;
  }

  .meta {
    margin-top: 10px;
    display: flex;
    gap: 14px;
    font-size: 15px;
    color: #555;
  }
}

.image-section {
  position: relative;

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 14px;
  }

  .img-count {
    position: absolute;
    bottom: 14px;
    right: 16px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
  }
}

//저장, 공유 , 리뷰
.action-bar {
  display: flex;
  justify-content: space-around;
  padding: 24px 0;

  background: #ffffff;
  border-bottom: 1px solid #eee;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  font-size: 14px;
  color: #333;
}

.action-icon {
  width: 42px;
  height: 42px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.action-item:hover .action-icon {
  transform: scale(1.12);
}

.action-icon.active {
  filter: drop-shadow(0 0 6px rgba(255, 80, 80, 0.6));
}

.map {
  height: 360px;
  border-radius: 14px;
}

/* ======================
   REVIEWS
====================== */

.reviews-section {
  max-width: 1100px;
  margin: 40px auto 0;
  border: 1px solid #eee;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  h2 {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
  }

  .count {
    margin-left: 8px;
    font-size: 14px;
    color: #666;
  }

  .left {
    display: flex;
    align-items: center;
  }
}

.reviews-body {
  padding: 20px;
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
    cursor: pointer;
    font-size: 13px;

    &.active {
      border-color: #2b7cff;
      color: #2b7cff;
      font-weight: 700;
    }
  }
}

.empty {
  padding: 20px 0;
  color: #777;
  text-align: center;
}

.review-card {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
    }

    .rating {
      font-size: 14px;
      color: #444;
    }
  }

  .meta {
    margin-top: 8px;
    font-size: 13px;
    color: #777;

    .dot {
      margin: 0 6px;
    }
  }
}

.more-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}
</style>
