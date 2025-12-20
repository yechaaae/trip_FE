<template>
  <div class="card">
    <img :src="place.image" />
    <div class="info">
      <h3>{{ place.title }}</h3>
      <p>{{ place.addr }}</p>
      <router-link
        :to="`/place/${place.id}`"
        class="detail-btn"
      >
        상세 보기 →
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  place: Object,
});
</script>

<style scoped>
.card {
  width: 300px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info {
  padding: 16px;
}

.detail-btn {
  display: inline-block;
  margin-top: 10px;
  color: #4f8cff;
  font-weight: bold;
}
</style>
