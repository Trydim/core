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
    current: {
      id: 0,
      name: '',
      accessVal: {
        menu: '',
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
          accessVal = (sPer && sPer['accessVal']['menu']) || '';

    menu[0] = this.permissionsMenu.filter(m => !accessVal.includes(m.id));
    menu[1] = this.permissionsMenu.filter(m => accessVal.includes(m.id));

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
  }
}

export const methods = {
  checkPermName(name) {
    return [...this.permissionNames].includes(name.toLowerCase());
  },

  addPermission() {
    const id = Math.random(),
          name = this.permission.name

    if (this.checkPermName(name)) {
      f.showMsg(`Тип доступа ${name} существует`);
      return;
    }

    this.permissionsData.push({
      id, name,
      accessVal: {},
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
  removePermission() {
    const sPer = this.permissionsData.find(i => i.id === this.permissionsChangeId);
    sPer.name += ' (удаление)';
    sPer.delete = true;
  },

  pickedChange() {
    this.permission.current.accessVal.menu = this.permission.menu[1].map(m => m.id).join(',');
  }
}
