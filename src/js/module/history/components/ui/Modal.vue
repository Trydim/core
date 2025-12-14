<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">

        <button
          v-if="variant === 'widget'"
          class="close-btn-external"
          @click="$emit('close')"
        >
          <i class="pi pi-times"></i>
        </button>

        <div class="modal-container" :class="[`variant-${variant}`]">

          <div class="modal-header" v-if="variant !== 'widget' && title">
            <h3>{{ title }}</h3>
            <button class="close-btn-internal" @click="$emit('close')">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>

          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    visible: {type: Boolean, required: true},
    title: {type: String, default: ''},
    // 'default' или 'widget'
    variant: {type: String, default: 'default'}
  },
  emits: ['close']
};
</script>

<style lang="scss" scoped>
@use './../../scss/mixin/functions' as *;
@use './../../scss/vars/colors' as *;

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.modal-container {
  display: flex;
  flex-direction: column;
  position: relative;

  width: auto;
  height: auto;

  background: $bg-main;
  border-radius: rem(8);
  box-shadow: $shadow-modal;

  &.variant-default {
    width: rem(500);
    max-width: 90%;
    max-height: 90vh;
  }

  &.variant-widget {
    width: 96vw;
    height: 96vh;
    overflow: hidden;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  padding: rem(15);

  background-color: $bg-main;
  border-bottom: rem(1) solid $border-light;
  border-radius: rem(8) rem(8) 0 0;

  h3 {
    margin: 0;
    font-size: rem(18);
    font-weight: 600;
    color: $text-title;
  }

  .close-btn-internal {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: rem(4);
    cursor: pointer;

    background: none;
    border: none;
    border-radius: rem(4);

    font-size: rem(16);
    color: $text-disabled;

    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      background-color: $bg-hover;
    }
  }
}

.close-btn-external {
  position: absolute;
  top: rem(12);
  right: rem(12);
  z-index: 10001;

  display: flex;
  justify-content: center;
  align-items: center;

  width: rem(36);
  height: rem(36);

  cursor: pointer;

  background: $bg-main;
  border: none;
  border-radius: 50%;

  font-size: rem(18);
  color: $text-secondary;

  box-shadow: $shadow-btn-external;

  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: scale(1.1);
    background: $bg-main;
    color: #d32f2f;
  }

  &:active {
    transform: scale(0.95);
  }
}

.modal-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.variant-default .modal-body {
  display: block;
  overflow-y: auto;
  padding: rem(20);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;

  padding: rem(15);
  gap: rem(10);

  background-color: $bg-panel;
  border-top: rem(1) solid $border-light;
  border-radius: 0 0 rem(8) rem(8);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .modal-container,
  .close-btn-external {
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-container,
  .close-btn-external {
    transform: scale(0.98) translateY(rem(10));
    opacity: 0;
  }
}
</style>
