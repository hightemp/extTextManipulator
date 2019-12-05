<template>
  <q-page class="flex">
    
    <GlobalEvents
      @keyup.ctrl.s="fnSaveData(true)"
      @change="fnSaveData(true)"
    />
    
    <q-splitter
      v-model="iTextBoxSplitter"
      style=""
      class="col"
      after-class="flex"
      before-class="column"
    >

      <template v-slot:before>
          <div class="row col-auto q-pa-sm">
            <q-input 
              outlined 
              square 
              v-model="sTextBoxesFilterText" 
              dense
              label="Filter..." 
              class="col"
            >
              <template v-if="sTextBoxesFilterText" v-slot:append>
                <q-icon name="cancel" @click.stop="sTextBoxesFilterText = ''" class="cursor-pointer" />
              </template>
            </q-input>
            <q-btn-dropdown 
              color="primary" 
              class="col-2 dropdown-without-arrow" 
              dense 
              unelevated 
              flat
              dropdown-icon="none"
            >
              <template v-slot:label>
                <div class="row items-center no-wrap">
                  <q-icon left name="more_horiz" />
                </div>
              </template>

              <q-list dense>
                <q-item clickable v-close-popup @click="fnAddTextBox">
                  <q-item-section>
                    <q-item-label>Add</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="fnRemoveTextBoxes">
                  <q-item-section>
                    <q-item-label>Remove</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="fnCloneTextBox">
                  <q-item-section>
                    <q-item-label>Clone</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <q-scroll-area
            :thumb-style="oScollbarThumbStyle"
            :bar-style="oScollbarBarStyle"
            style="border: 1px solid #eee; height:calc(100% - 58px)"
            class=""
          >
            <q-list separator>
              <q-item
                v-if="fnTextBoxFilter(oTextBox)" 
                v-for="(oTextBox, sTextBoxID) in oTextBoxes"
                clickable 
                v-ripple
                dense
                :active="sSelectedTextBox==sTextBoxID"
                @click="sSelectedTextBox = sTextBoxID"
              >
                <q-item-section side top>
                  <q-checkbox 
                    v-model="oTextBox.bSelected" 
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ oTextBox.sName ? oTextBox.sName : 'Undefined' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
      </template>

      <template v-slot:after>
        <q-splitter
          v-model="iRightPanelSplitter"
          style=""
          class="col"
          after-class="flex"
        >
          <template v-slot:before>

            <q-tab-panels
              v-model="sSelectedTextBox"
              transition-prev="jump-up"
              transition-next="jump-up"
              class="col column"
            >
              <q-tab-panel 
                v-for="(oTextBox, sTextBoxID) in oTextBoxes"
                :name="sTextBoxID"
                class="q-pa-none column"
              >

                  <div class="col column">
                    <div class="col-auto q-pa-sm row">
                      <q-input
                        ref="textbox_name"
                        outlined 
                        dense
                        square
                        v-model="oTextBox.sName" 
                        label="Name" 
                        class="col"
                      />
                      <q-btn-toggle
                        flat
                        square 
                        unelevated 
                        class="col-auto"
                        v-model="bPasteAsText"
                        toggle-color="primary"
                        :options="[
                          {label: 'text', value: true},
                          {label: 'html', value: false}
                        ]"
                      />
                      <q-btn 
                        flat
                        color="negative" 
                        icon="delete" 
                        @click="fnRemoveTextBox" 
                        square 
                        unelevated 
                        class="col-auto"
                      />
                    </div>
                    <MonacoEditor 
                      ref="me_editor"
                      class="" 
                      style="width:100%;height:calc(50vh - 58px);border:1px solid grey"
                      v-model="oTextBox.sTextArea" 
                      :options="oMeOptions"
                      language="javascript" 
                      @editorDidMount="fnMonacoEditorDidMount"
                    />
                    <!--codemirror
                      ref="cm_editor"
                      :value="oTextBox.sTextArea" 
                      :options="oCmOptions"
                      @ready="fnOnCmReady"
                      @focus="fnOnCmFocus"
                      @input="(sNewText) => { fnOnCmCodeChange(sNewText, oTextBox) }"
                      class="flex col"
                      style="width:100%"
                    >
                    </codemirror-->
                    <div class="col-6">
                      <q-tabs
                        v-model="oTextBox.sSelectedResultTab"
                        dense
                        align="left"
                        active-color="primary"
                        indicator-color="primary"
                        narrow-indicator
                      >
                        <q-tab 
                          :name="sResultID" 
                          :label="oResultItem.sName ? oResultItem.sName : 'Undefined'" 
                          v-for="(oResultItem, sResultID) in oTextBox.oResults"
                        />
                          <q-btn 
                            color="primary" 
                            icon="loop"
                            @click="fnReuseResultTab" 
                            flat 
                            unelevated 
                            class="col-auto q-ml-auto"
                            v-if="oTextBox.sSelectedResultTab"
                          />
                          <q-btn 
                            color="primary" 
                            icon="close" 
                            @click="fnRemoveResultTab(oTextBox)" 
                            flat 
                            unelevated 
                            class="col-auto q-ml-sm"
                            v-if="oTextBox.sSelectedResultTab"
                          />
                        </q-tab>
                      </q-tabs>

                      <q-separator />

                      <q-tab-panels 
                        v-model="oTextBox.sSelectedResultTab" 
                        class="flex"
                        style="height: calc(100% - 32px)"
                      >
                        <q-tab-panel 
                          :name="sResultID" 
                          v-for="(oResultItem, sResultID) in oTextBox.oResults"
                          class="row flex"
                        >
                          <div class="col-3 column">
                            <q-input 
                              outlined 
                              square 
                              v-model="oResultItem.sName" 
                              dense
                              label="Name" 
                              class="col-auto q-pb-sm"
                            />
                            <q-input 
                              outlined 
                              square 
                              v-model="oResultItem.sFiltersFilter" 
                              dense
                              label="Filter" 
                              class="col-auto q-pb-sm"
                            />
                            <q-scroll-area
                              :thumb-style="oScollbarThumbStyle"
                              :bar-style="oScollbarBarStyle"
                              style="border: 1px solid #eee"
                              class="col-5 q-pb-sm"
                            >
                              <q-list bordered separator>
                                <q-item
                                  v-for="(oFilter, sFilterID) in oResultItem.oFilters"
                                  v-if="!oResultItem.sFiltersFilter || ~oFilter.sName.indexOf(oResultItem.sFiltersFilter)"
                                  clickable 
                                  v-ripple
                                  dense
                                  :active="oResultItem.sSelectedFilter==sFilterID"
                                  @click="fnSetSelectedFilterForResultItem(oResultItem, sFilterID)"
                                >
                                  <q-item-section>
                                    <q-item-label>{{ oFilter.sName ? oFilter.sName : 'Undefined' }}</q-item-label>
                                    <q-item-label caption lines="2">
                                      <small v-if="oFilter.sType=='regexp'">/{{ oFilter.sRegExp }}/{{ oFilter.sFlags }}</small>
                                      <small v-if="oFilter.sType=='text'">{{ oFilter.sSubString }}</small>
                                    </q-item-label>
                                  </q-item-section>

                                  <q-item-section side>
                                    <q-item-label caption>{{ oFilter.sType }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-list>                        
                            </q-scroll-area>
                            <div class="col-4 q-pa-sm" v-if="oSelectedResultItemFilter">
                              <b>Name:</b> {{ oSelectedResultItemFilter.sName }}<br>
                              <b>Type:</b> {{ oSelectedResultItemFilter.sType }}<br>
                              <div v-if="oSelectedResultItemFilter.sType=='regexp'">
                                <b>RegExp:</b> /{{ oSelectedResultItemFilter.sRegExp }}/{{ oSelectedResultItemFilter.sFlags }}<br>
                              </div>
                              <div v-if="oSelectedResultItemFilter.sType=='text'">
                                <b>Substring:</b> {{ oSelectedResultItemFilter.sSubString }}<br>
                              </div>
                              <div v-if="oSelectedResultItemFilter.sType=='function'">
                                <b>Function:</b> {{ oSelectedResultItemFilter.sFunction }}<br>
                              </div>
                            </div>
                          </div>
                          <div class="col flex q-pl-sm">
                            <q-scroll-area
                              :thumb-style="oScollbarThumbStyle"
                              :bar-style="oScollbarBarStyle"
                              style="border: 1px solid #eee"
                              class="col"
                            >
                              <code><pre style="user-select:text">{{ oResultItem.sResultText }}</pre></code>
                            </q-scroll-area>
                          </div>
                        </q-tab-panel>
                      </q-tab-panels>
                    </div>             
                  </div>
              </q-tab-panel>
            </q-tab-panels>

          </template>
          <template v-slot:after>
              <div class="col column q-pl-sm">
                <div class="col-auto text-h6 q-mb-sm">Storage</div>
                <div class="row col-auto q-mb-sm">
                  <!--q-linear-progress 
                    class="col"
                    size="32px" 
                    :value="iStorageFullnessSize/iStorageSize" 
                    color="accent"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge 
                        color="white" 
                        text-color="accent" 
                        :label="fnFormatSize(iStorageFullnessSize)+'/'+fnFormatSize(iStorageSize)" 
                      />
                    </div>
                  </q-linear-progress-->
                  <q-input 
                    outlined 
                    square 
                    v-model="sConfigFilePath" 
                    dense
                    readonly
                    label="Configuration file" 
                    class="col"
                  />
                  <q-btn flat dense icon="cloud_upload" class="col-1" @click="fnUploadConfig" />
                  <q-btn flat dense icon="cloud_download" class="col-1" @click="fnDownloadConfig" />
                </div>
                <div class="col-auto text-h6 q-mb-sm">Filters</div>
                <div class="col-4 column">
                  <div class="row col-auto q-pb-sm">
                    <q-select
                      class="col"
                      filled
                      dense
                      v-model="sSelectedGroup"
                      use-input
                      clearable
                      input-debounce="0"
                      label="Groups"
                      :options="aFiltersGroupsOptions"
                      @new-value="fnAddFiltersGroups"
                      @filter="fnFilterGroups"
                      @input="fnUpdateGroupCheckboxes"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No results
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <q-btn-dropdown 
                      color="primary" 
                      class="col-2 dropdown-without-arrow" 
                      dense 
                      unelevated 
                      dropdown-icon="none"
                      flat
                    >
                      <template v-slot:label>
                        <div class="row items-center no-wrap">
                          <q-icon left name="more_horiz" />
                        </div>
                      </template>

                      <q-list dense>
                        <q-item clickable v-close-popup @click="fnAddFiltersGroups">
                          <q-item-section>
                            <q-item-label>Add</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="fnRemoveFiltersGroups">
                          <q-item-section>
                            <q-item-label>Remove</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                  <div class="row col-auto q-pb-sm">
                    <q-input 
                      outlined 
                      square 
                      v-model="sFiltersFilterText" 
                      dense
                      label="Filter..." 
                      class="col"
                    >
                      <template v-if="sFiltersFilterText" v-slot:append>
                        <q-icon name="cancel" @click.stop="sFiltersFilterText = ''" class="cursor-pointer" />
                      </template>
                    </q-input>
                    <q-btn-dropdown 
                      color="primary" 
                      class="col-2 dropdown-without-arrow" 
                      dense 
                      unelevated 
                      flat
                      dropdown-icon="none"
                    >
                      <template v-slot:label>
                        <div class="row items-center no-wrap">
                          <q-icon left name="more_horiz" />
                        </div>
                      </template>

                      <q-list dense>
                        <q-item clickable v-close-popup @click="fnAddFilter">
                          <q-item-section>
                            <q-item-label>Add</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="fnRemoveFilters">
                          <q-item-section>
                            <q-item-label>Remove</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="fnExecuteFilters" :disable="!fnHasSelectedFilters()">
                          <q-item-section>
                            <q-item-label>Execute</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                  <q-scroll-area
                    :thumb-style="oScollbarThumbStyle"
                    :bar-style="oScollbarBarStyle"
                    style="border: 1px solid #eee"
                    class="col"
                  >
                    <q-list separator>
                      <q-item
                        v-if="fnFilterFilter(oFilter)" 
                        v-for="(oFilter, sFilterID) in oFilters"
                        clickable 
                        v-ripple
                        dense
                        :active="sSelectedFilter==sFilterID"
                        @click="sSelectedFilter = sFilterID"
                      >
                        <q-item-section side top>
                          <q-checkbox 
                            v-model="oFilter.bSelected" 
                            @input="fnUpdateCurrentGroup" 
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ oFilter.sName ? oFilter.sName : 'Undefined' }}</q-item-label>
                          <q-item-label caption lines="2">
                            <small v-if="oFilter.sType=='regexp'">/{{ oFilter.sRegExp }}/{{ oFilter.sFlags }}</small>
                            <small v-if="oFilter.sType=='text'">{{ oFilter.sSubString }}</small>
                          </q-item-label>
                        </q-item-section>

                        <q-item-section side>
                          <q-item-label caption>{{ oFilter.sType }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-scroll-area>
                </div>
                <div class="col-6 column q-pt-md" v-if="oFilters[sSelectedFilter]">
                  <q-input
                    ref="filter_name"
                    outlined 
                    square
                    dense
                    v-model="oFilters[sSelectedFilter].sName" 
                    label="Name" 
                    class="col-auto q-mb-sm"
                  />

                  <q-select 
                    class="col-auto q-mb-sm" 
                    filled 
                    square
                    dense
                    v-model="oFilters[sSelectedFilter].sType" 
                    :options="aFiltersTypes" 
                    label="Type" 
                    @input="(v) => fnChangeFilterType(v, sSelectedFilter)" 
                  />

                  <div class="col-auto column" v-show="oFilters[sSelectedFilter].sType=='regexp'">
                    <q-input 
                      square
                      dense
                      outlined 
                      v-model="oFilters[sSelectedFilter].sRegExp" 
                      label="Regular expression" 
                      class="col-auto q-mb-sm"
                    />
                    <q-input 
                      ref="filter_flags"
                      outlined 
                      square
                      dense
                      v-model="oFilters[sSelectedFilter].sFlags" 
                      label="Flags" 
                      class="col-auto q-mb-sm"
                      :rules="[
                        v => /^[gmi]+$/.test(v) || 'Wrong flag',
                        v => !v.split('').some((v,i,a) => a.lastIndexOf(v)!=i ) || 'Duplicate flag'
                      ]"
                    />
                    <q-input
                      v-model="oFilters[sSelectedFilter].sReplacement"
                      square
                      dense
                      outlined
                      type="textarea"
                      label="Replacement"
                    />
                  </div>
                  <div class="col-auto column" v-show="oFilters[sSelectedFilter].sType=='text'">
                    <q-input outlined v-model="oFilters[sSelectedFilter].sSubString" label="String" class="col-auto q-mb-sm"/>
                    <q-input
                      v-model="oFilters[sSelectedFilter].sReplacement"
                      square
                      dense
                      outlined
                      type="textarea"
                      label="Replacement"
                    />
                  </div>
                  <div class="col column" v-show="oFilters[sSelectedFilter].sType=='function'">
                    <MonacoEditor 
                      ref="filter_me_editor"
                      class="flex col" 
                      :options="oMeFilterOptions"
                      v-model="oFilters[sSelectedFilter].sFunction" 
                      language="javascript" 
                    />
                    <!--codemirror
                      ref="filter_cm_editor"
                      :value="oFilters[sSelectedFilter].sFunction" 
                      :options="oFilterCmOptions"
                      @input="(sNewText) => { fnOnFilterCmCodeChange(sNewText, sSelectedFilter) }"
                      class="flex col"
                      style="width:100%; height:100%"
                    >
                    </codemirror-->
                  </div>
                </div>
              </div>

          </template>
        </q-splitter>
      </template>

    </q-splitter>

  </q-page>
