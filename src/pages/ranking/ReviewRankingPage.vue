<template>
  <div class="ranking-page">
    <!-- Top 3 카드 영역 -->
    <TopRankCard :top3="top3" value-label="리뷰 수" />

    <!-- 4위부터 랭킹 테이블 -->
    <RankingTable :list="restList" value-label="리뷰 수" :start-rank="4" />
  </div>
</template>

<script setup>
import TopRankCard from "@/components/ranking/TopRankCard.vue";
import RankingTable from "@/components/ranking/RankingTable.vue";
import { ref, onMounted } from "vue";
import axios from "axios";

const top3 = ref([]);
const restList = ref([]);

const fetchRankingData = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/ranking/reviews");
    const rankingList = response.data;

    top3.value = rankingList.slice(0, 3);
    restList.value = rankingList.slice(3);
  } catch (error) {
    console.error("리뷰 랭킹 데이터 로딩 실패:", error);
  }
};

onMounted(fetchRankingData);
</script>

<style scoped>
.ranking-page {
  display: flex;
  flex-direction: column;
  gap: 32px;

  /* ⭐ 컨텐츠 적을 때 바닥 여백 방지 */
  min-height: calc(100vh - 220px);
}
</style>
