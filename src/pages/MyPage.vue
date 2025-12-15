<template>
  <div class="mypage-container">
    <aside class="profile-section">
      <div class="avatar"></div>
      <h2 class="nickname">{{ user.nickname }}</h2>
      <p class="bio">{{ user.bio }}</p>

      <div class="stats">
        <div class="stat">
          <span class="number">{{ user.following }}</span>
          <span class="label">팔로우</span>
        </div>
        <div class="stat">
          <span class="number">{{ user.followers }}</span>
          <span class="label">팔로워</span>
        </div>
        <div class="stat">
          <span class="number">{{ user.badges }}</span>
          <span class="label">뱃지</span>
        </div>
      </div>

      <button class="edit-btn" @click="goProfileEdit">프로필 설정</button>
      
    </aside>

    <section class="content-section">
      <div class="tabs">
        <div
          :class="['tab', { active: tab === 'myReviews' }]"
          @click="tab = 'myReviews'"
        >
          내 리뷰 관리
        </div>
        <div
          :class="['tab', { active: tab === 'likedReviews' }]"
          @click="tab = 'likedReviews'"
        >
          좋아요 한 리뷰
        </div>
        <div
          :class="['tab', { active: tab === 'savedPlaces' }]"
          @click="tab = 'savedPlaces'"
        >
          저장한 관광지
        </div>
      </div>

      <div class="tab-content">
        <div v-if="tab === 'myReviews'">
          <p>내가 작성한 리뷰 리스트가 들어갑니다.</p>
        </div>
        <div v-if="tab === 'likedReviews'">
          <p>좋아요 누른 리뷰 리스트가 들어갑니다.</p>
        </div>
        <div v-if="tab === 'savedPlaces'">
          <p>저장한 관광지가 들어갑니다.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"; // onMounted import 추가
import { useRouter } from "vue-router";
import axios from "axios"; // axios 직접 사용 또는 api 설정 파일 import

// axios 인스턴스를 따로 파일로 관리하지 않는다면 아래처럼 직접 생성해도 됩니다.
// 만약 api 설정 파일이 있다면 import { api } from "@/api/axiosConfig"; 를 사용하세요.
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // 세션 유지 필수
});

const router = useRouter();

const goProfileEdit = () => {
  router.push("/mypage/profile-edit");
};

// 1. 임시 데이터를 빈 객체로 변경하고, 실제 API로 채울 준비
const user = ref({
  userId: "", // 새로 추가 (정보 수정 시 필요)
  nickname: "",
  email: "",
  bio: "여행을 좋아하는 개발자입니다.", // 이 부분은 DB에 없다면 고정값으로 둡니다.
  following: 0, // DB 미구현 시 0으로 고정
  followers: 0,
  badges: 0,
});

const tab = ref("myReviews");

// 2. onMounted 훅을 사용하여 컴포넌트 로드 시 정보를 가져옵니다.
onMounted(() => {
  fetchUserInfo();
});

const fetchUserInfo = async () => {
  try {
    // [GET] /user/info 요청 (세션 기반 인증)
    // 현재 백엔드는 /user 경로에 세션 기반으로 userInfo를 관리하고 있습니다.
    const response = await api.get("/user/info");
    
    // 성공 응답 (200 OK)
    const userInfo = response.data;
    
    // DB에서 가져온 데이터로 user ref 업데이트
    // 주의: 백엔드 UserDto는 nickName(대소문자)일 가능성이 높음
    user.value.userId = userInfo.userId;
    user.value.nickname = userInfo.nickName; // DTO 필드명에 맞춤
    user.value.email = userInfo.email; 
    
    // TODO: DB에 following, followers, badges 필드가 있다면 함께 업데이트
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized (인증 실패): 로그인하지 않은 경우
      alert("로그인이 필요합니다.");
      router.push("/login"); 
    } else if (error.response && error.response.status === 204) {
      // 204 No Content (세션은 있으나 사용자 정보가 없는 경우 등)
      alert("사용자 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.");
      router.push("/login");
    } else {
      console.error("회원 정보 조회 오류:", error);
      // alert("서버 오류가 발생했습니다."); // 사용자 경험을 위해 불필요한 알림 자제 가능
    }
  }
};

// 로그아웃 기능 추가
const handleLogout = async () => {
  try {
    await api.get("/user/logout");
    alert("로그아웃 되었습니다.");
    router.push("/"); // 메인 페이지로 이동
  } catch (error) {
    console.error("로그아웃 실패:", error);
  }
};
</script>

<style scoped lang="scss">
.mypage-container {
  display: flex;
  height: calc(100vh - 60px);
}

/* 왼쪽 프로필 */
.profile-section {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  padding: 28px;
  background: #fafbff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #cfd8ea;
  margin-bottom: 18px;
}

.nickname {
  font-size: 22px;
  margin-bottom: 6px;
}

.bio {
  font-size: 14px;
  color: #555;
  text-align: center;
  margin-bottom: 26px;
}

.stats {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .number {
  font-size: 20px;
  font-weight: 700;
}
.stat .label {
  font-size: 13px;
  color: #666;
}

/* 오른쪽 콘텐츠 */
.content-section {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  transition: 0.2s;
  background: #e9eef7;
  color: #42506c;
}
.tab.active {
  background: #4b7bff;
  color: white;
}

.tab-content {
  border-top: 1px solid #ddd;
  padding-top: 24px;
  font-size: 16px;
}

.edit-btn {
  margin-top: 22px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #4b7bff;
  color: white;
  width: 100%; /* 버튼 너비 맞춤 */
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}
.edit-btn:hover {
  background: #3a64d2;
}


</style>