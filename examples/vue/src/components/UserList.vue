<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
interface User {
  id: number
  name: string
  bio: string
}

defineProps<{ users: User[]; showBio?: boolean }>()
</script>

<template>
  <ul>
    <li v-for="(user, index) in users">
      <strong>{{ user.name }}</strong>
      <p v-if="showBio" v-html="user.bio" />
    </li>
  </ul>
</template>
