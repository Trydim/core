<script lang="ts" setup>

import {ref} from 'vue';

const count = ref<number>(0)

</script>

<template>
  <h1>Hello, Vue!</h1>
  <p>The count now is: {{count}}</p>
  <button @click="count++">Click me</button>
</template>

<style scoped>
h1 {
  color: red;
}
</style>
