<template>
  <div class="col-6 border" id="mailForm">
    <h3 class="col text-center">Настройка почты</h3>
    <div class="form-floating my-3">
      <p-input-text v-model="mail.mailTarget" ref="mailTarget" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Почта для получения заказов</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.mailTargetCopy" ref="mailTargetCopy" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Копия письма</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.mailSubject" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Тема письма</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="mail.mailFromName" :class="'form-control'" placeholder="_"
      ></p-input-text>
      <label>Имя отправителя</label>
    </div>
  </div>
</template>

<script>

export default {
  data: () => ({
    mail: {
      managerTarget    : '', // Почта получения заказов
      managerTargetCopy: '', // Дополнительная Почта получения заказов
      subject          : '', // тема письма
      fromName         : '', // Имя отправителя
    },
  }),
}

</script>
