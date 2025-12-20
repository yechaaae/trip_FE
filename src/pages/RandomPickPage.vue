<template>
  <div class="random-page">
    <h1 class="title">🎲 오늘의 랜덤 여행지</h1>

    <GachaMachine
      :isSpinning="isSpinning"
      @spin="drawRandom"
    />

    <PlaceCard
      v-if="pickedPlace"
      :place="pickedPlace"
      class="result-card"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import GachaMachine from "@/components/GachaMachine.vue";
import PlaceCard from "@/components/PlaceCard.vue";

// 🔹 임시 더미 (나중에 API/AI로 교체)
const places = [
  { id: 1, title: "경주 불국사", addr: "경북 경주시", image: "/sample/1.jpg" },
  { id: 2, title: "부산 감천문화마을", addr: "부산 사하구", image: "/sample/2.jpg" },
  { id: 3, title: "전주 한옥마을", addr: "전북 전주시", image: "/sample/3.jpg" },
];

const isSpinning = ref(false);
const pickedPlace = ref(null);

const drawRandom = () => {
  isSpinning.value = true;
  pickedPlace.value = null;

  setTimeout(() => {
    const idx = Math.floor(Math.random() * places.length);
    pickedPlace.value = places[idx];
    isSpinning.value = false;
  }, 1800); // 가챠 연출 시간
};
</script>

<style scoped>
.random-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.title {
  margin-bottom: 30px;
}

.result-card {
  margin-top: 30px;
}
</style>
