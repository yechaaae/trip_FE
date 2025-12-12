<template>
  <div class="detail-page">

    <!-- ⭐ 상단 정보 -->
    <section class="header-section">
      <h1>{{ place.title }}</h1>
      <p class="subtitle">{{ place.addr1 }}</p>

      <div class="meta">
        <span class="rating">⭐ 4.6</span>
        <span class="count">123 리뷰</span>
      </div>
    </section>

    <!-- ⭐ 이미지 슬라이더 -->
    <section class="slider-section">
      <Swiper
        :slides-per-view="1"
        :space-between="20"
        :pagination="{ clickable: true }"
        :navigation="true"
        class="place-swiper"
      >
        <SwiperSlide v-for="(img, idx) in images" :key="idx">
          <img :src="img.originimgurl || img.smallimageurl || place.firstimage" />
        </SwiperSlide>
      </Swiper>

      <div class="img-count">{{ images.length }}장</div>
    </section>

    <!-- ⭐ 액션바 -->
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

    <!-- ⭐ 상세 소개 -->
    <section class="content-section">
      <h2>상세 소개</h2>
      <p>{{ place.overview }}</p>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getAttractionDetail, getAttractionImage } from "@/api/attraction";

const route = useRoute();
const router = useRouter();

const contentId = route.params.id;

const place = ref({});
const images = ref([]);

const saved = ref(false);

// 🔥 상세 정보 조회
const fetchDetail = async () => {
  const { data } = await getAttractionDetail(contentId);
  const item = data?.response?.body?.items?.item;
  place.value = Array.isArray(item) ? item[0] : item;
};

// 🔥 이미지 조회
const fetchImages = async () => {
  try {
    const { data } = await getAttractionImage(contentId);

    const items = data?.response?.body?.items?.item;
    images.value = items ? (Array.isArray(items) ? items : [items]) : [];

    // 이미지가 아예 없으면 상세 이미지 1개라도 넣기
    if (images.value.length === 0 && place.value.firstimage) {
      images.value.push({ originimgurl: place.value.firstimage });
    }
  } catch (e) {
    console.error("이미지 조회 실패", e);
  }
};

// 저장하기
const toggleSave = () => {
  saved.value = !saved.value;
};

// 리뷰쓰기
const goWriteReview = () => {
  router.push(`/board/write?placeId=${contentId}`);
};

// 공유하기
const sharePlace = () => {
  navigator.clipboard.writeText(window.location.href);
  alert("링크가 클립보드에 복사되었습니다!");
};

onMounted(async () => {
  await fetchDetail();
  await fetchImages();
});
</script>

<style scoped lang="scss">
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* -------------------
   HEADER
------------------- */
.header-section {
  margin-bottom: 24px;

  h1 {
    font-size: 32px;
    font-weight: 800;
  }

  .subtitle {
    font-size: 17px;
    color: #666;
    margin-top: 6px;
  }

  .meta {
    margin-top: 10px;
    display: flex;
    gap: 12px;
    font-size: 15px;
    color: #444;
  }
}

/* -------------------
   SLIDER
------------------- */
.slider-section {
  position: relative;

  img {
    width: 100%;
    height: 420px;
    object-fit: cover;
    border-radius: 14px;
  }

  .img-count {
    position: absolute;
    bottom: 14px;
    right: 16px;
    background: rgba(0, 0, 0, 0.55);
    color: white;
    padding: 5px 12px;
    border-radius: 12px;
    font-size: 14px;
  }
}

/* -------------------
   ACTION BAR
------------------- */
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
      margin-bottom: 3px;
      color: #444;
      transition: 0.2s;
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

/* -------------------
   CONTENT
------------------- */
.content-section {
  margin-top: 32px;

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
