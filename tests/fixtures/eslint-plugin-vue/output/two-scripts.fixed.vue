<script>
import { defineComponent } from 'vue'

export default defineComponent({ inheritAttrs: false })
</script>

<script setup>
import { ref } from 'vue'

const html = ref('<b>Hello</b>')
</script>

<template>
  <div v-html="html" />
</template>
