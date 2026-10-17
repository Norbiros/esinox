<script>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({ inheritAttrs: false })
</script>

<script setup>
import { ref } from '@vue/runtime-core'

const html = ref('<b>Hello</b>')
</script>

<template>
  <div v-html="html"></div>
</template>
