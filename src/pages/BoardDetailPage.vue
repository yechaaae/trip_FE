<template>
  <div class="detail-container">
    <article class="detail-card">
      <!-- 제목 -->
      <h1 class="detail-title">{{ post.title }}</h1>

      <!-- 평점 -->
      <div v-if="post.rating" class="rating">⭐ {{ post.rating }} / 5.0</div>

      <!-- 이미지 -->
      <img v-if="post.saveFile" :src="`http://localhost:8080/upload/${post.saveFile}`" class="detail-img" />

      <!-- 본문 -->
      <div class="detail-content">
        {{ post.content }}
      </div>

      <!-- 액션 + 메타 -->
      <div class="detail-footer">
        <!-- 좌측: 좋아요 / 댓글 / 조회수 -->
        <div class="actions">
          <button class="like-btn" :class="{ liked: post.userLiked }" @click="toggleLike">
            {{ post.userLiked ? "❤️" : "🤍" }} {{ post.likeCount }}
          </button>

          <button class="comment-btn">💬 {{ post.commentCount || 0 }}</button>

          <span class="views">👀 {{ post.hit }}</span>
        </div>

        <!-- 우측: 수정/삭제 + 작성자/날짜 -->
        <div class="meta-area">
          <!-- 작성자 전용 버튼 (⬆ 위로 이동) -->
          <div class="owner-actions" v-if="userInfo && userInfo.userId === post.userId">
            <button class="owner-btn edit" @click="goModify">수정</button>
            <button class="owner-btn delete" @click="deleteArticle">삭제</button>
          </div>

          <!-- 메타 정보 -->
          <div class="meta">
            <span class="writer" @click="goToProfile(post.userId)">
              {{ post.nickName }}
            </span>
            · {{ post.registDate }}
          </div>
        </div>
      </div>

      <!-- 댓글 영역 -->
      <div class="comment-section">
        <CommentList :boardId="postId" :userInfo="userInfo" @comment-change="fetchPostDetail(false)" />
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import CommentList from "@/pages/CommentList.vue";
const route = useRoute();
const router = useRouter();
const postId = route.params.id;

// 게시글 데이터
const post = ref({});
// 로그인한 유저 정보 (로그인 시 sessionStorage에 'userInfo'라는 키로 저장했다고 가정)
const userInfo = ref(null);

onMounted(async () => {
  // 1. 세션 스토리지에서 유저 정보 가져오기
  const storedUser = sessionStorage.getItem("userInfo");
  if (storedUser) {
    try {
      userInfo.value = JSON.parse(storedUser);
    } catch (e) {
      console.error(e);
    }
  }

  // 2. 게시글 상세 조회 호출 (수정됨)
  await fetchPostDetail(true);
});

// 삭제 기능
const deleteArticle = async () => {
  const isAdmin = userInfo.value?.role === 1;
  const msg = isAdmin ? "관리자 권한으로 이 게시글을 강제 삭제하시겠습니까?" : "정말 삭제하시겠습니까?";

  if (!confirm(msg)) return;

  try {
    // 관리자면 /admin/board, 일반유저면 /api/board 호출 (백엔드 설정에 맞춤)
    const url = isAdmin ? `http://localhost:8080/admin/board/${postId}` : `http://localhost:8080/api/board/${postId}`;

    await axios.delete(url, {
      withCredentials: true,
    });

    alert("삭제되었습니다.");
    router.push("/board");
  } catch (error) {
    console.error(error);
    alert("삭제 중 오류가 발생했습니다.");
  }
};

// 수정 페이지 이동
const goModify = () => {
  // 수정 페이지 라우터가 있다면 이동 (ex: /board/modify/1)
  // 혹은 기존 Write 페이지를 재활용할 수도 있음
  router.push(`/board/modify/${postId}`);
};

