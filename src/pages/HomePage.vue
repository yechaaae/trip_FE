<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 지도 영역 -->
      <section class="map-section">
        <div class="map-wrapper">
          <!-- FILTER BAR -->
          <div class="filter-bar">
            <button class="filter-btn" :class="{ active: filters.saved }" @click="toggleFilter('saved')">
              <i class="fa-solid fa-heart"></i>
              저장
            </button>

            <button class="filter-btn" :class="{ active: filters.reviewed }" @click="toggleFilter('reviewed')">
              <i class="fa-solid fa-pen"></i>
              리뷰
            </button>
          </div>

          <!-- MAP -->
          <!-- 지도 리렌더링 최적화: filters가 변경될 때만 지도 렌더링 -->
          <MapView v-if="mapReady" :filters="filters" :zoom="zoomLevel" :center="center" @update="handleMapUpdate" />
        </div>
      </section>

      <!-- BADGE CARD -->
      <aside class="badge-card">
        <h2>나의 뱃지함</h2>

        <div class="badge-list" v-if="myBadges.length > 0">
          <div class="badge-item" v-for="badge in myBadges" :key="badge.badgeId">
            <div class="badge-circle">
              <img :src="getImageUrl(badge.image)" alt="뱃지" />
            </div>
            <p>{{ badge.name }}</p>
          </div>
        </div>

        <div v-else class="empty-badge">
          <p>획득한 뱃지가 없습니다. 😢</p>
          <small>리뷰를 남기고 지역 뱃지를 모아보세요!</small>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import MapView from "@/components/MapView.vue";
import { getMyBadges } from "@/api/badge";
import axios from "axios";
import { debounce } from "lodash"; // 디바운스 적용

const filters = reactive({
  saved: false,
  reviewed: false,
});

const myBadges = ref([]);

// 지도 데이터 및 상태
const mapReady = ref(false); // 지도 준비 상태
const zoomLevel = ref(10); // 기본 줌 레벨
const center = ref([37.5665, 126.978]); // 기본 위치

// 필터 및 지도 상태 변경 시 요청할 데이터
const fetchMapData = async (newZoom, newCenter) => {
  try {
    const { data } = await axios.get("/api/get-map-data", {
      params: {
        zoom: newZoom,
        center: newCenter,
      },
    });
    mapData.value = data;
  } catch (error) {
    console.error("지도 데이터 로딩 오류:", error);
  }
};

// 필터 상태 변경
const toggleFilter = (type) => {
  filters[type] = !filters[type];
  // 필터 상태 변경 시 새로운 데이터 요청 (디바운스 사용)
  fetchMapDataDebounced();
};

// 디바운스를 적용한 지도 데이터 요청
const fetchMapDataDebounced = debounce(() => {
  fetchMapData(zoomLevel.value, center.value);
}, 500); // 500ms 대기 후 실행

// 마운트 시 뱃지 및 지도 데이터 로드
onMounted(async () => {
  try {
    const { data } = await getMyBadges();
    myBadges.value = data;
    mapReady.value = true; // 뱃지 데이터 로딩 후 지도 준비 완료
  } catch (error) {
    console.log("뱃지 로딩 실패(비로그인 등):", error);
    myBadges.value = [];
    mapReady.value = true; // 비어도 지도 렌더링 진행
  }
});

// 지도 업데이트 시 (줌, 위치 변경)
const handleMapUpdate = (newZoom, newCenter) => {
  zoomLevel.value = newZoom;
  center.value = newCenter;

  // 지도 상태 변경 시 데이터 요청
  fetchMapData(newZoom, newCenter);
};

// 이미지 경로 처리
const getImageUrl = (path) => {
  if (!path) return "/tmpimg.png";
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};
</script>
<style scoped lang="scss">
/* ===================
   PAGE LAYOUT (FINAL)
=================== */
.home-page {
  width: 100%;
  height: 100%; /* ✅ main 기준 */
  overflow: hidden; /* ✅ 페이지 스크롤 차단 */
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.home-container {
  width: 100%;
  max-width: 1100px;

  height: 100%;
  min-height: 0; /* ⭐ flex overflow 핵심 */
  overflow: hidden;

  padding: 20px;
  box-sizing: border-box;

  display: flex;
  gap: 20px;
}

/* ===================
   MAP SECTION
=================== */
.map-section {
  flex: 7;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  display: flex;
}

.map-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  position: relative;
  background: #ffffff;
  border-radius: 16px;

  /* 🔥 맵 영역 구분감 */
  box-shadow: inset 0 0 0 1px #eef1f5;
}

/* ===================
   BADGE CARD
=================== */
.badge-card {
  flex: 3;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  /* 🔥 카드 강조 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px #f1f3f5;
}

/* ===================
   BADGE TITLE
=================== */
.badge-card h2 {
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 18px;
  font-weight: 700;
  color: #2b2f33;

  padding-bottom: 12px;
  margin-bottom: 16px;

  border-bottom: 1px solid #f1f3f5;
}

/* ===================
   BADGE LIST
=================== */
.badge-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto; /* ✅ 내부만 스크롤 */

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

/* ===================
   EMPTY BADGE
=================== */
.empty-badge {
  flex: 1;
  min-height: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  color: #888;
}

/* ===================
   FILTER BAR
=================== */
.filter-bar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 30;

  display: flex;
  gap: 10px;

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 8px 10px;

  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: transparent;

  font-size: 14px;
  font-weight: 600;
  color: #555;
  cursor: pointer;

  transition: background 0.2s ease, color 0.2s ease;
}

.filter-btn:hover {
  background: #f1f3f5;
}

.filter-btn.active {
  background: #dbe5ff;
  color: #4a90e2;
}
</style>
