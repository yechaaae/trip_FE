<template>
  <div class="ranking-table">
    <div class="ranking-header">
      <span>순위</span>
      <span>사용자</span>
      <span>{{ valueLabel }}</span>
    </div>

    <div v-for="(user, index) in list" :key="user.nickname" class="ranking-row">
      <span class="rank">{{ startRank + index }}</span>

      <!-- UserHoverCard 추가 -->
      <UserHoverCard :user="user" />

      <span class="count">{{ user.value }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserHoverCard from "@/components/user/UserHoverCard.vue"; // 경로 확인

// props for receiving data from parent component
const props = defineProps({
  list: Array,
  valueLabel: String,
  startRank: Number,
});
</script>

<style scoped>
.ranking-table {
  margin-top: 40px;
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

.nickname {
  font-weight: 500;
}

.count {
  text-align: right;
  font-weight: 600;
}
</style>
