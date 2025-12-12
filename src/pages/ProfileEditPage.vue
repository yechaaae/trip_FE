<template>
  <div class="edit-container">
    <h1>프로필 설정</h1>

    <div class="form-wrapper">
      <!-- 프로필 이미지 -->
      <div class="avatar-wrapper">
        <div class="avatar-preview"></div>
        <button class="change-img-btn">프로필 사진 변경</button>
      </div>

      <!-- 입력 폼 -->
      <div class="inputs">
        <label>닉네임</label>
        <input type="text" v-model="form.nickname" />

        <label>생년월일</label>
        <input type="date" v-model="form.birth" />

        <label>이메일</label>
        <input type="email" v-model="form.email" />
      </div>
    </div>

    <div class="actions">
      <button class="cancel-btn" @click="cancel">취소</button>
      <button class="save-btn" @click="saveProfile">저장</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 임시 사용자 데이터 — 나중에 DB 연동 시 교체
const form = ref({
  nickname: "사용자 닉네임",
  birth: "2000-01-01",
  email: "test@example.com",
});

const cancel = () => {
  router.push("/mypage");
};

const saveProfile = () => {
  // 🔥 이 자리에 나중에 axios/POST 예정
  console.log("저장 요청:", form.value);
  router.push("/mypage");
};
</script>

<style scoped lang="scss">
.edit-container {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;

  h1 {
    margin-bottom: 30px;
  }
}

.form-wrapper {
  display: flex;
  gap: 32px;
}

/* 프로필 이미지 */
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
}

.avatar-preview {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #d0d8e8;
  margin-bottom: 14px;
}

.change-img-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #eceffa;
  border: 1px solid #c1c9df;
  cursor: pointer;
  transition: 0.2s;
}
.change-img-btn:hover {
  background: #d8def5;
}

/* 입력 영역 */
.inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: -4px;
}

input {
  padding: 10px;
  border: 1px solid #ccd2e0;
  border-radius: 6px;
  font-size: 15px;
}

/* 취소 / 저장 버튼 */
.actions {
  margin-top: 32px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.save-btn {
  padding: 10px 16px;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.cancel-btn {
  background: #d9dbe2;
}
.cancel-btn:hover {
  background: #c4c6cc;
}

.save-btn {
  background: #4b7bff;
  color: white;
}
.save-btn:hover {
  background: #3a64d2;
}
</style>
