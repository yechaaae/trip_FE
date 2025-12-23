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
/* ✅ 전체 페이지 배경 */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6fa;
}

/* ✅ 네비바 아래 영역 */
.main {
  flex: 1;
  padding-top: 52px; /* fixed navbar 높이 */
  display: flex;
  justify-content: center;
}

/* ✅ 실제 콘텐츠 카드 */
.content-wrapper {
  width: 100%;
  max-width: 1200px;

  margin: 24px 20px;
  padding: 24px 24px 48px; /* ⭐ 하단 여백은 여기서만 */

  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .content-wrapper {
    margin: 12px;
    padding: 18px 16px 36px;
    border-radius: 16px;
  }
}
</style>
