<template>
  <div class="login-container">
    <h1>로그인</h1>
    <form class="login-form" @submit.prevent="handleLogin">
      
      <div class="form-group">
        <label for="id">아이디</label>
        <input 
          type="text" 
          id="id" 
          v-model="loginForm.userId" 
          placeholder="아이디를 입력하세요" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input 
          type="password" 
          id="password" 
          v-model="loginForm.password" 
          placeholder="비밀번호를 입력하세요" 
          required 
        />
      </div>

      <div class="save-id-wrapper">
        <input type="checkbox" id="saveId" v-model="saveId" />
        <label for="saveId">아이디 기억하기</label>
      </div>

      <button type="submit" class="login-btn">로그인</button>
      
      <div class="links">
        <router-link to="/register">회원가입</router-link> |
        <a href="#">아이디/비밀번호 찾기</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMemberStore } from "@/stores/memberStore";
import axios from "axios"; 

const router = useRouter();
const memberStore = useMemberStore();

// axios 설정 (또는 기존 api 인스턴스 import)
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, 
});

const loginForm = ref({
  userId: "",
  password: "",
});

// 아이디 저장 체크 여부
const saveId = ref(false);

// 1. 페이지 로드 시: 저장된 아이디가 있는지 확인
onMounted(() => {
  const savedUserId = localStorage.getItem("savedUserId");
  if (savedUserId) {
    loginForm.value.userId = savedUserId; // 아이디 채우기
    saveId.value = true; // 체크박스 체크
  }
});

const handleLogin = async () => {
  try {
    const response = await api.post("/user/login", loginForm.value);
    
    if (response.status === 200 && response.data) {
      // 2. 로그인 성공 시: 체크박스 상태에 따라 아이디 저장/삭제
      if (saveId.value) {
        localStorage.setItem("savedUserId", loginForm.value.userId);
      } else {
        localStorage.removeItem("savedUserId");
      }

      // 스토어 저장 및 이동
      memberStore.setLoginUser(response.data);
      alert("로그인 성공!");
      router.push("/"); 
    } else {
      alert("로그인에 실패했습니다."); // 204 No Content 등
    }
  } catch (error) {
    console.error("로그인 에러:", error);
    alert("아이디 또는 비밀번호를 확인해주세요.");
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
.login-container { max-width: 400px; margin: 50px auto; padding: 40px; border: 1px solid #ddd; border-radius: 10px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: bold; }
.form-group input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
.login-btn { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px;}
.links { margin-top: 15px; text-align: center; font-size: 14px; }
.links a { color: #666; text-decoration: none; margin: 0 5px; }

/* 아이디 저장 체크박스 스타일 */
.save-id-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}
.save-id-wrapper input {
  cursor: pointer;
}
.save-id-wrapper label {
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
</style>