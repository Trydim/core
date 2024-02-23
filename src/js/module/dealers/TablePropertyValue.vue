<template>
  <p class="m-0 text-nowrap">
    {{ name }}: <i class="pi pi-table" v-tooltip.left="tableValue"></i>
  </p>
</template>

<script>

export default {
  name: "TablePropertyValue",
  props: {
    name: {
      type: String,
    },
    value: {
      type: Object,
    }
  },
  computed: {
    tableValue() {
      if (!Array.isArray(this.value)) return `<div>${this.$t('Value is not valid')}</div>`;

      let v = this.value,
          columns = Object.keys(v[0]).length,
          html    = `<div class="grid text-center text-nowrap" style="--bs-columns: ${columns}; grid-gap: 0.1rem;">`;

      v.forEach(r => {
        Object.values(r).forEach(c => {
          html += '<div class="border overflow-hidden" style="max-width: 200px">' + (c || '') + '</div>';
        });
      });

      return {escape: false, value: html + '</div>', /*hideDelay: 30000*/};
    },
  },
}

</script>
