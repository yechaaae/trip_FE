<template>
  <div class="mypage-container">
    <aside class="profile-section">
      <div class="avatar" :style="user.profileImg ? { backgroundImage: `url(${user.profileImg})` } : {}"></div>

      <h2 class="nickname">{{ user.nickname }}</h2>
      <p class="bio">
        <span v-if="user.bio">{{ user.bio }}</span>

        <span v-else style="color: #999">
          {{ isOtherUser ? "자기소개가 없습니다." : "자기소개를 입력해주세요." }}
        </span>
      </p>

      <div class="stats">
        <div class="stat clickable" @click="openModal('following')">
          <span class="number">{{ user.following }}</span>
          <span class="label">팔로우</span>
        </div>

        <div class="stat clickable" @click="openModal('follower')">
          <span class="number">{{ user.followers }}</span>
          <span class="label">팔로워</span>
        </div>

        <div class="stat">
          <div class="stat clickable" @click="openBadgeModal">
            <span class="number">{{ user.badges }}</span> <span class="label">뱃지</span>
          </div>

          <BadgeListModal :isVisible="showBadgeModal" :badges="myBadges" @close="showBadgeModal = false" />
        </div>
      </div>

      <div style="width: 100%; margin-top: 15px">
        <button v-if="!isOtherUser" class="edit-btn" @click="goProfileEdit">프로필 설정</button>

        <button v-else class="follow-btn" :class="{ following: isFollowing }" @click="toggleFollow">
          {{ isFollowing ? "팔로잉" : "팔로우" }}
        </button>
      </div>
    </aside>

    <section class="content-section">
      <div class="tabs">
        <div :class="['tab', { active: tab === 'myReviews' }]" @click="tab = 'myReviews'">
          {{ isOtherUser ? "작성한 리뷰" : "내 리뷰 관리" }}
        </div>

        <template v-if="!isOtherUser">
          <div :class="['tab', { active: tab === 'likedReviews' }]" @click="tab = 'likedReviews'">좋아요 한 리뷰</div>
          <div :class="['tab', { active: tab === 'savedPlaces' }]" @click="tab = 'savedPlaces'">저장한 관광지</div>
        </template>
      </div>

      <div class="tab-content">
        <div v-if="tab === 'myReviews'">
          <div v-if="myReviews.length === 0" style="color: #888; text-align: center; padding: 20px">
            작성한 리뷰가 없습니다.
          </div>
          <div
            v-for="review in myReviews"
            :key="review.boardId"
            class="list-item"
            @click="router.push(`/board/${review.boardId}`)"
          >
            <img
              v-if="review.saveFile"
              :src="getImageUrl(review.saveFile)"
              class="list-thumb"
            />
            <div v-else class="list-thumb empty">
              이미지 없음
            </div>

            <div class="list-body">
              <h4 class="list-title">
                {{ review.title }}
              </h4>

              <div class="list-meta">
                <span class="rating">⭐ {{ review.rating }}</span>
                &nbsp;|&nbsp; 조회수 {{ review.hit }}
              </div>

              <div class="list-date">
                {{ review.registDate ? review.registDate.split(" ")[0] : "" }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'likedReviews' && !isOtherUser">
          <div v-if="likedReviews.length === 0" style="color: #888; text-align: center; padding: 20px">
            좋아요 한 리뷰가 없습니다.
          </div>
          <div
            v-for="review in likedReviews"
            :key="review.boardId"
            class="list-item"
            @click="router.push(`/board/${review.boardId}`)"
          >
            <img
              v-if="review.saveFile"
              :src="getImageUrl(review.saveFile)"
              class="list-thumb"
            />

            <div v-else class="list-thumb empty">
              이미지 없음
            </div>
            <div class="list-body">
              <h4 class="list-title">
                {{ review.title }}
              </h4>

              <div class="list-meta">
                <span class="rating">⭐ {{ review.rating }}</span>
                &nbsp;|&nbsp; ❤️ {{ review.likeCount }} &nbsp;|&nbsp;
                {{ review.nickName }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'savedPlaces' && !isOtherUser">
          <div v-if="savedPlaces.length === 0" style="color: #888; text-align: center; padding: 20px">
            저장한 관광지가 없습니다.
          </div>
          <div
            v-for="place in savedPlaces"
            :key="place.bookmarkId"
            class="list-item"
            @click="router.push(`/attraction/${place.contentId}`)"
          >
            <img
              v-if="place.firstImage"
              :src="place.firstImage"
              class="place-thumb"
            />

            <div v-else class="place-thumb empty">
              No Image
            </div>
            <div class="list-body">
              <h4 class="list-title">
                {{ place.title }}
              </h4>
              <p class="list-meta">
                📍 {{ place.addr1 }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FollowModal :isVisible="showModal" :type="modalType" :userId="user.userId" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import axios from "axios";
import FollowModal from "@/pages/FollowModal.vue";
import { getMyBadges, getUserBadges } from "@/api/badge"; // API 가져오기
import BadgeListModal from "@/pages/BadgeListModal.vue"; // 모달 가져오기
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});
const likedReviews = ref([]);
const route = useRoute();
const isOtherUser = ref(false);
const router = useRouter();

const isFollowing = ref(false); // 팔로우 중인지 여부
const mySessionId = ref(""); // 로그인한 내 ID (비교용)
// 모달 관련 상태
const showModal = ref(false);
const modalType = ref("follower");

// ★ 데이터 저장용 변수 추가
const myReviews = ref([]);
const savedPlaces = ref([]);

const showBadgeModal = ref(false);
const myBadges = ref([]); // 실제 뱃지 리스트 담을 곳

const user = ref({
  userId: "",
  nickname: "",
  email: "",
  bio: "",
  profileImg: "",
  following: 0,
  followers: 0,
  badges: 0,
});

const tab = ref("myReviews");

onMounted(async () => {
  // 1. 세션에서 내 ID 가져오기 (비교를 위해 필수)
  const storedUser = sessionStorage.getItem("userInfo");
  if (storedUser) {
    mySessionId.value = JSON.parse(storedUser).userId;
  }
  loadPage();
});

// 다른 사용자 페이지 이동 시에도 재로딩
watch(
  () => route.params.userId,
  () => {
    loadPage();
  }
);

// 이미지 경로
const getImageUrl = (path) => {
  if (!path) return "";

  // 1. 외부 링크(http로 시작)면 그대로 반환
  if (path.startsWith("http")) return path;

  // 2. 경로에 이미 /upload가 포함된 경우 (UserDto 프로필 이미지 등)
  if (path.startsWith("/upload")) {
    return `http://localhost:8080${path}`;
  }

  // 3. 파일명만 있는 경우 (BoardDto 리뷰 이미지 등)
  // 경로가 '/'로 시작하지 않으면 붙여줌
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `http://localhost:8080/upload${cleanPath}`;
};

// 내/타인 구분
const loadPage = async () => {
  const paramId = route.params.userId;

  // 파라미터가 없거나, 파라미터가 내 ID와 같으면 => "내 페이지"
  if (!paramId || paramId === mySessionId.value) {
    isOtherUser.value = false;
    user.value.userId = mySessionId.value; // 내 ID로 설정

    await fetchMyInfo(); // 내 정보
    await fetchFollowCounts(user.value.userId);
    await fetchMyActivity(); // 내 활동 내역(리뷰, 좋아요, 저장)
  }
  // 파라미터가 있고 내 ID와 다르면 => "타인 페이지"
  else {
    isOtherUser.value = true;
    user.value.userId = paramId;
    tab.value = "myReviews"; // 탭 초기화 (리뷰만 볼 수 있으므로)

    await fetchOtherUserInfo(paramId); // 타인 정보 API 호출
    await fetchFollowCounts(paramId); // 타인 팔로우 수
    await checkFollowStatus(paramId); // [중요] 팔로우 여부 확인

    // 타인의 작성 글 가져오기 (기존 API에 파라미터를 추가하거나 별도 API 필요)
    // 예시: await fetchOtherReviews(paramId);
    // 임시로 내 리뷰 변수를 비움
    await fetchOtherReviews(paramId);
    likedReviews.value = [];
    savedPlaces.value = [];

    try {
      const res = await getUserBadges(paramId);
      myBadges.value = res.data; // 뱃지 리스트 저장
      user.value.badges = res.data.length; // 뱃지 개수 업데이트!
    } catch (e) {
      console.error("타인 뱃지 조회 실패", e);
      user.value.badges = 0;
    }
  }
};

const fetchOtherReviews = async (userId) => {
  try {
    // 방금 만든 백엔드 API 호출
    const res = await api.get(`api/board/user/${userId}`);
    myReviews.value = res.data;
  } catch (error) {
    console.error("타인 리뷰 조회 실패:", error);
    myReviews.value = [];
  }
};

const checkFollowStatus = async (targetId) => {
  if (!mySessionId.value) return; // 비로그인 상태면 패스
  try {
    const res = await api.get(`/follow/status/${targetId}`);
    isFollowing.value = res.data; // true or false
  } catch (error) {
    console.error("팔로우 상태 확인 실패:", error);
  }
};

const toggleFollow = async () => {
  if (!mySessionId.value) {
    alert("로그인이 필요합니다.");
    return;
  }
  const targetId = user.value.userId;

  try {
    if (isFollowing.value) {
      // 이미 팔로우 중 -> 언팔로우 요청 (DELETE)
      await api.delete(`/follow/${targetId}`);
      isFollowing.value = false;
      user.value.followers--; // 숫자 즉시 감소 (UX)
    } else {
      // 팔로우 안 함 -> 팔로우 요청 (POST)
      await api.post(`/follow/${targetId}`);
      isFollowing.value = true;
      user.value.followers++; // 숫자 즉시 증가 (UX)
    }
  } catch (error) {
    console.error("팔로우 처리 실패:", error);
    alert("요청 처리에 실패했습니다.");
  }
};

// 내 정보
const fetchMyInfo = async () => {
  try {
    const res = await api.get("/user/info");
    setUserInfo(res.data);
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 204)) {
      alert("로그인이 필요합니다.");
      router.push("/login");
    } else {
      console.error("회원 정보 조회 오류:", error);
    }
  }
};

