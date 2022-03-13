<?php if (!defined('MAIN_ACCESS')) die('access denied!'); ?>

<div id="catalogForm">
  <div class="container-fluid">
    <div class="row">
      <div id="searchField" class="position-relative form-group col-12 pt-2">
        <span v-if="searchShow" class="p-float-label">
          <p-input-text v-model="search" :class="'w-100'"></p-input-text>
          <label>Поиск</label>
        </span>
        <p-button v-tooltip.left="'Скрыть'" :label="searchShow ? '-' : '+'" :class="'position-absolute p-0'"
                  style="width: 30px; height: 20px; right: 12px; top: 8px;"
                  @click="searchShow = !searchShow"
        ></p-button>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-3 overflow-auto position-relative"
           :style="{'max-width': sectionShow ? '25%' : '20px'}"
           :class="{'p-0': !sectionShow}">
        <p-button v-tooltip.bottom="'Скрыть'" :label="sectionShow ? '<' : '>'" :class="'position-absolute p-0 p-button-white'"
                  style="width: 20px; right: 0; top: 0; bottom: 0;"
                  @click="sectionShow = !sectionShow"
        ></p-button>

        <template v-if="sectionShow">
          <Tree :value="sectionTree"
                :loading="sectionLoading"
                :expanded-keys="sectionExpanded"
                selection-mode="single"
                v-model:selection-keys="sectionSelected"
                @dblclick="openSection"
          ></Tree>

          <div class="d-flex mt-2 justify-content-center">
            <p-button v-tooltip.bottom="'Создать раздел'" icon="pi pi-plus-circle" class="p-button-success"
                      :loading="sectionLoading" @click="createSection"></p-button>
            <p-button v-tooltip.bottom="'Изменить раздел'" icon="pi pi-cog" class="p-button-warning mx-2"
                      :loading="sectionLoading" @click="changeSection"></p-button>
            <p-button v-tooltip.bottom="'Удалить раздел'" icon="pi pi-trash" class="p-button-danger"
                      :loading="sectionLoading" @click="deleteSection"></p-button>
          </div>

          <p-dialog v-model:visible="sectionModal.display">
            <template #header>
              <h4>{{ sectionModal.title }}</h4>
            </template>

            <div v-if="queryParam.dbAction !== 'deleteSection'">
              <div class="p-inputgroup my-2">
                <span class="col-6 p-inputgroup-addon">Имя раздела:</span>
                <p-input-text v-model="section.name" autofocus></p-input-text>
              </div>
              <div class="p-inputgroup my-2">
                <span class="col-6 p-inputgroup-addon">Символьный код раздела:</span>
                <span class="p-input-icon-right">
                  <i v-if="sectionModalLoading" class="pi pi-spin pi-spinner"></i>
                  <p-input-text class="w-100" v-model="section.code" @input="codeChange()"></p-input-text>
                </span>
              </div>
              <div class="p-inputgroup my-2">
                <span class="col-6 p-inputgroup-addon">Родительский раздел:</span>
                <p-tree-select selectionMode="single"
                               :options="sectionTree"
                               :disabled="sectionModalSelectedDisabled"
                               v-model="sectionModalSelected"
                               @change="sectionSelectChange($event)"
                ></p-tree-select>
              </div>
              <div class="p-inputgroup my-2">
                <span class="col-6 p-inputgroup-addon">Доступен:</span>
                <p-toggle-button on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                                 on-label="Активен" off-label="Неактивен"
                                 v-model="section.activity"
                ></p-toggle-button>
              </div>
            </div>
            <div v-else>
              Удалить раздел (включая все элементы)
            </div>

            <template #footer>
              <p-button label="Подтвердить" icon="pi pi-check" :disabled="sectionModal.confirmDisabled" @click="sectionConfirm()"></p-button>
              <p-button label="Отмена" icon="pi pi-times" class="p-button-text" @click="sectionCancel()"></p-button>
            </template>
          </p-dialog>
        </template>

      </div>

      <!-- Elements -->
      <div class="col">
        <div class="position-relative" :style="{'max-height': elementShow ? '100%' : '30px'}">
          <div style="height: 20px">
            <p-button v-tooltip.left="'Скрыть'" :label="elementShow ? '-' : '+'" :class="'position-absolute p-0 p-button-white'"
                      style="width: 30px; height: 20px; right: 1px; top: 1px;"
                      :style="{'z-index': 100}"
                      @click="elementShow = !elementShow"
            ></p-button>
          </div>

          <template v-if="elementShow">
            <p-table v-if="elements.length"
                     :value="elements" datakey="id"
                     :loading="elementsLoading"
                     :resizable-columns="true" column-resize-mode="fit" show-gridlines
                     selection-mode="multiple" :meta-key-selection="false"
                     :paginator="elements.length > 5" :rows="10" :rows-per-page-options="[5,10,20,50]"
                     paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                     current-page-report-template="Showing {first} to {last} of {totalRecords}"
                     responsive-layout="scroll"
                     v-model:selection="elementsSelected"
                     @dblclick="loadElement($event)"
            >
              <p-t-column field="id" :sortable="true" header="<?= gTxtDB('elements', 'id') ?>">
                <template #body="slotProps">
                  <div :data-id="slotProps.data.id">
                    {{ slotProps.data.id }}
                  </div>
                </template>
              </p-t-column>
              <p-t-column field="codeName" :sortable="true" header="<?= gTxtDB('elements', 'id') ?>"></p-t-column>
              <p-t-column field="name" :sortable="true" header="<?= gTxtDB('elements', 'name') ?>"></p-t-column>
              <p-t-column field="activity" :sortable="true" header="<?= gTxtDB('elements', 'activity') ?>" :class="'text-center'">
                <template #body="slotProps">
                  <span v-if="!!slotProps.data.activity" class="pi pi-check" style="color: green"></span>
                  <span v-else class="pi pi-times" style="color: red"></span>
                </template>
              </p-t-column>
              <p-t-column field="sort" :sortable="true" header="<?= gTxtDB('elements', 'sort') ?>" :class="'text-center'"></p-t-column>
              <p-t-column field="lastEditDate" :sortable="true" header="<?= gTxtDB('elements', 'lastEditDate') ?>"></p-t-column>
            </p-table>

            <div class="mt-1 d-flex justify-content-between">
              <span>
                <p-button v-if="sectionSelected" v-tooltip.bottom="'Создать элемент'" icon="pi pi-plus-circle" class="p-button-success me-2"
                          :loading="elementsLoading" @click="createElement"></p-button>
                <span v-if="elements.length">
                  <p-button v-tooltip.bottom="'Изменить элемент'" icon="pi pi-cog" class="p-button-warning me-2"
                            :loading="elementsLoading" @click="changeElements"></p-button>
                  <p-button v-tooltip.bottom="'Копировать элемент'" icon="pi pi-copy" class="p-button-warning me-2"
                            :loading="elementsLoading" @click="copyElement"></p-button>
                  <p-button v-tooltip.bottom="'Удалить элемент'" icon="pi pi-trash" class="p-button-danger me-2"
                            :loading="elementsLoading" @click="deleteElements"></p-button>
                </span>
              </span>

              <div v-if="elements.length">
                <p-button v-tooltip.bottom="'Выделить все'" icon="pi pi-check" class="p-button-warning"
                          :loading="elementsLoading" @click="selectedAll"></p-button>
                <p-button v-if="elementsSelected.length"
                          v-tooltip.left="'Снять выделение'" icon="pi pi-times" class="p-button-danger ms-2"
                          :loading="elementsLoading" @click="clearAll"></p-button>
                <p-button v-if="elementsSelected.length"
                          v-tooltip.left="'Показать выбранные'" icon="pi pi-bars" class="p-button-warning ms-2"
                          @click="elementsSelectedShow = !elementsSelectedShow"
                ></p-button>
              </div>
            </div>

            <div v-if="elementsSelectedShow" class="position-absolute bg-white p-2 end-0 bottom-0" style="min-width: 230px">
              <div class="position-relative pt-4">
                <p-button v-tooltip.left="'Закрыть'" icon="pi pi-times" class="position-absolute top-0 end-0"
                          style="width: 25px;height: 25px"
                          @click="elementsSelectedShow = !elementsSelectedShow"></p-button>
                <div v-for="item of elementsSelected" class="d-flex justify-content-between align-items-center my-1">
                  <div>{{ item.name }}</div>
                  <p-button v-tooltip.left="'Убрать выделение'" icon="pi pi-times" class="p-button-danger p-button-outlined"
                            style="width: 25px;height: 25px"
                            @click="unselectedElement(item.id)"></p-button>
                </div>
              </div>
            </div>

            <p-dialog v-model:visible="elementsModal.display" :modal="true">
              <template #header>
                <h4>{{ elementsModal.title }}</h4>
              </template>

              <div v-if="queryParam.dbAction !== 'deleteElements'" style="min-width: 500px">
                <!-- Тип элемента -->
                <div class="p-inputgroup my-2">
                  <span class="p-inputgroup-addon col-5">Тип элемента:</span>
                  <span v-if="!elementsModal.single" class="p-inputgroup-addon">
                    <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.type"></p-checkbox>
                  </span>
                  <p-select option-label="name" option-value="symbolCode"
                            :editable="true"
                            :disabled="!fieldChange.type"
                            :options="codes"
                            v-model="element.type"
                  ></p-select>
                </div>
                <!-- Имя элемента -->
                <div v-if="elementsModal.single" class="p-inputgroup my-2">
                  <span class="p-inputgroup-addon col-5">Имя элемента:</span>
                  <p-input-text v-model="element.name" @input="elementNameInput()" autofocus></p-input-text>
                </div>
                <!-- Раздел -->
                <div class="p-inputgroup my-2">
                  <span class="p-inputgroup-addon col-5">
                    Родительский раздел <i class="pi pi-question" v-tooltip.bottom="'Выберите раздел!'" style="color: red"></i>:
                  </span>
                  <span v-if="!elementsModal.single" class="p-inputgroup-addon">
                    <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.parentId"></p-checkbox>
                  </span>
                  <p-tree-select selectionMode="single"
                                 :options="sectionTreeModal"
                                 :disabled="elementParentModalDisabled || !fieldChange.parentId"
                                 v-model="elementParentModalSelected"
                                 @change="elementParentModalSelectedChange($event)">
                  </p-tree-select>
                </div>
                <!-- Доступен -->
                <div class="p-inputgroup my-2">
                  <span class="p-inputgroup-addon col-5">Доступ:</span>
                  <span v-if="!elementsModal.single" class="p-inputgroup-addon">
                    <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.activity"></p-checkbox>
                  </span>
                  <p-toggle-button on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                                   on-label="Активен" off-label="Неактивен"
                                   :disabled="!fieldChange.activity"
                                   v-model="element.activity"
                  ></p-toggle-button>
                </div>
                <!-- Сортировка -->
                <div class="p-inputgroup my-2">
                  <span class="p-inputgroup-addon col-5">Сортировка:</span>
                  <span v-if="!elementsModal.single" class="p-inputgroup-addon">
                    <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.sort"></p-checkbox>
                  </span>
                  <p-input-number :disabled="!fieldChange.sort" :min="0" v-model="element.sort"></p-input-number>
                </div>
              </div>
              <div v-else>
                Удалить элемент(ы)
              </div>

              <template #footer>
                <p-button label="Подтвердить" icon="pi pi-check" :disabled="elementsModal.confirmDisabled" @click="elementConfirm()"></p-button>
                <p-button label="Отмена" icon="pi pi-times" class="p-button-text" @click="elementCancel()"></p-button>
              </template>
            </p-dialog>
          </template>
        </div>
      </div>
    </div>
  </div>
  <hr>

  <!-- Options -->
  <div class="container-fluid position-relative">
    <p-table v-if="options.length"
             :value="options" datakey="id"
             :loading="optionsLoading"
             :resizable-columns="true" column-resize-mode="fit" show-gridlines
             selection-mode="multiple" :meta-key-selection="false"
             :scrollable="true"
             responsive-layout="scroll"
             v-model:selection="optionsSelected"
             @dblclick="dblClickOptions($event)"
             :bodyClass="'text-center'"
    >
      <template #header>
        <p-multi-select :model-value="optionsColumnsSelected"
                          :options="optionsColumns"
                          option-label="name"
                          @update:model-value="onToggle"
                          placeholder="Настроить колонки" style="width: 20em"
          ></p-multi-select>
        <h3 class="d-inline ms-3">Открыт: {{ elementLoaded }} - {{ elementName }}</h3>
      </template>
      <p-t-column v-if="checkColumn('id')" field="id" :sortable="true" header="<?= gTxtDB('options', 'id') ?>" :class="'text-center'">
        <template #body="slotProps">
          <span :data-id="slotProps.data.id">{{ slotProps.data.id }}</span>
        </template>
      </p-t-column>
      <p-t-column v-if="checkColumn('images')" field="images" header="<?= gTxtDB('options', 'images') ?>">
        <template #body="slotProps">
          <p-image v-for="images of slotProps.data.images"
                   :src="images.src" preview
                   image-style="max-width: 70px"
          ></p-image>
        </template>
      </p-t-column>
      <p-t-column field="name" :sortable="true" header="<?= gTxtDB('options', 'name') ?>"></p-t-column>
      <p-t-column v-if="checkColumn('unitName')" field="unitName" header="<?= gTxtDB('options', 'unitName') ?>"></p-t-column>
      <p-t-column v-if="checkColumn('activity')" field="activity" :sortable="true" header="<?= gTxtDB('options', 'activity') ?>" :class="'text-center'">
        <template #body="slotProps">
          <span v-if="!!+slotProps.data.activity" class="pi pi-check" style="color: green"></span>
          <span v-else class="pi pi-times" style="color: red"></span>
        </template>
      </p-t-column>
      <p-t-column v-if="checkColumn('sort')" field="sort" :sortable="true" header="<?= gTxtDB('options', 'sort') ?>" :class="'text-center'"></p-t-column>
      <p-t-column v-if="checkColumn('moneyInputName')" field="moneyInputName" :sortable="true" header="<?= gTxtDB('options', 'moneyInputName') ?>"></p-t-column>
      <p-t-column v-if="checkColumn('inputPrice')" field="inputPrice" :sortable="true" header="<?= gTxtDB('options', 'inputPrice') ?>">
        <template #body="slotProps">
          {{ (+slotProps.data.inputPrice).toFixed(2) }}
        </template>
      </p-t-column>
      <p-t-column v-if="checkColumn('outputPercent')" field="outputPercent" :sortable="true" header="<?= gTxtDB('options', 'outputPercent') ?>"></p-t-column>
      <p-t-column v-if="checkColumn('moneyOutputName')" field="moneyOutputName" :sortable="true" header="<?= gTxtDB('options', 'moneyOutputName') ?>"></p-t-column>
      <p-t-column v-if="checkColumn('outputPrice')" field="outputPrice" :sortable="true" header="<?= gTxtDB('options', 'outputPrice') ?>"></p-t-column>
    </p-table>

    <div v-if="options.length" class="mt-1 d-flex justify-content-between">
      <div></div>
      <div>
        <p-button v-tooltip.left="'Добавить вариант'"
                  icon="pi pi-plus-circle" class="p-button-success me-2"
                  :loading="optionsLoading" @click="createOption"></p-button>
        <span>
          <p-button v-tooltip.bottom="'Изменить вариант'" icon="pi pi-cog" class="p-button-warning me-2"
                    :loading="optionsLoading" @click="changeOptions"></p-button>
          <p-button v-tooltip.bottom="'Копировать вариант'" icon="pi pi-copy" class="p-button-warning me-2"
                    :loading="optionsLoading" @click="copyOption"></p-button>
          <p-button v-tooltip.bottom="'Удалить вариант'" icon="pi pi-trash" class="p-button-danger me-2"
                    :loading="optionsLoading" @click="deleteOptions"></p-button>
        </span>
      </div>

      <div class="d-flex justify-content-end" style="min-width: 130px">
        <p-button v-tooltip.bottom="'Выделить все'" icon="pi pi-check" class="p-button-warning"
                  :loading="elementsLoading" @click="selectedAllOptions"></p-button>
        <p-button v-if="optionsSelected.length"
                  v-tooltip.left="'Снять выделение'" icon="pi pi-times" class="p-button-danger ms-2"
                  :loading="elementsLoading" @click="clearAllOptions"></p-button>
        <p-button v-if="optionsSelected.length"
                  v-tooltip.left="'Показать выбранные'" icon="pi pi-bars" class="p-button-warning ms-2"
                  @click="optionsSelectedShow = !optionsSelectedShow"></p-button>
      </div>
    </div>

    <div v-if="optionsSelectedShow" class="position-absolute bg-white end-0 bottom-0 p-2" style="min-width: 230px">
      <div class="position-relative pt-4">
        <p-button v-tooltip.left="'Закрыть'" icon="pi pi-times" class="position-absolute p-button-raised end-0 top-0"
                  style="width: 25px;height: 25px;"
                  @click="optionsSelectedShow = !optionsSelectedShow"></p-button>
        <div v-for="item of optionsSelected" class="d-flex justify-content-between align-items-center my-1">
          <div>{{ item.name }}</div>
          <p-button v-tooltip.left="'Снять выделение'" icon="pi pi-times" class="p-button-danger p-button-outlined"
                    style="width: 25px;height: 25px"
                    @click="unselectedOption(item.id)"></p-button>
        </div>
      </div>
    </div>

    <p-dialog v-model:visible="optionsModal.display" :modal="true" style="min-width: 70vw">
      <template #header>
        <h4>{{ optionsModal.title }}</h4>
      </template>

      <div v-if="queryParam.dbAction !== 'deleteOptions'" class="row">
        <!-- Основное -->
        <div class="col-6">
          <!-- Имя -->
          <div v-if="optionsModal.single" class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5">Имя варианта</span>
            <p-input-text v-model="option.name" autofocus></p-input-text>
          </div>
          <!-- Единица измерения -->
          <div class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5 text-nowrap">Единица измерения</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.unitId"></p-checkbox>
            </span>
            <p-select option-label="name" option-value="id"
                      :editable="true"
                      :disabled="!fieldChange.unitId"
                      :options="units"
                      v-model="option.unitId">
            </p-select>
          </div>
          <!-- Входная цена -->
          <div class="col text-center">Входная цена</div>
          <div class="p-inputgroup my-2">
            <!-- Валюта -->
            <span class="p-inputgroup-addon" :class="{'col-5': !optionsModal.single}">Валюта</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true"
                          v-model="fieldChange.moneyInputId"
              ></p-checkbox>
            </span>
            <p-select option-label="shortName" option-value="id"
                      :disabled="!fieldChange.moneyInputId"
                      :options="money" v-model="option.moneyInputId"
            ></p-select>
            <!-- Сумма -->
            <template v-if="optionsModal.single">
              <span class="p-inputgroup-addon">Сумма</span>
              <p-input-number mode="decimal" :min-fraction-digits="2" v-model="option.inputPrice"></p-input-number>
            </template>
          </div>
          <!-- Выходная цена -->
          <div class="col-12 text-center">Розничная цена</div>
          <div class="p-inputgroup my-2">
            <!-- Наценка -->
            <span class="p-inputgroup-addon col-5">Наценка</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.percent"></p-checkbox>
            </span>
            <p-input-number v-model="option.percent" class="p-inputtext-sm" show-buttons
                            :disabled="!fieldChange.percent"
                            :min="0" :max="10000" :step="0.25" suffix=" %"
                            :min-fraction-digits="1" :max-fraction-digits="2"
                            @input="changePercent()"
                            @blur="changePercent()"
            ></p-input-number>
          </div>
          <div class="p-inputgroup my-2">
            <!-- Валюта -->
            <span class="p-inputgroup-addon" :class="{'col-5': !optionsModal.single}">Валюта</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.moneyOutputId"></p-checkbox>
            </span>
            <p-select option-label="shortName" option-value="id"
                      :disabled="!fieldChange.moneyOutputId"
                      :options="money"
                      v-model="option.moneyOutputId"
            ></p-select>
            <!-- Сумма -->
            <template v-if="optionsModal.single">
              <span class="p-inputgroup-addon">Сумма</span>
              <p-input-number mode="decimal" :min-fraction-digits="2"
                              v-model="option.outputPrice"
                              @input="changeOutputPrice()"
                              @blur="changeOutputPrice()"
              ></p-input-number>
            </template>
          </div>
          <!-- Доступен -->
          <div class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5">Доступен</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.activity"></p-checkbox>
            </span>
            <p-toggle-button on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                             on-label="Активен" off-label="Неактивен"
                             :disabled="!fieldChange.activity"
                             v-model="option.activity"
            ></p-toggle-button>
          </div>
          <!-- Сортировка -->
          <div class="p-inputgroup my-2">
            <span class="p-inputgroup-addon col-5">Сортировка</span>
            <span v-if="!optionsModal.single" class="p-inputgroup-addon">
              <p-checkbox v-tooltip.bottom="'Не редактировать'" :binary="true" v-model="fieldChange.sort"></p-checkbox>
            </span>
            <p-input-number :disabled="!fieldChange.sort"
                            v-model="option.sort" :min="0"
            ></p-input-number>
          </div>
          <!-- Показать параметры -->
          <div v-if="!optionsModal.single" class="p-inputgroup my-5">
            <span class="p-inputgroup-addon col">Показать параметры</span>
            <p-toggle-button on-icon="pi pi-check" off-icon="pi pi-times" v-model="fieldChange.properties"></p-toggle-button>
          </div>
          <!-- Файлы -->
          <div v-if="optionsModal.single" class="col">
            <input type="file" class="d-none" id="uploadFile" multiple @change="addFile">
            <label class="p-button p-button-warning me-2" for="uploadFile">Загрузить</label>
            <p-button label="Выбрать" @click="chooseUploadedFiles()" class="p-button-warning"></p-button>
          </div>
          <div class="col">
            <div v-for="(file, id) of files"
                 class="row my-1 align-items-center text-center"
                 :class="{'error': file.fileError}"
                 :key="id"
                 :data-id="id"
            >
              <div class="col-2">
                <p-image :src="file.src" :alt="file.name" preview
                         image-style="max-width: 70px; max-height: 70px">
              </div>
              <span class="col-8 text-nowrap overflow-hidden">{{ file.name }}</span>
              <div class="col-2">
                <p-button icon="pi pi-times" @click="removeFile"></p-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Пользовательские параметры -->
        <div v-if="optionsModal.single || fieldChange.properties" class="col-6 overflow-auto" style="max-height: 90vh">
          <div class="form-label text-center mb-3">Параметры</div>
          <div v-for="(prop, key, index) of properties" class="p-inputgroup mb-2" :key="'t' + key">
            <span class="p-inputgroup-addon col-6 text-nowrap">{{ prop.name }}</span>
            <p-input-text v-if="prop.type === 'text'" v-model="option.properties[key]"></p-input-text>
            <p-input-number v-else-if="prop.type === 'number'" class="p-inputtext-sm" show-buttons
                            v-model="option.properties[key]"
            ></p-input-number>
            <p-textarea v-else-if="prop.type === 'textarea'" v-model="option.properties[key]" style="min-height: 42px"></p-textarea>
            <p-calendar v-else-if="prop.type === 'date'" date-format="dd.mm.yy" v-model="option.properties[key]"></p-calendar>
            <p-toggle-button v-else-if="prop.type === 'checkbox'"
                             on-icon="pi pi-check" off-icon="pi pi-times" class="w-100"
                             on-label="Да" off-label="Нет"
                             v-model="option.properties[key]"
            ></p-toggle-button>
            <p-select v-else option-label="name" option-value="id"
                      :options="prop.values"
                      v-model="option.properties[key]"
            ></p-select>
          </div>
        </div>
      </div>
      <div v-else>
        Удалить элемент(ы)
      </div>

      <template #footer>
        <p-button label="Подтвердить" icon="pi pi-check" :disabled="optionsModal.confirmDisabled" @click="optionsConfirm()"></p-button>
        <p-button label="Отмена" icon="pi pi-times" class="p-button-text" @click="optionsCancel()"></p-button>
      </template>
    </p-dialog>

    <p-dialog v-model:visible="optionsModal.chooseFileDisplay" :modal="true" style="max-width: 80vw">
      <template #header>
        <p-button v-tooltip.bottom="'Обновить'" icon="pi pi-sync" @click="refreshUploadedFiles"></p-button>
        <h4>Библиотека файлов</h4>
      </template>

      <span v-if="filesLoading" class="text-center"><i class="pi pi-spin pi-spinner"></i></span>
      <div v-else class="row">
        <div v-for="file of loadedFiles" class="col-6 col-lg-2 mb-3">
          <p-image class="w-100 text-center" preview :src="file.src" :alt="file.name" height="100"></p-image>
          <div class="my-1 text-center">
            <p-checkbox v-model="filesUpSelected[file.id]" :value="file.id" :id="'files-' + file.id"></p-checkbox>
            <label class="form-check-label ms-1" :for="'files-' + file.id" role="button">{{ file.name }}</label>
          </div>
        </div>
      </div>

      <template #footer>
        <p-button label="Закрыть" @click="closeChooseImage()"></p-button>
      </template>
    </p-dialog>
  </div>
</div>

