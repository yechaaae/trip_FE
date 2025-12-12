<template>
  <div class="login-container">
    <h2>로그인</h2>

    <div class="login-box">
      <input
        type="text"
        v-model="userId"
        placeholder="아이디를 입력하세요"
      />

      <input
        type="password"
        v-model="password"
        placeholder="비밀번호를 입력하세요"
      />

      <button class="login-btn" @click="login">로그인</button>

      <p class="sub-text">
        아직 회원이 아니신가요?
        <router-link to="/register">회원가입</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const userId = ref("");
const password = ref("");

const login = () => {
  if (!userId.value || !password.value) {
    alert("아이디와 비밀번호를 입력하세요!");
    return;
  }

  console.log("로그인 요청:", userId.value, password.value);

  // TODO: 로그인 API 연동 예정
};
</script>

<style scoped>
.login-container {
  max-width: 380px;
  margin: 80px auto;
  text-align: center;
}

h2 {
  margin-bottom: 26px;
  font-size: 26px;
  font-weight: 700;
}

.login-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

input {
  padding: 12px 14px;
  font-size: 16px;
  border: 1px solid #cccccc;
  border-radius: 8px;
}

.login-btn {
  margin-top: 6px;
  padding: 12px;
  font-size: 17px;
  color: white;
  background: #4b7bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  background: #335fd2;
}

.sub-text {
  margin-top: 12px;
  font-size: 14px;
}
</style>