// 타인 프로필 정보
const fetchOtherUserInfo = async (userId) => {
  try {
    const res = await api.get(`/user/info/${userId}`);
    setUserInfo(res.data);
    console.log("타인 정보 응답 데이터:", res.data);
  } catch (error) {
    console.error("타인 프로필 조회 실패:", error);
  }
};

// 공통 세팅
const setUserInfo = (userInfo) => {
  user.value.userId = userInfo.userId;
  user.value.nickname = userInfo.nickName;
  user.value.email = userInfo.email || "";

  // 백엔드 DTO는 introduction, 프론트는 bio로 사용 중
  user.value.bio = userInfo.introduction || "";

  // 이미지 처리 (위에서 만든 함수 사용)
  // DTO에 profileImg가 있으면 쓰고, 없으면 saveFile(혹시 모를 호환성) 확인
  user.value.profileImg = getImageUrl(userInfo.profileImg || userInfo.saveFile);
};

// 팔로우 카운트
const fetchFollowCounts = async (userId) => {
  try {
    const res = await api.get(`/follow/count/${userId}`);
    user.value.followers = res.data.followerCnt;
    user.value.following = res.data.followingCnt;
  } catch (error) {
    console.error("팔로우 카운트 조회 실패:", error);
  }
};

// 내 활동
const fetchMyActivity = async () => {
  try {
    const reviewRes = await api.get("/api/mypage/review");
    myReviews.value = reviewRes.data;

    const bookmarkRes = await api.get("/api/mypage/bookmark");
    savedPlaces.value = bookmarkRes.data;

    const likeRes = await api.get("/api/mypage/like");
    likedReviews.value = likeRes.data;

    const badgeRes = await getMyBadges();
    myBadges.value = badgeRes.data;

    user.value.badges = myBadges.value.length;
  } catch (error) {
    console.error("내 활동 로딩 실패:", error);
  }
};

