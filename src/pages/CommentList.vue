<template>
  <div class="comment-container">
    <!-- <h3>댓글 {{ comments.length }}개</h3> -->

    <ul class="comment-list">
      <li v-for="comment in comments" :key="comment.commentId" class="comment-item">
        <div class="comment-content" :class="{ deleted: comment.isDeleted }">
          <div class="meta">
            <span class="author" @click="goProfile(comment.userId)">
              {{ comment.nickName || "익명" }}
            </span>
            <span class="date">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <div v-if="editingCommentId === comment.commentId" class="edit-box">
            <textarea v-model="editContent"></textarea>
            <div class="edit-actions">
              <button @click="updateComment(comment.commentId)">저장</button>
              <button class="cancel" @click="cancelEdit">취소</button>
            </div>
          </div>

          <div v-else>
            <p v-if="comment.isDeleted" class="deleted-msg">삭제된 댓글입니다.</p>
            <p v-else class="text">{{ comment.content }}</p>

            <div class="actions" v-if="!comment.isDeleted">
              <button @click="toggleReplyBox(comment.commentId)">답글</button>

              <span v-if="isOwner(comment.userId) || userInfo?.role === 1">
                <button v-if="isOwner(comment.userId)" @click="openEdit(comment)">수정</button>

                <button
                  @click="deleteComment(comment.commentId)"
                  :style="userInfo?.role === 1 && !isOwner(comment.userId) ? 'color: #f44336; font-weight: bold;' : ''"
                >
                  {{ userInfo?.role === 1 && !isOwner(comment.userId) ? "강제 삭제" : "삭제" }}
                </button>
              </span>
            </div>
          </div>
        </div>

        <div v-if="replyBoxId === comment.commentId" class="reply-form">
          <textarea v-model="replyContent" placeholder="답글을 입력하세요." ref="replyInput"></textarea>
          <div class="reply-actions">
            <button @click="submitComment(comment.commentId)">답글 등록</button>
            <button class="cancel" @click="replyBoxId = null">취소</button>
          </div>
        </div>

        <ul v-if="comment.children && comment.children.length > 0" class="children-list">
          <li v-for="child in comment.children" :key="child.commentId" class="child-item">
            <div class="comment-content" :class="{ deleted: child.isDeleted }">
              <div class="meta">
                <span class="author" @click="goProfile(child.userId)"> ↳ {{ child.nickName || "익명" }} </span>
                <span class="date">{{ formatDate(child.createdAt) }}</span>
              </div>

              <div v-if="editingCommentId === child.commentId" class="edit-box">
                <textarea v-model="editContent"></textarea>
                <div class="edit-actions">
                  <button @click="updateComment(child.commentId)">저장</button>
                  <button class="cancel" @click="cancelEdit">취소</button>
                </div>
              </div>

              <div v-else>
                <p v-if="child.isDeleted" class="deleted-msg">삭제된 댓글입니다.</p>
                <p v-else class="text">{{ child.content }}</p>

                <div class="actions" v-if="!child.isDeleted && isOwner(child.userId)">
                  <button @click="openEdit(child)">수정</button>
                  <button @click="deleteComment(child.commentId)">삭제</button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </li>
    </ul>

    <!-- 댓글 입력창을 댓글 목록 하단으로 이동 -->
    <div class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="댓글을 남겨보세요."
        @keyup.enter.prevent="submitComment(null)"
      ></textarea>
      <button class="regist-btn" @click="submitComment(null)" :disabled="!newComment.trim()">등록</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const props = defineProps({
  boardId: [Number, String],
  userInfo: Object,
});
const emit = defineEmits(["comment-change"]);
const comments = ref([]);
const newComment = ref("");
const replyContent = ref("");
const replyBoxId = ref(null);

// ★ 수정 관련 상태 추가
const editingCommentId = ref(null); // 현재 수정 중인 댓글 ID
const editContent = ref(""); // 수정 중인 내용 임시 저장

/* --- 유틸리티 --- */
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T").join(" ").substring(0, 16);
};

// 프로필 이동 함수 추가
const goProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`);
  }
};
const isOwner = (writerId) => {
  return props.userInfo && props.userInfo.userId === writerId;
};

/* --- 조회 --- */
const fetchComments = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/comment/${props.boardId}`);
    comments.value = data;
  } catch (error) {
    console.error("댓글 로드 실패", error);
  }
};

/* --- 작성 (원글/답글 공통) --- */
const toggleReplyBox = (commentId) => {
  replyBoxId.value = replyBoxId.value === commentId ? null : commentId;
  replyContent.value = "";
};

