<template>
  <div class="write-container">
    <h1>{{ isReview ? "리뷰 작성" : "자유글 작성" }}</h1>

    <form class="form" @submit.prevent="submitReview">
      <label>{{ isReview ? "관광지 (제목)" : "제목" }}</label>

      <!-- 관광지 선택 -->
      <div v-if="isReview" class="attraction-search-area">
        <div class="search-row">
          <input
            type="text"
            v-model="title"
            placeholder="관광지를 검색해주세요"
            readonly
            required
            @click="openSearchModal"
          />
          <button type="button" class="search-btn" @click="openSearchModal">🔍 검색</button>
        </div>

        <p v-if="selectedAttraction" class="selected-info">
          선택된 관광지:
          <strong>{{ selectedAttraction.title }}</strong>
          ({{ selectedAttraction.addr1 }})
        </p>
      </div>

      <input v-else type="text" v-model="title" placeholder="제목을 입력해주세요." required />

      <!-- 별점 -->
      <div v-if="isReview">
        <label>별점</label>
        <StarRating v-model="rating" />
      </div>

      <label>사진 업로드 {{ isReview ? "(필수)" : "(선택)" }}</label>
      <input type="file" @change="handleFile" accept="image/*" />

      <label>내용</label>
      <textarea
        v-model="content"
        rows="10"
        :placeholder="isReview ? '여행은 어떠셨나요? 상세하게 작성해주세요 😊' : '자유롭게 이야기를 나누어보세요.'"
        required
      />

      <button type="submit" class="submit-btn">작성 완료</button>
    </form>

    <!-- 관광지 검색 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>관광지 검색</h3>

        <div class="modal-search-box">
          <input v-model="modalSearchKeyword" placeholder="관광지 이름 (예: 경복궁)" @keyup.enter="realSearch" />
          <button @click="realSearch">찾기</button>
        </div>

        <ul class="result-list">
          <li v-if="searchResults.length === 0 && isSearched">검색 결과가 없습니다.</li>
          <li v-for="item in searchResults" :key="item.contentId" @click="selectAttraction(item)">
            <strong>{{ item.title }}</strong>
            <br />
            <small>{{ item.addr1 }}</small>
          </li>
        </ul>

        <button class="close-btn" @click="showModal = false">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import StarRating from "@/components/StarRating.vue";

const router = useRouter();
const route = useRoute();

/* ======================
   MODE / TYPE
====================== */
const boardId = route.params.boardId;
const isEditMode = computed(() => !!boardId);

const pageType = ref(Number(route.query.type) || 2);
const isReview = computed(() => pageType.value === 2);

/* ======================
   STATE
====================== */
const title = ref("");
const rating = ref(0);
const content = ref("");
const imageFile = ref(null);

const selectedAttraction = ref(null);

/* modal */
const showModal = ref(false);
const modalSearchKeyword = ref("");
const searchResults = ref([]);
const isSearched = ref(false);

/* ======================
   EDIT MODE LOAD
====================== */
onMounted(async () => {
  if (!isEditMode.value) return;

  try {
    const { data } = await axios.get(`http://localhost:8080/api/board/${boardId}`, { withCredentials: true });

    title.value = data.title;
    content.value = data.content;
    rating.value = data.rating;
    pageType.value = data.type;

    if (data.contentId) {
      selectedAttraction.value = {
        contentId: data.contentId,
        title: data.attractionTitle || "이전 선택 관광지",
        addr1: "",
      };
    }
  } catch {
    alert("기존 글 정보를 불러오지 못했습니다.");
    router.push("/board");
  }
});

/* ======================
   FILE
====================== */
const handleFile = (e) => {
  imageFile.value = e.target.files[0];
};

/* ======================
   SEARCH
====================== */
const openSearchModal = () => {
  showModal.value = true;
  modalSearchKeyword.value = "";
  searchResults.value = [];
  isSearched.value = false;
};

