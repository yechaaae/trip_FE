<template>
  <div class="user-hover-wrapper" @mouseenter="show = true" @mouseleave="show = false" @click.stop="goProfile">
    <span class="display-name">{{ user.nickName }}</span>

    <transition name="fade">
      <div v-if="show" class="mini-profile-tooltip">
        <div class="profile-header">
          <div
            class="mini-avatar"
            :style="
              user.profileImg
                ? {
                    backgroundImage: `url(http://localhost:8080${user.profileImg})`,
                  }
                : { backgroundColor: '#e0e0e0' }
            "
          >
            <span v-if="!user.profileImg" class="no-img-text">No Img</span>
          </div>

          <div class="text-info">
            <div class="mini-nickname">{{ user.nickName }}</div>
            <div class="mini-bio">
              {{ user.introduction || "자기소개가 없습니다." }}
            </div>
          </div>
        </div>

        <div class="mini-stats">
          <div class="stat-item">
            <span class="label">🏅 뱃지</span>
            <span class="value">{{ user.badges || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">✍️ 리뷰</span>
            <span class="value">{{ user.reviews || 0 }}</span>
          </div>
        </div>

        <div class="click-hint">클릭하여 프로필 방문 ></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const show = ref(false);

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const goProfile = () => {
  if (props.user.userId) {
    router.push(`/user/${props.user.userId}`);
  } else {
    console.error("User ID가 없습니다:", props.user);
  }
};
</script>

<style scoped>
.user-hover {
  position: relative;
  cursor: pointer;
  font-weight: 600;
}

.tooltip {
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font-size: 13px;
  white-space: nowrap;
  z-index: 100;
}

.tooltip .nickname {
  font-weight: 700;
  margin-bottom: 4px;
}

.tooltip .hint {
  margin-top: 6px;
  font-size: 12px;
  color: #4b7bff;
}

/* 전체 래퍼: 위치 기준점 */
.user-hover-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-weight: 600;
  padding: 2px 0;
}

/* 이름에 마우스 올렸을 때 효과 */
.display-name:hover {
  color: #4b7bff;
  text-decoration: underline;
}

/* 툴팁 박스 (카드 디자인) */
.mini-profile-tooltip {
  position: absolute;
  top: 130%; /* 이름 밑으로 떨어뜨리기 */
  left: 50%;
  transform: translateX(-50%);
  width: 200px; /* 카드 너비 */
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* 그림자 */
  z-index: 1000;
  text-align: left;
  border: 1px solid #f0f0f0;
}

/* ★ 말풍선 꼬리 (삼각형) 만들기 */
.mini-profile-tooltip::after {
  content: "";
  position: absolute;
  bottom: 100%; /* 박스 바로 위 */
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}

/* 상단 프로필 영역 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

/* 둥근 프로필 이미지 */
.mini-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
}

.no-img-text {
  font-size: 10px;
  color: #888;
}

.text-info {
  overflow: hidden; /* 글자 넘침 방지 */
}

.mini-nickname {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.mini-bio {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 말줄임표(...) */
}

/* 통계 박스 */
.mini-stats {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
}

.stat-item .value {
  font-weight: 700;
  font-size: 12px;
  color: #333;
  margin-top: 2px;
}

.click-hint {
  font-size: 10px;
  color: #4b7bff;
  text-align: center;
}

/* 부드러운 애니메이션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