</template>

<style>
/*
.CodeMirror {
  height: auto;
  min-height: 0;
  max-height: calc(50vh - 40px - 48px);
  width: auto;
  min-width: 0;
  max-width: 100%;
  flex: 10000 1 0%;
  border: 1px solid #eee;
}
*/
.dropdown-without-arrow .on-left {
  margin-right: 0px;
}
.dropdown-without-arrow .q-btn-dropdown__arrow {
  display: none;
}
.q-tab__label {
  word-break: break-all;
  word-wrap: break-word;
  white-space: normal;
}
</style>

<script>

// require component
// import { codemirror } from 'vue-codemirror';
import Vue from 'vue';

import GlobalEvents from 'vue-global-events';

// require styles
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/addon/edit/matchbrackets.js';
// import 'codemirror/addon/comment/continuecomment.js';
// import 'codemirror/addon/comment/comment.js';
// import 'codemirror/mode/javascript/javascript.js';

import MonacoEditor from 'vue-monaco'

import cuid from 'cuid';

const deepcopy = require('deepcopy');
const stackTrace = require('stack-trace');

const moment = require('moment');

const fs = require('~/lib/fs.js').default;
const utils = require('~/lib/utils.js').default;

const storage = require('~/lib/local_storage.js').default;

const FILTER_REGEXP = "regexp";
const FILTER_TEXT = "text";
const FILTER_FUNCTION = "function";

