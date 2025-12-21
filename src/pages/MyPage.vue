<template>
  <div class="mypage-container">
    <aside class="profile-section">
      <div
        class="avatar"
        :style="
          user.profileImg ? { backgroundImage: `url(${user.profileImg})` } : {}
        "
      ></div>

      <h2 class="nickname">{{ user.nickname }}</h2>
      <p class="bio">
        <span v-if="user.bio">{{ user.bio }}</span>

        <span v-else style="color: #999">
          {{
            isOtherUser ? "자기소개가 없습니다." : "자기소개를 입력해주세요."
          }}
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
          <span class="number">{{ user.badges }}</span>
          <span class="label">뱃지</span>
        </div>
      </div>

      <div style="width: 100%; margin-top: 15px">
        <button v-if="!isOtherUser" class="edit-btn" @click="goProfileEdit">
          프로필 설정
        </button>

        <button
          v-else
          class="follow-btn"
          :class="{ following: isFollowing }"
          @click="toggleFollow"
        >
          {{ isFollowing ? "팔로잉" : "팔로우" }}
        </button>
      </div>
    </aside>

    <section class="content-section">
      <div class="tabs">
        <div
          :class="['tab', { active: tab === 'myReviews' }]"
          @click="tab = 'myReviews'"
        >
          {{ isOtherUser ? "작성한 리뷰" : "내 리뷰 관리" }}
        </div>

        <template v-if="!isOtherUser">
          <div
            :class="['tab', { active: tab === 'likedReviews' }]"
            @click="tab = 'likedReviews'"
          >
            좋아요 한 리뷰
          </div>
          <div
            :class="['tab', { active: tab === 'savedPlaces' }]"
            @click="tab = 'savedPlaces'"
          >
            저장한 관광지
          </div>
        </template>
      </div>

      <div class="tab-content">
        <div v-if="tab === 'myReviews'">
          <div
            v-if="myReviews.length === 0"
            style="color: #888; text-align: center; padding: 20px"
          >
            작성한 리뷰가 없습니다.
          </div>
          <div
            v-for="review in myReviews"
            :key="review.boardId"
            @click="router.push(`/board/${review.boardId}`)"
            style="
              display: flex;
              gap: 15px;
              border-bottom: 1px solid #eee;
              padding: 15px 0;
              cursor: pointer;
            "
          >
            <img
              v-if="review.saveFile"
              :src="getImageUrl(review.saveFile)"
              style="
                width: 100px;
                height: 75px;
                object-fit: cover;
                border-radius: 6px;
                background: #eee;
              "
            />
            <div
              v-else
              style="
                width: 100px;
                height: 75px;
                background: #f0f0f0;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #aaa;
              "
            >
              이미지 없음
            </div>

            <div style="flex: 1">
              <h4 style="margin: 0 0 6px 0; font-size: 16px">
                {{ review.title }}
              </h4>
              <div style="font-size: 13px; color: #666; margin-bottom: 4px">
                <span style="color: #f39c12; font-weight: bold"
                  >⭐ {{ review.rating }}</span
                >
                &nbsp;|&nbsp; 조회수 {{ review.hit }}
              </div>
              <div style="font-size: 12px; color: #999">
                {{ review.registDate ? review.registDate.split(" ")[0] : "" }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'likedReviews' && !isOtherUser">
          <div
            v-if="likedReviews.length === 0"
            style="color: #888; text-align: center; padding: 20px"
          >
            좋아요 한 리뷰가 없습니다.
          </div>
          <div
            v-for="review in likedReviews"
            :key="review.boardId"
            @click="router.push(`/board/${review.boardId}`)"
            style="
              display: flex;
              gap: 15px;
              border-bottom: 1px solid #eee;
              padding: 15px 0;
              cursor: pointer;
            "
          >
            <img
              v-if="review.saveFile"
              :src="getImageUrl(review.saveFile)"
              style="
                width: 100px;
                height: 75px;
                object-fit: cover;
                border-radius: 6px;
                background: #eee;
              "
            />
            <div
              v-else
              style="
                width: 100px;
                height: 75px;
                background: #f0f0f0;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #aaa;
              "
            >
              이미지 없음
            </div>
            <div style="flex: 1">
              <h4 style="margin: 0 0 6px 0; font-size: 16px">
                {{ review.title }}
              </h4>
              <div style="font-size: 13px; color: #666; margin-bottom: 4px">
                <span style="color: #f39c12; font-weight: bold"
                  >⭐ {{ review.rating }}</span
                >
                &nbsp;|&nbsp; ❤️ {{ review.likeCount }} &nbsp;|&nbsp;
                {{ review.nickName }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'savedPlaces' && !isOtherUser">
          <div
            v-if="savedPlaces.length === 0"
            style="color: #888; text-align: center; padding: 20px"
          >
            저장한 관광지가 없습니다.
          </div>
          <div
            v-for="place in savedPlaces"
            :key="place.bookmarkId"
            @click="router.push(`/attraction/${place.contentId}`)"
            style="
              display: flex;
              gap: 15px;
              border-bottom: 1px solid #eee;
              padding: 15px 0;
              cursor: pointer;
            "
          >
            <img
              v-if="place.firstImage"
              :src="place.firstImage"
              style="
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 50%;
                border: 1px solid #eee;
              "
            />
            <div
              v-else
              style="
                width: 80px;
                height: 80px;
                background: #f0f0f0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #aaa;
              "
            >
              No Image
            </div>
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
              "
            >
              <h4 style="margin: 0 0 5px 0; font-size: 16px">
                {{ place.title }}
              </h4>
              <p style="margin: 0; font-size: 13px; color: #666">
                📍 {{ place.addr1 }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FollowModal
      :isVisible="showModal"
      :type="modalType"
      :userId="user.userId"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import axios from "axios";
import FollowModal from "@/pages/FollowModal.vue";

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

    // ※ 백엔드에 '타인 작성글 조회' API가 있다면 여기서 호출해서 myReviews에 넣어주세요.
    // 예: axios.get(`/api/board/user/${paramId}`)
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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 204)
    ) {
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
  } catch (error) {
    console.error("내 활동 로딩 실패:", error);
  }
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
/* 기존 CSS 유지 */
.mypage-container {
  display: flex;
  height: calc(100vh - 60px);
}

.profile-section {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  padding: 28px;
  background: #fafbff;
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
  padding: 32px;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
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
  border-top: 1px solid #ddd;
  padding-top: 24px;
  font-size: 16px;
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
</style>
