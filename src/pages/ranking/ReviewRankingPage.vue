<template>
  <!-- Top3 카드 -->
  <TopRankCard :top3="top3" value-label="리뷰" />

  <!-- 4위부터 테이블 -->
  <RankingTable :list="restList" value-label="리뷰 수" :start-rank="4" />
</template>

<script setup>
import TopRankCard from "@/components/ranking/TopRankCard.vue";
import RankingTable from "@/components/ranking/RankingTable.vue";

const rankingList = [
  { id: 1, nickname: "여행왕", value: 128 },
  { id: 2, nickname: "부산러버", value: 96 },
  { id: 3, nickname: "혼행족", value: 72 },
  { id: 4, nickname: "맛집헌터", value: 55 },
  { id: 5, nickname: "주말여행러", value: 41 },
];

const top3 = rankingList.slice(0, 3);
const restList = rankingList.slice(3);
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
  transition: background-color 0.2s;
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

/* 🥇🥈🥉 Top 3 강조 */
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
