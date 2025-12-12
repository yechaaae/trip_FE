<template>
  <div class="board-container">
  <h1>리뷰 게시판</h1>
  <button class="write-btn" @click="goWrite">✍️ 리뷰 작성하기</button>

    <div class="review-feed">
      <div
        class="review-card"
        v-for="n in 6"
        :key="n"
        @click="goDetail(n)"          
      >
        <h2 class="place">경복궁</h2>

        <div class="photo"></div>

        <div class="rating">⭐ 4.5 / 5.0</div>

        <p class="content">
          야경이 정말 예쁜데 낮보다 분위기가 좋아요! 다음에는 가족들이랑 다시 올 예정입니다 😊
        </p>

        <div class="actions" @click.stop>   <!-- 🔥 좋아요/댓글 클릭 시 상세 진입 방지 -->
          <button class="like-btn">❤️ 12</button>
          <button class="comment-btn">💬 3</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goWrite = () => router.push("/board/write");

const goDetail = (id) => {
  router.push(`/board/${id}`);
};
</script>

<style scoped lang="scss">
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
  cursor: pointer;                         /* 🔥 카드 전체 클릭 가능 */
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.review-card:hover {
  transform: translateY(-3px);             /* 🔥 hover 부드러운 인터랙션 */
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.09);
}

.place {
  font-size: 22px;
  margin-bottom: 14px;
}

.photo {
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
.like-btn:hover {
  background: #ffc8cf;
}

.comment-btn {
  background: #eaf1ff;
}
.comment-btn:hover {
  background: #d4e3ff;
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
  transition: 0.2s;
}
.write-btn:hover {
  background: #0052d8;
}

</style>
