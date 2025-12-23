<template>
  <div class="rating-container">
    <div class="stars">
      <span
        v-for="i in 5"
        :key="i"
        class="star"
        :class="{
          full: displayValue >= i,
          half: displayValue === i - 0.5,
        }"
        @mousemove="setHover(i, $event)"
        @mouseleave="clearHover"
        @click="setRating(i, $event)"
      >
        ★
      </span>
    </div>

    <p class="result">점수: {{ modelValue.toFixed(1) }} / 5.0</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Number,
});
const emit = defineEmits(["update:modelValue"]);

const score = ref(props.modelValue ?? 0);

watch(score, (v) => emit("update:modelValue", v));

const hoverValue = ref(null);

// 마우스 올렸을 때 임시 표시될 값 or 실제 값
const displayValue = computed(() => (hoverValue.value !== null ? hoverValue.value : props.modelValue));

// ⭐ 커서 위치 기반 정확한 반별/전별 판정
const getHalfOrFull = (i, e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  return x < rect.width / 2 ? i - 0.5 : i;
};

// hover
const setHover = (i, e) => {
  hoverValue.value = getHalfOrFull(i, e);
};
const clearHover = () => {
  hoverValue.value = null;
};

// click → 값 확정
const setRating = (i, e) => {
  emit("update:modelValue", getHalfOrFull(i, e));
};
</script>

<style scoped>
.rating-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 6px;
  cursor: pointer;
}

.star {
  font-size: 38px;
  color: #d4d8e3; /* 기본 회색 */
  transition: 0.12s;
  user-select: none;
}

/* ⭐ 완전 채워진 별 */
.star.full {
  color: #ffd600;
}

/* ⭐ 반만 채워진 별 (마스크 기반) */
.star.half {
  background: linear-gradient(90deg, #ffd600 50%, #d4d8e3 50%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.result {
  font-size: 16px;
}
</style>
