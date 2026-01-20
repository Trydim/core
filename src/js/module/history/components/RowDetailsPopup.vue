<template>
  <teleport to="body">
    <div
      v-if="isVisible"
      v-bind="$attrs"
      class="row-details-popup"
      :class="{ 'is-pinned': isPinned }"
      :style="positionStyle"
      v-click-outside="onClickOutside"
      @mousedown="onWindowMouseDown"
    >
      <!-- Шапка -->
      <div class="popup-header" @mousedown="startDrag">
        <div class="header-left">
          <div class="main-title">
            {{ $t('Row Details') }} #{{ config.lineNum }}
          </div>
          <div v-if="config.sourceTitle" class="sub-title">
            {{ config.sourceTitle }}
          </div>
        </div>

        <div class="header-actions">
          <button
            class="action-btn pin-btn"
            :class="{ active: isPinned }"
            @click.stop="togglePin"
            :title="isPinned ? $t('Unpin') : $t('Pin')"
          >
            <i class="pi pi-thumbtack" :style="{ transform: isPinned ? 'rotate(45deg)' : 'rotate(0deg)' }"></i>
          </button>

          <button class="action-btn close-btn" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Тело -->
      <div class="popup-body">
        <table class="details-table">
          <thead>
          <tr>
            <th>{{ $t('Field') }}</th>
            <th>{{ $t('Value') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in config.data" :key="idx">
            <td class="field-name">{{ item.label }}</td>
            <td class="field-value">{{ item.value }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

  </teleport>
</template>

<script>
export default {
  name: 'RowDetailsPopup',
  inheritAttrs: false,
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'pin', 'focus'],
  data() {
    return {
      localX: this.config.x || 0,
      localY: this.config.y || 0,

      // Локальное состояние пина
      isPinned: this.config.isPinned || false,

      isVisible: true,

      // Для Drag and Drop
      isDragging: false,
      dragCtx: {
        startX: 0,
        startY: 0,
        startMouseX: 0,
        startMouseY: 0
      }
    };
  },
  computed: {
    positionStyle() {
      return {
        top: `${this.localY + 10}px`,
        left: `${this.localX + 10}px`,
        zIndex: this.config.zIndex || 10000
      };
    }
  },
  watch: {
    'config.isPinned'(newVal) {
      this.isPinned = newVal;
    }
  },
  methods: {
    close() {
      this.$emit('close', this.config.id);
    },
    togglePin() {
      this.isPinned = !this.isPinned;
      this.$emit('pin', { id: this.config.id, isPinned: this.isPinned });
    },
    onClickOutside() {
      if (!this.isPinned && !this.isDragging) {
        this.close();
      }
    },
    onWindowMouseDown() {
      // Поднимаем слой при клике
      this.$emit('focus', this.config.id);
    },

    startDrag(event) {
      // Игнорируем клики по кнопкам в шапке
      if (event.target.closest('button')) return;

      this.isDragging = true;

      // Запоминаем начальную позицию мыши и окна
      this.dragCtx.startMouseX = event.clientX;
      this.dragCtx.startMouseY = event.clientY;
      this.dragCtx.startX = this.localX;
      this.dragCtx.startY = this.localY;

      // Добавляем слушатели на document, чтобы не потерять фокус при быстром движении
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);

      // Вызываем focus, чтобы при начале перетаскивания окно всплыло
      this.onWindowMouseDown();
    },
    onDrag(event) {
      if (!this.isDragging) return;

      // Вычисляем дельту (смещение)
      const deltaX = event.clientX - this.dragCtx.startMouseX;
      const deltaY = event.clientY - this.dragCtx.startMouseY;

      // Применяем смещение к начальной позиции окна
      this.localX = this.dragCtx.startX + deltaX;
      this.localY = this.dragCtx.startY + deltaY;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        // Небольшая задержка, чтобы текущий клик открытия не закрыл окно сразу
        setTimeout(() => { document.addEventListener('click', el.clickOutsideEvent); }, 0);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.row-details-popup {
  position: fixed;
  background: $bg-main;
  border: rem(1) solid $border-main;
  box-shadow: $shadow-modal;
  border-radius: rem(4);
  width: rem(400);
  max-width: 90vw;
  max-height: rem(500);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.is-pinned {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    border-color: $color-primary;
    .popup-header { background: $bg-hover; }
  }
}

.popup-header {
  padding: rem(6) rem(12);
  background: $bg-panel;
  border-bottom: rem(1) solid $border-main;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: rem(13);
  color: $text-title;
  user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    pointer-events: none;
  }

  .main-title { font-weight: 700; }
  .sub-title { font-size: rem(11); color: $text-secondary; font-weight: 500; }

  .header-actions {
    display: flex;
    align-items: center;
    gap: rem(4);
    margin-top: rem(2);
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: $text-muted;
    padding: rem(4);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: rem(4);
    i { font-size: rem(12); transition: transform 0.2s; }
    &:hover { color: $text-primary; background-color: rgba(0,0,0,0.05); }
    &.active { color: $color-primary; background-color: $bg-active; }
  }
}

.popup-body {
  overflow-y: auto;
  padding: rem(10);
  background: $bg-main;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: rem(12);

  th, td {
    padding: rem(6);
    border: rem(1) solid $border-light;
    text-align: left;
    white-space: normal;
    word-break: break-word;
  }
  th { background: $bg-panel; color: $text-secondary; font-weight: 600; }
  .field-name { background: $bg-separator; width: 35%; font-weight: 500; color: $text-secondary; }
  .field-value { width: 65%; color: $text-primary; }
}
</style>
