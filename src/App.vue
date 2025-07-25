<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Toolbar from './components/Toolbar.vue'
</script>

<template>
  <div class="app-container">
    <Toolbar />
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f6f8fa;
}
</style>
