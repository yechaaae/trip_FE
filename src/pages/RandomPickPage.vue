<template>
  <div class="random-page">
    <!-- 타이틀 영역: 드롭다운과 조사를 자연스럽게 통합 -->
    <h1 class="title">
      <div class="dropdown-wrapper">
        <select v-model="selectedCategory" class="title-select" :disabled="isSpinning">
          <option value="12">🏖️ 관광지</option>
          <option value="15">🎉 축제</option>
          <option value="32">🏨 숙소</option>
          <option value="39">🍱 음식점</option>
        </select>
        <!-- 드롭다운임을 알리는 화살표 아이콘 추가 -->
        <span class="select-arrow">▼</span>
      </div>
      <!-- 선택된 카테고리에 따라 '를/을' 자동 변경 -->
      <span class="josa">{{ josaText }} 뽑아볼까요?</span>
    </h1>

    <!-- 1. 뽑기 진행 섹션 -->
    <div v-if="!pickedPlace" class="draw-section">
      <div class="machine-container">
        <GachaMachine ref="gachaRef" @finish="onAnimationFinish" />
      </div>
      
      <!-- 버튼 정렬을 위한 래퍼: 가챠 머신 아래 중앙 정렬 -->
      <div class="button-wrapper">
        <button v-if="!isSpinning" class="main-draw-btn" @click="handleStartPick">
          ✨ 결과 확인하기
        </button>
        <div v-else class="status-box">
          <p class="status-msg">가장 멋진 곳을 고르고 있어요...</p>
          <div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>
        </div>
      </div>
    </div>

    <!-- 2. 결과 출력 섹션 -->
    <div v-else class="result-section">
      <div class="card-reveal">
        <PlaceCard :place="pickedPlace" />
      </div>
      <!-- 결과 페이지 버튼 정렬 래퍼 -->
      <div class="button-wrapper">
        <button class="retry-btn" @click="reset">🔄 다시 선택하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import GachaMachine from "@/components/GachaMachine.vue";
import PlaceCard from "@/components/PlaceCard.vue";
import { getTravelRecommendation } from "@/api/ai";

const gachaRef = ref(null);
const isSpinning = ref(false);
const pickedPlace = ref(null);
const tempResponse = ref(null);
const selectedCategory = ref("12"); // 기본값: 관광지

/** * 카테고리별 조사 선택 로직
 * '음식점'(39)은 받침이 있으므로 '을'을 사용하고, 
 * 나머지는 '를'을 사용하도록 처리합니다.
 */
const josaText = computed(() => {
  return selectedCategory.value === "39" ? "을" : "를";
});

const handleStartPick = async () => {
  isSpinning.value = true;
  pickedPlace.value = null;
  gachaRef.value.startDraw();

  try {
    const res = await getTravelRecommendation({ 
      contentTypeId: selectedCategory.value 
    });
    
    let rawData = res.recommendation;
    if (rawData.includes("```")) {
      rawData = rawData.replace(/```json|```/g, "").trim();
    }

    const data = JSON.parse(rawData);
    tempResponse.value = {
      id: data.id,
      title: data.title,
      description: data.description,
      addr: data.addr,
      image: data.image
    };
  } catch (e) {
    alert("데이터를 가져오지 못했습니다.");
    reset();
  }
};

const onAnimationFinish = () => {
  if (tempResponse.value) pickedPlace.value = tempResponse.value;
  isSpinning.value = false;
};

const reset = () => {
  pickedPlace.value = null;
  tempResponse.value = null;
  isSpinning.value = false;
};
</script>

<style scoped>
.random-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh; /* 전체적인 수직 높이 소폭 축소 */
  padding: 20px;
}

/* 타이틀 스타일: 전체적인 사이즈 축소 */
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 1.4rem; 
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.dropdown-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.title-select {
  appearance: none; /* 기본 화살표 숨김 */
  background: #f0f4ff;
  border: 1.5px solid #4f7cff;
  border-radius: 8px;
  padding: 2px 28px 2px 10px; /* 화살표 자리를 위해 오른쪽 패딩 확보 */
  font-size: 1.2rem; 
  font-weight: 800;
  color: #4f7cff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  text-align: center;
}

/* 커스텀 화살표 아이콘 */
.select-arrow {
  position: absolute;
  right: 10px;
  font-size: 0.7rem;
  color: #4f7cff;
  pointer-events: none; /* 클릭 이벤트가 select 박스로 전달되도록 설정 */
}

.title-select:hover:not(:disabled) {
  background: #4f7cff;
  color: white;
  transform: translateY(-1px);
}

.title-select:hover + .select-arrow {
  color: white; /* 호버 시 화살표 색상도 변경 */
}

.title-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.josa {
  font-weight: 600;
  color: #4a5568;
}

/* 섹션 공통 정렬 */
.draw-section, .result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.machine-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 버튼 정렬 래퍼: 버튼을 가이드라인에 맞춰 중앙 정렬 */
.button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 60px;
}

/* 버튼 스타일: 컴팩트한 사이즈로 조정 */
.main-draw-btn, .retry-btn {
  padding: 10px 30px; 
  font-size: 0.95rem; 
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
}

/* 메인 뽑기 버튼 */
.main-draw-btn {
  color: white;
  background: linear-gradient(135deg, #4f7cff 0%, #2563eb 100%);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
}

/* 다시 뽑기 버튼 */
.retry-btn {
  color: #4f7cff;
  background-color: white;
  border: 1.5px solid #4f7cff;
  box-shadow: 0 2px 6px rgba(79, 124, 255, 0.08);
}

.main-draw-btn:hover, .retry-btn:hover {
  transform: translateY(-2px) scale(1.02);
}

/* 결과 카드 애니메이션 정렬 */
.card-reveal {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
  animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.95) translateY(15px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* 로딩 상태 정렬 */
.status-box { 
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center; 
}
.status-msg { font-size: 0.85rem; color: #718096; margin-bottom: 4px; }
.loading-dots span {
  animation: blink 1.4s infinite both;
  font-size: 1.1rem;
  color: #4f7cff;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 100% { opacity: 0.2; } 20% { opacity: 1; } }
</style>