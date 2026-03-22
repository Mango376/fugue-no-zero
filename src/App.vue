<template>
  <div id="app">
    <router-view />
    <!-- 全局悬浮API按钮，必须在这里 -->
    <ApiPanel />
  </div>
</template>

<script setup>
import ApiPanel from '@/components/common/ApiPanel.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