import { Notify } from 'quasar';

Notify.setDefaults({
  position: 'top-right',
  timeout: 2500,
  textColor: 'white',
  actions: [{ icon: 'close', color: 'white' }]
});

export default {
  name: 'PageIndex',

  components: {
    //codemirror,
    MonacoEditor,
    GlobalEvents
  },

  data()
  {
    return {
      aFiltersTypes: [
        FILTER_REGEXP,
        FILTER_TEXT,
        FILTER_FUNCTION
      ],

      oTextBoxes: {
        /*
        guid1: {
          sName: 'Undefined',
          bSelected: false,
          sSelectedResultTab: "",
          sFiltersFilter: '',
          sTextArea: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.",
          oResults: {
            guid1: {
              sName: 'Undefined',
              sResultText: '123',
              sSelectedFilter: '',
              oFilters: {
                guid1: {
                  bSelected: false,
                  sName: "Remove spaces",
                  sType: "regexp",
                  sRegExp: "\s+",
                  sFlags: "g",
                  sReplacement: ""
                },
                guid2: {
                  bSelected: false,
                  sName: "Remove test",
                  sType: "text",
                  sSubString: "test",
                  sReplacement: ""
                },
              }
            },
            guid2: {
              sName: 'Test',
              sResultText: 'Lorem ipsum dolor sit'
            }
          }
        },
        guid2: {
          sName: 'Undefined 2',
          bSelected: false,
          sSelectedResultTab: "",
          sFiltersFilter: '',
          sTextArea: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.",
          oResults: {
            guid1: {
              sName: 'Undefined',
              sResultText: '123'
            },
            guid2: {
              sName: 'Test',
              sResultText: 'Lorem ipsum dolor sit'
            }
          }
        }
        */
      },
      oFiltersGroups: {
        /*
        guid1: {
          sName: 'group1',
          aFilters: [
            'guid1',
            'guid2'
          ]
        }
        */
      },
      oFilters: {
        /*
        guid1: {
          bSelected: false,
          sName: "Remove spaces",
          sType: "regexp",
          sRegExp: "\s+",
          sFlags: "g",
          sReplacement: ""
        },
        guid2: {
          bSelected: false,
          sName: "Remove test",
          sType: "text",
          sSubString: "test",
          sReplacement: ""
        },
        guid3: {
          bSelected: false,
          sName: "Remove with function",
          sType: "function",
          sFunction: "function(sText) { return ''; }"
        }
        */
      },

      sSelectedGroup: "",
      sSelectedFilter: "",
      sSelectedFilterType: "",
      sSelectedTextBox: '',

      iStorageSize: 0,
      iStorageFullnessSize: 0,

      bPasteAsText: false,

      oApplicationSettings: {
        sHomePath: '',
        sConfigurationPath: ''
      },

      oMeFilterOptions: {
        automaticLayout: true
      },
      oMeOptions: {
        automaticLayout: true
      },

      /*
      oFilterCmOptions: {
        mode: 'javascript',
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        continueComments: "Enter",
        extraKeys: {"Ctrl-Q": "toggleComment"}
      },

      oCmOptions: {
        lineNumbers: true,
        lineWrapping: true
      },
      */

      sTextBoxesFilterText: '',
      sFiltersFilterText: '',

      sConfigFilePath: "123",

      iSaveTimerID: -1,
      iSaveTimeout: 15000,
      iTextBoxSplitter: 10,
      iRightPanelSplitter: 70
    }
  },

  computed: {
    oScollbarThumbStyle() 
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      return {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      }
    },

    oScollbarBarStyle() 
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      return {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0.2
      }      
    },

    aFiltersGroupsOptions: {
      get()
      {
        console.log(stackTrace.get()[0].getFunctionName(), arguments);

        var oThis = this;
        var aKeys = Object.keys(oThis.oFiltersGroups);
        var aNames = [];

        aKeys.forEach((sKey) => {
          //if (!oThis.sSelectedGroup || ~oThis.oFiltersGroups[sKey].sName.indexOf(oThis.sSelectedGroup))
          aNames.push(oThis.oFiltersGroups[sKey].sName) 
        });

        console.log('>>> aNames', aNames);

        return aNames;
      },
      cache: false
    },

    oSelectedTextBox()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      return this.oTextBoxes[this.sSelectedTextBox];
    },

    oSelectedResultItemFilter()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      var oTextBox = this.oSelectedTextBox;
      var oResultItem = oTextBox.oResults[oTextBox.sSelectedResultTab];

      if (!oResultItem || !oResultItem.oFilters)
        return undefined;

      return oResultItem.oFilters[oResultItem.sSelectedFilter];
    }
  },

  methods: {
    async fnCalcStorageFullnessSize()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var sConfig = await storage.getItem('config');

      this.iStorageFullnessSize = sConfig.length*1;
    },
    fnCalcstorageSize()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      this.iStorageSize = 10 * 1024 * 1024;

      return;

      if (storage && !storage.getItem('size')) {
        var i = 0;
        try {
          // Test up to 10 MB
          for (i = 250; i <= 50000; i += 250) {
              storage.setItem('test', new Array((i * 1024) + 1).join('a'));
          }
        } catch (e) {
          storage.removeItem('test');
          storage.setItem('size', i - 250);
          console.log('>>> storage size', i - 250);
        }
      }

      this.iStorageSize = storage.getItem('size')*1;
    },
    fnFormatSize(iValue)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      var aSuffixes = [ 'B', 'KB', 'MB', 'GB' ];
      var iSuffixIndex = 0;

      while (iValue > 1024) {
        iSuffixIndex++;
        iValue /= 1024;
      }

      return `${Math.round(iValue, 2)} ${aSuffixes[iSuffixIndex]}`;
    },
    fnMonacoEditorDidMount(oMonacoEditor)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      window.onresize = function () {
        console.log(stackTrace.get()[0].getFunctionName(), arguments);

        if (oMonacoEditor) {
          oMonacoEditor.layout();
        }
      };
    },
    fnOnCmReady(oCodeMirror)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      this.fnSetCodemirrorEventHandlers(oCodeMirror)
    },
    fnSetCodemirrorEventHandlers(oCodeMirror)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      var oThis = this;

      console.log(oCodeMirror);

      oCodeMirror
        .on(
          'paste', 
          function(oCodeMirror, oEvent) 
          {
            console.log('codemirror - paste', oCodeMirror, oEvent);

            var oClipboardData = (oEvent.clipboardData || window.clipboardData);

            /*
            for (var iIndex in oClipboardData.items)
            {
                var oItem = oClipboardData.items[iIndex];

                if (oItem.kind == 'file') {
                    window.oApplication.bShowLoadingScreen = true;

                    var oFile = oItem.getAsFile();

                    var oFormData = new FormData();

                    oFormData.append('action', 'upload_images');
                    oFormData.append('repository', oThis.oRepository.sName);
                    oFormData.append('pasted_files[]', oFile);

                    oThis
                        .$http
                        .post(
                            '',
                            oFormData
                        ).then(function(oResponse)
                        {
                            window.oApplication.bShowLoadingScreen = false;

                            if (oResponse.body.status=='error') {
                                oThis.$snotify.error(oResponse.body.message, 'Error');
                                return;
                            }

                            oCodeMirror.replaceSelection('![](/images/'+oResponse.body.data[0]+')');
                        })
                        .catch(function(sError)
                        {
                            oThis.$snotify.error(sError);
                            window.oApplication.bShowLoadingScreen = false;
                        });

                    return;
                }
            }
            */

            if (oThis.bPasteAsText) {
              var sText = oClipboardData.getData('text/plain');
              oCodeMirror.replaceSelection(sText);

              oEvent.preventDefault();
              return;
            }

            if (~oClipboardData.types.indexOf('text/html')) {

              for (var iIndex in oClipboardData.items) {
                var oItem = oClipboardData.items[iIndex];

                if (oItem.type=='text/html') {
                  oItem.getAsString(s => oCodeMirror.replaceSelection(s));
                }
              }

              oEvent.preventDefault();
              return;
            }
          }
      );      
    },
    fnOnCmFocus(oCM)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
    },
    fnOnCmCodeChange(sNewText, oTextBox)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      oTextBox.sTextArea = sNewText;
    },
    fnOnFilterCmCodeChange(sNewText, sSelectedFilter)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      this.oFilters[sSelectedFilter].sFunction = sNewText;
    },
    fnFilterFilter(oFilter)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      return ~oFilter.sName.indexOf(this.sFiltersFilterText);
    },
    fnSelectFilter(sFilterID)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      // this.sSelectedFilter = sFilterID;
      // sSelectedFilterType
    },
    fnChangeFilterType(sValue, sSelectedFilter)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var aAttributes = [ "sRegExp", "sFlags", "sSubString", "sFunction" ];

      var oFilter = this.oFilters[sSelectedFilter];

      aAttributes.forEach((v) => Vue.delete(oFilter, v) );

      if (sValue==FILTER_REGEXP) {
        Vue.set(oFilter, 'sRegExp', '');
        Vue.set(oFilter, 'sFlags', '');
      }
      if (sValue==FILTER_TEXT) {
        Vue.set(oFilter, 'sSubString', '');
      }
      if (sValue==FILTER_FUNCTION) {
        Vue.set(oFilter, 'sFunction', '');
      }

      oFilter.sType = sValue;
    },
    fnAddFilter()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var sCUID = cuid();

      Vue.set(this.oFilters, sCUID, {
        bSelected: false,
        sName: "",
        sType: "regexp",
        sRegExp: "",
        sFlags: "g",
        sReplacement: ""
      });

      this.sSelectedFilter = sCUID;
    },
    fnRemoveFilters()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var aKeys = Object.keys(oThis.oFilters);

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        if (oFilter.bSelected) {
          Vue.delete(oThis.oFilters, sKey);
          
          if (oThis.sSelectedFilter == sKey) {
            oThis.sSelectedFilter = '';
          }
        }
      });
    },
    fnHasSelectedFilters()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var aKeys = Object.keys(oThis.oFilters);
      var bSelected = false;

      for (var sKey of aKeys) {
        var oFilter = oThis.oFilters[sKey];
        if (oFilter && oFilter.bSelected) {
          bSelected = true;
          break;
        }
      }

      console.log('fnHasSelectedFilters', bSelected);

      return bSelected;
    },
    fnSetSelectedFilterForResultItem(oResultItem, sFilterID)
    {
      Vue.set(oResultItem, 'sSelectedFilter', sFilterID);
    },
    fnExecuteFilters()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var oTextBox = this.oTextBoxes[this.sSelectedTextBox];
      var aKeys = Object.keys(oThis.oFilters);
      var oSelectedFilters = {};
      var sResult = oTextBox.sTextArea;
      var oResults = oTextBox.oResults;

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        if (!oFilter.bSelected) {
          return;
        }

        if (oFilter.sType==FILTER_REGEXP) {
          var oRegExp = new RegExp(oFilter.sRegExp, oFilter.sFlags);

          sResult = sResult.replace(oRegExp, oFilter.sReplacement);
        }
        if (oFilter.sType==FILTER_TEXT) {
          sResult = sResult.replace(oFilter.sSubString, oFilter.sReplacement);
        }
        if (oFilter.sType==FILTER_FUNCTION) {
          try {
            eval('var fnFunction = '+oFilter.sFunction);
          } catch (oError) {
            oThis.fnNotifyError(oError);
          }
          sResult = fnFunction(sResult);
        }

        oSelectedFilters[sKey] = deepcopy(oFilter);
      });

      var sCUID = cuid();

      Vue.set(oResults, sCUID, {
        sName: '',
        sResultText: sResult,
        sFiltersFilter: '',
        oFilters: oSelectedFilters
      });

      this.oTextBoxes[this.sSelectedTextBox].sSelectedResultTab = sCUID;

      console.log(`oTextBox.oResults`, oTextBox.oResults)
    },
    fnReuseResultTab()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var oTextBox = this.oTextBoxes[this.sSelectedTextBox];
      var oResultItem = oTextBox.oResults[oTextBox.sSelectedResultTab];
      var aKeys = Object.keys(oResultItem.oFilters);
      var sResult = oTextBox.sTextArea;
      
      aKeys.forEach((sKey) => { 
        var oFilter = oResultItem.oFilters[sKey];

        if (oFilter.sType==FILTER_REGEXP) {
          var oRegExp = new RegExp(oFilter.sRegExp, oFilter.sFlags);

          sResult = sResult.replace(oRegExp, oFilter.sReplacement);
        }
        if (oFilter.sType==FILTER_TEXT) {
          sResult = sResult.replace(oFilter.sSubString, oFilter.sReplacement);
        }
        if (oFilter.sType==FILTER_FUNCTION) {
          eval('var fnFunction = '+oFilter.sFunction);
          sResult = fnFunction(sResult);
        }
      });

      oResultItem.sResultText = sResult
    },
    fnAddTextBox()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var sCUID = cuid();

      Vue.set(
        this.oTextBoxes, 
        sCUID, 
        {
          sName: '',
          sSelectedResultTab: "",
          sTextArea: "",
          oResults: {
          }
        }
      );

      this.sSelectedTextBox = sCUID;
    },
    fnRemoveTextBoxes()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var aKeys = Object.keys(oThis.oTextBoxes);

      aKeys.forEach((sKey) => { 
        var oTextBox = oThis.oTextBoxes[sKey];

        if (oTextBox.bSelected) {
          Vue.delete(oThis.oTextBoxes, sKey);
          
          if (oThis.sTextBoxesFilterText == sKey) {
            oThis.sSelectedTextBox = '';
          }
        }
      });      
    },
    fnRemoveTextBox()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      Vue.delete(this.oTextBoxes, this.sSelectedTextBox);

      this.sSelectedTextBox = '';
    },
    fnCloneTextBox()
    {
      var oThis = this;
      var aKeys = Object.keys(oThis.oTextBoxes);

      aKeys.forEach((sKey) => { 
        var oTextBox = oThis.oTextBoxes[sKey];

        if (oTextBox.bSelected) {
          var sCUID = cuid();

          Vue.set(
            oThis.oTextBoxes, 
            sCUID, 
            deepcopy(oTextBox)
          );
        }
      });
    },
    fnTextBoxFilter(oTextBox)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      return ~oTextBox.sName.indexOf(this.fnTextBoxFilter);
    },
    fnRemoveResultTab(oTextBox)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      
      Vue.delete(oTextBox.oResults, oTextBox.sSelectedResultTab);

      oTextBox.sSelectedResultTab = utils.fnGetFirstKey(oTextBox.oResults);
    },
    fnFindFilterGroup(sName)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      for (var sKey in this.oFiltersGroups) {
        if (this.oFiltersGroups[sKey].sName==sName)
          return sKey;
      }
    },
    fnFilterGroups(sName, fnUpdate)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);

      var oThis = this;

      fnUpdate(() => {
        if (sName === '') {
          this.options = oThis.aFiltersGroupsOptions;
        } else {
          const needle = sName.toLowerCase()
          this.options = oThis.aFiltersGroupsOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
        }
      })
    },
    fnUpdateCurrentGroup()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;

      var sGroupKey = oThis.fnFindFilterGroup(oThis.sSelectedGroup);

      if (!oThis.oFiltersGroups[sGroupKey])
        return;

      var aKeys = Object.keys(oThis.oFilters);
      var aSelected = [];

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        if (oFilter.bSelected) {
          aSelected.push(sKey);
        }
      });
      
      oThis.oFiltersGroups[sGroupKey].aFilters = aSelected;
    },
    fnUpdateGroupCheckboxes(sName)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;

      var sGroupKey = oThis.fnFindFilterGroup(sName);
      var oGroup = oThis.oFiltersGroups[sGroupKey] ? oThis.oFiltersGroups[sGroupKey] : { aFilters: [] };
      console.log('>>> oGroup', oGroup, 'sGroupKey', sGroupKey);
      var aKeys = Object.keys(oThis.oFilters);

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        oFilter.bSelected = !!~oGroup.aFilters.indexOf(sKey);
      });
    },
    fnAddFiltersGroups(sName, fnDone)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;

      if (!fnDone || !sName || ~oThis.aFiltersGroupsOptions.indexOf(sName)) 
        return;
      
      var sCUID = cuid();
      var aKeys = Object.keys(oThis.oFilters);
      var aSelected = [];

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        if (oFilter.bSelected) {
          aSelected.push(sKey);
        }
      });

      Vue.set(
        oThis.oFiltersGroups, 
        sCUID, 
        {
          sName: sName,
          aFilters: aSelected
        }
      );

      //oThis.sSelectedGroup = sName;

      fnDone(sName, 'toggle');
    },
    fnRemoveFiltersGroups()
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var oThis = this;
      var aGroups = oThis.aFiltersGroupsOptions;
      
      if (aGroups.length) {
        var sGroupKey = this.fnFindFilterGroup(oThis.sSelectedGroup);

        if (!oThis.oFiltersGroups[sGroupKey]) {
          return;
        }

        Vue.delete(oThis.oFiltersGroups, sGroupKey);
        oThis.sSelectedGroup = '';
      }
    },
    fnNotifyError(sMessage)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      this.$q.notify({ color: 'negative', message: sMessage, icon: 'report_problem' });
    },
    fnNotifySuccess(sMessage)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      this.$q.notify({ message: sMessage, icon: 'thumb_up' });
    },
    async fnUploadConfig()
    {
      try {
        await storage.fnLoadData(this);
      } catch (oError) {
        this.fnNotifyError(oError && oError.toString());
        return;
      }
    },
    async fnDownloadConfig()
    {
      try {
        await storage.fnSaveData(this);
      } catch (oError) {
        this.fnNotifyError(oError && oError.toString());
        return;
      }
    },
    async fnSaveData(bShowNotification=false)
    {
      console.log(stackTrace.get()[0].getFunctionName(), arguments);
      var sData = JSON.stringify(this.$data, null, 4);

      try {
        await storage.setItem('config', sData);
        await this.fnCalcStorageFullnessSize();
      } catch (oError) {
        this.fnNotifyError(oError.toString());
        return;
      }

      if (bShowNotification) {
        this.fnNotifySuccess("Data saved");
      }
    },
    async fnSaveLoop()
    {
      console.log(stackTrace.get()[0].getFunctionName(), this.iSaveTimerID);

      if (!this.iSaveTimerID)
        return;

      console.log(`this.iSaveTimerID ${this.iSaveTimerID}`);

      this.iSaveTimerID = 0;

      await this.fnSaveData();

      this.iSaveTimerID = setTimeout(this.fnSaveLoop, this.iSaveTimeout);
    },
    async fnLoadData()
    {
      var sData;

      try {
        var oThis = this;

        sData = await storage.getItem('config');

        console.log('sData', sData);

        if (sData) {
          var oData = JSON.parse(sData);

          console.log('oData', oData);

          Object.assign(oThis.$data, oData);

          console.log('oThis.$data', oThis.$data);
        }
      } catch (oError) {
        this.fnNotifyError(oError.toString());

        if (sData) {
          var sStorageItemName = 'config_'+moment().unix();
          var sMessage = `config saved to '${sStorageItemName}'`;
          this.fnNotifyError(sMessage);
          console.error(sMessage);

          await storage.setItem(sStorageItemName, sData);
        }
      }
          
      await this.fnSaveData();
    }
  },

  async created()
  {
    console.log('created', stackTrace.get());
    console.log(stackTrace.get()[0].getFunctionName(), arguments);

    var oThis = this;

    await this.fnLoadData();

    this.fnCalcstorageSize();

    this.iSaveTimerID = -1;

    this.sSelectedTextBox = utils.fnGetFirstKey(this.oTextBoxes);

    await this.fnSaveLoop();
  }
}
</script>
