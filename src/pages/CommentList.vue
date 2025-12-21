<template>
  <div class="comment-container">
    <h3>댓글 {{ comments.length }}개</h3>

    <div class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="댓글을 남겨보세요."
        @keyup.enter.prevent="submitComment(null)"
      ></textarea>
      <button
        class="regist-btn"
        @click="submitComment(null)"
        :disabled="!newComment.trim()"
      >
        등록
      </button>
    </div>

    <ul class="comment-list">
      <li
        v-for="comment in comments"
        :key="comment.commentId"
        class="comment-item"
      >
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
            <p v-if="comment.isDeleted" class="deleted-msg">
              삭제된 댓글입니다.
            </p>
            <p v-else class="text">{{ comment.content }}</p>

            <div class="actions" v-if="!comment.isDeleted">
              <button @click="toggleReplyBox(comment.commentId)">답글</button>
              <span v-if="isOwner(comment.userId)">
                <button @click="openEdit(comment)">수정</button>
                <button @click="deleteComment(comment.commentId)">삭제</button>
              </span>
            </div>
          </div>
        </div>

        <div v-if="replyBoxId === comment.commentId" class="reply-form">
          <textarea
            v-model="replyContent"
            placeholder="답글을 입력하세요."
            ref="replyInput"
          ></textarea>
          <div class="reply-actions">
            <button @click="submitComment(comment.commentId)">답글 등록</button>
            <button class="cancel" @click="replyBoxId = null">취소</button>
          </div>
        </div>

        <ul
          v-if="comment.children && comment.children.length > 0"
          class="children-list"
        >
          <li
            v-for="child in comment.children"
            :key="child.commentId"
            class="child-item"
          >
            <div class="comment-content" :class="{ deleted: child.isDeleted }">
              <div class="meta">
                <span class="author" @click="goProfile(child.userId)">
                  ↳ {{ child.nickName || "익명" }}
                </span>
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
                <p v-if="child.isDeleted" class="deleted-msg">
                  삭제된 댓글입니다.
                </p>
                <p v-else class="text">{{ child.content }}</p>

                <div
                  class="actions"
                  v-if="!child.isDeleted && isOwner(child.userId)"
                >
                  <button @click="openEdit(child)">수정</button>
                  <button @click="deleteComment(child.commentId)">삭제</button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const props = defineProps({
  boardId: [Number, String],
  userInfo: Object,
});

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
    const { data } = await axios.get(
      `http://localhost:8080/comment/${props.boardId}`
    );
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
  } catch (error) {
    console.error("작성 실패", error);
  }
};

/* --- 삭제 --- */
const deleteComment = async (commentId) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    // DELETE 요청 시 data 옵션으로 userId 전송
    await axios.delete(`http://localhost:8080/comment/${commentId}`, {
      data: { userId: props.userInfo.userId },
    });
    await fetchComments();
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
/* 기존 스타일 유지 + 추가 스타일 */
.comment-container {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.comment-form textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}
.regist-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: right;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin-top: 50px;
}
.comment-item {
  border-bottom: 1px solid #f1f1f1;
  padding: 15px 0;
}
.meta {
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
}
.author {
  font-weight: bold;
  color: #333;
  margin-right: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.author:hover {
  color: #0066ff;
  text-decoration: underline;
}

.text {
  white-space: pre-wrap;
  line-height: 1.5;
  color: #444;
}

.actions {
  margin-top: 8px;
  font-size: 13px;
}
.actions button {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  margin-right: 10px;
  padding: 0;
}
.actions button:hover {
  color: #0066ff;
  text-decoration: underline;
}

/* 대댓글 스타일 */
.children-list {
  list-style: none;
  padding-left: 40px;
  margin-top: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}
.child-item {
  padding: 10px;
  border-top: 1px solid #eee;
}
.child-item:first-child {
  border-top: none;
}
.deleted-msg {
  color: #999;
  font-style: italic;
}

/* 답글 & 수정 입력창 공통 스타일 */
.reply-form,
.edit-box {
  margin-top: 10px;
  padding: 10px;
  background: #f1f3f5;
  border-radius: 5px;
}
.reply-form textarea,
.edit-box textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #ccc;
  padding: 5px;
  background: white;
  resize: none;
}
.reply-actions,
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
}
.reply-actions button,
.edit-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  background: #0066ff;
  color: white;
}
.reply-actions button.cancel,
.edit-actions button.cancel {
  background: #ccc;
  color: #333;
}
</style>
