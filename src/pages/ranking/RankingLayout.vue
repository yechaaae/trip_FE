<template>
  <div class="ranking-layout">
    <!-- 랭킹 탭 -->
    <div class="ranking-tabs">
      <RouterLink to="/ranking/review" class="tab" :class="{ active: isActive('/ranking/review') }">
        리뷰 수
      </RouterLink>

      <RouterLink to="/ranking/badge" class="tab" :class="{ active: isActive('/ranking/badge') }"> 뱃지 수 </RouterLink>

      <RouterLink to="/ranking/like" class="tab" :class="{ active: isActive('/ranking/like') }"> 좋아요 수 </RouterLink>
    </div>

    <!-- 하위 페이지 -->
    <div class="ranking-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const isActive = (path) => route.path === path;
</script>

<style scoped>
/* =========================
   LAYOUT
========================= */
.ranking-layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px 32px;
}

.ranking-content {
  width: 100%;

  /* ✅ 핵심: 하위 RouterView가 '남는 높이'를 억지로 차지하는 걸 막음 */
  height: auto;
  min-height: 0;

  /* ✅ 혹시 하위 페이지가 margin-bottom 같은 걸로 늘리면 잘라냄(스크롤 방지) */
  overflow: visible;
}

/* ✅ RouterView가 렌더링하는 첫 래퍼가 block으로 높이만큼만 먹게 */
.ranking-content :deep(> *) {
  height: auto !important;
  min-height: 0 !important;
}

/* =========================
   TABS (세그먼트 스타일)
========================= */
.ranking-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  margin-bottom: 32px;

  background: #f1f3f5;
  border-radius: 999px;
}

/* 개별 탭 */
.tab {
  position: relative;
  padding: 8px 20px;
  border-radius: 999px;

  font-size: 14px;
  font-weight: 600;
  color: #555;
  text-decoration: none;

  transition: background 0.2s ease, color 0.2s ease;
}

/* hover */
.tab:hover {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

/* 활성 탭 */
.tab.active {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
}

/* =========================
   RESPONSIVE
========================= */
@media (max-width: 768px) {
  .ranking-layout {
    padding: 20px 14px 28px;
  }

  .ranking-tabs {
    gap: 4px;
    padding: 4px;
  }

  .tab {
    padding: 7px 14px;
    font-size: 13px;
  }
}
</style>
