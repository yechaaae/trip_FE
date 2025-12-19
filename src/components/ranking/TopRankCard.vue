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
  gap: 16px;
  margin-bottom: 32px;
}

.rank-card {
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.medal {
  font-size: 28px;
  margin-bottom: 8px;
}

.nickname {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.value {
  font-size: 14px;
  color: #555;
}

.first {
  background: #fff7d6;
}

.second {
  background: #f4f6f8;
}

.third {
  background: #fff2e8;
}
</style>
