<template>
  <div class="col-6 border" id="mailForm">
    <h3 class="col text-center">Настройка почты</h3>
    <div class="form-floating my-3">
      <p-input-text v-model="mail.target" ref="mailTarget" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Почта для получения заказов</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.targetCopy" ref="mailTargetCopy" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Копия письма</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.subject" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Тема письма</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.fromName" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Имя отправителя</label>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    propMail: {
      required: true,
      type: Object,
    },
  },
  emits: ['update'],
  data: () => ({
    mail: {
      target    : '', // Почта получения заказов
      targetCopy: '', // Дополнительная Почта получения заказов
      subject   : '', // тема письма
      fromName  : '', // Имя отправителя
    },
  }),
  methods: {},
  created() {
    this.mail = this.propMail;

    this.$watch('mail', {
      deep: true,
      handler() { this.$emit('update', this.mail) },
    });
  },
}

</script>
