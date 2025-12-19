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

    let items = data;
    if (items?.response?.body?.items?.item) {
      items = items.response.body.items.item;
    }

    if (items && !Array.isArray(items)) items = [items];

    searchResults.value = items || [];
    isSearched.value = true;
  } catch {
    alert("검색 중 오류가 발생했습니다.");
  }
};

const selectAttraction = (item) => {
  selectedAttraction.value = {
    contentId: item.contentId,
    title: item.title,
    addr1: item.addr1,
  };
  title.value = item.title;
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

  const boardDto = {
    boardId: isEditMode.value ? boardId : 0,
    title: title.value,
    content: content.value,
    type: pageType.value,
    rating: isReview.value ? rating.value : 0,
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
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.search-row {
  display: flex;
  gap: 10px;
}

.search-btn {
  padding: 0 16px;
  border-radius: 6px;
}

.selected-info {
  font-size: 14px;
  color: #0066ff;
}

.submit-btn {
  padding: 14px;
  font-size: 17px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}
</style>
