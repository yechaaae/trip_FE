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

    <!-- 🔹 지역명 + 카테고리 선택 -->
    <section class="place-list">

      <div class="title-row">
        <h2>{{ selectedArea.name }}</h2>

        <div class="category-box" @click="toggleDropdown">
          {{ selectedCategory.label }}
          <span class="arrow" :class="{ open: dropdownOpen }">⌄</span>
        </div>

        <ul v-if="dropdownOpen" class="dropdown">
          <li
            v-for="c in categories"
            :key="c.type"
            @click="selectCategory(c)"
          >
            {{ c.label }}
          </li>
        </ul>
      </div>

      <!-- 🔹 추천 -->
      <div class="recommend-box">
        <span class="tag">추천</span>
        {{ selectedArea.name }} 인기 {{ selectedCategory.label }} 보기 →
      </div>

      <!-- 🔹 카드 목록 -->
      <div class="cards">
        <div
          class="card"
          v-for="item in places"
          :key="item.contentid"
          @click="goDetail(item.contentid)"
        >
          <!-- ⭐ 이미지 없을 때 fallback 적용 -->
          <div
            class="thumbnail"
            :style="{ backgroundImage: `url(${item.firstimage || '/tmpimg.png'})` }"
          ></div>

          <div class="info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.addr1 || "설명 예시 텍스트입니다." }}</p>
          </div>
        </div>
      </div>

      <!-- 🔹 페이지네이션 -->
      <div class="pagination" v-if="totalCount > numOfRows">
        <button
          :disabled="pageNo === 1"
          @click="pageNo--, fetchPlaces()"
        >
          이전
        </button>

        <span>
          {{ pageNo }} /
          {{ Math.ceil(totalCount / numOfRows) }}
        </span>

        <button
          :disabled="pageNo >= Math.ceil(totalCount / numOfRows)"
          @click="pageNo++, fetchPlaces()"
        >
          다음
        </button>
      </div>


    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { areas } from "@/data/areas";
import { getAttractionList } from "@/api/attraction";

const router = useRouter();

// ⭐ 상태값
const selectedArea = ref(areas[0]);
const places = ref([]);
const pageNo = ref(1);
const totalCount = ref(0);
const numOfRows = 20;

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
    const areaCode = selectedArea.value.code;

    const { data } = await getAttractionList(
      areaCode, // null이면 전국
      selectedCategory.value.typeId,
      pageNo.value,
      numOfRows
    );

    const body = data?.response?.body;
    const items = body?.items?.item;

    places.value = Array.isArray(items) ? items : [];
    totalCount.value = body?.totalCount || 0;

  } catch (error) {
    console.error("❌ 관광지 API 호출 실패:", error);
    places.value = [];
  }
};


// ⭐ 지역 선택 시
const selectArea = (area) => {
  selectedArea.value = area;
  pageNo.value = 1;
  fetchPlaces();
};

// ⭐ 카테고리 드롭다운
const dropdownOpen = ref(false);
const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value);

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

/* 🔹 캐러셀 */
.area-scroll {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
}

.nav-btn {
  border: none;
  background: none;
  font-size: 32px;
  cursor: pointer;
  color: #777;
  padding: 0 4px;
}

.scroll-wrapper {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px;
}

.area-item {
  flex-shrink: 0;
  width: 82px;
  text-align: center;
  cursor: pointer;
  transition: 0.25s;

  img {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    background: #eceff5;
  }

  span {
    display: block;
    margin-top: 6px;
    font-size: 15px;
  }
}

.area-item.active {
  transform: scale(1.08);
  font-weight: 700;
}

/* 🔹 제목 + 카테고리 */
.title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  position: relative;
}

.title-row h2 {
  font-size: 26px;
  font-weight: 700;
}

.category-box {
  padding: 8px 14px;
  border: 2px solid #bcd0ff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 6px;

  .arrow {
    font-size: 15px;
    margin-top: 1px;
    transition: 0.2s;
  }

  .arrow.open {
    transform: rotate(180deg);
  }
}

/* 🔹 드롭다운 */
.dropdown {
  position: absolute;
  top: 50px;
  left: 96px;
  width: 160px;
  background: white;
  border: 1px solid #d7d7d7;
  border-radius: 6px;
  z-index: 20;
  list-style: none;
  padding: 6px 0;
  margin: 0;

  li {
    padding: 10px 12px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      background: #eef4ff;
    }
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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.thumbnail {
  width: 100%;
  height: 140px;
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

</style>
