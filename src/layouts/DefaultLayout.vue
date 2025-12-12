<template>
  <div class="layout">
    <NavBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
main {
  flex: 1;
}
</style>