const openBadgeModal = () => {
  showBadgeModal.value = true;
};

// 프로필 수정
const goProfileEdit = () => {
  router.push("/mypage/profile-edit");
};

const openModal = (type) => {
  modalType.value = type;
  showModal.value = true;
};
</script>

<style scoped lang="scss">

.mypage-container {
  display: flex;

  max-width: 1200px;
  margin: 24px auto;
  height: calc(100vh - 112px);

  background: #ffffff;
  border-radius: 24px;

  /* ⭐ 통일된 무대 쉐도우 */
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.06);

  overflow: hidden;
}




.profile-section {
  width: 320px;
  height: 100%;
  flex-shrink: 0;

  background: #f4f6fd;
  border-right: 1px solid #e6ebf2;

  padding: 40px 24px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background-color: #cfd8ea;
  margin-bottom: 18px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #e0e0e0;
}

.nickname {
  font-size: 22px;
  margin-bottom: 6px;
  font-weight: 700;
}

.bio {
  font-size: 14px;
  color: #555;
  text-align: center;
  margin-bottom: 26px;
  line-height: 1.4;
  white-space: pre-wrap;
  padding: 0 10px;
}

.bio-empty {
  color: #999;
  font-style: italic;
}

.stats {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* [수정] 클릭 가능한 요소에 커서 포인터 추가 */
.stat.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}
.stat.clickable:hover {
  opacity: 0.7;
}

