<template>
  <div class="layout">
    <NavBar />

    <!-- ✅ 마이페이지 계열 -->
    <div v-if="isMyPage" class="mypage-root">
      <router-view />
    </div>

    <!-- ✅ 일반 페이지 -->
    <main v-else class="main">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "@/components/NavBar.vue";

const route = useRoute();

/**
 * /mypage, /mypage/*
 * /user/:userId
 * → wrapper 제거 대상
 */
const isMyPage = computed(() => {
  return (
    route.path.startsWith("/mypage") ||
    route.path.startsWith("/user/")
  );
});
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
  padding-top: 64px;
  height: 100%;

  /* ⭐ 추가 */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9),
    #f4f6fa 120px
  );
}

.content-wrapper {
  max-width: 1200px;
  margin: 24px auto;
  padding: 24px 20px;

  background: #ffffff;
  border-radius: 24px;

  /* ⭐ 수정 포인트 */
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.06);

  height: calc(100vh - 112px);
  overflow-y: auto;
}


/* ✅ 마이페이지 전용 루트 */
.mypage-root {
  padding-top: 64px; /* ⭐ NavBar 높이만큼만 밀어줌 */
  height: calc(100vh - 64px);
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
