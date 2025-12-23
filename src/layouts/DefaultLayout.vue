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
/* ✅ 전체 배경 */
.layout {
  background: #f4f6fa;
}

/* ✅ 네비바 높이만큼 밀기 + 하단 여백은 여기서만 */
.main {
  padding-top: 52px; /* navbar */
  padding-bottom: 60px; /* ⭐ 바닥 여유는 여기 */
}

/* ✅ 카드 덩어리 */
.content-wrapper {
  max-width: 1200px;
  margin: 24px auto 0; /* ❗ bottom 제거 */
  padding: 24px 20px 48px; /* 내부 여백만 */

  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 -1px 0 rgba(0, 0, 0, 0.03);
}

/* 모바일 */
@media (max-width: 768px) {
  .content-wrapper {
    margin-top: 12px;
    padding: 18px 14px 40px;
    border-radius: 16px;
  }
}
</style>
