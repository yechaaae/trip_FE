<template>
  <div class="register-container">
    <h1>회원가입</h1>

    <form class="register-form" @submit.prevent="handleRegister">
      
      <div class="form-group">
        <label>아이디</label>
        <div class="input-with-button">
          <input 
            type="text" 
            v-model="userId" 
            required 
            placeholder="아이디를 입력하세요" 
          />
          <button type="button" class="check-btn" @click="checkId">중복확인</button>
        </div>
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

      <div class="form-group">
        <label>생년월일</label>
        <input type="date" v-model="birthDate" required />
      </div>

      <div class="form-group">
        <label>전화번호</label>
        <input type="tel" v-model="phoneNumber" required placeholder="010-1234-5678" />
      </div>

      <div class="form-group">
        <label>성별</label>
        <div class="gender-group">
          <label class="gender-label">
            <input type="radio" v-model="sex" value="M" /> 남성
          </label>
          <label class="gender-label">
            <input type="radio" v-model="sex" value="F" /> 여성
          </label>
        </div>
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
import axios from "axios";

const router = useRouter();

// 상태 변수들
const userId = ref("");
const password = ref("");
const passwordCheck = ref("");
const name = ref("");
const email = ref("");
const birthDate = ref("");     
const phoneNumber = ref("");   
const sex = ref("M");          

// [추가] 아이디 중복 확인 함수
const checkId = async () => {
  if (!userId.value) {
    alert("아이디를 입력해주세요.");
    return;
  }

  try {
    // GET /user/idcheck/{userId}
    const response = await axios.get(`http://localhost:8080/user/idcheck/${userId.value}`);
    
    // 백엔드에서 중복이면 1, 아니면 0 리턴
    if (response.data === 0) {
      alert("사용 가능한 아이디입니다!");
    } else {
      alert("이미 사용 중인 아이디입니다.");
    }
  } catch (error) {
    console.error("아이디 중복 확인 에러:", error);
    alert("중복 확인 중 오류가 발생했습니다.");
  }
};

const handleRegister = async () => {
  // 1. 유효성 검사
  if (password.value !== passwordCheck.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // 2. 백엔드 UserDto 형식 매핑
  const userDto = {
    userId: userId.value,
    password: password.value,
    email: email.value,
    nickName: name.value,
    birthDate: birthDate.value,
    phoneNumber: phoneNumber.value,
    sex: sex.value,
  };

  try {
    // 3. 백엔드 API 호출
    const response = await axios.post("http://localhost:8080/user/join", userDto);

    if (response.status === 201) {
      alert("회원가입이 완료되었습니다!");
      router.push("/login"); 
    }
  } catch (error) {
    console.error("회원가입 에러:", error);

    // [수정] 409 에러(중복 발생) 처리
    if (error.response && error.response.status === 409) {
      // 백엔드에서 보낸 메시지("이미 사용 중인 닉네임입니다." 등)를 그대로 출력
      alert(error.response.data);
    } else {
      alert("회원가입 중 오류가 발생했습니다.");
    }
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

input[type="text"],
input[type="password"],
input[type="email"],
input[type="tel"],
input[type="date"] {
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

/* [추가] 입력창 + 버튼 가로 정렬용 스타일 */
.input-with-button {
  display: flex;
  gap: 8px; /* 입력창과 버튼 사이 간격 */
}

.input-with-button input {
  flex: 1; /* 입력창이 남은 공간 다 차지하도록 */
}

/* [추가] 중복 확인 버튼 스타일 (회원가입 버튼과 톤 앤 매너 맞춤) */
.check-btn {
  padding: 0 12px;
  background: #eef2ff; /* 연한 파란색 배경 */
  color: #4f7cff;
  border: 1px solid #4f7cff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap; /* 글자 줄바꿈 방지 */
  transition: 0.2s;
}

.check-btn:hover {
  background: #4f7cff;
  color: white;
}

/* 성별 라디오 버튼용 스타일 추가 */
.gender-group {
  display: flex;
  gap: 20px;
  padding: 5px 0;
}

.gender-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  cursor: pointer;
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