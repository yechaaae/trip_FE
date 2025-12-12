<template>
  <div class="register-container">
    <h1>회원가입</h1>

    <form class="register-form" @submit.prevent="handleRegister">
      <!-- 이메일 -->
      <div class="form-group">
        <label>이메일</label>
        <input type="email" v-model="email" required placeholder="이메일을 입력하세요" />
      </div>

      <!-- 비밀번호 -->
      <div class="form-group">
        <label>비밀번호</label>
        <input type="password" v-model="password" required placeholder="비밀번호를 입력하세요" />
      </div>

      <!-- 비밀번호 확인 -->
      <div class="form-group">
        <label>비밀번호 확인</label>
        <input type="password" v-model="passwordCheck" required placeholder="비밀번호를 다시 입력하세요" />
      </div>

      <!-- 이름 -->
      <div class="form-group">
        <label>이름</label>
        <input type="text" v-model="name" required placeholder="이름을 입력하세요" />
      </div>

      <!-- 회원가입 버튼 -->
      <button type="submit" class="register-btn">회원가입</button>

      <!-- 로그인 이동 -->
      <p class="login-link">
        이미 계정이 있으신가요?
        <router-link to="/login">로그인하기</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const passwordCheck = ref("");
const name = ref("");

const handleRegister = () => {
  if (password.value !== passwordCheck.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // 실제 API 연동 시 여기에 axios 코드 들어감!
  console.log("회원가입 정보:", {
    email: email.value,
    password: password.value,
    name: name.value,
  });

  alert("회원가입이 완료되었습니다!");
  router.push("/login");
};
</script>

<style scoped lang="scss">
.register-container {
  max-width: 420px;
  margin: 60px auto;
  padding: 32px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

h1 {
  text-align: center;
  margin-bottom: 26px;
  font-size: 26px;
  font-weight: 700;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  font-size: 15px;
}

input {
  padding: 12px;
  border: 1px solid #d5d5d5;
  border-radius: 8px;
  font-size: 15px;
}

input:focus {
  outline: none;
  border-color: #4f7cff;
  box-shadow: 0 0 0 2px rgba(79, 124, 255, 0.25);
}

.register-btn {
  margin-top: 6px;
  padding: 12px;
  background: #4f7cff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.register-btn:hover {
  background: #3d63d8;
}

.login-link {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
}

.login-link a {
  color: #4f7cff;
  font-weight: 600;
}
</style>
