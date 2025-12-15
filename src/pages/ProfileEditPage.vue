<template>
  <div class="edit-container">
    <h1>프로필 설정</h1>

    <div class="form-wrapper">
      <div class="avatar-wrapper">
        <div 
          class="avatar-preview" 
          :style="{ backgroundImage: `url(${previewImage})` }"
        ></div>
        
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileChange" 
          accept="image/*" 
          style="display: none" 
        />
        
        <button class="change-img-btn" @click="triggerFileUpload">프로필 사진 변경</button>
      </div>

      <div class="inputs">
        <label>닉네임</label>
        <input type="text" v-model="form.nickname" placeholder="닉네임 입력" />

        <label>생년월일</label>
        <input type="date" v-model="form.birthDate" />

        <label>이메일</label>
        <input type="email" v-model="form.email" placeholder="이메일 입력" />
      </div>
    </div>

    <div class="actions">
      <button class="cancel-btn" @click="cancel">취소</button>
      <button class="save-btn" @click="saveProfile">저장</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useMemberStore } from "@/stores/memberStore";

const router = useRouter();
const memberStore = useMemberStore();

// axios 설정
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// 폼 데이터
const form = ref({
  nickname: "",
  birthDate: "",
  email: "",
});

// 이미지 관련 변수
const fileInput = ref(null);      // input 태그 참조
const selectedFile = ref(null);   // 실제 선택된 파일 객체
const previewImage = ref("");     // 화면에 보여줄 이미지 URL

// 1. 프로필 정보 불러오기
const fetchCurrentProfile = async () => {
  try {
    const response = await api.get("/user/info");
    const userInfo = response.data;

    form.value.nickname = userInfo.nickName;
    form.value.birthDate = userInfo.birthDate || "";
    form.value.email = userInfo.email;

    // 기존 프로필 이미지가 있다면 보여주기 (없으면 기본 회색)
    if (userInfo.profileImg) {
      // 백엔드 URL + DB에 저장된 경로
      previewImage.value = `http://localhost:8080${userInfo.profileImg}`;
    }

  } catch (error) {
    console.error(error);
    memberStore.clearLoginUser();
    alert("로그인 정보가 만료되었습니다.");
    router.push("/login");
  }
};

onMounted(() => {
  fetchCurrentProfile();
});

// 2. 파일 선택 창 열기
const triggerFileUpload = () => {
  fileInput.value.click();
};

// 3. 파일 선택 시 미리보기 처리
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    // 브라우저 내에서 미리보기 URL 생성
    previewImage.value = URL.createObjectURL(file);
  }
};

const cancel = () => {
  router.push("/mypage");
};

// 4. 저장 (FormData 사용)
const saveProfile = async () => {
  try {
    // ★ FormData 객체 생성 (파일 전송 필수)
    const formData = new FormData();

    // JSON 데이터를 Blob으로 변환하여 추가 (백엔드 @RequestPart("userDto")와 매칭)
    const userDto = {
      nickName: form.value.nickname,
      birthDate: form.value.birthDate,
      email: form.value.email,
    };
    
    // JSON 타입을 명시해서 보냄
    formData.append(
      "userDto", 
      new Blob([JSON.stringify(userDto)], { type: "application/json" })
    );

    // 파일이 선택되었다면 추가 (백엔드 @RequestPart("file")과 매칭)
    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    // 전송 (Content-Type은 axios가 자동으로 multipart/form-data로 설정함)
    const response = await api.put("/user", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    // 5. 스토어 정보 갱신 (서버에서 받은 최신 UserDto 사용)
    const updatedUser = response.data; // 백엔드에서 리턴해준 최신 정보
    
    // DTO 필드명 매핑 (필요 시)
    const userToSave = {
        userId: updatedUser.userId,
        nickName: updatedUser.nickName,
        email: updatedUser.email,
        birthDate: updatedUser.birthDate,
        profileImg: updatedUser.profileImg // 프로필 이미지 경로 추가
    };

    memberStore.setLoginUser(userToSave);

    alert("프로필이 수정되었습니다.");
    router.push("/mypage");

  } catch (error) {
    console.error("수정 실패:", error);
    alert("오류가 발생했습니다.");
  }
};
</script>

<style scoped lang="scss">
/* 기존 스타일 그대로 유지 */
/* avatar-preview 스타일만 확인: background-size가 cover여야 이미지가 꽉 찹니다. */
.edit-container { padding: 32px; max-width: 800px; margin: 0 auto; }
.form-wrapper { display: flex; gap: 32px; margin-top: 30px; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; width: 220px; }
.avatar-preview { 
  width: 160px; 
  height: 160px; 
  border-radius: 50%; 
  background-color: #d0d8e8; 
  margin-bottom: 14px; 
  background-size: cover; 
  background-position: center;
  border: 1px solid #ddd; /* 테두리 살짝 추가 */
}
/* ... 나머지 스타일 ... */
.inputs { flex: 1; display: flex; flex-direction: column; gap: 16px; }
label { font-weight: 600; font-size: 14px; }
input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.actions { margin-top: 30px; display: flex; justify-content: flex-end; gap: 10px; }
.save-btn { background: #4b7bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.cancel-btn { background: #eee; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>