<template>
  <h1>Hello, Vue!</h1>
  <p>The count now is: {{count}}</p>
  <button @click="count++">Click me</button>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    count: 0,
  }),
}
</script>

<style>
h1 {
  color: red;
}
</style>
