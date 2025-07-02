<template>
  <div class="col-12 col-md-6 border" id="mailForm">
    <h3 class="col text-center">{{ $t('Mail settings') }}</h3>
    <div class="form-floating my-3">
      <p-input-text ref="mailTarget" class="form-control" placeholder="" v-model="mail.target" />
      <label>{{ $t('E-Mail To:') }}</label>
    </div>

    <div class="form-floating mb-3">
      <p-input-text ref="mailTargetCopy" class="form-control" placeholder="" v-model="mail.targetCopy" />
      <label>{{ $t('Copy') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text class="form-control" placeholder="" v-model="mail.subject" />
      <label>{{ $t('Subject') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text class="form-control" placeholder="" v-model="mail.fromName" />
      <label>{{ $t('From') }}</label>
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
