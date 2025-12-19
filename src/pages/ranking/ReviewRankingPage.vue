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

    top3.value = rankingList.slice(0, 3); // 상위 3명
    restList.value = rankingList.slice(3); // 나머지
  } catch (error) {
    console.error("리뷰 랭킹 데이터 로딩 실패:", error);
  }
};

onMounted(() => {
  fetchRankingData(); // 페이지가 로드되면 데이터를 불러옵니다.
});
</script>
