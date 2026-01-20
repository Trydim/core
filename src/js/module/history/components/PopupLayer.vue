<template>
  <RowDetailsPopup
    v-for="item in popups"
    :key="item.id"
    :config="item"
    @close="closePopup"
    @pin="togglePopupPin"
    @focus="bringToFront"
  />
</template>

<script>
import RowDetailsPopup from "./RowDetailsPopup.vue";

export default {
  name: 'PopupLayer',
  components: { RowDetailsPopup },
  data() {
    return {
      popups: [],
      globalZIndex: 10005
    };
  },
  methods: {
    /**
     * Открывает или обновляет окно с деталями.
     * @param {Object} payload
     * @param {number} payload.lineNum - Номер строки
     * @param {Array<{label: string, value: string}>} payload.data - Массив полей и значений
     * @param {number} payload.x - Координата X мыши
     * @param {number} payload.y - Координата Y мыши
     * @param {string} [payload.sourceTitle] - Заголовок источника (версия)
     */
    show(payload) {
      const unpinnedIndex = this.popups.findIndex(p => !p.isPinned);
      this.globalZIndex++;

      const newConfig = {
        lineNum: payload.lineNum,
        data: payload.data,
        x: payload.x,
        y: payload.y,
        sourceTitle: payload.sourceTitle,
        zIndex: this.globalZIndex,
        isPinned: false
      };

      if (unpinnedIndex !== -1) {
        const oldItem = this.popups[unpinnedIndex];
        this.popups[unpinnedIndex] = {
          ...oldItem,
          ...newConfig,
          id: Date.now()
        };
      } else {
        // Добавляем новое
        this.popups.push({
          id: Date.now(),
          ...newConfig
        });
      }
    },

    closePopup(id) {
      this.popups = this.popups.filter(p => p.id !== id);
    },

    togglePopupPin({ id, isPinned }) {
      const popup = this.popups.find(p => p.id === id);
      if (popup) {
        popup.isPinned = isPinned;
      }
    },

    bringToFront(id) {
      const popup = this.popups.find(p => p.id === id);
      if (popup) {
        this.globalZIndex++;
        popup.zIndex = this.globalZIndex;
      }
    },

    clearAll() {
      this.popups = [];
    }
  }
};
</script>