const submitComment = async (parentId) => {
  if (!props.userInfo) {
    alert("로그인이 필요합니다.");
    return;
  }
  const content = parentId ? replyContent.value : newComment.value;
  if (!content.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  const commentDto = {
    boardId: props.boardId,
    userId: props.userInfo.userId,
    content: content,
    parentId: parentId,
  };

  try {
    await axios.post("http://localhost:8080/comment", commentDto);
    if (parentId) {
      replyBoxId.value = null;
      replyContent.value = "";
    } else {
      newComment.value = "";
    }
    await fetchComments();
    emit("comment-change");
  } catch (error) {
    console.error("작성 실패", error);
  }
};

/* --- 삭제 --- */
const deleteComment = async (commentId) => {
  const isAdmin = props.userInfo?.role === 1;
  const msg = isAdmin ? "관리자 권한으로 이 댓글을 강제 삭제하시겠습니까?" : "정말 삭제하시겠습니까?";

  if (!confirm(msg)) return;

  try {
    // 관리자면 /admin/comment, 일반유저면 /comment 호출
    const url = isAdmin
      ? `http://localhost:8080/admin/comment/${commentId}`
      : `http://localhost:8080/comment/${commentId}`;

    await axios.delete(url, {
      data: { userId: props.userInfo.userId }, // 기존 로직 유지
      withCredentials: true,
    });

    await fetchComments();
    emit("comment-change");
  } catch (error) {
    console.error("삭제 실패", error);
    alert("삭제 권한이 없거나 오류가 발생했습니다.");
  }
};
/* --- ★ 수정 기능 (추가됨) --- */

// 1. 수정 모드 진입
const openEdit = (comment) => {
  editingCommentId.value = comment.commentId; // 해당 댓글을 수정 상태로 변경
  editContent.value = comment.content; // 기존 내용을 입력창에 채움
  replyBoxId.value = null; // (혹시 열려있던 답글창 닫기)
};

// 2. 수정 취소
const cancelEdit = () => {
  editingCommentId.value = null;
  editContent.value = "";
};

// 3. 수정 요청 보내기 (PUT)
const updateComment = async (commentId) => {
  if (!editContent.value.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  try {
    await axios.put("http://localhost:8080/comment", {
      commentId: commentId,
      userId: props.userInfo.userId, // 본인 확인용
      content: editContent.value,
    });

    // 성공 시 상태 초기화 및 목록 갱신
    cancelEdit();
    await fetchComments();
    emit("comment-change");
  } catch (error) {
    console.error("수정 실패", error);
    alert("수정 권한이 없거나 오류가 발생했습니다.");
  }
};

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
/* ===============================
   댓글 전체 컨테이너
================================ */
.comment-container {
  margin-top: 0;
  padding-top: 0;
  border-top: none; /* ❌ 불필요한 상단 선 제거 */
}

/* ===============================
   댓글 리스트
================================ */
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 댓글 하나 */
.comment-item {
  padding: 16px 0;
}

/* 댓글 간 구분선 (첫 댓글 제외) */
.comment-item + .comment-item {
  border-top: 1px solid #f1f5f9;
}

/* ===============================
   댓글 내용
================================ */
.comment-content {
  font-size: 14px;
}

.meta {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.author {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  cursor: pointer;
}

.author:hover {
  color: #0066ff;
  text-decoration: underline;
}

.text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #374151;
}

/* ===============================
   댓글 액션 (답글 / 수정 / 삭제)
================================ */
.actions {
  margin-top: 8px;
  font-size: 13px;
}

.actions button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  margin-right: 10px;
  padding: 0;
}

.actions button:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* ===============================
   대댓글
================================ */
.children-list {
  list-style: none;
  margin-top: 12px;
  margin-left: 32px;
  padding-left: 16px;
  border-left: 2px solid #eef2f7;
}

.child-item {
  padding: 12px 0;
}

.child-item + .child-item {
  border-top: 1px solid #f1f5f9;
}

/* ===============================
   삭제된 댓글
================================ */
.deleted-msg {
  color: #9ca3af;
  font-style: italic;
}

/* ===============================
   답글 / 수정 입력창
================================ */
.reply-form,
.edit-box {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.reply-form textarea,
.edit-box textarea {
  width: 100%;
  height: 70px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  resize: none;
  font-size: 14px;
}

.reply-actions,
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-actions button,
.edit-actions button {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  background: #0066ff;
  color: #fff;
}

.reply-actions button.cancel,
.edit-actions button.cancel {
  background: #e5e7eb;
  color: #374151;
}

/* ===============================
   댓글 작성 폼 (하단 고정 느낌)
================================ */
.comment-form {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-form textarea {
  width: 100%;
  height: 90px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
  font-size: 14px;
}

.regist-btn {
  align-self: flex-end;
  padding: 8px 20px;

  background: #0066ff;
  color: white;
  border: none;
  border-radius: 8px;

  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
