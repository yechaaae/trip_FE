<template>
  <div class="register-container">
    <h1>회원가입</h1>

    <form class="register-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label>아이디</label>
        <input type="text" v-model="userId" required placeholder="아이디를 입력하세요" />
        </div>

      <div class="form-group">
        <label>비밀번호</label>
        <input type="password" v-model="password" required placeholder="비밀번호를 입력하세요" />
      </div>

      <div class="form-group">
        <label>비밀번호 확인</label>
        <input type="password" v-model="passwordCheck" required placeholder="비밀번호를 다시 입력하세요" />
      </div>

      <div class="form-group">
        <label>이름(닉네임)</label>
        <input type="text" v-model="name" required placeholder="이름을 입력하세요" />
      </div>

      <div class="form-group">
        <label>이메일</label>
        <input type="email" v-model="email" required placeholder="이메일을 입력하세요" />
      </div>

      <button type="submit" class="register-btn">회원가입</button>

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
import axios from "axios"; // axios 임포트

const router = useRouter();

// 상태 변수들
const userId = ref("");    // 추가된 아이디 필드
const email = ref("");
const password = ref("");
const passwordCheck = ref("");
const name = ref("");

const handleRegister = async () => {
  // 1. 클라이언트 측 유효성 검사
  if (password.value !== passwordCheck.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // 2. 백엔드 UserDto 형식에 맞춰 데이터 준비
  const userDto = {
    userId: userId.value,
    password: password.value,
    email: email.value,
    nickName: name.value, // Vue의 name을 DTO의 nickName으로 매핑
    // phoneNumber, birthDate, sex 등은 폼에 없으므로 null로 전송되거나
    // 필요하다면 입력 필드를 추가해야 합니다.
  };

  try {
    // 3. 백엔드 API 호출 (UserRestController의 @PostMapping("/user/join"))
    // 포트 번호(8080)는 스프링부트 설정에 맞게 변경하세요.
    const response = await axios.post("http://localhost:8080/user/join", userDto);

    if (response.status === 201) {
      alert("회원가입이 완료되었습니다!");
      router.push("/login"); // 로그인 페이지로 이동
    }
  } catch (error) {
    console.error("회원가입 에러:", error);
    alert("회원가입 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped lang="scss">
/* 기존 스타일 유지 */
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