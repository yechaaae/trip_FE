import { createRouter, createWebHistory } from "vue-router";
import AttractionDetailPage from "@/pages/PlaceDetailPage.vue";
import RankingLayout from "@/pages/ranking/RankingLayout.vue";
import ReviewRanking from "@/pages/ranking/ReviewRankingPage.vue";

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
  {
    // [수정 완료] BoardWritePage 변수 대신 직접 import 함수를 넣습니다.
    path: "/board/modify/:boardId",
    name: "BoardModify",
    component: () => import("@/pages/BoardWritePage.vue"),
  },

  // ===== 회원 =====
  { path: "/login", name: "Login", component: () => import("@/pages/LoginPage.vue") },
  { path: "/register", name: "Register", component: () => import("@/pages/RegisterPage.vue") },

  // ===== 마이페이지 =====
  { path: "/mypage", name: "MyPage", component: () => import("@/pages/MyPage.vue") },
  { path: "/mypage/profile-edit", name: "ProfileEdit", component: () => import("@/pages/ProfileEditPage.vue") },
  {
    path: "/user/:userId",
    name: "UserProfile",
    component: () => import("@/pages/MyPage.vue"),
  },

  {
    path: "/attraction/:id", // :id 부분이 contentId가 됩니다.
    name: "AttractionDetail",
    component: AttractionDetailPage,
  },

  {
    path: "/ranking",
    component: () => import("@/pages/ranking/RankingLayout.vue"),
    redirect: "/ranking/review",
    children: [
      {
        path: "review",
        name: "ReviewRanking",
        component: () => import("@/pages/ranking/ReviewRankingPage.vue"),
      },
      {
        path: "badge",
        name: "BadgeRanking",
        component: () => import("@/pages/ranking/BadgeRankingPage.vue"),
      },
      {
        path: "like",
        name: "LikeRanking",
        component: () => import("@/pages/ranking/LikeRankingPage.vue"),
      },
    ],
  },

  {
  path: "/random",
  name: "RandomPick",
  component: () => import("@/pages/RandomPickPage.vue"),
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
