<template>
  <header class="navbar">
    <nav class="nav-links">

      <!-- 🔹 왼쪽 메뉴 -->
      <div class="left">
        <router-link to="/">홈</router-link>
        <router-link to="/area">지역별 보기</router-link>
        <router-link to="/tour">여행 정보</router-link>
        <router-link to="/board">게시판</router-link>
      </div>

      <!-- 🔹 오른쪽 메뉴 -->
      <div class="right">
        <router-link to="/mypage">마이페이지</router-link>
        <router-link to="/login" class="login-btn">로그인</router-link>
      </div>

    </nav>
  </header>
</template>

<script setup></script>

<style lang="scss" scoped>
/* ================================
   🔹 전체 네비바 레이아웃
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
  justify-content: space-between; /* 왼·오른쪽 배치 */
  align-items: center;
}

/* ================================
   🔹 메뉴 (좌측)
================================ */
.left {
  display: flex;
  gap: 26px;
}

/* ================================
   🔹 메뉴 (우측)
================================ */
.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

/* ================================
   🔹 공통 링크 스타일
================================ */
.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 16px;

  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  transition: 0.2s;
}

.nav-links a:hover {
  color: #0066ff;
}

.nav-links a.router-link-active {
  color: #0066ff;
  border-bottom: 2px solid #0066ff;
}

/* ================================
   로그인 버튼 
================================ */
.login-btn {
  padding: 8px 22px;
  background: #f2f4ff;        /* 은은한 파란 배경 */
  color: #3a4a6b;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: 0.2s;
  border: 1px solid #d6ddff;  /* 탭 같은 선 */
}

.login-btn:hover {
  background: #4f7cff;        /* 활성화 느낌 */
  color: white;
  border-color: #4f7cff;
}

</style>
