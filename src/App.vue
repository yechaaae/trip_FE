<template>
  <DefaultLayout />
</template>

<script setup>
  import DefaultLayout from "@/layouts/DefaultLayout.vue";
  
  // ▼▼▼ 새로고침 시 로그인 유지를 위한 추가 코드 ▼▼▼
  import { onMounted } from "vue";
  import { useMemberStore } from "@/stores/memberStore";
  import axios from "axios"; 

  const memberStore = useMemberStore();

  // 1. 쿠키를 담아 보낼 axios 인스턴스 생성
  const api = axios.create({
    baseURL: "http://localhost:8080", // 백엔드 주소
    withCredentials: true,            // ★핵심: 세션 쿠키 전송
  });

  // 2. 앱이 시작되면(=새로고침 시) 실행
  onMounted(async () => {
    // 이미 스토어에 정보가 있다면(로그인 직후 등) 굳이 또 요청 안 함
    if (memberStore.userInfo) return;

    try {
      console.log("🔄 새로고침 감지: 세션 복구 시도...");

      // 서버에 "나 로그인 되어있니?" 확인 (쿠키 자동 전송)
      const response = await api.get("/user/info");
      
      if (response.data) {
        console.log("✅ 세션 복구 성공:", response.data.nickName);

        // 3. 서버에서 받은 정보로 스토어(Pinia) 다시 채우기
        const userInfo = response.data;
        const userToSave = {
          userId: userInfo.userId,
          nickName: userInfo.nickName, 
          email: userInfo.email,
          birthDate: userInfo.birthDate,
          // 필요한 다른 필드들...
        };

        memberStore.setLoginUser(userToSave);
      }
    } catch (error) {
      // 401 에러 등이 나면 "로그인 안 된 상태구나" 하고 조용히 넘어감
      console.log("로그인 정보 없음 (비로그인 상태)");
    }
  });
</script>