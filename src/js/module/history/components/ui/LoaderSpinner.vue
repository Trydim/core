<template>
  <div class="spinner-container">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'LoaderSpinner'
};
</script>

<style lang="scss" scoped>
@use './../../scss/mixin/functions' as *;
@use './../../scss/vars/colors' as *;

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: rem(50);
}

.spinner {
  width: rem(32);
  height: rem(32);

  border: rem(3) solid $bg-hover;
  border-top: rem(3) solid $color-primary;
  border-radius: 50%;

  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
