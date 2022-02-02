'use strict';

export const data = {
  errorTimeOut: false,

  permissionsChanged: false,
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
}

export const watch = {
  'permission.id'(newValue, oldValue) {
    if (typeof newValue === 'string') {
      if (typeof oldValue === 'number') this.permissionsChangeId = oldValue;
      return;
    }

    const menu = this.permission.menu,
          sPer = this.permissionsData.find(i => i.id === this.permission.id),
          accessMenu = (sPer && sPer.properties['menu']) || '';

    menu[0] = this.permissionsMenu.filter(m => !accessMenu.includes(m.id));
    menu[1] = this.permissionsMenu.filter(m => accessMenu.includes(m.id));
    this.permission.tags = (sPer && sPer.properties['tags']) || '';

    this.permission.current = sPer;
  },

  permissionsData: {
    deep: true,
    handler() {
      this.permissionsChanged = true;
    }
  },
}

export const computed = {
  permissionNames() {
    return new Set(this.permissionsData.map(p => p.name.toLowerCase()));
  },

  isPermissionDelete() {
    const sPer = this.permissionsData.find(i => i.id === this.permission.id);
    return !!(sPer && sPer.delete);
  },
}

export const methods = {
  checkPermName(name) {
    return [...this.permissionNames].includes(name.toLowerCase());
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
}
