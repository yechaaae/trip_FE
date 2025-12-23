<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <nav class="nav-links">
        <!-- LEFT -->
        <div class="left">
          <router-link to="/" class="logo">
            <img src="@/assets/icons/moabwa.png" alt="모아봐 로고" />
          </router-link>
        </div>

        <!-- CENTER -->
        <div class="center">
          <router-link to="/" class="nav-item">홈</router-link>
          <router-link to="/area" class="nav-item">지역별 보기</router-link>
          <router-link to="/board" class="nav-item">게시판</router-link>
          <router-link to="/ranking/review" class="nav-item">명예의 전당</router-link>
          <router-link to="/random" class="nav-item">무작위 여행</router-link>
        </div>

        <!-- RIGHT -->
        <div class="right">
          <template v-if="!userInfo">
            <router-link to="/login" class="login-btn">로그인</router-link>
          </template>

          <template v-else>
            <div class="user-menu" ref="userMenuRef">
              <button class="user-trigger" @click="toggleUserMenu">
                <span class="nickname">{{ userInfo.nickName }}</span>
                <span class="arrow" :class="{ open: isUserMenuOpen }">▾</span>
              </button>

              <div v-if="isUserMenuOpen" class="dropdown">
                <router-link v-if="userInfo.role === 1" to="/admin/users" class="dropdown-item" @click="closeUserMenu">
                  관리자 콘솔
                </router-link>

                <router-link to="/mypage" class="dropdown-item" @click="closeUserMenu"> 마이페이지 </router-link>

                <button class="dropdown-item logout" @click="handleLogout">로그아웃</button>
              </div>
            </div>
          </template>
        </div>
      </nav>
    </div>
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
   NAVBAR (Floating 유지)
========================= */
.navbar {
  position: fixed;
  top: 12px; /* ⭐ 살짝 띄워서 '떠있는 바' 느낌 */
  left: 0;
  right: 0;
  z-index: 1000;

  background: transparent; /* ⭐ 전체 배경 제거 */
}

/* ⭐ 실제 네비바 카드 */
.navbar-inner {
  max-width: 1200px; /* content-wrapper와 통일 */
  height: 52px;
  margin: 0 auto;
  padding: 0 20px;

  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);

  display: flex;
  align-items: center;
  transition: backdrop-filter 0.25s ease, background 0.25s ease;
}

/* 스크롤 시 */
.navbar.scrolled .navbar-inner {
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.88);
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
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* CENTER */
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
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
}

/* =========================
   LOGO
========================= */
.logo img {
  height: 68px;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.logo:hover img {
  transform: translateY(-1px) scale(1.04);
  filter: drop-shadow(0 4px 8px rgba(79, 124, 255, 0.25));
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
}

.nav-item::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
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
  color: var(--primary-blue);
}

.nav-item.router-link-active::after {
  width: 100%;
}

/* =========================
   LOGIN BUTTON
========================= */
.login-btn {
  padding: 8px 26px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark));
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;

  box-shadow: 0 4px 10px rgba(79, 124, 255, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(79, 124, 255, 0.45);
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

/* =========================
   DROPDOWN BOX
========================= */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 160px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 6px;
  z-index: 2000;
}

/* =========================
   DROPDOWN ITEM (공통)
========================= */
.dropdown-item {
  display: block;
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  text-align: left;
}

/* 일반 hover */
.dropdown-item:hover {
  background: #f1f5ff;
  color: var(--primary-blue);
}

/* =========================
   LOGOUT (텍스트 강조만)
========================= */
.dropdown-item.logout {
  color: #e03131;
  font-weight: 600;
}

.dropdown-item.logout:hover {
  background: #fff5f5;
  color: #c92a2a;
}
</style>
