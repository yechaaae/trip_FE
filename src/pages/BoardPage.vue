<template>
  <div class="board-container">
    <h1>{{ currentType === 2 ? "여행 후기" : "자유 게시판" }}</h1>

    <div class="tab-menu">
      <button :class="{ active: currentType === 2 }" @click="changeTab(2)">📸 여행 후기</button>
      <button :class="{ active: currentType === 1 }" @click="changeTab(1)">🗣️ 자유 게시판</button>
    </div>

    <div class="top-controls">
      <div class="filter-container">
        <label class="checkbox-label" title="로그인이 필요합니다">
          <input type="checkbox" v-model="onlyFollowing" @change="getArticles" />
          <span>❤️ 내 팔로우만</span>
        </label>

        <div class="vertical-divider"></div>
        <div class="date-range">
          <input type="date" v-model="startDate" @change="getArticles" placeholder="시작일" />
          <span class="tilde">~</span>
          <input type="date" v-model="endDate" @change="getArticles" placeholder="종료일" />
        </div>
      </div>

      <div class="right-controls">
        <div class="search-box-wrapper">
          <div class="search-box">
            <input
              type="text"
              v-model="searchWord"
              @input="onSearchInput"
              @keyup.enter="getArticles"
              placeholder="검색어 입력"
            />
            <button class="icon-btn search-btn" @click="getArticles">🔍</button>
          </div>
          <ul v-if="suggestions.length > 0 && showSuggestions" class="suggestions-list">
            <li v-for="(item, index) in suggestions" :key="index" @click="selectSuggestion(item)">🔍 {{ item }}</li>
          </ul>
        </div>

        <div class="sort-box">
          <select v-model="sortOrder" @change="getArticles">
            <option value="latest">최신순</option>
            <option value="views">조회수순</option>
            <option value="comments">댓글순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>

        <button class="write-btn" @click="goWrite">
          {{ currentType === 2 ? "✏️ 리뷰 작성" : "✏️ 글 작성" }}
        </button>
      </div>
    </div>

    <div @click="showSuggestions = false">
      <div v-if="currentType === 2" class="review-feed">
        <div class="review-card" v-for="article in articles" :key="article.boardId" @click="goDetail(article.boardId)">
          <h2 class="place">{{ article.title }}</h2>
          <img
            v-if="article.saveFile"
            :src="`http://localhost:8080/upload/${article.saveFile}`"
            class="photo-img"
            alt="리뷰 사진"
          />
          <div class="rating">⭐ {{ article.rating }} / 5.0</div>
          <p class="content preview-text">{{ article.content }}</p>

          <div class="actions" @click.stop>
            <button class="like-btn">❤️ {{ article.likeCount }}</button>
            <button class="comment-btn">💬 {{ article.commentCount || 0 }}</button>
            <span class="views">👀 {{ article.hit }}</span>
            <span class="writer">
              by
              <span class="nickname-link" @click.stop="goProfile(article.userId)">
                {{ article.nickName }}
              </span>
              · {{ article.registDate ? article.registDate.split(" ")[0] : "" }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="review-feed">
        <div class="review-card" v-for="article in articles" :key="article.boardId" @click="goDetail(article.boardId)">
          <h2 class="place">{{ article.title }}</h2>

          <img
            v-if="article.saveFile"
            :src="`http://localhost:8080/upload/${article.saveFile}`"
            class="photo-img"
            alt="게시글 사진"
          />

          <p class="content preview-text">{{ article.content }}</p>

          <div class="actions" @click.stop>
            <button class="like-btn">❤️ {{ article.likeCount }}</button>
            <button class="comment-btn">💬 {{ article.commentCount || 0 }}</button>
            <span class="views">👀 {{ article.hit }}</span>
            <span class="writer">
              by
              <span class="nickname-link" @click.stop="goProfile(article.userId)">
                {{ article.nickName }}
              </span>
              · {{ article.registDate ? article.registDate.split(" ")[0] : "" }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="articles.length === 0" class="empty-feed-msg">
        {{ currentType === 2 ? "작성된 리뷰가 없습니다. 📸" : "작성된 글이 없습니다. 📝" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const articles = ref([]);
const currentType = ref(2); // 기본값 2 (리뷰 게시판)
const searchWord = ref("");

const onlyFollowing = ref(false);
const startDate = ref("");
const endDate = ref("");

// 🔥 [추가된 변수] 정렬 및 자동완성 관련
const sortOrder = ref("latest");
const suggestions = ref([]);
const showSuggestions = ref(false);
let debounceTimer = null;

// 목록 가져오기 (타입에 따라 조회)
const getArticles = async () => {
  try {
    const { data } = await axios.get("http://localhost:8080/api/board", {
      params: {
        type: currentType.value,
        word: searchWord.value,
        sort: sortOrder.value, // 🔥 [수정] 정렬 기준 추가 전송

        onlyFollowing: onlyFollowing.value,
        startDate: startDate.value || null,
        endDate: endDate.value || null,
      },
      withCredentials: true,
    });
    articles.value = data;
    showSuggestions.value = false; // 검색 후 자동완성 닫기
  } catch (error) {
    console.error("목록 조회 실패", error);
  }
};

const goProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`);
  }
};

// 탭 변경 시 데이터 재로딩
const changeTab = (type) => {
  currentType.value = type;
  searchWord.value = ""; // 탭 변경 시 검색어 초기화
  sortOrder.value = "latest"; // 🔥 [추가] 탭 변경 시 정렬 초기화

  onlyFollowing.value = false;
  startDate.value = "";
  endDate.value = "";
  getArticles();
};

// 🔥 [추가] 검색어 자동완성 로직 (Debounce)
const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    if (!searchWord.value.trim()) {
      suggestions.value = [];
      showSuggestions.value = false;
      return;
    }
    try {
      const { data } = await axios.get("http://localhost:8080/api/board/search", {
        params: { keyword: searchWord.value },
      });
      suggestions.value = data;
      showSuggestions.value = true;
    } catch (e) {
      console.error(e);
    }
  }, 300);
};

// 🔥 [추가] 추천 검색어 선택
const selectSuggestion = (keyword) => {
  searchWord.value = keyword;
  showSuggestions.value = false;
  getArticles();
};

const goWrite = () => {
  // 글쓰기 페이지로 갈 때 현재 탭 타입(1 or 2)을 쿼리로 넘겨줌
  router.push({ path: "/board/write", query: { type: currentType.value } });
};

const goDetail = (id) => {
  router.push(`/board/${id}`);
};

onMounted(() => {
  getArticles();
});
</script>

<style scoped lang="scss">
/* =========================================
   1. 전체 레이아웃 & 탭 메뉴
   ========================================= */
.board-container {
  max-width: 900px; /* 너비를 조금 더 넓혀서 여유 있게 */
  margin: 0 auto;
  padding: 40px 20px;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 700;
    color: #333;
  }
}

.tab-menu {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.tab-menu button {
  padding: 12px 28px;
  border: 1px solid #e1e4e8;
  background: #f8f9fa;
  color: #666;
  border-radius: 30px; /* 둥근 캡슐 모양 */
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-menu button:hover {
  background: #eef1f5;
}

.tab-menu button.active {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 102, 255, 0.3);
}

/* =========================================
   2. [NEW] 상단 컨트롤 바 (필터, 검색, 정렬)
   ========================================= */
.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 수직 중앙 정렬 핵심 */
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

/* 2-1. 좌측 필터 그룹 (흰색 박스로 감싸기) */
.filter-container {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #dcdfe6;
  padding: 0 20px;
  height: 44px; /* 높이 고정 */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #ff4081;
  cursor: pointer;
}

.vertical-divider {
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input[type="date"] {
  border: none;
  font-size: 14px;
  color: #555;
  background: transparent;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.tilde {
  color: #aaa;
  font-weight: bold;
}

/* 2-2. 우측 컨트롤 그룹 */
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 검색창 */
.search-box-wrapper {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  height: 44px; /* 높이 통일 */
  padding: 0 8px 0 16px;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 160px;
}

.icon-btn.search-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.search-btn:hover {
  background: #f0f2f5;
}

/* 자동완성 목록 */
.suggestions-list {
  position: absolute;
  top: 50px;
  left: 0;
  width: 100%;
  min-width: 200px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 8px 0;
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
}

.suggestions-list li {
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.suggestions-list li:hover {
  background: #f5f7fa;
  color: #0066ff;
}

/* 정렬 셀렉트 박스 */
.sort-box select {
  height: 44px; /* 높이 통일 */
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 36px 0 16px;
  font-size: 14px;
  color: #555;
  background-color: #fff;
  cursor: pointer;
  outline: none;
}

.sort-box select:focus {
  border-color: #0066ff;
}

/* 글쓰기 버튼 */
.write-btn {
  height: 44px; /* 높이 통일 */
  padding: 0 24px;
  background-color: #0066ff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.write-btn:hover {
  background-color: #0056d6;
  transform: translateY(-1px);
}

.write-btn:active {
  transform: translateY(0);
}

/* =========================================
   3. 리뷰 피드 (카드 형태)
   ========================================= */
.review-feed {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-card {
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #cdd2d9;
}

.place {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.photo-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.rating {
  font-size: 16px;
  margin-bottom: 12px;
  color: #f5a623;
  font-weight: 800;
}

.preview-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.like-btn,
.comment-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.like-btn {
  background: #fff0f2;
  color: #e53e3e;
}

.comment-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.views {
  font-size: 14px;
  color: #718096;
  margin-left: 4px;
}

.writer {
  margin-left: auto;
  font-size: 14px;
  color: #718096;
}

.nickname-link:hover,
.clickable-writer:hover {
  color: #0066ff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

/* =========================================
   4. 자유 게시판 (리스트 형태)
   ========================================= */
.free-board-list table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e4e8;
}

.free-board-list th {
  background: #f8f9fa;
  padding: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e1e4e8;
  text-align: center;
}

.free-board-list td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
  font-size: 15px;
  color: #333;
}

.free-board-list tr:last-child td {
  border-bottom: none;
}

.free-board-list tr:hover {
  background: #f9fbff;
  cursor: pointer;
}

.title-td {
  text-align: left !important;
  font-weight: 500;
  color: #2d3748;
}

.empty-msg {
  padding: 60px !important;
  color: #a0aec0;
  font-size: 16px;
}

/* [신규] 게시글 없을 때 메시지 스타일 */
.empty-feed-msg {
  text-align: center;
  padding: 60px 0;
  color: #a0aec0;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dcdfe6;
}
</style>
