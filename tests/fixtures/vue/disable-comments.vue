<script setup>
// eslint-disable-next-line mini/no-foo
const foo = 'Hello'
</script>

<template>
  <!-- eslint-disable-next-line mini/no-marquee -->
  <marquee>{{ foo }}</marquee>
  <!-- eslint-disable mini/no-marquee -->
  <marquee>{{ foo }}</marquee>
  <!-- eslint-enable mini/no-marquee -->
  <marquee>{{ foo }}</marquee>
</template>
