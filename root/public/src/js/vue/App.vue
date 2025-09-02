<script setup>

import {ref} from 'vue';

const count = ref(0)

</script>

<style>
h1 {
  color: red;
}
</style>

<template>
  <h1>Hello, Vue!</h1>
  <p>The count now is: {{count}}</p>
  <button @click="count++">Click me</button>
</template>