// 좋아요 토글 함수
const toggleLike = async () => {
  // 1. 로그인 체크 (userInfo는 onMounted에서 세션스토리지에서 가져옴)
  if (!userInfo.value) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    // 2. 좋아요 토글 API 호출 (POST)
    // 백엔드 Controller가 Map을 받으므로 userId를 body에 담아 보냄
    await axios.post(
      `http://localhost:8080/api/board/like/${postId}`,
      { userId: userInfo.value.userId },
      { withCredentials: true } // 세션 유지를 위해 필수
    );

    // 3. 화면 갱신 (상세 정보를 다시 불러와서 숫자와 하트 상태 업데이트)
    await fetchPostDetail(false);
  } catch (error) {
    console.error("좋아요 처리 실패", error);
    alert("오류가 발생했습니다.");
  }
};

// 게시글 상세 조회 함수
const fetchPostDetail = async (shouldUpdateHit = true) => {
  try {
    // 백엔드에서 userLiked를 계산하려면 로그인 세션이 필요하므로 withCredentials 추가
    const { data } = await axios.get(`http://localhost:8080/api/board/${postId}`, {
      params: {
        // true면 조회수 증가, false면 데이터만 가져옴
        updateHit: shouldUpdateHit,
      },
      withCredentials: true,
    });
    post.value = data;
    console.log("게시글 정보(갱신):", post.value);
  } catch (error) {
    console.error("상세 조회 실패", error);
  }
};

const goToProfile = (userId) => {
  // 내 페이지면 /mypage, 남이면 /mypage/그사람ID (라우터 설정에 따라 다름)
  // 가장 쉬운 방법은 라우터를 통일하는 것입니다.
  // router/index.js에 { path: '/user/:userId', component: MyPage } 설정 추천
  router.push(`/user/${userId}`);
};
</script>

<style scoped>
/* ===============================
   레이아웃
================================ */
.detail-container {
  max-width: 880px;
  margin: 32px auto 80px;
  padding: 0 24px;
}

/* ===============================
   게시글 카드
================================ */
.detail-card {
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 20px;
  padding: 28px 32px 36px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

/* ===============================
   제목 / 평점
================================ */
.detail-title {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
  margin-left: 6px;
}

.rating {
  font-size: 16px;
  font-weight: 700;
  color: #f5a623;
  margin-left: 15px;
}

.detail-content {
  margin-top: 28px;
  margin-left: 10px;
  font-size: 17px;
  line-height: 1.75;
}

/* ===============================
   이미지
================================ */
.detail-img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 14px;
  background: #f3f4f6;
  margin: 18px 0 22px;
}

/* ===============================
   본문
================================ */
.detail-content {
  font-size: 16px;
  line-height: 1.65;
  color: #374151;
  white-space: pre-line;
  margin-bottom: 24px;
}

/* ===============================
   하단 액션 / 메타
================================ */
.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.like-btn,
.comment-btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.like-btn {
  background: #fff0f2;
  color: #e53e3e;
}

.like-btn.liked {
  background: #ffe4ea;
}

.comment-btn {
  background: #ebf4ff;
  color: #2563eb;
}

.views {
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
}

.meta-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.meta {
  font-size: 14px;
  color: #6b7280;
}

.owner-actions {
  display: flex;
  gap: 12px;
}

.owner-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}

.owner-btn.edit:hover {
  color: #2563eb;
  text-decoration: underline;
}

.owner-btn.delete:hover {
  color: #ef4444;
  text-decoration: underline;
}

.writer {
  font-weight: 600;
  cursor: pointer;
}

.writer:hover {
  color: #0066ff;
  text-decoration: underline;
}

/* ===============================
   수정 / 삭제 버튼 (자연스럽게)
================================ */
.owner-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.owner-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px 4px;
}

.owner-btn.edit:hover {
  color: #2563eb;
  text-decoration: underline;
}

.owner-btn.delete:hover {
  color: #ef4444;
  text-decoration: underline;
}

/* ===============================
   댓글 영역
================================ */
.comment-section {
  margin-top: 12px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
}
</style>
