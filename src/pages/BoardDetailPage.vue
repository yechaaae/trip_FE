<template>
  <div class="detail-container">
    <h1>{{ post.title }}</h1>

    <div class="image-placeholder"></div>

    <div class="rating">⭐ {{ post.rating }} / 5.0</div>

    <p class="content">
      {{ post.content }}
    </p>

    <div class="actions">
      <button>❤️ 좋아요 {{ post.likes }}</button>
      <button>💬 댓글 {{ post.comments }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const postId = route.params.id;

// 📌 임시 데이터 — 나중엔 API로 가져올 예정
const post = ref({
  id: postId,
  title: "경복궁",
  rating: 4.5,
  content: "야경이 정말 예쁜데 낮보다 분위기가 좋아요! 다음에는 가족들이랑 다시 올 예정입니다 😁",
  likes: 12,
  comments: 3,
});
</script>

<style scoped>
.detail-container {
  max-width: 850px;
  margin: 48px auto;
}

.image-placeholder {
  width: 100%;
  height: 380px;
  background: #cfdaf0;
  border-radius: 12px;
  margin: 22px 0;
}

.rating {
  font-size: 18px;
  margin-bottom: 14px;
  font-weight: 600;
}

.content {
  font-size: 17px;
  line-height: 1.55;
  margin-bottom: 28px;
  white-space: pre-line;
}

.actions button {
  margin-right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 17px;
}
</style>
