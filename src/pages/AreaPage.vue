<template>
  <div class="area-page">
    <!-- 🔹 지역 선택 캐러셀 -->
    <div class="area-scroll">
      <button class="nav-btn" @click="scrollLeft">‹</button>

      <div class="scroll-wrapper" ref="scrollBox">
        <div
          class="area-item"
          v-for="area in areas"
          :key="area.code"
          :class="{ active: selectedArea.code === area.code }"
          @click="selectArea(area)"
        >
          <img :src="area.icon" @error="imgFallback" />
          <span>{{ area.name }}</span>
        </div>
      </div>

      <button class="nav-btn" @click="scrollRight">›</button>
    </div>

    <section class="place-list">
      <div class="title-row">
        <!-- 🔹 지역명 + 카테고리 선택 -->
        <div class="title-left">
          <h2>{{ selectedArea.name }}</h2>

          <div class="category-box" @click="toggleDropdown">
            {{ selectedCategory.label }}
            <span class="arrow" :class="{ open: dropdownOpen }">⌄</span>
          </div>

          <!-- 드롭다운 메뉴 -->
          <ul v-show="dropdownOpen" class="dropdown">
            <li v-for="c in categories" :key="c.type" @click="selectCategory(c)">
              {{ c.label }}
            </li>
          </ul>
        </div>

        <!-- ➡ 오른쪽: 검색 (A안: 아이콘 → 펼쳐짐) -->
        <div class="title-right">
          <!-- 🔍 아이콘 버튼 -->
          <button v-if="!searchOpen" class="search-icon-btn" @click="openSearch">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>

          <!-- 🔍 펼쳐지는 검색창 -->
          <transition name="search-slide">
            <div v-if="searchOpen" class="search-box">
              <input
                ref="searchInput"
                type="text"
                v-model="searchQuery"
                placeholder="관광지 검색"
                @keyup.enter="onSearch"
                @blur="closeSearch"
              />
              <button @click="onSearch">검색</button>
            </div>
          </transition>
        </div>
      </div>

      <!-- 🔹 추천 -->
      <div class="recommend-box">
        <span class="tag">추천</span>
        {{ selectedArea.name }} 인기 {{ selectedCategory.label }} 보기 →
      </div>

      <!-- 🔹 카드 목록 -->
      <div class="cards">
        <div class="card" v-for="item in places" :key="item.contentid" @click="goDetail(item.contentid)">
          <!-- ⭐ 이미지 없을 때 fallback 적용 -->
          <div class="thumbnail" :style="{ backgroundImage: `url(${item.firstimage || '/tmpimg.png'})` }"></div>

          <div class="info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.addr1 || "설명 예시 텍스트입니다." }}</p>
          </div>
        </div>
      </div>

      <!-- 🔹 페이지네이션 -->
      <div class="pagination" v-if="totalCount > numOfRows">
        <button :disabled="pageNo === 1" @click="pageNo--, fetchPlaces()">이전</button>

        <span>
          {{ pageNo }} /
          {{ Math.ceil(totalCount / numOfRows) }}
        </span>

        <button :disabled="pageNo >= Math.ceil(totalCount / numOfRows)" @click="pageNo++, fetchPlaces()">다음</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { areas } from "@/data/areas";
import { getAttractionList } from "@/api/attraction";
import { nextTick } from "vue";

const router = useRouter();

// ⭐ 상태값
const selectedArea = ref(areas[0]);
const places = ref([]);
const pageNo = ref(1);
const totalCount = ref(0);
const numOfRows = 20;
const searchOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);

// ⭐ 카테고리 목록
const categories = [
  { type: "travel", label: "여행지", typeId: 12 },
  { type: "festival", label: "축제", typeId: 15 },
  { type: "stay", label: "숙소", typeId: 32 },
  { type: "food", label: "음식점", typeId: 39 },
];
const selectedCategory = ref(categories[0]);

// ⭐ 상세페이지 이동
const goDetail = (id) => router.push(`/place/${id}`);

// ⭐ API 호출
const fetchPlaces = async () => {
  try {
    const { data } = await getAttractionList(
      selectedArea.value.code,
      selectedCategory.value.typeId,
      pageNo.value,
      numOfRows,
      searchQuery.value
    );

    let rawItems = [];

    // 1. DB 검색 결과인 경우 (data.items 존재)
    if (data.items) {
      rawItems = data.items;
      totalCount.value = data.totalCount || 0;
    }
    // 2. 외부 API 결과인 경우
    else {
      const body = data?.response?.body;
      const items = body?.items?.item;
      rawItems = Array.isArray(items) ? items : items ? [items] : [];
      totalCount.value = body?.totalCount || 0;
    }

    // ⭐ 중요: DB 데이터(camelCase)와 API 데이터(lowercase) 필드명 통일
    places.value = rawItems.map((item) => ({
      contentid: item.contentid || item.contentId,
      title: item.title,
      addr1: item.addr1,
      firstimage: item.firstimage || item.firstImage || "area/moabwa.png",
      latitude: item.latitude || item.mapy,
      longitude: item.longitude || item.mapx,
    }));
  } catch (error) {
    console.error("❌ 관광지 데이터 로드 실패:", error);
    places.value = [];
  }
};

// ⭐ 지역 선택 시
const selectArea = (area) => {
  selectedArea.value = area;
  pageNo.value = 1;
  fetchPlaces();
};

// 🔍 아이콘 클릭 → 검색창 열기 + 포커스
const openSearch = async () => {
  searchOpen.value = true;
  await nextTick();
  searchInput.value?.focus();
};

