<template>
  <!-- Top 3 카드 영역 -->
  <TopRankCard :top3="top3" value-label="좋아요" />

  <!-- 4위부터 랭킹 테이블 -->
  <RankingTable :list="restList" value-label="좋아요 수" :start-rank="4" />
</template>

<script setup>
import TopRankCard from "@/components/ranking/TopRankCard.vue";
import RankingTable from "@/components/ranking/RankingTable.vue";

/**
 * TODO
 * - API 연동 시 서버 데이터로 교체
 * - value = 좋아요 받은 총합
 */

const rankingList = [
  { id: 1, nickname: "인기인", value: 310 },
  { id: 2, nickname: "핫플러", value: 255 },
  { id: 3, nickname: "공감왕", value: 198 },
  { id: 4, nickname: "리뷰마스터", value: 172 },
  { id: 5, nickname: "사진장인", value: 143 },
];

const top3 = rankingList.slice(0, 3);
const restList = rankingList.slice(3);
</script>
