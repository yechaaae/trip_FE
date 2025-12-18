import { createRouter, createWebHistory } from "vue-router";
import AttractionDetailPage from '@/pages/PlaceDetailPage.vue'

const routes = [
  // ===== 메인 페이지 =====
  { path: "/", name: "Home", component: () => import("@/pages/HomePage.vue") },

  // ===== 관광·지역 =====
  { path: "/area", name: "Area", component: () => import("@/pages/AreaPage.vue") },
  { path: "/tour", name: "Tour", component: () => import("@/pages/TourPage.vue") },
  { path: "/place/:id", name: "PlaceDetail", component: () => import("@/pages/PlaceDetailPage.vue") },

  // ===== 게시판 =====
  { path: "/board", name: "Board", component: () => import("@/pages/BoardPage.vue") },
  { path: "/board/write", name: "BoardWrite", component: () => import("@/pages/BoardWritePage.vue") },
  { path: "/board/:id", name: "BoardDetail", component: () => import("@/pages/BoardDetailPage.vue"), props: true },

  // ===== 회원 =====
  { path: "/login", name: "Login", component: () => import("@/pages/LoginPage.vue") },
  { path: "/register", name: "Register", component: () => import("@/pages/RegisterPage.vue") },

  // ===== 마이페이지 =====
  { path: "/mypage", name: "MyPage", component: () => import("@/pages/MyPage.vue") },
  { path: "/mypage/profile-edit", name: "ProfileEdit", component: () => import("@/pages/ProfileEditPage.vue") },

  {
    path: '/attraction/:id', // :id 부분이 contentId가 됩니다.
    name: 'AttractionDetail',
    component: AttractionDetailPage
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
