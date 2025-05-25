<!-- src/App.vue -->
<template>
  <div class="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<style>
/* #app 바로 밑 wrapper도 풀스크린을 물려받도록 */
.app {
  width: 100vw;
  height: 100vh;
}
</style>
