<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>🏆 획득한 뱃지 ({{ badges.length }})</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="badge-list" v-if="badges.length > 0">
        <div class="badge-item" v-for="badge in badges" :key="badge.badgeId">
          <div class="badge-img-wrapper">
            <img :src="getImageUrl(badge.image)" alt="뱃지" />
          </div>
          <div class="badge-info">
            <span class="badge-name">{{ badge.name }}</span>
            <span class="badge-date">{{ formatDate(badge.getDate) }} 획득</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-msg">
        아직 획득한 뱃지가 없습니다.<br />
        리뷰를 작성하고 뱃지를 모아보세요!
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isVisible: Boolean,
  badges: Array, // 부모에게서 뱃지 리스트를 받음
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};

// 날짜 포맷팅 (YYYY-MM-DD)
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0]; // 시간 제외하고 날짜만
};

// 이미지 경로 처리 (기존 로직 활용)
const getImageUrl = (path) => {
  if (!path) return "/tmpimg.png"; // 기본 이미지
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  width: 360px;
  max-height: 500px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.badge-list {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.badge-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px;
  border-bottom: 1px solid #f5f5f5;
}
.badge-img-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #eef4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #ddd;
}
.badge-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-info {
  display: flex;
  flex-direction: column;
}
.badge-name {
  font-weight: 700;
  font-size: 15px;
  color: #333;
}
.badge-date {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.empty-msg {
  text-align: center;
  color: #888;
  margin-top: 40px;
  font-size: 14px;
  line-height: 1.5;
}
</style>
