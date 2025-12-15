<template>
  <div class="board-container">
    <h1>리뷰 게시판</h1>
    <button class="write-btn" @click="goWrite">✍️ 리뷰 작성하기</button>

    <div class="review-feed">
      <div
        class="review-card"
        v-for="article in articles"
        :key="article.boardId"
        @click="goDetail(article.boardId)"
      >
        <h2 class="place">{{ article.title }}</h2>

        <img 
            v-if="article.saveFile" 
            :src="`http://localhost:8080/upload/${article.saveFile}`" 
            class="photo-img" 
            alt="리뷰 사진" 
        />
        <div v-else class="photo-placeholder"></div>

        <div class="rating">⭐ {{ article.rating }} / 5.0</div>

        <p class="content">
          {{ article.content }}
        </p>

        <div class="actions" @click.stop>
          <button class="like-btn">❤️ {{ article.likeCount }}</button>
          <button class="comment-btn">💬 {{ article.hit }}</button> 
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const articles = ref([]); // 서버에서 받아올 리스트

// 목록 가져오기
const getArticles = async () => {
    try {
        const { data } = await axios.get("http://localhost:8080/api/board");
        articles.value = data;
    } catch (error) {
        console.error("목록 조회 실패", error);
    }
};

onMounted(() => {
    getArticles();
});

const goWrite = () => router.push("/board/write");

const goDetail = (id) => {
  router.push(`/board/${id}`);
};
</script>

<style scoped lang="scss">
/* 기존 스타일 유지 + 이미지 태그 스타일 추가 */
.board-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 18px;

  h1 {
    text-align: center;
    margin-bottom: 30px;
  }
}

.review-feed {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.review-card {
  border: 1px solid #d4d9e3;
  border-radius: 12px;
  background: #fff;
  padding: 22px 24px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.09);
}

.place {
  font-size: 22px;
  margin-bottom: 14px;
}

/* 이미지 스타일 수정 */
.photo-img {
  width: 100%;
  height: 260px;
  object-fit: cover; /* 이미지가 찌그러지지 않게 */
  border-radius: 10px;
  margin-bottom: 16px;
}

.photo-placeholder {
  width: 100%;
  height: 260px;
  border-radius: 10px;
  background: #c9d5eb;
  margin-bottom: 16px;
}

.rating {
  font-size: 16px;
  margin-bottom: 12px;
}

.content {
  font-size: 15px;
  line-height: 1.55;
  margin-bottom: 18px;
  
  /* 내용이 길면 말줄임표 처리 (선택사항) */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.actions {
  display: flex;
  gap: 12px;
}

.like-btn,
.comment-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.like-btn {
  background: #ffe2e5;
}
.comment-btn {
  background: #eaf1ff;
}
.write-btn {
  margin: 0 auto 26px;
  display: block;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #0066ff;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
</style>