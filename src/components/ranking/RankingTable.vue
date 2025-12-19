<template>
  <div class="ranking-container">
    <div class="ranking-header">
      <span>순위</span>
      <span>사용자</span>
      <span>{{ valueLabel }}</span>
    </div>

    <div v-for="(user, index) in list" :key="user.id" class="ranking-row">
      <!-- 순위 -->
      <span class="rank">{{ startRank + index }}</span>

      <!-- 사용자 (hover + click) -->
      <span class="nickname">
        <UserHoverCard
          :user="{
            id: user.id,
            nickname: user.nickname,
            badges: user.badges ?? 0,
            reviews: user.reviews ?? user.value,
          }"
        />
      </span>

      <!-- 값 -->
      <span class="count">{{ user.value }}</span>
    </div>
  </div>
</template>

<script setup>
import UserHoverCard from "@/components/user/UserHoverCard.vue";

defineProps({
  list: {
    type: Array,
    required: true,
  },
  valueLabel: {
    type: String,
    required: true,
  },
  startRank: {
    type: Number,
    default: 4,
  },
});
</script>

<style scoped>
.ranking-container {
  border-top: 1px solid #ddd;
}

.ranking-header,
.ranking-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  padding: 14px 16px;
  align-items: center;
}

.ranking-header {
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #ddd;
}

.ranking-row {
  border-bottom: 1px solid #eee;
}

.rank {
  font-size: 18px;
  font-weight: 700;
}

.count {
  text-align: right;
  font-weight: 600;
}

/* Top 3 */
.top1 {
  background-color: #fff7d6;
}
.top2 {
  background-color: #f4f6f8;
}
.top3 {
  background-color: #fff2e8;
}
</style>
