<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <nav class="nav-links">
      <div class="left">
        <router-link to="/" class="nav-item">홈</router-link>
        <router-link to="/area" class="nav-item">지역별 보기</router-link>
        <router-link to="/board" class="nav-item">게시판</router-link>
        <router-link to="/ranking/review" class="nav-item">명예의 전당</router-link>
        <router-link to="/random" class="nav-item">무작위 여행</router-link>
      </div>

      <div class="right">
  <template v-if="!userInfo">
    <router-link to="/login" class="login-btn">로그인</router-link>
  </template>

  <template v-else>
    <router-link v-if="userInfo.role === 1" to="/admin/users" class="admin-link">
      관리자 콘솔
    </router-link>
    
    <span class="welcome-msg">
      <b>{{ userInfo.nickName }}</b>님 환영합니다!
    </span>
    <router-link to="/mypage" class="nav-item">마이페이지</router-link>
    <button @click="logout" class="logout-btn">로그아웃</button>
  </template>
</div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useMemberStore } from "@/stores/memberStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { api } from "@/api/axiosConfig";

const router = useRouter();
const memberStore = useMemberStore();
const { userInfo } = storeToRefs(memberStore);
const { clearLoginUser } = memberStore;

/* ✅ 스크롤 상태 */
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 4;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

/* 로그아웃 */
const logout = async () => {
  try {
    await api.get("/user/logout");
    clearLoginUser();
    router.push("/");
  } catch (e) {
    clearLoginUser();
    router.push("/");
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  height: 52px;
  display: flex;
  align-items: center;

  padding: 0 20px;
  background-color: rgba(255, 255, 255, 0.95);

  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  z-index: 1000;

  transition: background-color 0.25s ease, backdrop-filter 0.25s ease;
}

/* 스크롤 시 */
.navbar.scrolled {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
}


/* 내부 정렬 */
.nav-links {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  gap: 24px;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 메뉴 링크 */
.nav-item {
  position: relative;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 0;
}

.nav-item::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0%;
  height: 2px;
  background-color: #2563eb;
  transition: width 0.25s ease;
}

.nav-item:hover {
  color: #2563eb;
}

.nav-item:hover::after {
  width: 100%;
}

.nav-item.router-link-active {
  color: #2563eb;
}

.nav-item.router-link-active::after {
  width: 100%;
}

/* 로그인 버튼 */
.login-btn {
  padding: 8px 26px;
  background: linear-gradient(135deg, #4f7cff, #2563eb);
  color: #fff;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 3px 8px rgba(79, 124, 255, 0.35);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(79, 124, 255, 0.45);
}

/* 환영 문구 */
.welcome-msg {
  font-size: 13px;
  color: #555;
  white-space: nowrap;
}

/* 로그아웃 */
.logout-btn {
  padding: 5px 14px;
  background: transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #868e96;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.logout-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.admin-link {
  color: #d32f2f; /* 관리자 강조용 빨간색 */
  font-weight: 800;
  text-decoration: none;
  font-size: 13px;
  border: 1px solid #d32f2f;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
.admin-link:hover {
  background-color: #d32f2f;
  color: white;
}
</style>
