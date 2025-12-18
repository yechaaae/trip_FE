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

        <label>자기소개</label>
        <textarea 
          v-model="form.introduction" 
          placeholder="여행을 좋아하는 개발자입니다. 자기소개를 입력해주세요."
        ></textarea>
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

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// 폼 데이터 (introduction 추가)
const form = ref({
  nickname: "",
  birthDate: "",
  email: "",
  introduction: "", // [New]
});

const fileInput = ref(null);
const selectedFile = ref(null);
const previewImage = ref("");

// 1. 프로필 정보 불러오기
const fetchCurrentProfile = async () => {
  try {
    const response = await api.get("/user/info");
    const userInfo = response.data;

    form.value.nickname = userInfo.nickName;
    form.value.birthDate = userInfo.birthDate || "";
    form.value.email = userInfo.email;
    form.value.introduction = userInfo.introduction || ""; // [New] DB 값 바인딩

    if (userInfo.profileImg) {
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

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const cancel = () => {
  router.push("/mypage");
};

// 4. 저장 (FormData 사용)
const saveProfile = async () => {
  try {
    const formData = new FormData();

    // [New] introduction 포함
    const userDto = {
      nickName: form.value.nickname,
      birthDate: form.value.birthDate,
      email: form.value.email,
      introduction: form.value.introduction, 
    };
    
    formData.append(
      "userDto", 
      new Blob([JSON.stringify(userDto)], { type: "application/json" })
    );

    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    const response = await api.put("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    // 5. 스토어 정보 갱신
    const updatedUser = response.data;
    
    const userToSave = {
        userId: updatedUser.userId,
        nickName: updatedUser.nickName,
        email: updatedUser.email,
        birthDate: updatedUser.birthDate,
        profileImg: updatedUser.profileImg,
        introduction: updatedUser.introduction // [New] 스토어에도 업데이트
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
  border: 1px solid #ddd;
}

.inputs { flex: 1; display: flex; flex-direction: column; gap: 16px; }

label { font-weight: 600; font-size: 14px; }

/* input과 textarea 스타일 통일 */
input, textarea { 
  padding: 10px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  font-family: inherit; /* 폰트 상속 */
  font-size: 14px;      /* 폰트 사이즈 통일 */
}

/* textarea 전용 스타일 */
textarea {
  resize: vertical; /* 세로로만 늘리기 가능 */
  min-height: 100px; /* 기본 높이 설정 */
  line-height: 1.5;
}

/* 포커스 효과 통일 */
input:focus, textarea:focus {
  outline: none;
  border-color: #4b7bff;
}

.change-img-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.change-img-btn:hover { background: #f9f9f9; }

.actions { margin-top: 30px; display: flex; justify-content: flex-end; gap: 10px; }
.save-btn { background: #4b7bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.save-btn:hover { background: #3a68eb; }
.cancel-btn { background: #eee; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.cancel-btn:hover { background: #e0e0e0; }
</style>