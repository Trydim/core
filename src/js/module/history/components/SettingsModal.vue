<template>
  <Modal
    :visible="visible"
    :title="$t('Display Settings')"
    @close="close"
  >
    <div class="settings-grid">
      <h4>{{ $t('Colors') }}</h4>

      <div class="color-row">
        <span>{{ $t('Inserted Row Background') }}</span>
        <input type="color" v-model="localSettings.insertedBg">
      </div>
      <div class="color-row">
        <span>{{ $t('Deleted Row Background') }}</span>
        <input type="color" v-model="localSettings.deletedBg">
      </div>
      <div class="color-row">
        <span>{{ $t('Changed Row Background') }}</span>
        <input type="color" v-model="localSettings.changedBg">
      </div>
      <div class="color-row">
        <span>{{ $t('Normal Text Color') }}</span>
        <input type="color" v-model="localSettings.normalColor">
      </div>

      <div class="color-row">
        <span>{{ $t('Highlight Added Chunk') }}</span>
        <input type="color" v-model="localSettings.chunkAddBg">
      </div>
      <div class="color-row">
        <span>{{ $t('Highlight Removed Chunk') }}</span>
        <input type="color" v-model="localSettings.chunkDelBg">
      </div>
    </div>

    <template #footer>
      <button class="btn-text" @click="reset">{{ $t('Reset to Defaults') }}</button>
      <button class="btn-primary" @click="save">{{ $t('Save') }}</button>
    </template>
  </Modal>
</template>

<script>
import Modal from './ui/Modal.vue';

export default {
  name: 'SettingsModal',
  components: {Modal},
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    currentSettings: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'save', 'reset'],
  data() {
    return {
      localSettings: {}
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.syncWithProps();
      }
    },
    currentSettings: {
      deep: true,
      handler() {
        this.syncWithProps();
      }
    }
  },
  methods: {
    syncWithProps() {
      this.localSettings = {...this.props?.currentSettings || this.currentSettings};
    },
    save() {
      this.$emit('save', this.localSettings);
    },
    reset() {
      this.$emit('reset');
    },
    close() {
      this.$emit('close');
    }
  },

  created() {
    this.syncWithProps();
  },

};
</script>

<style lang="scss" scoped>
@use './../scss/mixin/functions' as *;
@use './../scss/vars/colors' as *;

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: rem(15);

  h4 {
    margin-top: 0;
    margin-bottom: rem(10);
    padding-bottom: rem(5);
    border-bottom: rem(1) solid $border-light;
    font-size: rem(16);
    color: $text-primary;
  }
}

.color-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: rem(5) 0;
  border-bottom: rem(1) solid $bg-hover;

  &:last-child {
    border-bottom: none;
  }

  span {
    font-size: rem(14);
    color: $text-secondary;
  }

  input[type="color"] {
    width: rem(40);
    height: rem(30);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
}

.btn-primary {
  cursor: pointer;
  background: $color-primary;
  border: none;
  border-radius: rem(4);
  color: #fff;
  padding: rem(8) rem(16);
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: $color-primary-hover;
  }
}

.btn-text {
  cursor: pointer;
  background: none;
  border: none;
  color: $text-secondary;
  padding: rem(8) rem(16);
  transition: color 0.2s;

  &:hover {
    color: $text-primary;
    text-decoration: underline;
  }
}
</style>
