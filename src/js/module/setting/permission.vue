<template>
  <div class="col-12 col-md-6 border" id="controlForm">
    <h3 class="col text-center">{{ $t('Access') }}</h3>

    <div class="input-group my-3">
      <span class="input-group-text">{{ $t('Add') }}</span>
      <p-input-text class="form-control" v-model="permission.name" />
      <p-button v-tooltip.bottom="$t('Add access type')" icon="pi pi-plus-circle" class="p-button-success"
                @click="addPermission" />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text">{{ $t('Access type') }}</span>
      <p-select class="col"
                option-label="name" option-value="id"
                :editable="true" :options="permissionsData"
                v-model="permission.id"
                @input="changePermission" />
      <p-button v-tooltip.bottom="$t(isPermissionDelete ? 'Cancel deletion' : 'Delete access type')"
                icon="pi pi-trash" class="p-button-danger"
                @click="removePermission" />
    </div>

    <div class="input-group mb-3">
        <span class="input-group-text">
          {{ $t('Tags') }}
          <i class="ms-1 pi pi-tag"
             v-tooltip.bottom="$t('Special property tags (separated by a space):\n\'protection/guard\' - protection from deletion\n')"
          ></i>
        </span>
      <p-input-text class="form-control" :disabled="isPermissionDelete"
                    v-model="propertyTags" @change="changePermissionTags" />
    </div>

    <div class="col mb-3">
      <p class="col-12 mt-2 text-center">
        {{ $t('Available menus') }}
        <i class="pi pi-tag" v-tooltip.bottom="$t('If `Available` is empty, then everything is available')"></i>
      </p>
      <p-picklist class="w-100" data-key="id"
                  list-style="height:220px"
                  v-model="permission.menu"
                  @selection-change="pickedChange"
      >
        <template #source>
          {{ $t('Possible') }}
        </template>
        <template #target>
          {{ $t('Available') }}
        </template>
        <template #item="slotProps">
          <div class="product-item">{{ slotProps.item.name }}</div>
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

    propertyTags: {
      get() { return this.permission.current.properties.tags },
      set(v) { return this.permission.current.properties.tags = v },
    }
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
            properties = {
              tags: sPer.properties.tags || '',
              menu: sPer.properties.menu || '',
            };

      menu[0] = this.permissionsMenu.filter(m => !properties.menu.includes(m.id));
      menu[1] = this.permissionsMenu.filter(m => properties.menu.includes(m.id));

      sPer.properties = properties;
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
        f.showMsg(_('Access type %1 exists', name));
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
          f.showMsg(_('Empty name is not allowed'), 'error');
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
        f.showMsg(
          _('To delete, protection must be removed! Deleting protected rights may disrupt functionality of the application!'),
          'warning'
        );
        return;
      }

      if (sPer.delete) {
        sPer.name = sPer.name.replace(' (удаление)', ''); //ToDo найти эту строку
        delete sPer.delete;
      } else {
        sPer.name += ' (удаление)'; //ToDo найти эту строку
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
