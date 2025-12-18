<template>
  <div class="mypage-container">
    <aside class="profile-section">
      <div 
        class="avatar" 
        :style="user.profileImg ? { backgroundImage: `url(${user.profileImg})` } : {}"
      ></div>
      
      <h2 class="nickname">{{ user.nickname }}</h2>
      
      <p class="bio">{{ user.bio || '자기소개를 입력해주세요.' }}</p>

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

      <button class="edit-btn" @click="goProfileEdit">프로필 설정</button>
      
    </aside>

    <section class="content-section">
      <div class="tabs">
        <div
          :class="['tab', { active: tab === 'myReviews' }]"
          @click="tab = 'myReviews'"
        >
          내 리뷰 관리
        </div>
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
      </div>

      <div class="tab-content">
        
        <div v-if="tab === 'myReviews'">
          <div v-if="myReviews.length === 0" style="color: #888; text-align: center; padding: 20px;">
            작성한 리뷰가 없습니다.
          </div>
          <div 
            v-for="review in myReviews" 
            :key="review.boardId" 
            @click="router.push(`/board/${review.boardId}`)"
            style="display: flex; gap: 15px; border-bottom: 1px solid #eee; padding: 15px 0; cursor: pointer;"
          >
            <img 
              v-if="review.saveFile" 
              :src="`http://localhost:8080/upload/${review.saveFile}`" 
              style="width: 100px; height: 75px; object-fit: cover; border-radius: 6px; background: #eee;"
            />
            <div v-else style="width: 100px; height: 75px; background: #f0f0f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #aaa;">
              이미지 없음
            </div>

            <div style="flex: 1;">
              <h4 style="margin: 0 0 6px 0; font-size: 16px;">{{ review.title }}</h4>
              <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                <span style="color: #f39c12; font-weight: bold;">⭐ {{ review.rating }}</span> 
                &nbsp;|&nbsp; 조회수 {{ review.hit }}
              </div>
              <div style="font-size: 12px; color: #999;">
                {{ review.registDate ? review.registDate.split(' ')[0] : '' }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'likedReviews'">
          <p style="color: #888; text-align: center; padding: 20px;">준비 중인 기능입니다.</p>
        </div>

        <div v-if="tab === 'savedPlaces'">
          <div v-if="savedPlaces.length === 0" style="color: #888; text-align: center; padding: 20px;">
            저장한 관광지가 없습니다.
          </div>
          <div 
            v-for="place in savedPlaces" 
            :key="place.bookmarkId"
            @click="router.push(`/attraction/${place.contentId}`)" 
            style="display: flex; gap: 15px; border-bottom: 1px solid #eee; padding: 15px 0; cursor: pointer;"
          >
            <img 
              v-if="place.firstImage" 
              :src="place.firstImage" 
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 1px solid #eee;"
            />
            <div v-else style="width: 80px; height: 80px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #aaa;">
              No Image
            </div>

            <div style="display: flex; flex-direction: column; justify-content: center;">
              <h4 style="margin: 0 0 5px 0; font-size: 16px;">{{ place.title }}</h4>
              <p style="margin: 0; font-size: 13px; color: #666;">📍 {{ place.addr1 }}</p>
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
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios"; 
  import FollowModal from "@/pages/FollowModal.vue"; 
  
  const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
  });
  
  const router = useRouter();
  
  // 모달 관련 상태
  const showModal = ref(false);
  const modalType = ref("follower");
  
  // ★ 데이터 저장용 변수 추가
  const myReviews = ref([]);
  const savedPlaces = ref([]);
  
  const goProfileEdit = () => {
    router.push("/mypage/profile-edit"); 
  };
  
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
  
  onMounted(() => {
    fetchUserInfo();
    fetchMyActivity(); // ★ 추가된 함수 호출
  });
  
  // ★ 내 리뷰 & 저장한 관광지 불러오기
  const fetchMyActivity = async () => {
      try {
          // 1. 내 리뷰 가져오기
          const reviewRes = await api.get("/api/mypage/review");
          myReviews.value = reviewRes.data;
  
          // 2. 저장한 관광지 가져오기
          const bookmarkRes = await api.get("/api/mypage/bookmark");
          savedPlaces.value = bookmarkRes.data;
  
      } catch (error) {
          console.error("데이터 로딩 실패:", error);
      }
  };
  
  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/user/info");
      const userInfo = response.data;
      
      user.value.userId = userInfo.userId;
      user.value.nickname = userInfo.nickName;
      user.value.email = userInfo.email;
      user.value.bio = userInfo.introduction; 
  
      if (userInfo.profileImg) {
        user.value.profileImg = `http://localhost:8080${userInfo.profileImg}`;
      } else {
        user.value.profileImg = ""; 
      }
  
      fetchFollowCounts(userInfo.userId);
      
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 204)) {
        alert("로그인이 필요합니다.");
        router.push("/login"); 
      } else {
        console.error("회원 정보 조회 오류:", error);
      }
    }
  };
  
  const fetchFollowCounts = async (userId) => {
    try {
      const res = await api.get(`/follow/count/${userId}`);
      user.value.followers = res.data.followerCnt;
      user.value.following = res.data.followingCnt;
    } catch (error) {
      console.error("팔로우 카운트 조회 실패:", error);
    }
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
</style>