<template>
  <div class="board-container">
    <div class="tab-menu">
      <button :class="{ active: currentType === 2 }" @click="changeTab(2)">📸 여행 후기</button>
      <button :class="{ active: currentType === 1 }" @click="changeTab(1)">🗣️ 자유 게시판</button>
    </div>

    <div class="filter-search-row">
      <!-- LEFT : FILTER -->
      <div class="filter-group">
        <!-- ❤️ 팔로우 토글 -->
        <label class="toggle-switch">
          <input type="checkbox" v-model="onlyFollowing" @change="getArticles" />
          <span class="slider"></span>
          <span class="toggle-label">내 팔로우만</span>
        </label>

        <!-- 날짜 필터 -->
        <div class="date-range">
          <input type="date" v-model="startDate" @change="getArticles" />
          <span class="tilde">~</span>
          <input type="date" v-model="endDate" @change="getArticles" />
        </div>
      </div>

      <!-- RIGHT : SEARCH -->
      <div class="search-group">
        <div class="search-box">
          <input
            type="text"
            v-model="searchWord"
            @input="onSearchInput"
            @keyup.enter="getArticles"
            placeholder="장소명, 제목, 작성자 검색"
          />
          <button class="icon-btn search-btn" @click="getArticles">🔍</button>
        </div>

        <ul v-if="suggestions.length && showSuggestions" class="suggestions-list">
          <li
            v-for="(item, index) in suggestions"
            :key="index"
            @click="selectSuggestion(item)"
          >
            🔍 {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 🔧 ACTION BAR -->
    <div class="action-bar">
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
/* =====================================================
   0. 페이지 프레임
   ===================================================== */
.board-container {
  max-width: 880px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}

body {
  background: #f5f7fb;
}

/* =====================================================
   2. 탭 메뉴
   ===================================================== */
.tab-menu {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-menu button {
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-menu button:hover {
  background: #f1f5ff;
}

.tab-menu button.active {
  background: #0066ff;
  color: #fff;
  border-color: #0066ff;
  box-shadow: 0 4px 10px rgba(0, 102, 255, 0.25);
}

/* =====================================================
   3. FILTER + SEARCH ROW
   ===================================================== */
.filter-search-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 12px 16px;
  margin-bottom: 20px;

  background: #f9fbff;
  border: 1px solid #e4e9f2;
  border-radius: 14px;
}

/* LEFT : FILTER */
.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 토글 */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.toggle-switch input {
  display: none;
}

.toggle-switch .slider {
  width: 36px;
  height: 20px;
  background: #dcdfe6;
  border-radius: 20px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch .slider::before {
  content: "";
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch input:checked + .slider {
  background: #ff5a5f;
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(16px);
}

.toggle-label {
  user-select: none;
}

/* 날짜 */
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input {
  height: 34px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.tilde {
  color: #999;
}

/* RIGHT : SEARCH */
.search-group {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 12px;

  border-radius: 10px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}

.search-box input {
  width: 200px;
  border: none;
  outline: none;
  font-size: 13px;
}

.icon-btn.search-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.icon-btn.search-btn:hover {
  background: #eef3ff;
}

/* =====================================================
   4. ACTION BAR
   ===================================================== */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 20px; 
}

.sort-box select {
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fff;
}

.write-btn {
  height: 42px;
  padding: 0 26px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: #0066ff;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 102, 255, 0.25);
}

.write-btn:hover {
  background: #0056d6;
}

/* =====================================================
   5. 리뷰 카드
   ===================================================== */
.review-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 16px;
  padding: 22px 24px 24px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.review-card:hover {
  border-color: #d0d7e2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.place {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.photo-img {
  width: 100%;
  height: 230px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 14px;
  background: #f0f2f5;
}

.rating {
  font-size: 15px;
  font-weight: 700;
  color: #f5a623;
  margin-bottom: 8px;
}

.preview-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 하단 액션 */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid #eef1f5;
}

.like-btn,
.comment-btn {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: none;
}

.like-btn {
  background: #fff0f2;
  color: #e53e3e;
}

.comment-btn {
  background: #ebf4ff;
  color: #2563eb;
}

.views {
  font-size: 13px;
  color: #6b7280;
}

.writer {
  margin-left: auto;
  font-size: 13px;
  color: #6b7280;
}

.nickname-link:hover {
  color: #0066ff;
  text-decoration: underline;
  cursor: pointer;
}

/* =====================================================
   6. 빈 상태
   ===================================================== */
.empty-feed-msg {
  margin-top: 40px;
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 16px;
  border-radius: 14px;
  background: #f8f9fa;
  border: 1px dashed #dcdfe6;
}

</style>
