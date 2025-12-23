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

          <div class="category-wrapper">
            <div class="category-box" @click="toggleDropdown">
              {{ selectedCategory.label }}
              <span class="arrow" :class="{ open: dropdownOpen }">⌄</span>
            </div>

            <ul v-if="dropdownOpen" class="dropdown">
              <li v-for="c in categories" :key="c.type" @click="selectCategory(c)">
                {{ c.label }}
              </li>
            </ul>
          </div>
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
      firstimage: item.firstimage || item.firstImage || "/tmpimg.png",
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
/* ===================
   PAGE
=================== */
.area-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 26px 18px;
}

/* ===================
   AREA CAROUSEL
=================== */
.area-scroll {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;

  padding: 12px 16px;
  background: #f1f5ff;
  border-radius: 14px;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.nav-btn {
  border: none;
  background: #ffffff;
  font-size: 24px;
  cursor: pointer;
  color: #4c6f89;

  width: 42px;
  height: 42px;
  border-radius: 50%;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: 0.2s ease;

  &:hover {
    background: #e6efff;
    transform: scale(1.05);
  }
}

.scroll-wrapper {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px;

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.area-item {
  flex-shrink: 0;
  width: 100px;

  padding: 10px 8px;
  border-radius: 12px;
  background: #ffffff;

  text-align: center;
  cursor: pointer;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: 0.25s;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.area-item:hover {
  transform: translateY(-4px);
  background: #eef4ff;
}

.area-item.active {
  border: 2px solid #3d81ff;
  background: #e1ecff;
}

.area-item img {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #eceff5;
  margin-bottom: 8px;
}

.area-item span {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* ===================
   TITLE + CONTROLS
=================== */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-left h2 {
  font-size: 24px; /* 🔥 밀도 완화 */
  font-weight: 700;
  margin: 0;
  color: #2b2f33;
}

/* ===================
   CATEGORY DROPDOWN
=================== */
.category-wrapper {
  position: relative; /* 🔥 기준점 */
}

.category-box {
  padding: 8px 14px;
  border: 1px solid #c6d6ff;
  border-radius: 999px;
  cursor: pointer;

  font-size: 15px;
  font-weight: 600;
  color: #3d81ff;

  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;

  transition: background 0.2s ease;
}

.category-box:hover {
  background: #eef4ff;
}

.category-box .arrow {
  font-size: 14px;
  transition: transform 0.25s ease;
}

.category-box .arrow.open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;

  width: 160px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #d7dbe6;

  list-style: none;
  padding: 6px 0;
  margin: 0;

  z-index: 9999;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}

.dropdown li {
  padding: 10px 14px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown li:hover {
  background: #eef4ff;
}

/* ===================
   SEARCH
=================== */
.search-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;

  background: #eef4ff;
  color: #3d81ff;
  font-size: 16px;
  cursor: pointer;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    width: 220px;
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid #cfd6e6;
    font-size: 14px;
  }

  button {
    height: 36px;
    padding: 0 16px;
    border-radius: 999px;
    border: none;
    background: #3d81ff;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
}

/* ===================
   RECOMMEND
=================== */
.recommend-box {
  background: #f4f7ff;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 26px;
  color: #555;

  display: flex;
  align-items: center;
  gap: 10px;

  .tag {
    background: #6c8cff;
    color: #ffffff;
    padding: 4px 10px;
    font-size: 13px;
    border-radius: 6px;
  }
}

/* ===================
   CARDS
=================== */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 🔥 4 → 3 */
  gap: 24px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;

  border: 1px solid #e0e4ee;
  transition: 0.25s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
}

.thumbnail {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-color: #d9e3f5;
  margin-bottom: 12px;
}

.info h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.info p {
  font-size: 14px;
  color: #666;
}

/* ===================
   PAGINATION
=================== */
.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;

  button {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #cfd6e6;
    background: #ffffff;
    cursor: pointer;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 15px;
    font-weight: 600;
  }
}

/* ===================
   SEARCH TRANSITION
=================== */
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
