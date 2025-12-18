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
      <div class="action-item" @click="toggleSave">
        <i :class="saved ? 'fa-solid fa-heart saved' : 'fa-regular fa-heart'"></i>
        <span>{{ saved ? '저장됨' : '저장하기' }}</span>
      </div>

      <div class="action-item" @click="goWriteReview">
        <i class="fa-regular fa-star"></i>
        <span>리뷰쓰기</span>
      </div>

      <div class="action-item" @click="sharePlace">
        <i class="fa-solid fa-share-nodes"></i>
        <span>공유하기</span>
      </div>
    </section>

    <!-- BASIC INFO -->
    <section class="info-section">
      <h2>기본 정보</h2>

      <div class="info-item">
        <span class="label">
          <i class="fa-solid fa-location-dot"></i> 주소
        </span>
        <p class="value">{{ place.addr1 }}</p>
      </div>

      <div class="info-item" v-if="place.tel">
        <span class="label">
          <i class="fa-solid fa-phone"></i> 전화
        </span>
        <p class="value">{{ place.tel }}</p>
      </div>

      <div class="info-item" v-if="place.homepage">
        <span class="label">
          <i class="fa-solid fa-globe"></i> 홈페이지
        </span>
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

/* ======================
   BASIC SETUP
====================== */
const route = useRoute();
const router = useRouter();
const contentId = route.params.id;

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

/* axios (세션 포함) */
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

/* ======================
   STATE
====================== */
const place = ref(null);
const images = ref([]);
const saved = ref(false);
const bookmarkId = ref(null);

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

const fetchReviewStats = async () => {
  try {
    const { data } = await getReviewStats(contentId);
    reviewStats.value = {
      avgRating: data.avgRating ?? 0,
      reviewCount: data.reviewCount ?? 0,
    };
  } catch (e) {
    console.error("리뷰 통계 조회 실패", e);
  }
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
    // 비로그인 상태
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
      });
      await checkSavedStatus();
    } catch (e) {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  } else {
    if (!confirm("저장을 취소할까요?")) return;
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
  
  /* -------------------
     ACTIONS
  ------------------- */
  // ★ [수정] DB 연동 저장/삭제 토글
  const toggleSave = async () => {
    if (!saved.value) {
      // 1. 저장 (INSERT)
      try {
        // DTO 구조에 맞춰서 데이터 전송
        const payload = {
          contentId: Number(contentId),
          title: place.value.title,
          addr1: place.value.addr1,
          firstImage: place.value.firstimage || place.value.firstImage, // API 버전에 따라 키값이 다를 수 있음
          latitude: Number(place.value.mapy), 
          longitude: Number(place.value.mapx)
        
        };
  
        await api.post("/api/mypage/bookmark", payload);
        alert("관광지가 저장되었습니다. 📂");
        
        // 저장 후 ID 확인을 위해 상태 재조회
        await checkSavedStatus();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("로그인이 필요한 서비스입니다.");
          router.push("/login");
        } else {
          alert("저장에 실패했습니다.");
        }
      }
    } else {
      // 2. 삭제 (DELETE)
      if (!bookmarkId.value) return;
  
      if (!confirm("저장을 취소하시겠습니까?")) return;
  
      try {
        await api.delete(`/api/mypage/bookmark/${bookmarkId.value}`);
        saved.value = false;
        bookmarkId.value = null;
        alert("저장이 취소되었습니다.");
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };
  
  const goWriteReview = () => router.push(`/board/write?placeId=${contentId}`);
  const sharePlace = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("링크가 복사되었습니다");
  };
  
  /* -------------------
     MOUNT
  ------------------- */
  onMounted(async () => {
    await fetchDetail();
    await fetchImages();
    await checkSavedStatus(); // ★ 페이지 들어오면 저장 여부 확인
  
    window.scrollTo(0, 0);
  
    if (place.value?.mapx && place.value?.mapy) {
      initMap();
    }
  });

  new kakao.maps.Marker({ map, position });
};

/* ======================
   COMPUTED
====================== */
const cleanOverview = computed(() =>
  place.value?.overview
    ? place.value.overview.replace(/<br\s*\/?>/gi, "\n")
    : ""
);

/* ======================
   ACTIONS
====================== */
const goWriteReview = () =>
  router.push(`/board/write?placeId=${contentId}`);

const sharePlace = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert("링크가 복사되었습니다");
};

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

/* ===================
   HEADER
=================== */
.header-section {
  margin-bottom: 24px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.3;
  }

  .meta {
    margin-top: 10px;
    display: flex;
    gap: 14px;
    font-size: 15px;
    color: #555;
  }
}

/* ===================
   IMAGE SLIDER
=================== */
.image-section {
  position: relative;
  --swiper-navigation-color: rgb(140, 140, 140);

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 14px;
  }

  .swiper-button-prev,
  .swiper-button-next {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }

  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    --swiper-navigation-color: rgb(90, 90, 90);
    background: rgba(0, 0, 0, 0.55);
  }

  .swiper-pagination-bullet-active {
    background: white;
    width: 18px;
    border-radius: 6px;
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

/* ===================
   ACTION BAR
=================== */
.action-bar {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

/* ===================
   INFO
=================== */
.info-section {
  margin-top: 36px;
}

/* ===================
   MAP
=================== */
.map-section {
  margin-top: 36px;

  .map {
    height: 360px;
    border-radius: 14px;
  }
}

/* ===================
   OVERVIEW
=================== */
.overview-section {
  margin-top: 36px;
}
</style>
