<template>
  <div class="col-6 border" id="controlForm">
    <h3 class="col text-center">Управление доступом</h3>

    <div class="input-group my-3">
      <span class="input-group-text">Добавить тип доступа</span>
      <p-input-text v-model="permission.name" class="form-control"
      ></p-input-text>
      <p-button v-tooltip.bottom="'Добавить тип доступа'" icon="pi pi-plus-circle" class="p-button-success"
                @click="addPermission"></p-button>
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text">Тип доступа</span>
      <p-select option-label="name" option-value="id"
                :editable="true"
                :options="permissionsData"
                v-model="permission.id"
                class="col"
                @input="changePermission"
      ></p-select>
      <p-button v-tooltip.bottom="isPermissionDelete ? 'Отменить удаление' : 'Удалить тип доступа'"
                icon="pi pi-trash" class="p-button-danger"
                @click="removePermission"></p-button>
    </div>

    <div class="input-group mb-3">
        <span class="input-group-text">
          Теги
          <i class="ms-1 pi pi-tag"
             v-tooltip.bottom="'Теги особых свойств (через пробел):\n\'защита/guard\' - защита от удаления\n'"
          ></i>
        </span>
      <p-input-text v-model="permission.tags" class="form-control"
                    :disabled="isPermissionDelete"
                    @change="changePermissionTags"
      ></p-input-text>
    </div>

    <div class="col mb-3">
      <p class="col-12 mt-2 text-center">
        Доступные меню
        <i class="pi pi-tag" v-tooltip.bottom="'Если в `Доступные` пусто, значит доступны все'"></i>
      </p>
      <p-picklist v-model="permission.menu" data-key="id"
                  list-style="height:220px" class="w-100"
                  @selection-change="pickedChange"
      >
        <template #source>
          Возможные
        </template>
        <template #target>
          Доступные
        </template>
        <template #item="slotProps">
          <div class="product-item">
            {{ slotProps.item.name }}
          </div>
        </template>
      </p-picklist>
    </div>
  </div>
</template>

<script>

export default {
  emits: ['update'],
  data: () => ({
    errorTimeOut: false,

    permissionsChangeId: 0,
    permissionsData: [],
    permissionsMenu: [],

    permission: {
      id: 0,
      name: '',
      tags: '',
      current: {
        id: 0,
        name: '',
        properties: {
          menu: '',
          tags: '',
        },
      },
      menu: [[], []],
    },
  }),
  watch: {
    'permission.id'(newValue, oldValue) {
      if (typeof newValue === 'string') {
        if (typeof oldValue === 'number') this.permissionsChangeId = oldValue;
        return;
      }

      this.setPermission();
    },
  },
  computed: {
    permissionNames() {
      return new Set(this.permissionsData.map(p => p.name.toLowerCase()));
    },

    isPermissionDelete() {
      const sPer = this.permissionsData.find(i => i.id === this.permission.id);
      return !!(sPer && sPer.delete);
    },
  },
  methods: {
    loadData() {
      const node = f.gI('dataPermissions'),
            data = JSON.parse(node.value);

      this.permissionsData = data.permissions;
      this.permissionsMenu = data.menu;
      this.permission.id = data.permissions[0].id;

      node.remove();
    },

    checkPermName(name) {
      return [...this.permissionNames].includes(name.toLowerCase());
    },

    setPermission() {
      const menu = this.permission.menu,
            sPer = this.permissionsData.find(i => i.id === this.permission.id),
            accessMenu = (sPer && sPer.properties['menu']) || '';

      menu[0] = this.permissionsMenu.filter(m => !accessMenu.includes(m.id));
      menu[1] = this.permissionsMenu.filter(m => accessMenu.includes(m.id));
      this.permission.tags = (sPer && sPer.properties['tags']) || '';

      this.permission.current = sPer;
    },
    setPermissionTags(id) {
      if (typeof id === 'string') id = this.permissionsChangeId;
      const sPer = this.permissionsData.find(i => i.id === id);
      sPer.properties.tags = this.permission.tags;
    },

    // Events

    addPermission() {
      const id = Math.random(),
            name = this.permission.name

      if (this.checkPermName(name)) {
        f.showMsg(`Тип доступа ${name} существует`);
        return;
      }

      this.permissionsData.push({
        id, name,
        properties: {},
      });

      this.permission.name = '';
      this.permission.id = id;
    },
    changePermission() {
      const name = this.permission.id;
      if (name) {
        const sPer = this.permissionsData.find(i => i.id === this.permissionsChangeId);
        sPer.name = name;

        clearTimeout(this.errorTimeOut);
      } else {
        this.errorTimeOut = setTimeout(() => {
          this.permission.id = this.permissionsData[0].id;
          f.showMsg('Пустое имя не допустимо', 'error');
        }, 3000);
      }
    },
    changePermissionTags() {
      this.permission.tags = this.permission.tags.toLowerCase();
      this.setPermissionTags(this.permission.id);
    },
    removePermission() {
      const id = typeof this.permission.id !== 'string' ? this.permission.id : this.permissionsChangeId,
            sPer = this.permissionsData.find(i => i.id === id);

      if (/защ|guard/i.test(sPer.properties.tags)) {
        f.showMsg('Для удаления требуется снять защиту! Удаление защищенных прав может нарушить работу приложения!', 'warning');
        return;
      }

      if (sPer.delete) {
        sPer.name = sPer.name.replace(' (удаление)', '');
        delete sPer.delete;
      } else {
        sPer.name += ' (удаление)';
        sPer.delete = true;
      }
    },

    pickedChange() {
      this.permission.current.properties.menu = this.permission.menu[1].map(m => m.id).join(',');
    }
  },
  created() {
    this.loadData();

    this.$watch('permissionsData', {
      deep: true,
      handler() { this.$emit('update', this.permissionsData) },
    });
  },
}

</script>
