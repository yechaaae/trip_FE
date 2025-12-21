<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header>
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </header>
      
      <ul class="user-list">
        <li v-for="user in userList" :key="user.userId" class="user-item">
          <img :src="user.profileImg || '/default-profile.png'" alt="프사" class="profile-thumb" />
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

const props = defineProps({
  isVisible: Boolean,      // 모달 표시 여부
  type: String,            // 'follower' 또는 'following'
  userId: String,          // 누구의 목록을 볼 건지
});

const emit = defineEmits(["close"]);

const userList = ref([]);

// 제목을 동적으로 변경 (팔로워 vs 팔로잉)
const title = computed(() => (props.type === "follower" ? "팔로워 목록" : "팔로잉 목록"));

// 모달이 열릴 때(isVisible이 true가 될 때)마다 목록을 새로 가져옴
watch(() => props.isVisible, async (newVal) => {
  if (newVal) {
    await fetchList();
  }
});

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

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 반투명 배경 */
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; width: 300px; max-height: 400px;
  border-radius: 12px; padding: 20px;
  display: flex; flex-direction: column;
}
header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;
}
.user-list {
  list-style: none; padding: 0; margin: 0; overflow-y: auto;
}
.user-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
}
.profile-thumb {
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;
}
.nickname { font-weight: bold; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; }
</style>