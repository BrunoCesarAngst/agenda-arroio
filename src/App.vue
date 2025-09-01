<template>
  <div id="app">
    <router-view />
    <ConsentBanner />
    <DevTools />
  </div>
</template>

<script setup>
import ConsentBanner from './components/ConsentBanner.vue';
import DevTools from './components/DevTools.vue';
</script>
