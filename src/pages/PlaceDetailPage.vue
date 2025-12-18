<template>
  <div class="detail-page" v-if="place">
    <!-- HEADER -->
    <section class="header-section">
      <h1>{{ place.title }}</h1>
      <div class="meta">
        <span>⭐ 4.6</span>
        <span>리뷰 123</span>
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
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getAttractionDetail, getAttractionImage } from "@/api/attraction";

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const route = useRoute();
const router = useRouter();
const contentId = route.params.id;

const place = ref(null);
const images = ref([]);
const saved = ref(false);

/* API */
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

/* KAKAO MAP */
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

  const position = new kakao.maps.LatLng(
    Number(place.value.mapy),
    Number(place.value.mapx)
  );

  const map = new kakao.maps.Map(document.getElementById("map"), {
    center: position,
    level: 3,
  });

  new kakao.maps.Marker({ map, position });
};

const cleanOverview = computed(() =>
  place.value?.overview
    ? place.value.overview.replace(/<br\s*\/?>/gi, "\n")
    : ""
);

/* ACTIONS */
const toggleSave = () => (saved.value = !saved.value);
const goWriteReview = () =>
  router.push(`/board/write?placeId=${contentId}`);
const sharePlace = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert("링크가 복사되었습니다");
};

onMounted(async () => {
  await fetchDetail();
  await fetchImages();
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
