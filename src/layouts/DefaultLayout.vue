<template>
  <div class="layout">
    <NavBar />

    <main class="main">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<style scoped>
/* 전체 배경 */
.layout {
  height: 100vh;
  background: #f4f6fa;
  overflow: hidden; /* ⭐ 페이지 전체 스크롤 제거 */
}

/* 네비바 아래 영역 */
.main {
  padding-top: 64px; /* 네비바 높이 */
  height: 100%;
}

/* ⭐ 핵심: 카드 영역을 화면 안에 고정 */
.content-wrapper {
  max-width: 1200px;
  margin: 24px auto;
  padding: 24px 20px;

  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);

  /* ⭐ 여기 중요 */
  height: calc(100vh - 112px);
  overflow-y: auto; /* 내부 스크롤 */
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .content-wrapper {
    margin: 12px;
    padding: 16px 14px;
    border-radius: 16px;
    height: calc(100vh - 96px);
  }
}
</style>
