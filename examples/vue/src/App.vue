<script setup lang="ts">
import { ref } from 'vue'
import AppFooter from './components/AppFooter.vue'
import UserList from './components/UserList.vue'

const users = ref([
  { id: 1, name: 'Ada', bio: '<b>Mathematician</b>' },
  { id: 2, name: 'Linus', bio: '<i>Kernel hacker</i>' },
])
</script>

<template>
  <main>
    <h1>Team</h1>
    <UserList :users="users" showBio />
    <AppFooter />
  </main>
</template>
