<template>
  <!-- Top 3 카드 영역 -->
  <TopRankCard :top3="top3" value-label="뱃지" />

  <!-- 4위부터 랭킹 테이블 -->
  <RankingTable :list="restList" value-label="뱃지 수" :start-rank="4" />
</template>

<script setup>
import TopRankCard from "@/components/ranking/TopRankCard.vue";
import RankingTable from "@/components/ranking/RankingTable.vue";

/**
 * TODO
 * - API 연동 시 서버 데이터로 교체
 * - value = 뱃지 개수
 */

const rankingList = [
  { id: 1, nickname: "수집왕", value: 24 },
  { id: 2, nickname: "여행덕후", value: 19 },
  { id: 3, nickname: "뱃지헌터", value: 15 },
  { id: 4, nickname: "주말여행러", value: 12 },
  { id: 5, nickname: "혼행족", value: 9 },
];

const top3 = rankingList.slice(0, 3);
const restList = rankingList.slice(3);
</script>