.stat .number {
  font-size: 20px;
  font-weight: 700;
}
.stat .label {
  font-size: 13px;
  color: #666;
}

/* 오른쪽 콘텐츠 */
.content-section {
  flex: 1;
  padding: 32px 24px;

  display: flex;
  flex-direction: column;

  height: 100%;          /* ⭐ 부모(mypage-container) 기준 */
  overflow: hidden;      /* ⭐ 여기서 전체 스크롤 차단 */
}

/* 탭 영역 (고정) */
.tabs {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  flex-shrink: 0;        /* ⭐ 줄어들지 않게 */
}

.tab {
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  transition: 0.2s;
  background: #e9eef7;
  color: #42506c;
}
.tab.active {
  background: #4b7bff;
  color: white;
}

.tab-content {
  flex: 1;             
  overflow-y: auto;     
  padding-top: 24px;
  border-top: 1px solid #ddd;
}

.edit-btn {
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #4b7bff;
  color: white;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.edit-btn:hover {
  background: #3a64d2;
}

.follow-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  background: #0066ff; /* 기본: 파란색 */
  color: white;
}

.follow-btn:hover {
  background: #0056d6;
}

/* 팔로잉 중일 때 (회색 처리) */
.follow-btn.following {
  background: #e0e0e0;
  color: #555;
}
.follow-btn.following:hover {
  background: #d0d0d0;
}

/* =========================
   LIST ITEM (공통)
========================= */
.list-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.15s ease;
}

.list-item:hover {
  background: #f8faff;
}

/* 리뷰 썸네일 */
.list-thumb {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 6px;
  background: #eee;
  flex-shrink: 0;
}

.list-thumb.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #aaa;
  background: #f0f0f0;
}

/* 관광지 썸네일 */
.place-thumb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
  background: #f0f0f0;
  flex-shrink: 0;
}

.place-thumb.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #aaa;
}

/* 텍스트 영역 */
.list-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.list-title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
}

.list-meta {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.list-meta .rating {
  color: #f39c12;
  font-weight: 700;
}

.list-date {
  font-size: 12px;
  color: #999;
}

</style>
