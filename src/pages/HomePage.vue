<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 지도 영역 -->
      <section class="map-section">
        <div class="map-wrapper">
          <!-- FILTER BAR -->
          <div class="filter-bar">
            <button
              class="filter-btn"
              :class="{ active: filters.saved }"
              @click="toggleFilter('saved')"
            >
              <i class="fa-solid fa-heart"></i>
              저장
            </button>

            <button
              class="filter-btn"
              :class="{ active: filters.reviewed }"
              @click="toggleFilter('reviewed')"
            >
              <i class="fa-solid fa-pen"></i>
              리뷰
            </button>
          </div>

          <!-- MAP -->
          <MapView :filters="filters" />
        </div>
      </section>

      <!-- BADGE CARD -->
      <aside class="badge-card">
        <h2>🏅 나의 뱃지함</h2>

        <div class="badge-list">
          <div class="badge-item" v-for="n in 9" :key="n">
            <div class="badge-circle"></div>
            <p>뱃지 {{ n }}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import MapView from "@/components/MapView.vue";

const filters = reactive({
  saved: false,
  reviewed: false,
});

const toggleFilter = (type) => {
  filters[type] = !filters[type];
};
</script>

<style scoped lang="scss">
/* ===================
   PAGE LAYOUT
=================== */
.home-page {
  width: 100%;
  height: calc(100vh - 60px); // 네비바 높이 제외
  display: flex;
  justify-content: center;
}

.home-container {
  width: 100%;
  max-width: 1100px;
  padding: 20px;

  display: flex;
  gap: 20px;
  height: 100%;
}

/* ===================
   MAP
=================== */
.map-section {
  flex: 7;
  display: flex;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  position: relative; /* filter bar 기준 */
}

/* ===================
   BADGE CARD
=================== */
.badge-card {
  flex: 3;
  background: #fff;
  border-radius: 16px;
  padding: 24px;

  display: flex;
  flex-direction: column;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .badge-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .badge-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #dbe6ff;
      transition: transform 0.2s ease;
    }

    p {
      font-size: 14px;
      margin-top: 6px;
    }

    &:hover .badge-circle {
      transform: scale(1.08);
    }
  }
}

/* ===================
   FILTER BAR
=================== */
.filter-bar {
  position: absolute;
  top: 20px;
  left: 20px;
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

.filter-btn i {
  font-size: 14px;
}

/* hover (비활성) */
.filter-btn:hover {
  background: #f1f3f5;
}

/* 활성 상태 */
.filter-btn.active {
  background: #e7edff;
  color: #3b5bdb;
}

.filter-btn.active i {
  color: #3b5bdb;
}
</style>
