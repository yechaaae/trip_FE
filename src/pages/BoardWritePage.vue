<template>
  <div class="write-container">
    <h1>리뷰 작성</h1>

    <form class="form" @submit.prevent="submitReview">

      <label>관광지</label>
      <input type="text" v-model="title" placeholder="예: 경복궁" required />

      <label>별점</label>
      <StarRating v-model="rating" />

      <label>사진 업로드</label>
      <input type="file" @change="handleFile" accept="image/*" />

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
import axios from "axios"; // axios import
import StarRating from "@/components/StarRating.vue";

const router = useRouter();

// 입력값
const title = ref("");
const rating = ref(0);
const content = ref("");
const imageFile = ref(null);

const handleFile = (e) => {
  imageFile.value = e.target.files[0];
};

const submitReview = async () => {
  // 🔥 백엔드 @RequestPart 구조에 맞게 FormData 생성
  const formData = new FormData();

  // 1. DTO 객체 생성
  const boardDto = {
    title: title.value,
    rating: rating.value,
    content: content.value,
    // userId는 백엔드 세션에서 처리하므로 여기서 안 보내도 됨 (혹은 필요시 추가)
  };

  // 2. JSON 데이터를 Blob으로 변환하여 추가 (중요!)
  // 백엔드에서 @RequestPart("boardDto")로 받음
  formData.append(
    "boardDto",
    new Blob([JSON.stringify(boardDto)], { type: "application/json" })
  );

  // 3. 파일 데이터 추가 (파일이 있을 때만)
  // 백엔드에서 @RequestPart("file")로 받음
  if (imageFile.value) {
    formData.append("file", imageFile.value);
  }

  try {
    // API 호출 (경로는 프로젝트 설정에 맞게 수정)
    await axios.post("http://localhost:8080/api/board", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // axios가 자동 설정하지만 명시적으로 적음
      },
      withCredentials: true, // 세션(JSESSIONID) 쿠키 전송을 위해 필수
    });

    alert("리뷰가 작성되었습니다! 🙌");
    router.push("/board");
  } catch (error) {
    console.error("작성 실패:", error);
    alert("오류가 발생했습니다. 로그인을 확인해주세요.");
  }
};
</script>

<style scoped lang="scss">
/* 스타일은 기존 유지 */
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