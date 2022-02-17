<template>
  <div class="col-6 border" id="otherForm">
    <h3 class="col text-center">Прочее</h3>
    <div class="form-floating mb-3">
      <p-input-text v-model="phoneMaskUsers" class="form-control" placeholder="_"></p-input-text>
      <label>Шаблон телефона для менеджеров</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="phoneMaskCustomers" class="form-control" placeholder="_"
      ></p-input-text>
      <label>Шаблон телефона для клиентов</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="phoneMaskGlobal" class="form-control" placeholder="_"></p-input-text>
      <label>Шаблон телефона для остальных пользователей</label>
    </div>
  </div>
</template>

<script>
export default {
  name: "other",
  data: () => ({
    phoneMaskUsers: '',
    phoneMaskCustomers: '',
    phoneMaskGlobal: '',
  }),

}
</script>
