<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <nav class="nav-links">
      <!-- LEFT: 로고 -->
      <div class="left">
        <router-link to="/" class="logo">
          <img src="@/assets/icons/moabwa.png" alt="모아봐 로고" />
        </router-link>
      </div>

      <!-- CENTER: 메뉴 -->
      <div class="center">
        <router-link to="/" class="nav-item">홈</router-link>
        <router-link to="/area" class="nav-item">지역별 보기</router-link>
        <router-link to="/board" class="nav-item">게시판</router-link>
        <router-link to="/ranking/review" class="nav-item">명예의 전당</router-link>
        <router-link to="/random" class="nav-item">무작위 여행</router-link>
      </div>

      <div class="right">
        <!-- 비로그인 -->
        <template v-if="!userInfo">
          <router-link to="/login" class="login-btn">로그인</router-link>
        </template>

        <!-- 로그인 -->
        <template v-else>
          <div class="user-menu" ref="userMenuRef">
            <!-- 트리거 -->
            <button class="user-trigger" @click="toggleUserMenu">
              <span class="nickname">{{ userInfo.nickName }}</span>
              <span class="arrow" :class="{ open: isUserMenuOpen }">▾</span>
            </button>

            <!-- 드롭다운 -->
            <div v-if="isUserMenuOpen" class="dropdown">
              <router-link to="/mypage" class="dropdown-item" @click="closeUserMenu">
                마이페이지
              </router-link>
              <button class="dropdown-item logout" @click="handleLogout">
                로그아웃
              </button>
            </div>
          </div>
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
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);

/* ✅ 스크롤 상태 */
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 4;
};

//드롭다운 

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    closeUserMenu();
  }
};

const handleLogout = async () => {
  closeUserMenu();
  await logout();
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleClickOutside);
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

/* =========================
   NAVBAR
========================= */
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

/* =========================
   내부 정렬
========================= */
.nav-links {
  position: relative;
  width: 100%;
  height: 100%;
}

/* LEFT */
.left {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* CENTER — 진짜 중앙 */
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 26px;
}

/* RIGHT */
.right {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
}

/* =========================
   USER DROPDOWN
========================= */
.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.user-trigger:hover {
  color: var(--primary-blue);
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

/* 드롭다운 박스 */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 140px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 6px;
  z-index: 2000;
}

/* 항목 */
.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
}

.dropdown-item:hover {
  background: #f1f5ff;
  color: var(--primary-blue);
}

/* 로그아웃 강조 */
.dropdown-item.logout {
  color: #e03131;
}

.dropdown-item.logout:hover {
  background: #fff5f5;
  color: #c92a2a;
}


/* 로고 */
.logo {
  display: flex;
  align-items: center;
  margin-right: 6px;
}

.logo img {
  height: 72px; 
  width: auto;
  cursor: pointer;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.logo:hover img {
  transform: translateY(-1px) scale(1.04);
  filter: drop-shadow(0 4px 8px rgba(79, 124, 255, 0.35));
}

/* 스크롤 시 로고 반응 */
.navbar.scrolled .logo img {
  transform: scale(0.95);
  opacity: 0.95;
}


/* =========================
   NAV ITEM
========================= */
.nav-item {
  position: relative;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.nav-item::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 2px;
  background-color: var(--primary-blue);
  transition: width 0.25s ease;
}

.nav-item:hover {
  color: var(--primary-blue);
}

.nav-item:hover::after {
  width: 100%;
}

.nav-item.router-link-active {
  color: var(--primary-blue-dark);
}

.nav-item.router-link-active::after {
  width: 100%;
}

/* =========================
   LOGIN BUTTON
========================= */
.login-btn {
  line-height: 1;
  padding: 8px 26px;
  background: linear-gradient(
    135deg,
    var(--primary-blue),
    var(--primary-blue-dark)
  );
  color: #fff;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 3px 8px rgba(79, 124, 255, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(79, 124, 255, 0.45);
}

/* =========================
   USER AREA
========================= */
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
  transition: background-color 0.2s ease, color 0.2s ease;
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
