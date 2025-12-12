<template>
  <div class="home-container">
    <section class="map-section">
      <div class="map-wrapper">
        <MapView />
      </div>
    </section>

    <aside class="badge-section">
      <h2>🏅 나의 뱃지함</h2>
      <div class="badge-list">
        <div class="badge-item" v-for="n in 12" :key="n">
          <div class="badge-circle"></div>
          <p>뱃지 {{ n }}</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
    import MapView from "@/components/MapView.vue"
</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 60px); // 네비바 높이 제외
}

/* 왼쪽 지도 */
.map-section {
  flex: 7;
  border-right: 1px solid #e5e5e5;
  display: flex;            /* 지도 wrapper가 부모 높이를 받을 수 있게 */
}

/* 지도 wrapper (MapView가 들어가는 자리) */
.map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}

/* 오른쪽 뱃지 보관함 */
.badge-section {
  flex: 2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  h2 {
    margin-bottom: 18px;
    font-size: 22px;
  }

  .badge-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .badge-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #dbe6ff;
    }

    p {
      font-size: 14px;
      margin-top: 6px;
    }
  }
}
</style>