// 🔍 blur(포커스 아웃) 시 닫기: 입력값 없을 때만 닫기
const closeSearch = () => {
  if (!searchQuery.value.trim()) {
    searchOpen.value = false;
  }
};

// 🔍 검색 실행
const onSearch = () => {
  pageNo.value = 1; // 검색 시 첫 페이지로
  fetchPlaces();
};

// ⭐ 카테고리 드롭다운
const dropdownOpen = ref(false);
// 드롭다운 열기/닫기 함수
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value; // 상태 토글
};

const selectCategory = (c) => {
  selectedCategory.value = c;
  dropdownOpen.value = false;
  pageNo.value = 1;
  fetchPlaces();
};
// ⭐ 아이콘 이미지 fallback
const imgFallback = (e) => {
  e.target.src = "/tmpimg.png";
};

// ⭐ 캐러셀 이동
const scrollBox = ref(null);
const scrollLeft = () => scrollBox.value && (scrollBox.value.scrollLeft -= 200);
const scrollRight = () => scrollBox.value && (scrollBox.value.scrollLeft += 200);

// ⭐ 첫 로딩 시 자동 호출
onMounted(() => {
  fetchPlaces();
});
</script>

<style scoped lang="scss">
.area-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 26px 18px;
}

/* 🔹 지역 선택 캐러셀 */
.area-scroll {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  padding: 10px 0;
  background: #eaf2ff; /* 부드러운 배경색으로 수정 */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 🔹 네비게이션 버튼 (화살표) */
.nav-btn {
  border: none;
  background: none;
  font-size: 28px;
  cursor: pointer;
  color: #4c6f89;
  padding: 10px;
  transition: transform 0.3s ease;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    background: #d0e1f9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 🔹 지역 선택 아이템 - 아이콘 + 이름 */
.scroll-wrapper {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px;
}

.area-item {
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
  transition: 0.25s;
  padding: 6px;
  width: 110px; /* 너비 확장 */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 아이템 hover 효과 */
.area-item:hover {
  transform: scale(1.1);
  background: #eef4ff;
}

/* 활성화된 상태 */
.area-item.active {
  font-weight: 700;
  border: 2px solid #3d81ff;
  background-color: #d7e8ff;
}

/* 아이콘 크기 조정 */
.area-item img {
  width: 80px; /* 아이콘 크기 확장 */
  height: 80px; /* 아이콘 크기 확장 */
  border-radius: 50%;
  background: #eceff5;
  margin-bottom: 10px;
}

/* 텍스트 스타일 */
.area-item span {
  font-size: 14px;
  color: #333;
}

/* 🔹 스크롤바 숨기기 */
.scroll-wrapper {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.scroll-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 🔹 제목 + 카테고리 */
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  position: relative;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-left h2 {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* 전체(선택 지역) 스타일 개선 */
.title-left .selected-area {
  background: #eef4ff;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #3d81ff;
  cursor: pointer;
  transition: 0.3s ease;
}

.title-left .selected-area:hover {
  background: #d7e8ff;
  transform: scale(1.05);
}

/* 🔹 여행지 드롭다운 */
.category-box {
  padding: 10px 14px;
  border: 2px solid #bcd0ff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  width: max-content;
}

/* 드롭다운 아이콘 회전 효과 */
.category-box .arrow {
  font-size: 16px;
  transition: transform 0.3s ease; /* 부드러운 회전 */
}

.category-box .arrow.open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: 50px;
  left: 0;
  width: 160px;
  background: #fff;
  border: 1px solid #d7d7d7;
  border-radius: 6px;
  z-index: 1000;
  list-style: none;
  padding: 6px 0;
  margin: 0;

  /* 애니메이션용 */
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown[style*="display: block"] {
  opacity: 1;
  transform: translateY(0);
}

.dropdown li {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.dropdown li:hover {
  background: #eef4ff; /* 호버 시 배경색 변경 */
}

/* 드롭다운 열릴 때 애니메이션 */
@keyframes dropdown-slide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🔹 추천 박스 */
.recommend-box {
  background: #eef4ff;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 17px;
  margin-bottom: 26px;
  display: flex;
  align-items: center;
  gap: 10px;

  .tag {
    background: #3d81ff;
    color: white;
    padding: 5px 10px;
    font-size: 14px;
    border-radius: 6px;
  }
}

/* 🔹 카드 스타일 */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.card {
  border: 1px solid #d4d9e3;
  border-radius: 10px;
  background: #fff;
  padding: 14px;
  cursor: pointer;
  transition: 0.25s;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.thumbnail {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  background: #d9e3f5;
  margin-bottom: 12px;
  background-size: cover;
  background-position: center;
}

.info {
  h3 {
    font-size: 17px;
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    color: #555;
  }
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;

  button {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #cfd6e6;
    background: #fff;
    cursor: pointer;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 16px;
    font-weight: 600;
  }
}

.pagination button.active {
  background-color: #3d81ff;
  color: white;
}

.pagination button:hover {
  background-color: #eef4ff;
}

/* 🔍 아이콘 버튼 */
.search-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: #eef4ff;
  cursor: pointer;
  font-size: 16px;
  color: #3d81ff;
}

/* 🔍 검색창 */
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    width: 220px;
    height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid #cfd6e6;
    font-size: 15px;
  }

  button {
    height: 38px;
    padding: 0 16px;
    border-radius: 999px;
    border: none;
    background: #3d81ff;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
}

/* ✨ 슬라이드 애니메이션 */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.25s ease;
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
