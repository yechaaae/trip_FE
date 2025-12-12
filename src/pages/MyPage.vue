<template>
  <div class="mypage-container">
    <!-- 왼쪽 프로필 -->
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

    <!-- 오른쪽 콘텐츠 -->
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

      <!-- 탭 콘텐츠 -->
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
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goProfileEdit = () => {
  router.push("/mypage/profile-edit");
};

// 🔥 지금은 임시 데이터 — 후에 DB 연동 시 교체
const user = ref({
  nickname: "사용자 닉네임",
  bio: "여행을 좋아하는 개발자입니다.",
  following: 23,
  followers: 15,
  badges: 8,
});

const tab = ref("myReviews");
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
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}
.edit-btn:hover {
  background: #3a64d2;
}

</style>
