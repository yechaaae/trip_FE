<template>
  <div class="top-rank-container">
    <div v-for="(user, index) in top3" :key="user.nickname" class="rank-card" :class="rankClass(index)">
      <div class="medal">
        <span v-if="index === 0">👑</span>
        <span v-else-if="index === 1">🥈</span>
        <span v-else>🥉</span>
      </div>

      <!-- UserHoverCard 추가 -->
      <UserHoverCard :user="user" />

      <div class="value">{{ user.value }} {{ valueLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserHoverCard from "@/components/user/UserHoverCard.vue"; // UserHoverCard 경로 확인

// props for receiving data from parent component
const props = defineProps({
  top3: Array,
  valueLabel: String,
});

// rankClass method to dynamically assign classes based on ranking
const rankClass = (index) => {
  if (index === 0) return "first";
  if (index === 1) return "second";
  return "third";
};
</script>

<style scoped>
.top-rank-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 5px;
  align-items: stretch;
}

/* =========================
   공통 카드
========================= */
.rank-card {
  padding: 24px 20px 22px;
  border-radius: 18px;
  text-align: center;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* hover 공통 */
.rank-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* =========================
   메달
========================= */
.medal {
  font-size: 30px;
  margin-bottom: 10px;
}

/* =========================
   값
========================= */
.value {
  margin-top: 6px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

/* =========================
   1등 (중앙, 강조)
========================= */
.first {
  order: 2; /* ⭐ 중앙 */
  background: #fff7d6;

  transform: translateY(-6px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12);
}

.first .medal {
  font-size: 34px;
}

.first .value {
  font-weight: 600;
}

/* =========================
   2등 (왼쪽)
========================= */
.second {
  order: 1;
  background: #f4f6f8;
  opacity: 0.95;
}

/* =========================
   3등 (오른쪽)
========================= */
.third {
  order: 3;
  background: #fff2e8;
  opacity: 0.95;
}

/* =========================
   반응형
========================= */
@media (max-width: 768px) {
  .top-rank-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .first,
  .second,
  .third {
    order: unset;
    transform: none;
  }
}
</style>
