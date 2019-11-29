<template>
  <q-page class="flex">
    
    <q-splitter
      v-model="iTextBoxSplitter"
      style=""
      class="col"
      after-class="flex"
    >

      <template v-slot:before>
        <q-tabs
          v-model="sSelectedTextBox"
          vertical
          class=""
        >
          <q-btn color="primary" label="Add" @click="fnAddTextBox" unelevated class="col full-width"/>
          <q-tab 
            v-for="(oTextBox, sTextBoxID) in oTextBoxes"
            :name="sTextBoxID" 
            :label="oTextBox.sName" 
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="sSelectedTextBox"
          transition-prev="jump-up"
          transition-next="jump-up"
          class="col"
        >
          <q-tab-panel 
            v-for="(oTextBox, sTextBoxID) in oTextBoxes"
            :name="sTextBoxID"
            class="row"
          >

              <div class="col-8 column">
                <!--div class="col-auto text-h6 q-mb-sm">{{ oTextBox.sName }}</div-->
                <div class="col-auto q-mb-sm row">
                  <q-input
                    ref="textbox_name"
                    outlined 
                    dense
                    square
                    v-model="oTextBox.sName" 
                    label="Name" 
                    class="col"
                  />
                  <q-btn color="negative" label="Remove" @click="fnRemoveTextBox" square unelevated class="col-auto"/>
                </div>
                <codemirror
                  ref="cm_editor"
                  :value="oTextBox.sTextArea" 
                  :options="oCmOptions"
                  @ready="fnOnCmReady"
                  @focus="fnOnCmFocus"
                  @input="(sNewText) => { fnOnCmCodeChange(sNewText, oTextBox) }"
                  class="flex col"
                  style="width:100%"
                >
                </codemirror>
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
                      @click="fnRemoveResultTab(oTextBox, sResultID)" 
                      flat 
                      unelevated 
                      class="col-auto q-ml-sm"
                      v-if="oTextBox.sSelectedResultTab"
                    />
                  </q-tabs>

                  <q-separator />

                  <q-tab-panels 
                    v-model="oTextBox.sSelectedResultTab" 
                    class="flex"
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
                          class="col-auto"
                        />
                      </div>
                      <div class="col flex q-pl-sm">
                        <q-scroll-area
                          :thumb-style="oScollbarThumbStyle"
                          :bar-style="oScollbarBarStyle"
                          style="border: 1px solid #eee"
                          class="col"
                        >
                          {{ oResultItem.sResultText }}
                        </q-scroll-area>
                      </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </div>             
              </div>
              <div class="col-4 column q-pl-md">
                <div class="col-auto text-h6 q-mb-sm">Filters</div>
                <div class="col-5 column">
                  <div class="row col-auto">
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
                    <q-btn-dropdown color="primary" class="col-2 dropdown-without-arrow" dense unelevated dropdown-icon="none">
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

                        <q-item clickable v-close-popup @click="fnExecuteFilters">
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
                    <q-list bordered separator>
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
                          <q-checkbox v-model="oFilter.bSelected" />
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
                          <!--q-icon name="star" color="yellow" /-->
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-scroll-area>
                </div>
                <div class="col-6 column q-pt-md" v-if="sSelectedFilter!=''">
                  <!--div class="col-auto text-h6 q-mb-sm">{{ oFilters[sSelectedFilter].sName }}</div-->
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
                    <codemirror
                      ref="filter_cm_editor"
                      :value="oFilters[sSelectedFilter].sFunction" 
                      :options="oFilterCmOptions"
                      @input="(sNewText) => { fnOnFilterCmCodeChange(sNewText, sSelectedFilter) }"
                      class="flex col"
                      style="width:100%; height:100%"
                    >
                    </codemirror>
                  </div>
                </div>
              </div>

          </q-tab-panel>
        </q-tab-panels>
      </template>

    </q-splitter>

  </q-page>
</template>

<style>
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
import { codemirror } from 'vue-codemirror'
import Vue from 'vue'

// require styles
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/comment/continuecomment.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/mode/javascript/javascript.js'

import cuid from 'cuid';

//import fs from 'fs';
if (chrome) {
  const fs = require('~/lib/fs.js');
} else {
  const fs = require('fs');
}

const utils = require('~/lib/utils.js');

const FILTER_REGEXP = "regexp";
const FILTER_TEXT = "text";
const FILTER_FUNCTION = "function";

const sDataFilePath = './data.json';

import { Notify } from 'quasar'

