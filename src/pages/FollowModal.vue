<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header>
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </header>

      <ul class="user-list">
        <li
          v-for="user in userList"
          :key="user.userId"
          class="user-item"
          @click="goProfile(user.userId)"
        >
          <img
            :src="getImageUrl(user.profileImg || user.saveFile)"
            alt="프사"
            class="profile-thumb"
            @error="(e) => (e.target.src = '/default-profile.png')"
          />
          <span class="nickname">{{ user.nickName }}</span>
        </li>

        <li v-if="userList.length === 0" class="empty-msg">
          목록이 비어있습니다.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  isVisible: Boolean, // 모달 표시 여부
  type: String, // 'follower' 또는 'following'
  userId: String, // 누구의 목록을 볼 건지
});

const emit = defineEmits(["close"]);
const goProfile = (targetUserId) => {
  if (targetUserId) {
    router.push(`/user/${targetUserId}`); // 페이지 이동
    closeModal(); // 모달 닫기 (선택사항이지만 권장)
  }
};
const userList = ref([]);

// 제목을 동적으로 변경 (팔로워 vs 팔로잉)
const title = computed(() =>
  props.type === "follower" ? "팔로워 목록" : "팔로잉 목록"
);

// 모달이 열릴 때(isVisible이 true가 될 때)마다 목록을 새로 가져옴
watch(
  () => props.isVisible,
  async (newVal) => {
    if (newVal) {
      await fetchList();
    }
  }
);

// src/components/FollowModal.vue (또는 pages/FollowModal.vue)

const fetchList = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/follow/list/${props.type}/${props.userId}`,
      { withCredentials: true }
    );
    userList.value = response.data;
  } catch (error) {
    console.error("목록 불러오기 실패:", error);
  }
};

const getImageUrl = (path) => {
  if (!path) return "/default-profile.png"; // 이미지가 없으면 기본 이미지

  // 1. 외부 링크면 그대로 반환
  if (path.startsWith("http")) return path;

  // 2. 이미 /upload 경로가 포함되어 있으면 호스트만 붙임
  if (path.startsWith("/upload")) {
    return `http://localhost:8080${path}`;
  }

  // 3. 파일명만 있는 경우 /upload 붙임
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `http://localhost:8080/upload${cleanPath}`;
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 반투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 300px;
  max-height: 400px;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer; /* 🔥 손가락 모양 추가 */
  transition: background-color 0.2s;
}
.user-item:hover {
  background-color: #f5f5f5;
  border-radius: 8px;
}

.profile-thumb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}
.nickname {
  font-weight: bold;
}
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
</style>
