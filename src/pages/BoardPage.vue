<template>
  <div class="board-container">
    <h1>{{ currentType === 2 ? "여행 후기" : "자유 게시판" }}</h1>

    <div class="tab-menu">
      <button :class="{ active: currentType === 2 }" @click="changeTab(2)">📸 여행 후기</button>
      <button :class="{ active: currentType === 1 }" @click="changeTab(1)">🗣️ 자유 게시판</button>
    </div>

    <div class="top-controls">
      <div class="search-box">
        <input type="text" v-model="searchWord" @keyup.enter="getArticles" placeholder="검색어를 입력하세요..." />
        <button @click="getArticles">검색</button>
      </div>
      <button class="write-btn" @click="goWrite">
        {{ currentType === 2 ? "✍️ 리뷰 작성하기" : "✍️ 글 작성하기" }}
      </button>
    </div>

    <div v-if="currentType === 2" class="review-feed">
      <div class="review-card" v-for="article in articles" :key="article.boardId" @click="goDetail(article.boardId)">
        <h2 class="place">{{ article.title }}</h2>

        <img
          v-if="article.saveFile"
          :src="`http://localhost:8080/upload/${article.saveFile}`"
          class="photo-img"
          alt="리뷰 사진"
        />
        <div v-else class="photo-placeholder"></div>

        <div class="rating">⭐ {{ article.rating }} / 5.0</div>
        <p class="content preview-text">
          {{ article.content }}
        </p>

        <div class="actions" @click.stop>
          <button class="like-btn">❤️ {{ article.likeCount }}</button>
          <button class="comment-btn">💬 {{ article.commentCount || 0 }}</button>
          <span class="views">👀 {{ article.hit }}</span>
          <span class="writer">by {{ article.nickName }}</span>
        </div>
      </div>
    </div>

    <div v-else class="free-board-list">
      <table>
        <thead>
          <tr>
            <th width="10%">번호</th>
            <th width="50%">제목</th>
            <th width="15%">작성자</th>
            <th width="15%">작성일</th>
            <th width="10%">조회</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.boardId" @click="goDetail(article.boardId)">
            <td>{{ article.boardId }}</td>
            <td class="title-td">{{ article.title }}</td>
            <td>{{ article.nickName }}</td>
            <td>{{ article.registDate ? article.registDate.split(" ")[0] : "" }}</td>
            <td>{{ article.hit }}</td>
          </tr>
          <tr v-if="articles.length === 0">
            <td colspan="5" class="empty-msg">작성된 글이 없습니다.</td>
          </tr>
        </tbody>
      </table>
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

// 목록 가져오기 (타입에 따라 조회)
const getArticles = async () => {
  try {
    const { data } = await axios.get("http://localhost:8080/api/board", {
      params: {
        type: currentType.value,
        word: searchWord.value,
      },
    });
    articles.value = data;
  } catch (error) {
    console.error("목록 조회 실패", error);
  }
};

// 탭 변경 시 데이터 재로딩
const changeTab = (type) => {
  currentType.value = type;
  searchWord.value = ""; // 탭 변경 시 검색어 초기화
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
/* 기존 스타일 유지 */
.board-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 18px;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
}

/* 탭 메뉴 스타일 추가 */
.tab-menu {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-menu button {
  padding: 10px 24px;
  border: 1px solid #d4d9e3;
  background: #f8f9fa;
  color: #666;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}

.tab-menu button.active {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
  font-weight: bold;
}

/* 상단 컨트롤(검색+글쓰기) */
.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 8px;

  input {
    padding: 8px 12px;
    border: 1px solid #d4d9e3;
    border-radius: 6px;
  }
  button {
    padding: 8px 14px;
    border: 1px solid #d4d9e3;
    background: white;
    border-radius: 6px;
    cursor: pointer;
  }
}

.write-btn {
  /* 기존 마진 제거 후 상단바에 맞춤 */
  margin: 0;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #0066ff;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

/* --- 리뷰 게시판 스타일 (기존 유지) --- */
.review-feed {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.review-card {
  border: 1px solid #d4d9e3;
  border-radius: 12px;
  background: #fff;
  padding: 22px 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.09);
}

.place {
  font-size: 20px;
  margin-bottom: 14px;
  font-weight: bold;
}
.photo-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 16px;
}
.photo-placeholder {
  width: 100%;
  height: 260px;
  border-radius: 10px;
  background: #c9d5eb;
  margin-bottom: 16px;
}
.rating {
  font-size: 16px;
  margin-bottom: 12px;
  color: #ffbf00;
  font-weight: bold;
}

.preview-text {
  font-size: 15px;
  line-height: 1.5;
  color: #555;
  margin-bottom: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 2줄까지만 표시 */
  -webkit-box-orient: vertical;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.like-btn,
.comment-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.like-btn {
  background: #ffe2e5;
  color: #d63346;
}
.comment-btn {
  background: #eaf1ff;
  color: #0066ff;
}
.writer {
  margin-left: auto;
  font-size: 14px;
  color: #888;
}

/* --- 자유 게시판 스타일 (신규 추가) --- */
.free-board-list table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.free-board-list th {
  background: #f4f6fa;
  padding: 14px;
  font-size: 15px;
  color: #444;
  border-bottom: 2px solid #e1e5ee;
}

.free-board-list td {
  padding: 16px 14px;
  border-bottom: 1px solid #eee;
  text-align: center;
  font-size: 15px;
  color: #333;
}

.free-board-list tr:hover {
  background: #f9fbff;
  cursor: pointer;
}

.title-td {
  text-align: left !important;
  font-weight: 500;
}

.empty-msg {
  padding: 40px !important;
  color: #999;
}
</style>
