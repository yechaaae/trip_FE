<template>
  <div class="ranking-layout">
    <!-- 페이지 타이틀 -->
    <h1 class="page-title">사용자 랭킹</h1>

    <!-- 랭킹 탭 -->
    <div class="ranking-tabs">
      <RouterLink to="/ranking/review" class="tab" :class="{ active: isActive('/ranking/review') }">
        리뷰 수
      </RouterLink>

      <RouterLink to="/ranking/badge" class="tab" :class="{ active: isActive('/ranking/badge') }"> 뱃지 수 </RouterLink>

      <RouterLink to="/ranking/like" class="tab" :class="{ active: isActive('/ranking/like') }"> 좋아요 수 </RouterLink>
    </div>

    <!-- 하위 페이지 -->
    <RouterView />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => route.path === path;
</script>

<style scoped>
.ranking-layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
}

.ranking-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.tab {
  padding: 8px 18px;
  border-radius: 20px;
  background-color: #f1f3f5;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.tab.active {
  background-color: #2563eb;
  color: white;
}
</style>
