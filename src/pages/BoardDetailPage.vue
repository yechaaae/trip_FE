<template>
  <div class="detail-container">
    <h1>{{ post.title }}</h1>

    <!-- 별점 (제목 아래로 이동) -->
    <div class="rating">⭐ {{ post.rating }} / 5.0</div>

    <!-- 이미지 영역이 있을 때만 보이도록 수정 -->
    <div v-if="post.saveFile" class="image-container">
      <img :src="`http://localhost:8080/upload/${post.saveFile}`" class="detail-img" />
    </div>

    <!-- 이미지가 없으면 이 부분은 아예 보이지 않도록 설정 -->
    <div v-else class="image-placeholder"></div>

    <p class="content">
      {{ post.content }}
    </p>

    <!-- 좋아요, 댓글과 작성자, 날짜, 조회수를 다른 행으로 배치 -->
    <div class="post-meta-actions">
      <div class="actions">
        <button class="action-btn like-btn" :class="{ liked: post.userLiked }" @click="toggleLike">
          {{ post.userLiked ? "❤️" : "🤍" }} 좋아요 {{ post.likeCount }}
        </button>
        <button>💬 댓글 {{ post.commentCount || 0 }}</button>
      </div>

      <div class="post-meta">
        <span class="writer" @click="goToProfile(post.userId)" style="cursor: pointer"> by {{ post.nickName }}</span>
        <span class="date">·{{ post.registDate }}</span>
        <span class="views">·조회{{ post.hit }} </span>
      </div>
    </div>

    <div class="owner-actions" v-if="userInfo && (userInfo.userId === post.userId || userInfo.role === 1)">
  <button v-if="userInfo.userId === post.userId" class="edit-btn" @click="goModify">수정</button>
  
  <button class="delete-btn" @click="deleteArticle">
    {{ userInfo.role === 1 && userInfo.userId !== post.userId ? '강제 삭제' : '삭제' }}
  </button>
</div>

    <CommentList :boardId="postId" :userInfo="userInfo" />
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
    const url = isAdmin 
                ? `http://localhost:8080/admin/board/${postId}` 
                : `http://localhost:8080/api/board/${postId}`;

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
    await fetchPostDetail(true);
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
.detail-container {
  max-width: 850px;
  margin: 48px auto;
}

.detail-img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  margin: 22px 0;
}

.image-placeholder {
  width: 100%;
  height: 380px;
  background: #cfdaf0;
  border-radius: 12px;
  margin: 22px 0;
}

.rating {
  font-size: 18px;
  margin-bottom: 14px;
  font-weight: 600;
}

.content {
  font-size: 17px;
  line-height: 1.55;
  margin-bottom: 28px;
  white-space: pre-line;
}

/* 좋아요, 댓글과 작성자, 날짜, 조회수 배치 */
.post-meta-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.actions {
  display: flex;
}

.actions button {
  margin-right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 17px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

/* 작성자와 날짜, 조회수 */
.post-meta {
  display: flex;
  font-size: 14px;
  color: #777;
}

.writer {
  font-weight: bold;
  margin-right: 8px;
}

.date .views {
  color: #aaa;
}

.owner-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.edit-btn,
.delete-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.edit-btn {
  background-color: #4caf50;
}
.delete-btn {
  background-color: #f44336;
}

/* 좋아요 버튼 전용 스타일 */
.like-btn {
  color: #555; /* 기본 색상 */
}

/* 좋아요 눌렀을 때 (.liked 클래스) */
.like-btn.liked {
  color: #ff4081; /* 핑크/빨강 계열 */
  font-weight: bold;
  background-color: #fff0f5; /* 연한 핑크 배경 */
}

/* 클릭 시 띠용~ 하는 애니메이션 효과 (선택사항) */
.like-btn:active {
  transform: scale(1.2);
}
</style>
