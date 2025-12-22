<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
    <div class="modal-content">
      <h3>관광지 검색</h3>

      <div class="search-box">
        <input
          type="text"
          v-model="keyword"
          @input="searchAttractions"
          placeholder="관광지 이름 입력 (예: 경복궁)"
          ref="searchInput"
        />
        <button @click="searchAttractions">검색</button>
      </div>

      <ul class="result-list">
        <li v-if="results.length === 0 && keyword.length > 0" class="no-result">검색 결과가 없습니다.</li>

        <li v-for="place in results" :key="place.contentId" @click="selectPlace(place)" class="result-item">
          <strong>{{ place.title }}</strong>
          <span class="addr">{{ place.addr1 }}</span>
        </li>
      </ul>

      <button class="close-btn" @click="closeModal">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import axios from "axios";

const props = defineProps({ isVisible: Boolean });
const emit = defineEmits(["close", "select-attraction"]);

const keyword = ref("");
const results = ref([]);
const searchInput = ref(null);

// 모달이 열릴 때 입력창에 포커스 주기
watch(
  () => props.isVisible,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      searchInput.value?.focus();
    }
  }
);

// ★ 검색 로직 (타이핑 시 자동 호출)
const searchAttractions = async () => {
  // 1글자 미만이면 검색 안함 (서버 부하 방지)
  if (!keyword.value || keyword.value.length < 1) {
    results.value = [];
    return;
  }

  try {
    console.log("검색 요청:", keyword.value); // F12 콘솔 확인용

    const response = await axios.get("http://localhost:8080/attraction/search", {
      params: {
        keyword: keyword.value,
      },
      withCredentials: true,
    });

    console.log("서버 응답:", response.data); // ★ 여기서 데이터 구조 확인 필수

    // 데이터 구조에 따른 처리 (List로 오는지, response.body... 로 오는지)
    if (Array.isArray(response.data)) {
      results.value = response.data;
    } else if (response.data.response?.body?.items?.item) {
      // 공공데이터 API 구조 그대로 리턴하는 경우
      results.value = response.data.response.body.items.item;
    } else {
      results.value = [];
    }
  } catch (error) {
    console.error("검색 에러:", error);
  }
};

const selectPlace = (place) => {
  emit("select-attraction", place); // 부모에게 선택한 정보 전달
  closeModal();
};

const closeModal = () => {
  keyword.value = "";
  results.value = [];
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.search-box input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-box button {
  padding: 8px 12px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  border-top: 1px solid #eee;
}
.result-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.result-item:hover {
  background-color: #f9f9f9;
}
.addr {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.no-result {
  padding: 20px;
  text-align: center;
  color: #999;
}

.close-btn {
  margin-top: 10px;
  padding: 10px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
