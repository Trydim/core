<template>
  <div class="col-6 border" id="userForm">
    <h3 class="col text-center">{{ $t('User') }}</h3>
    <div class="form-floating my-3">
      <p-input-text v-model="user.login" class="form-control" placeholder="_"
      ></p-input-text>
      <label>{{ $t('Login') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text type="password" v-model="user.password" class="form-control" placeholder="_"
      ></p-input-text>
      <label>{{ $t('New password') }}</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text type="password" v-model="user.passwordRepeat" class="form-control" placeholder="_"
      ></p-input-text>
      <label>{{ $t('Repeat password') }}</label>
    </div>

    <div class="input-group mb-3">
      <div class="input-group-text col-1">
        <p-checkbox id="showAllField" v-model="showAllField" :binary="true"></p-checkbox>
      </div>
      <label class="input-group-text col" for="showAllField">{{ $t('Show all options') }}</label>
    </div>

    <template v-if="showAllField">
      <div class="form-floating my-3">
        <p-input-text v-model="user.name" class="form-control" placeholder="_"></p-input-text>
        <label>{{ $t('Full name') }}</label>
      </div>
      <div class="form-floating mb-3">
        <p-input-text v-model="user.fields.phone" class="form-control" placeholder="_"></p-input-text>
        <label>{{ $t('Phone') }}</label>
      </div>
      <div class="form-floating mb-3">
        <p-input-text v-model="user.fields.email" class="form-control" placeholder="_"></p-input-text>
        <label>{{ $t('Mail') }}</label>
      </div>

      <div v-for="(item, key) of userFields" class="mb-3"
           :class="{'form-floating': item.type === 'text' || item.type === 'textarea',
                    'input-group': item.type !== 'text' && item.type !== 'textarea'}"
      >
        <p-input-text v-if="item.type === 'text'"
                      class="form-control" :id="item.type + key"
                      v-model="user.fields[key]" placeholder="_"
        ></p-input-text>

        <p-textarea v-if="item.type === 'textarea'"
                    class="form-control" :id="item.type + key" placeholder="_"
                    v-model="user.fields[key]"
        ></p-textarea>

        <label :class="{'col-6 input-group-text': item.type !== 'text' && item.type !== 'textarea'}"
               :for="item.type + key"
        >{{ item.name }}</label>

        <p-input-number v-if="item.type === 'number'"
                        :id="item.type + key" class="col-6" show-buttons
                        v-model="user.fields[key]" placeholder="0"
        ></p-input-number>

        <p-calendar v-if="item.type === 'date'"
                    :id="item.type + key" class="col-6"
                    date-format="mm-dd-yy"
                    v-model="user.fields[key]"
        ></p-calendar>


      </div>

      <div class="input-group mb-3">
        <div class="input-group-text col-1">
          <p-checkbox id="onlyOne" v-model="user.onlyOne" :binary="true"></p-checkbox>
        </div>
        <label class="input-group-text col" for="onlyOne">{{ $t('Prevent simultaneous login') }}</label>
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
