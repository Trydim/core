<template>
  <div class="mb-3 form-floating">
    <input type="text" class="form-control" id="search" v-model="search" :placeholder="$t('Search')"
           @focus="showResult = true"
           @blur="showResult = false"
    >
    <label for="search">{{ $t('Search') }}</label>

    <div v-if="showResult && result.length" class="position-absolute start-0 top-100 bg-white w-100">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" style="width: 10%">{{ $t('Section') }}</th>
            <th scope="col" style="width: 15%">{{ $t('Value') }}</th>
            <th scope="col">{{ $t('Content') }}</th>
          </tr>
        </thead>
        <tbody style="cursor: pointer">
          <tr v-for="(item, key) of result" :key="key"
              @click="clickResult(item.sectionCode, item.fieldCode)">
            <td>{{ item.sectionName }}</td>
            <td>{{ item.fieldCode }} / {{ item.fieldName }}</td>
            <td>{{ item.content }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Search',
  props: {
    contentData: Object,
  },
  emits: ['update:section', 'update:field'],
  data: () => ({
    search: '',
    showResult: false,
  }),
  watch: {
    search() {
      this.showResult = true;
    },
  },
  computed: {
    result() {
      const search = this.prepareString(this.search),
            res = [];

      if (this.search.length < 3) return res;

      Object.entries(this.contentData).forEach(([sectionCode, section]) => {
        Object.entries(section.fields).forEach(([fieldCode, field]) => {
          if (this.prepareString(fieldCode).includes(search)
              || this.prepareString(field.name).includes(search)
              || this.prepareString(field.value).includes(search)) {
            res.push({
              sectionCode,
              sectionName: section.name,
              fieldCode,
              fieldName: field.name,
              content: field.value.substr(0, 50),
            });
          }
        });
      });

      return res;
    },
  },
  methods: {
    prepareString(str) {
      return str.toLowerCase().replaceAll(' ', '');
    },

    clickResult(section, field) {
      this.showResult = false;
      this.$emit('update:section', section);
      this.$emit('update:field', field);
    }
  },
}
</script>
