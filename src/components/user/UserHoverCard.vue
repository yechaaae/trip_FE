<template>
  <span class="user-hover" @mouseenter="show = true" @mouseleave="show = false" @click="goProfile">
    {{ user.nickname }}

    <div v-if="show" class="tooltip">
      <div class="nickname">{{ user.nickname }}</div>
      <div class="info">
        🏅 {{ user.badges }} 뱃지<br />
        ✍️ {{ user.reviews }} 리뷰
      </div>
      <div class="hint">프로필 보기</div>
    </div>
  </span>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const show = ref(false);

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const goProfile = () => {
  router.push(`/user/${props.user.id}`);
};
</script>

<style scoped>
.user-hover {
  position: relative;
  cursor: pointer;
  font-weight: 600;
}

.tooltip {
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font-size: 13px;
  white-space: nowrap;
  z-index: 100;
}

.tooltip .nickname {
  font-weight: 700;
  margin-bottom: 4px;
}

.tooltip .hint {
  margin-top: 6px;
  font-size: 12px;
  color: #4b7bff;
}
</style>
