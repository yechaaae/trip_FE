<template>
  <div class="top-rank-container">
    <div v-for="(user, index) in top3" :key="user.id" class="rank-card" :class="rankClass(index)">
      <!-- 메달 -->
      <div class="medal">
        <span v-if="index === 0">👑</span>
        <span v-else-if="index === 1">🥈</span>
        <span v-else>🥉</span>
      </div>

      <!-- 닉네임 (hover + click) -->
      <div class="nickname">
        <UserHoverCard
          :user="{
            id: user.id,
            nickname: user.nickname,
            badges: user.badges ?? 0,
            reviews: user.reviews ?? user.value,
          }"
        />
      </div>

      <!-- 값 -->
      <div class="value">{{ user.value }} {{ valueLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import UserHoverCard from "@/components/user/UserHoverCard.vue";

defineProps({
  top3: {
    type: Array,
    required: true,
  },
  valueLabel: {
    type: String,
    required: true,
  },
});

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

/* 컬러 */
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