Notify.setDefaults({
  position: 'top-right',
  timeout: 2500,
  textColor: 'white',
  actions: [{ icon: 'close', color: 'white' }]
})

export default {
  name: 'PageIndex',

  components: {
    codemirror
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
          sSelectedResultTab: "",
          sTextArea: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.",
          oResults: {
            guid1: {
              sName: 'Undefined',
              sResultText: '123',
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
          sSelectedResultTab: "",
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

      sSelectedFilter: "",
      sSelectedFilterType: "",
      sSelectedTextBox: '',

      oApplicationSettings: {
        sHomePath: '',
        sConfigurationPath: ''
      },

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
      sFiltersFilterText: '',

      iSaveTimeout: 5000,
      iTextBoxSplitter: 10
    }
  },

  computed: {
    oScollbarThumbStyle () 
    {
      return {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      }
    },

    oScollbarBarStyle () 
    {
      return {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0.2
      }
    }
  },

  methods: {
    fnOnCmReady(oCM)
    {

    },
    fnOnCmFocus(oCM)
    {

    },
    fnOnCmCodeChange(sNewText, oTextBox)
    {
      oTextBox.sTextArea = sNewText;
    },
    fnOnFilterCmCodeChange(sNewText, sSelectedFilter)
    {
      this.oFilters[sSelectedFilter].sFunction = sNewText;
    },
    fnFilterFilter(oFilter)
    {
      return ~oFilter.sName.indexOf(this.sFiltersFilterText);
    },
    fnSelectFilter(sFilterID)
    {
      // this.sSelectedFilter = sFilterID;
      // sSelectedFilterType
    },
    fnChangeFilterType(sValue, sSelectedFilter)
    {
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
      var oThis = this;
      var aKeys = Object.keys(oThis.oFilters);

      aKeys.forEach((sKey) => { 
        var oFilter = oThis.oFilters[sKey];

        if (oFilter.bSelected) {
          Vue.delete(oThis.oFilters, sKey);
          
          if (oThis.sSelectedFilter == sKey) {
            oThis.sSelectedFilter = sKey;
          }
        }
      });
    },
    fnExecuteFilters()
    {
      console.log(`this.sSelectedTextBox ${this.sSelectedTextBox}`);
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
          eval('var fnFunction = '+oFilter.sFunction);
          sResult = fnFunction(sResult);
        }

        oSelectedFilters[sKey] = oFilter
      });

      var sCUID = cuid();

      Vue.set(oResults, sCUID, {
        sName: '',
        sResultText: sResult,
        oFilters: oSelectedFilters
      });

      console.log(`oTextBox.oResults`, oTextBox.oResults)
    },
    fnReuseResultTab()
    {
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
    fnRemoveTextBox()
    {
      Vue.delete(this.oTextBoxes, this.sSelectedTextBox);

      this.sSelectedTextBox = '';
    },
    fnRemoveResultTab(oTextBox, sResultID)
    {
      Vue.delete(oTextBox.oResults, sResultID);

      oTextBox.sSelectedResultTab = utils.fnGetFirstKey(oTextBox.oResults);
    },
    fnNotifyError(sMessage)
    {
      this.$q.notify({ color: 'negative', message: sMessage, icon: 'report_problem' });
    },
    fnNotifySuccess(sMessage)
    {
      this.$q.notify({ message: sMessage, icon: 'thumb_up' });
    },
    async fnSaveData()
    {
      var sData = JSON.stringify(this.$data, null, 4);

      try {
        await fs.writeFile(sDataFilePath, sData);
      } catch (oError) {
        this.fnNotifyError(oError.toString());
        return;
      }

      //this.fnNotifySuccess("Data saved");
    },
    fnSaveLoop()
    {
      this.fnSaveData();

      setTimeout(this.fnSaveLoop, this.iSaveTimeout);
    }
  },

  async created()
  {
    if (fs.existsSync ? fs.existsSync(sDataFilePath) : await fs.exists(sDataFilePath)) {
      try {
        var oThis = this;
        var oData = JSON.parse(await fs.readFile(sDataFilePath).toString());
        var aKeys = Object.keys(oData);

        aKeys.forEach((sKey) => { 
          Vue.set(oThis.$data, sKey, oData[sKey]);
        });
      } catch (oError) {
        this.fnNotifyError(oError.toString());
      }
    }

    this.sSelectedTextBox = utils.fnGetFirstKey(this.oTextBoxes);

    this.fnSaveLoop();
  }
}
</script>
