<template>
  <div class="lottery-wrapper">
    <div class="lottery-container">
      <div class="lottery-machine-wrapper">
        <div class="lottery-circle">
          <div class="glass-overlay"></div>
          
          <div 
            v-for="(ball, index) in balls" 
            :key="index"
            class="ball"
            :class="{ 
              'is-winner': winningIndex === index, 
              'dimmed': winningIndex !== null && winningIndex !== index 
            }"
            :style="getBallStyle(ball, index)"
          >
            {{ ball.label }}
          </div>
        </div>
      </div>

      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['finish']);
// 상수 설정
const labels = ["", "", "", "", "", "", "", ""];
const ballSize = 46;
const containerSize = 320;
const center = containerSize / 2; // 컨테이너 중심 (160)
const radiusLimit = center - (ballSize / 2) - 12; // 공이 벽에 닿는 한계선

// 상태 변수
const isDrawing = ref(false);
const winningIndex = ref(null);
let animationId = null;

// 공 데이터 초기화
const balls = reactive(labels.map(label => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radiusLimit;
  return {
    label,
    x: r * Math.cos(angle), // 중심으로부터의 상대 x
    y: r * Math.sin(angle), // 중심으로부터의 상대 y
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6
  };
}));

// 공 물리 엔진 (위치 업데이트)
const updatePositions = () => {
  balls.forEach((ball, idx) => {
    // 당첨된 공은 물리 엔진 정지
    if (winningIndex.value === idx) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // 원형 벽 충돌 체크
    const dist = Math.sqrt(ball.x * ball.x + ball.y * ball.y);
    
    if (dist > radiusLimit) {
      const nx = ball.x / dist; // 법선 벡터
      const ny = ball.y / dist;
      const dot = ball.vx * nx + ball.vy * ny;

      // 반사 및 에너지 손실
      ball.vx = (ball.vx - 2 * dot * nx) * 0.8;
      ball.vy = (ball.vy - 2 * dot * ny) * 0.8;

      // 경계 밖으로 나가지 않게 고정
      ball.x = nx * radiusLimit;
      ball.y = ny * radiusLimit;
    }

    // 미세한 무작위 움직임 부여
    ball.vx += (Math.random() - 0.5) * 0.2;
    ball.vy += (Math.random() - 0.5) * 0.2;
  });
  animationId = requestAnimationFrame(updatePositions);
};

// 인라인 스타일 계산
const getBallStyle = (ball, idx) => {
  let tx, ty;
  
  if (winningIndex.value === idx) {
    tx = center - (ballSize / 2);
    ty = center - (ballSize / 2);
  } else {
    tx = center + ball.x - (ballSize / 2);
    ty = center + ball.y - (ballSize / 2);
  }

  return {
    transform: `translate(${tx}px, ${ty}px)`
  };
};

// 추첨 시작 기능
const startDraw = () => {
  isDrawing.value = true;
  winningIndex.value = null;

  // 1. 공 가속 (섞기)
  balls.forEach(ball => {
    ball.vx = (Math.random() - 0.5) * 40;
    ball.vy = (Math.random() - 0.5) * 40;
  });

  // 2. 2초 후 당첨자 선정
  setTimeout(() => {
    winningIndex.value = Math.floor(Math.random() * balls.length);
    
    // 나머지 공들 감속
    balls.forEach((ball, idx) => {
      if(idx !== winningIndex.value) {
        ball.vx *= 0.2;
        ball.vy *= 0.2;
      }
    });

    setTimeout(() => {
      isDrawing.value = false;
      emit('finish');
    }, 1000);
  }, 2000);
};

// 라이프사이클 훅
onMounted(() => {
  updatePositions();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});

defineExpose({startDraw});
</script>

<style scoped>
/* 변수 설정 */
.lottery-wrapper {
  --primary-blue: #4f7cff;
  --primary-blue-dark: #2563eb;
  --text-color: #333;
  --bg-color: #f8fafc;
  --machine-border: #e2e8f0;
  --machine-bg: radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f4ff 60%, #dbeafe 100%);
  
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-family: system-ui, sans-serif;
}

.lottery-container {
  text-align: center;
  perspective: 1000px;
}

.lottery-machine-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 0 auto 32px;
}

.lottery-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--machine-bg);
  border: 10px solid var(--machine-border);
  overflow: hidden; 
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.1),
    inset 0 10px 30px rgba(0, 0, 0, 0.05),
    inset 0 -15px 40px rgba(79, 124, 255, 0.15);
  z-index: 1;
}

.glass-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
  pointer-events: none;
  z-index: 5;
}

.ball {
  position: absolute;
  top: 0;
  left: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffffff 0%, var(--primary-blue) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: opacity 0.4s ease;
  will-change: transform;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.ball.is-winner {
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), scale 0.8s ease;
  z-index: 100 !important;
  background: radial-gradient(circle at 35% 35%, #ffffff 0%, var(--primary-blue-dark) 100%);
  box-shadow: 0 0 40px rgba(37, 99, 235, 0.5);
  transform: translate(137px, 137px) scale(2.2) !important; /* 중앙 위치 보정 */
}

.ball.dimmed {
  opacity: 0.15;
  filter: grayscale(0.5);
}

.controls {
  margin-top: 10px;
}

.draw-btn {
  padding: 16px 48px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  background: var(--primary-blue);
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(79, 124, 255, 0.3);
  transition: all 0.3s ease;
}

.draw-btn:hover:not(:disabled) {
  background: var(--primary-blue-dark);
  transform: translateY(-2px);
}

.draw-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.result-panel {
  margin-top: 24px;
  height: 50px;
}

.result-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-blue-dark);
}

.winner-number {
  font-size: 1.8rem;
  margin-left: 10px;
}

/* Transitions */
.fade-up-enter-active {
  transition: all 0.5s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>