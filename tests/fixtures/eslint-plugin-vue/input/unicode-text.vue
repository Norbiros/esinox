<script setup>
const html = '示例 🎉'; import { ref } from '@vue/runtime-core'
</script>

<template>
  <p>示例 🎉<span v-html="html"></span></p>
</template>
