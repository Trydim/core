<template>
  <div ref="preview" class="w-100 border bg-white flex-grow-1 p-2" style="min-height: 15rem"></div>
</template>

<script>

const getCustomElements = () => new Promise((resolve) => {
  customElements.define('shadow-root', class extends HTMLElement {
    connectedCallback() {
      resolve(this.attachShadow({mode: 'open'}));
    }
  });
});

export default {
  name: 'preview',
  props: {
    content: String,
  },
  data: () => ({
    shadow: undefined,
  }),
  methods: {
    async init() {
      this.shadow = await getCustomElements();
      this.setContent();

      this.$watch('content', {handler: () => this.setContent()});
    },

    setContent() {
      this.shadow.innerHTML = this.content;
    }
  },
  mounted() {
    this.init();
    this.$refs.preview.innerHTML = '<shadow-root></shadow-root>';
  },
}

</script>
