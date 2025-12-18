<template>
  <header class="navbar">
    <nav class="nav-links">

      <div class="left">
        <router-link to="/">홈</router-link>
        <router-link to="/area">지역별 보기</router-link>
        <router-link to="/tour">여행 정보</router-link>
        <router-link to="/board">게시판</router-link>
      </div>

      <div class="right">
        <template v-if="!userInfo">
          <router-link to="/login" class="login-btn">로그인</router-link>
        </template>

        <template v-else>
          <span class="welcome-msg"><b>{{ userInfo.nickName }}</b>님 환영합니다!</span>
          <router-link to="/mypage">마이페이지</router-link>
          <button @click="logout" class="logout-btn">로그아웃</button>
        </template>
      </div>

    </nav>
  </header>
</template>

<script setup>
import { useMemberStore } from "@/stores/memberStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { api } from "@/api/axiosConfig"; // 백엔드 로그아웃 요청용

const router = useRouter();
const memberStore = useMemberStore();

// ✨ 스토어의 상태(userInfo)를 반응형으로 가져옵니다.
// 이제 로그인/로그아웃 할 때마다 화면이 알아서 바뀝니다.
const { userInfo } = storeToRefs(memberStore);
const { clearLoginUser } = memberStore;

const logout = async () => {
  try {
    // 1. 백엔드에 로그아웃 요청 (세션 삭제)
    await api.get("/user/logout"); 
    
    // 2. 프론트엔드 스토어 초기화
    clearLoginUser();
    
    alert("로그아웃 되었습니다.");
    router.push("/"); // 메인으로 이동
  } catch (error) {
    console.error("로그아웃 실패:", error);
    // 에러가 나도 일단 프론트 처리는 해주는 게 좋습니다.
    clearLoginUser();
    router.push("/");
  }
};
</script>

<style lang="scss" scoped>
/* ================================
   🔹 기존 스타일 유지 + 추가
================================ */
.navbar {
  width: 100%;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
}

.nav-links {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  gap: 26px;
}

.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 16px;
  transition: 0.2s;
}

.nav-links a:hover {
  color: #0066ff;
}

/* 로그인 버튼 */
.login-btn {
  padding: 8px 22px;
  background: #f2f4ff;
  color: #3a4a6b;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid #d6ddff;
}
.login-btn:hover {
  background: #4f7cff;
  color: white;
  border-color: #4f7cff;
}

/* ✨ 추가된 스타일: 환영 메시지 */
.welcome-msg {
  font-size: 14px;
  color: #555;
  margin-right: 4px;
}

/* ✨ 추가된 스타일: 로그아웃 버튼 */
.logout-btn {
  padding: 6px 14px;
  background: #e9ecef;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
  transition: 0.2s;
}
.logout-btn:hover {
  background: #dee2e6;
}
</style>