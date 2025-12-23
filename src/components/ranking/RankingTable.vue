<template>
  <div class="ranking-table">
    <!-- 헤더 -->
    <div class="ranking-header">
      <span>순위</span>
      <span>사용자</span>
      <span class="value-col">{{ valueLabel }}</span>
    </div>

    <!-- 랭킹 리스트 -->
    <div v-for="(user, index) in list" :key="user.nickname" class="ranking-row">
      <span class="rank">{{ startRank + index }}</span>

      <!-- UserHoverCard -->
      <UserHoverCard :user="user" />

      <span class="count">{{ user.value }}</span>
    </div>
  </div>
</template>

<script setup>
import UserHoverCard from "@/components/user/UserHoverCard.vue";

defineProps({
  list: Array,
  valueLabel: String,
  startRank: Number,
});
</script>

<style scoped>
/* =========================
   TABLE WRAPPER
========================= */
.ranking-table {
  margin-top: 12px;
}

/* =========================
   HEADER
========================= */
.ranking-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  padding: 12px 18px;
  align-items: center;

  font-size: 13px;
  font-weight: 600;
  color: #64748b;

  border-bottom: 1px solid #e5e7eb;
}

/* =========================
   ROW
========================= */
.ranking-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  padding: 16px 18px;
  align-items: center;

  background: #ffffff;
  border-radius: 14px;
  margin-top: 10px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ranking-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* =========================
   RANK
========================= */
.rank {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
}

/* =========================
   VALUE
========================= */
.count {
  text-align: right;
  font-weight: 700;
  font-size: 15px;
  color: #334155;
}

/* 헤더 value 정렬 */
.value-col {
  text-align: right;
}

/* =========================
   MOBILE
========================= */
@media (max-width: 768px) {
  .ranking-header,
  .ranking-row {
    grid-template-columns: 56px 1fr 80px;
    padding: 14px;
  }

  .rank {
    font-size: 16px;
  }

  .count {
    font-size: 14px;
  }
}
</style>
