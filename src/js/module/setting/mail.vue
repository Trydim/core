<template>
  <p-panel class="col-12 col-md-6 mb-3 p-0" id="mailForm" :header="$t('Mail settings')">
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="mailTarget" ref="mailTarget" class="w-100" v-model="mail.target" />
      <label for="mailTarget">{{ $t('E-Mail To:') }}</label>
    </p-float-label>
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="mailTargetCopy" ref="mailTargetCopy" class="w-100" v-model="mail.targetCopy" />
      <label for="mailTargetCopy">{{ $t('Copy') }}</label>
    </p-float-label>
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="mailSubject" class="w-100" v-model="mail.subject" />
      <label for="mailSubject">{{ $t('Subject') }}</label>
    </p-float-label>
    <p-float-label variant="on" class="d-block">
      <p-input-text id="mailFromName" class="w-100" v-model="mail.fromName" />
      <label for="mailFromName">{{ $t('From') }}</label>
    </p-float-label>
  </p-panel>
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
