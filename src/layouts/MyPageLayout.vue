<template>
  <div class="mypage-layout">
    <NavBar />
    <div class="mypage-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<style scoped>
.mypage-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* ⭐ 전체 페이지 스크롤 차단 */
}

/* 네비바 아래 영역 */
.mypage-content {
  flex: 1;              /* ⭐ 남은 영역 전부 차지 */
  overflow: hidden;     /* ⭐ 내부에서도 스크롤 안 생기게 */
}
</style>
