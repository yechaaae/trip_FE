<template>
  <div class="gacha-wrapper">
    <div
      class="capsule"
      :class="{ spin: isSpinning }"
    >
      🎁
    </div>

    <button
      class="spin-btn"
      :disabled="isSpinning"
      @click="$emit('spin')"
    >
      {{ isSpinning ? "뽑는 중..." : "캡슐 뽑기!" }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  isSpinning: Boolean,
});
</script>

<style scoped>
.gacha-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.capsule {
  font-size: 80px;
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.capsule.spin {
  animation: shake 0.3s infinite;
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
  100% { transform: rotate(0deg); }
}

.spin-btn {
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  background: #4f8cff;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
</style>
