<template>
  <div class="col-12 col-md-6 border" id="userForm">
    <h3 class="col text-center">{{ $t('User') }}</h3>
    <div class="form-floating my-3">
      <p-input-text class="form-control" placeholder="" v-model="user.login" />
      <label>{{ $t('Login') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text type="password" class="form-control" placeholder="" v-model="user.password" />
      <label>{{ $t('New password') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text type="password" class="form-control" placeholder="" v-model="user.passwordRepeat" />
      <label>{{ $t('Repeat password') }}</label>
    </div>

    <div class="input-group mb-3">
      <div class="input-group-text col-1">
        <p-checkbox id="showAllField" :binary="true" v-model="showAllField" />
      </div>
      <label class="input-group-text col" :for="'showAllField'">{{ $t('Show all options') }}</label>
    </div>

    <template v-if="showAllField">
      <div class="form-floating my-3">
        <p-input-text class="form-control" placeholder="" v-model="user.name" />
        <label>{{ $t('Full name') }}</label>
      </div>
      <div class="form-floating mb-3">
        <p-input-text class="form-control" placeholder="" v-model="user.fields.phone" />
        <label>{{ $t('Phone') }}</label>
      </div>
      <div class="form-floating mb-3">
        <p-input-text class="form-control" placeholder="" v-model="user.fields.email" />
        <label>{{ $t('Mail') }}</label>
      </div>

      <div v-for="(item, key) of userFields" class="mb-3"
           :class="{'form-floating': item.type === 'text' || item.type === 'textarea',
                    'input-group': item.type !== 'text' && item.type !== 'textarea'}"
      >
        <p-input-text v-if="item.type === 'text'"
                      class="form-control" :id="item.type + key" placeholder=""
                      v-model="user.fields[key]" />

        <p-textarea v-if="item.type === 'textarea'"
                    class="form-control" :id="item.type + key" placeholder=""
                    v-model="user.fields[key]" />

        <label :class="{'col-6 input-group-text': item.type !== 'text' && item.type !== 'textarea'}"
               :for="item.type + key">
          {{ item.name }}
        </label>

        <p-input-number v-if="item.type === 'number'"
                        :id="item.type + key" class="col-6" placeholder="0"
                        show-buttons v-model="user.fields[key]" />

        <p-calendar v-if="item.type === 'date'"
                    :id="item.type + key" class="col-6"
                    date-format="mm-dd-yy"
                    v-model="user.fields[key]" />
      </div>

      <div class="input-group mb-3">
        <div class="input-group-text col-1">
          <p-checkbox id="onlyOne" :binary="true" v-model="user.onlyOne" />
        </div>
        <label class="input-group-text col" :for="'onlyOne'">{{ $t('Prevent simultaneous login') }}</label>
      </div>

    </template>
  </div>
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
