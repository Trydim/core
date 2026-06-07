<template>
  <p-panel id="userForm" class="col-12 col-md-6 mb-3 p-0" :header="$t('User')">
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="userLogin" class="w-100" v-model="user.login" />
      <label for="userLogin">{{ $t('Login') }}</label>
    </p-float-label>
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="userPassword" type="password" class="w-100" v-model="user.password" />
      <label for="userPassword">{{ $t('New password') }}</label>
    </p-float-label>
    <p-float-label variant="on" class="d-block mb-3">
      <p-input-text id="userPasswordRepeat" type="password" class="w-100" v-model="user.passwordRepeat" />
      <label for="userPasswordRepeat">{{ $t('Repeat password') }}</label>
    </p-float-label>

    <div class="d-flex align-items-center gap-3 mb-3">
      <p-checkbox input-id="showAllField" :binary="true" v-model="showAllField" />
      <label for="showAllField">{{ $t('Show all options') }}</label>
    </div>

    <template v-if="showAllField">
      <p-float-label variant="on" class="d-block mb-3">
        <p-input-text id="userName" class="w-100" v-model="user.name" />
        <label for="userName">{{ $t('Full name') }}</label>
      </p-float-label>
      <p-float-label variant="on" class="d-block mb-3">
        <p-input-text id="userPhone" class="w-100" v-model="user.fields.phone" />
        <label for="userPhone">{{ $t('Phone') }}</label>
      </p-float-label>
      <p-float-label variant="on" class="d-block mb-3">
        <p-input-text id="userMail" class="w-100" v-model="user.fields.email" />
        <label for="userMail">{{ $t('Mail') }}</label>
      </p-float-label>

      <template v-for="(item, key) of userFields" :key="key">
        <p-float-label v-if="item.type === 'text'" variant="on" class="d-block mb-3">
          <p-input-text :id="item.type + key" class="w-100" v-model="user.fields[key]" />
          <label :for="item.type + key">{{ $t(item.name) }}</label>
        </p-float-label>

        <p-float-label v-else-if="item.type === 'textarea'" variant="on" class="d-block mb-3">
          <p-textarea :id="item.type + key" class="w-100" v-model="user.fields[key]" />
          <label :for="item.type + key">{{ $t(item.name) }}</label>
        </p-float-label>

        <div v-else class="row g-3 align-items-center mb-3">
          <label class="col" :for="item.type + key">{{ $t(item.name) }}</label>
          <p-input-number v-if="item.type === 'number'"
                          :id="item.type + key" class="col" placeholder="0"
                          show-buttons v-model="user.fields[key]" />

          <p-calendar v-if="item.type === 'date'"
                      :id="item.type + key" class="col"
                      date-format="mm-dd-yy"
                      v-model="user.fields[key]" />
        </div>
      </template>

      <div class="d-flex align-items-center gap-3">
        <p-checkbox input-id="onlyOne" :binary="true" v-model="user.onlyOne" />
        <label for="onlyOne">{{ $t('Prevent simultaneous login') }}</label>
      </div>

    </template>
  </p-panel>
</template>

<script>

export default {
  props: {
    userData: {
      required: true,
      type: Object,
    },
    userFields: {
      required: true,
      type: Object,
    },
  },
  emits: ['update'],
  data: () => ({
    showAllField: false,

    user: {
      name          : '',
      login         : '',
      password      : '',
      passwordRepeat: '',
      fields        : {},
      onlyOne       : false,
    },
  }),
  watch: {
    userData() {
      this.user.password = this.user.passwordRepeat = '';
    },
  },
  methods: {
    loadData() {
      const node = f.gI('dataUser'),
            data = node && node.value ? JSON.parse(node.value) : false;

      this.setData(data);
    },

    setData(data) {
      this.user.name = data.name;
      this.user.login = data.login;

      Object.entries(data.contacts).forEach(([k, v]) => this.user.fields[k] = v);
      Object.entries(data.customization).forEach(([k, v]) => this.user[k] = v);
    }
  },
  created() {
    this.loadData();

    this.$watch('user', {
      deep: true,
      handler() { this.$emit('update', this.user) },
    });
  },
}

</script>
