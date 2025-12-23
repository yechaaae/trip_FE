<template>
  <div class="random-page">
    <h1 class="title">🎲 당일치기 랜덤 여행 추천</h1>

    <div v-if="aiResults.length === 0">
      <div class="theme-selector">
        <select v-model="selectedTheme">
          <option value="힐링">🌿 힐링/휴식</option>
          <option value="맛집">🍕 맛집 탐방</option>
          <option value="액티비티">🏃 액티비티</option>
          <option value="문화">🏛️ 역사/문화</option>
        </select>
      </div>
      <GachaMachine :isSpinning="isSpinning" @spin="drawRandom" />
    </div>

    <div v-if="aiResults.length > 0" class="result-container">
      <h2 class="sub-title">✨ 오늘의 추천 코스 (당일치기)</h2>
      <div class="card-grid">
        <div v-for="(place, index) in aiResults" :key="index" class="selectable-card" @click="selectPlace(place)">
          <div class="time-tag">{{ index === 0 ? "오전" : index === 1 ? "오후" : "저녁" }}</div>
          <PlaceCard :place="place" :class="{ active: pickedPlace?.title === place.title }" />
        </div>
      </div>
      <button class="reset-btn" @click="resetGacha">다시 뽑기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import GachaMachine from "@/components/GachaMachine.vue";
import PlaceCard from "@/components/PlaceCard.vue";
import { getTravelRecommendation } from "@/api/ai";

const isSpinning = ref(false);
const aiResults = ref([]); // 3개의 결과를 담을 배열
const selectedTheme = ref("힐링");
const pickedPlace = ref(null);

const drawRandom = async () => {
  isSpinning.value = true;
  aiResults.value = [];
  pickedPlace.value = null;

  try {
    const [response] = await Promise.all([
      getTravelRecommendation({ theme: selectedTheme.value }),
      new Promise((resolve) => setTimeout(resolve, 1800)), // 가챠 연출
    ]);

    // AI의 JSON 응답 파싱
    const rawData = JSON.parse(response.recommendation);

    // 기존 PlaceCard의 변수명에 맞게 매핑
    aiResults.value = rawData.map((item, idx) => ({
      id: idx,
      title: item.title,
      addr: item.addr,
      // 테마와 장소명을 결합한 랜덤 이미지
      image: `https://loremflickr.com/400/250/${item.title},landscape/all`,
    }));
  } catch (error) {
    console.error("AI 추천 파싱 실패:", error);
    alert("데이터를 가져오는 중 오류가 발생했습니다.");
  } finally {
    isSpinning.value = false;
  }
};

const selectPlace = (place) => {
  pickedPlace.value = place;
};

const resetGacha = () => {
  aiResults.value = [];
  pickedPlace.value = null;
};
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.card-grid {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}
.selectable-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}
.selectable-card:hover {
  transform: scale(1.05);
}
.time-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #4f8cff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  z-index: 10;
  font-size: 0.8rem;
}
.active {
  border: 4px solid #4f8cff;
  border-radius: 16px;
}
.reset-btn {
  margin-top: 40px;
  padding: 10px 30px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
</style>
