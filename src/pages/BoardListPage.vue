<template>
  <div class="list-container">
    <h1>여행 정보 공유</h1>

    <div class="toolbar">
        <div class="filter-group">
            <label>
                <input type="checkbox" v-model="onlyFollowing"> 
                팔로우한 유저 글만 보기
            </label>
        </div>
        <div class="sort-group">
            <select v-model="sortOrder">
                <option value="latest">최신순</option>
                <option value="likes">좋아요순</option>
                <option value="views">조회수순</option>
            </select>
        </div>
        <button class="write-btn" @click="router.push('/board/write')">글쓰기</button>
    </div>

    <div class="board-list">
        <div v-if="filteredList.length === 0" class="no-data">
            게시글이 없습니다.
        </div>
        
        <div 
            v-for="post in filteredList" 
            :key="post.boardId" 
            class="board-item" 
            @click="router.push(`/board/${post.boardId}`)"
        >
            <div class="post-header">
                <span class="type-badge">{{ post.type === 1 ? '자유' : '리뷰' }}</span>
                <span class="title">{{ post.title }}</span>
            </div>
            <div class="post-info">
                <span>작성자: {{ post.nickName || post.userId }}</span>
                <span>❤️ {{ post.likeCount }}</span>
                <span>👀 {{ post.hit }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const boardList = ref([]);
const onlyFollowing = ref(false); // 필터 상태
const sortOrder = ref("latest");  // 정렬 상태
const myFollowingIds = ref([]);   // 내가 팔로우한 사람들의 ID 리스트

onMounted(async () => {
    await fetchBoardList();
    // 로그인 했다면 팔로잉 목록 가져오기 (API 구현되어 있다고 가정)
    // await fetchFollowingList(); 
});

const fetchBoardList = async () => {
    try {
        // 기존 Controller의 list 메서드 호출
        const { data } = await axios.get("http://localhost:8080/api/board");
        boardList.value = data;
    } catch (error) {
        console.error("목록 로드 실패", error);
    }
};

// ★ 필터링과 정렬을 동시에 처리하는 Computed 속성
const filteredList = computed(() => {
    let result = [...boardList.value];

    // 1. 팔로우 필터 적용 (프론트엔드 처리)
    if (onlyFollowing.value) {
        // (임시) 테스트를 위해 현재 로그인한 유저가 'admin'이고 'ssafy'를 팔로우했다고 가정
        // 실제로는 백엔드에서 가져온 myFollowingIds 배열을 사용해야 함
        // result = result.filter(post => myFollowingIds.value.includes(post.userId));
        console.log("팔로우 필터 켜짐 (로직 구현 필요)");
    }

    // 2. 정렬 적용
    if (sortOrder.value === 'likes') {
        result.sort((a, b) => b.likeCount - a.likeCount);
    } else if (sortOrder.value === 'views') {
        result.sort((a, b) => b.hit - a.hit);
    } else {
        // 최신순 (boardId가 클수록 최신이라고 가정)
        result.sort((a, b) => b.boardId - a.boardId);
    }

    return result;
});
</script>

<style scoped>
.list-container { max-width: 850px; margin: 40px auto; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 8px;}
.board-item { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
.board-item:hover { background: #f1f3f5; }
.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.type-badge { background: #e7f5ff; color: #0066ff; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;}
.title { font-weight: bold; font-size: 16px; }
.post-info { font-size: 14px; color: #666; display: flex; gap: 15px; }
.write-btn { background: #0066ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;}
</style>