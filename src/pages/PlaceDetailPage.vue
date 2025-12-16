<template>
  <div class="detail-page" v-if="place">

    <!-- 🔹 HEADER -->
    <section class="header-section">
      <h1>{{ place.title }}</h1>

      <div class="meta">
        <span>⭐ 4.6</span>
        <span>리뷰 123</span>
      </div>
    </section>

    <!-- 🔹 IMAGE -->
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

    <!-- 🔹 ACTION BAR -->
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

    <!-- 🔹 BASIC INFO -->
    <section class="info-section">
      <h2>기본 정보</h2>

      <div class="info-item">
        <span class="label">
          <i class="fa-solid fa-location-dot"></i>
          주소
        </span>
        <p class="value">{{ place.addr1 }}</p>
      </div>

      <div class="info-item" v-if="place.tel">
        <span class="label">
          <i class="fa-solid fa-phone"></i>
          전화
        </span>
        <p class="value">{{ place.tel }}</p>
      </div>

      <div class="info-item" v-if="place.homepage">
        <span class="label">
          <i class="fa-solid fa-globe"></i>
          홈페이지
        </span>
        <p class="value" v-html="place.homepage"></p>
      </div>
    </section>


    <!-- 🔹 MAP -->
    <section class="map-section" v-if="place.mapx && place.mapy">
      <h2>위치</h2>
      <div id="map" class="map"></div>
    </section>

    <!-- 🔹 OVERVIEW -->
    <section class="overview-section" v-if="place.overview">
      <h2>상세 소개</h2>
      <p v-html="cleanOverview"></p>
    </section>

  </div>
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

/* 🔑 ENV */
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const route = useRoute();
const router = useRouter();
const contentId = route.params.id;

const place = ref(null);
const images = ref([]);
const saved = ref(false);

/* -------------------
   API
------------------- */
const fetchDetail = async () => {
  const { data } = await getAttractionDetail(contentId);
  const item = data?.response?.body?.items?.item;
  place.value = Array.isArray(item) ? item[0] : item;
};

const fetchImages = async () => {
  const { data } = await getAttractionImage(contentId);
  const items = data?.response?.body?.items?.item;
  images.value = items ? (Array.isArray(items) ? items : [items]) : [];

  if (images.value.length === 0 && place.value?.firstimage) {
    images.value.push({ originimgurl: place.value.firstimage });
  }
};

/* -------------------
   KAKAO MAP
------------------- */
const loadKakaoMap = () => {
  return new Promise((resolve) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_MAP_KEY}`;
    script.onload = () => window.kakao.maps.load(resolve);
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  await loadKakaoMap();
  await nextTick();

  const container = document.getElementById("map");

  const position = new window.kakao.maps.LatLng(
    Number(place.value.mapy),
    Number(place.value.mapx)
  );

  const map = new window.kakao.maps.Map(container, {
    center: position,
    level: 3,
  });

  new window.kakao.maps.Marker({
    map,
    position,
  });
};

/* -------------------
   COMPUTED
------------------- */
const cleanOverview = computed(() => {
  if (!place.value?.overview) return "";
  return place.value.overview.replace(/<br\s*\/?>/gi, "\n");
});

/* -------------------
   ACTIONS
------------------- */
const toggleSave = () => (saved.value = !saved.value);
const goWriteReview = () =>
  router.push(`/board/write?placeId=${contentId}`);
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

  window.scrollTo(0, 0);

  if (place.value?.mapx && place.value?.mapy) {
    initMap();
  }
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

  /* 🔑 기본 화살표 색 (비-hover) */
  --swiper-navigation-color: rgb(140, 140, 140);

  /* 이미지 기본 */
  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    height: auto;
    object-fit: cover;
    border-radius: 14px;
  }

  /* 좌우 네비게이션 버튼 */
  .swiper-button-prev,
  .swiper-button-next {
    width: 46px;
    height: 46px;
    border-radius: 50%;

    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    display: flex;
    align-items: center;
    justify-content: center;

    opacity: 0.9;
    transition:
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  /* 🔥 hover 시만 색 변화 */
  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    --swiper-navigation-color: rgb(90, 90, 90);
    background: rgba(0, 0, 0, 0.55);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .swiper-button-prev::after,
  .swiper-button-next::after {
    font-size: 18px;
    font-weight: 700;
  }

  /* 페이지네이션 */
  .swiper-pagination-bullet {
    background: rgba(255, 255, 255, 0.6);
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    background: white;
    width: 18px;
    border-radius: 6px;
  }

  /* 이미지 개수 배지 */
  .img-count {
    position: absolute;
    bottom: 14px;
    right: 16px;

    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    color: white;

    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    z-index: 5;
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
  margin-top: 10px;

  .action-item {
    text-align: center;
    cursor: pointer;

    i {
      font-size: 22px;
      margin-bottom: 4px;
      color: #444;
      transition: color 0.2s ease;
    }

    i.saved {
      color: #ff4b4b;
    }

    span {
      display: block;
      font-size: 14px;
      margin-top: 6px;
      color: #333;
    }

    &:hover i {
      color: #0056ff;
    }
  }
}

/* ===================
   INFO (ICON STYLE)
=================== */
.info-section {
  margin-top: 36px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 22px;
  }

  .info-item {
    margin-bottom: 20px;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #777;
    margin-bottom: 6px;
  }

  .value {
    font-size: 16px;
    color: #222;
    line-height: 1.6;
    word-break: keep-all;
  }
}

/* ===================
   MAP
=================== */
.map-section {
  margin-top: 36px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .map {
    width: 100%;
    height: 360px;
    border-radius: 14px;
    overflow: hidden;
  }
}

/* ===================
   OVERVIEW
=================== */
.overview-section {
  margin-top: 36px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    line-height: 1.65;
    color: #333;
    white-space: pre-line;
  }
}
</style>
