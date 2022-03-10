<template>
  <div class="col-6 border" id="otherForm">
    <h3 class="col text-center">Прочее</h3>
    <div class="form-floating mb-3" v-tooltip.bottom="'Для маски использовать _'">
      <p-input-text v-model="phoneMask.global" class="form-control" placeholder="_"></p-input-text>
      <label>Шаблон телефона общий</label>
      <!--<label>Шаблон телефона для менеджеров</label>-->
    </div>
    <!--<div class="form-floating mb-3">
      <p-input-text v-model="phoneMask.Customers" class="form-control" placeholder="_"
      ></p-input-text>
      <label>Шаблон телефона для клиентов</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="phoneMask.global" class="form-control" placeholder="_"></p-input-text>
      <label>Шаблон телефона для остальных пользователей</label>
    </div>-->
  </div>
</template>

<script>
export default {
  name: "other",
  props: {
    propOtherFields: {
      required: true,
      type: Object,
    },
  },
  emits: ['updateOtherFields'],
  data: () => ({
    phoneMask: undefined,
  }),
  created() {
    this.phoneMask = this.propOtherFields.phoneMask || this.phoneMask;

    this.$watch('phoneMask', {
      deep: true,
      handler() {
        this.$emit('update', {
          phoneMask: this.phoneMask,
        });
      },
    });
  },
}
</script>
