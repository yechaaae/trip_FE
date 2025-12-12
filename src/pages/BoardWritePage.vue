<template>
  <div class="write-container">
    <h1>리뷰 작성</h1>

    <form class="form" @submit.prevent="submitReview">

      <!-- 관광지 -->
      <label>관광지</label>
      <input type="text" v-model="title" placeholder="예: 경복궁" required />

      <!-- 별점 -->
      <label>별점</label>
      <StarRating v-model="rating" />

      <!-- 사진 업로드 -->
      <label>사진 업로드</label>
      <input type="file" @change="handleFile" />

      <!-- 리뷰 내용 -->
      <label>리뷰 내용</label>
      <textarea
        v-model="content"
        rows="7"
        placeholder="여행은 어떠셨나요? 상세하게 작성해주세요 😊"
        required
      />

      <button type="submit" class="submit-btn">작성 완료</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import StarRating from "@/components/StarRating.vue";  // ⭐ 별점 컴포넌트

const router = useRouter();

// 입력값
const title = ref("");
const rating = ref(0);    // ⭐ 별점 연동
const content = ref("");
const imageFile = ref(null);

const handleFile = (e) => {
  imageFile.value = e.target.files[0];
};

const submitReview = () => {
  // 🔥 나중에 API 전송 예정
  console.log({
    title: title.value,
    rating: rating.value,
    content: content.value,
    image: imageFile.value,
  });

  alert("리뷰가 작성되었습니다! 🙌");
  router.push("/board");
};
</script>

<style scoped lang="scss">
.write-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 16px;

  h1 {
    text-align: center;
    margin-bottom: 26px;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

label {
  font-size: 16px;
  font-weight: 600;
}

input,
select,
textarea {
  padding: 10px 14px;
  font-size: 15px;
  border: 1px solid #cfd6e3;
  border-radius: 6px;
}

.submit-btn {
  margin-top: 14px;
  padding: 12px;
  font-size: 17px;
  border: none;
  border-radius: 6px;
  background: #0066ff;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.submit-btn:hover {
  background: #0052d8;
}
</style>
