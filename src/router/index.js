import { createRouter, createWebHistory } from "vue-router";
import AttractionDetailPage from "@/pages/PlaceDetailPage.vue";
import RankingLayout from "@/pages/ranking/RankingLayout.vue";
import ReviewRanking from "@/pages/ranking/ReviewRankingPage.vue";
import AdminUserPage from '@/pages/AdminUserPage.vue'
import MyPageLayout from "@/layouts/MyPageLayout.vue";

import { useMemberStore } from "@/stores/memberStore";
import { storeToRefs } from "pinia";
const routes = [
  // ===== 메인 페이지 =====
  { path: "/", name: "Home", component: () => import("@/pages/HomePage.vue") },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUserPage,
    // meta 필드에 관리자 전용 여부를 표시합니다.
    meta: { requiresAdmin: true } 
  },
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
  {
    path: "/mypage",
    component: MyPageLayout,
    meta: { noWrapper: true },   // ⭐ 추가
    children: [
      {
        path: "",
        name: "MyPage",
        component: () => import("@/pages/MyPage.vue"),
      },
      {
        path: "profile-edit",
        component: () => import("@/pages/ProfileEditPage.vue"),
      },
    ],
  },

  {
    path: "/user/:userId",
    component: MyPageLayout,
    meta: { noWrapper: true },   // ⭐ 추가
    children: [
      {
        path: "",
        name: "UserProfile",
        component: () => import("@/pages/MyPage.vue"),
      },
    ],
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

router.beforeEach((to, from, next) => {
  const memberStore = useMemberStore();
  const { userInfo } = storeToRefs(memberStore);

  // 1. 접근하려는 페이지가 관리자 전용(requiresAdmin)인지 확인
  if (to.meta.requiresAdmin) {
    // 2. 로그인이 안 되어 있거나, 권한(role)이 1(관리자)이 아니면 차단
    if (!userInfo.value || userInfo.value.role !== 1) {
      alert("관리자 권한이 필요한 페이지입니다.");
      next("/"); // 메인 페이지로 리다이렉트
    } else {
      next(); // 관리자라면 통과
    }
  } 
  // 관리자 전용 페이지가 아니라면 모두 통과
  else {
    next();
  }
});

export default router;