const realSearch = async () => {
  if (!modalSearchKeyword.value.trim()) {
    alert("검색어를 입력하세요.");
    return;
  }

  try {
    const { data } = await axios.get("http://localhost:8080/attraction/search", {
      params: {
        keyword: modalSearchKeyword.value,
        contentTypeId: 12,
      },
      withCredentials: true,
    });
    console.log("검색 결과:", data);

    let items = data;
    if (items.response && items.response.body && items.response.body.items) {
      items = items.response.body.items.item;
    } else if (items.response && items.response.body) {
      items = [];
    }

    if (items && !Array.isArray(items)) items = [items];

    searchResults.value = items || [];
    isSearched.value = true;
  } catch {
    alert("검색 중 오류가 발생했습니다.");
  }
};

const selectAttraction = (item) => {
  // API마다 필드명이 다를 수 있으므로 둘 다 확인 (contentId 또는 contentid)
  const id = item.contentId || item.contentid;

  if (!id) {
    console.error("관광지 ID를 찾을 수 없습니다:", item);
    alert("선택한 관광지의 식별자(ID)가 없습니다. 다른 관광지를 선택해주세요.");
    return;
  }

  selectedAttraction.value = {
    contentId: id,
    title: item.title,
    addr1: item.addr1,
    latitude: item.mapy || item.latitude,
    longitude: item.mapx || item.longitude,
  };

  title.value = item.title || item.addr1 || "이름 없음";
  showModal.value = false;
};

/* ======================
   SUBMIT
====================== */
const submitReview = async () => {
  if (isReview.value && !selectedAttraction.value) {
    alert("관광지를 선택해주세요.");
    return;
  }

  if (isReview.value && !selectedAttraction.value.contentId) {
    alert("선택된 관광지 정보가 올바르지 않습니다. 다시 검색해서 선택해주세요.");
    return;
  }

  if (!content.value) {
    alert("내용을 입력해주세요.");
    return;
  }
  const boardDto = {
    boardId: isEditMode.value ? boardId : 0,
    title: title.value,
    content: content.value,
    type: pageType.value,
    rating: isReview.value ? rating.value : 0,
    contentId: isReview.value ? selectedAttraction.value.contentId : null,
    latitude: isReview.value ? Number(selectedAttraction.value.latitude) : null,
    longitude: isReview.value ? Number(selectedAttraction.value.longitude) : null,
  };

  try {
    if (isEditMode.value) {
      await axios.put("http://localhost:8080/api/board", boardDto, {
        withCredentials: true,
      });
      alert("수정되었습니다.");
    } else {
      const formData = new FormData();

      formData.append(
        "boardDto",
        new Blob([JSON.stringify(boardDto)], {
          type: "application/json",
        })
      );

      if (isReview.value) {
        formData.append("contentId", selectedAttraction.value.contentId);
      }

      if (imageFile.value) {
        formData.append("file", imageFile.value);
      }

      await axios.post("http://localhost:8080/api/board", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("작성되었습니다.");
    }

    router.push("/board");
  } catch (error) {
    console.error(error);
    alert("오류가 발생했습니다.");
  }
};
</script>

<style scoped lang="scss">
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
  margin-bottom: 4px;
  display: block;
}

input,
textarea {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid #cfd6e3;
  border-radius: 6px;
  box-sizing: border-box;
}

.search-row {
  display: flex;
  gap: 10px;
}

.search-btn {
  white-space: nowrap;
  padding: 0 16px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

.selected-info {
  font-size: 14px;
  color: #0066ff;
  margin-top: 5px;
}

.submit-btn {
  margin-top: 14px;
  padding: 14px;
  font-size: 17px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.submit-btn:hover {
  background: #0052d8;
}

.modal-overlay {
  position: fixed; /* 화면 고정 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* 배경 어둡게 */
  display: flex;
  justify-content: center;
  align-items: center; /* 정중앙 정렬 */
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.modal-search-box input {
  flex: 1; /* 검색창 늘리기 */
}

.result-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.result-list li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.result-list li:hover {
  background: #f0f8ff;
}

.result-list li small {
  color: #888;
}

.close-btn {
  margin-top: 10px;
  padding: 8px;
  background: #f1f1f1;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
</style>
