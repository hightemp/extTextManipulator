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
          v-model="sCurrentTextBoxTab"
          vertical
          class=""
        >
          <q-tab 
            v-for="(oTextBox, sTextBoxID) in oTextBoxes"
            :name="sTextBoxID" 
            :label="oTextBox.sName" 
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="sCurrentTextBoxTab"
          animated
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
                <div class="col-auto text-h4 q-mb-md">{{ oTextBox.sName }}</div>
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
              </div>
              <div class="col-4 column q-px-md">
                <div class="col-auto text-h5 q-mb-md">Filters</div>
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
                    style=""
                    class="col"
                  >
                    <q-list bordered separator>
                      <q-item
                        v-if="fnFilterFilter(oFilter)" 
                        v-for="(oFilter, sFilterID) in oFilters"
                        clickable 
                        v-ripple
                        dense
                      >
                        <q-item-section side top>
                          <q-checkbox v-model="oFilter.bSelected" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ oFilter.sName }}</q-item-label>
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
                <div class="col-6">
                  123
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
  max-height: calc(100vh - 40px - 48px);
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
</style>

<script>

// require component
import { codemirror } from 'vue-codemirror'

// require styles
import 'codemirror/lib/codemirror.css'

const utils = require('~/lib/utils.js');

const FILTER_REGEXP = "regexp";
const FILTER_TEXT = "text";
const FILTER_FUNCTION = "function";

const aFiltersTypes = [
  FILTER_REGEXP,
  FILTER_TEXT,
  FILTER_FUNCTION
];

export default {
  name: 'PageIndex',

  components: {
    codemirror
  },

  data()
  {
    return {
      oTextBoxes: {
        guid1: {
          sName: 'Undefined',
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
        },
        guid2: {
          sName: 'Undefined 2',
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
      },
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
        guid3: {
          bSelected: false,
          sName: "Remove with function",
          sType: "function",
          sFunction: "function(sText) { return ''; }"
        }
      },



      oApplicationSettings: {
        sHomePath: '',
        sConfigurationPath: ''
      },

      oCmOptions: {
        lineNumbers: true,
        lineWrapping: true
      },
      sFiltersFilterText: '',

      iTextBoxSplitter: 10,
      sCurrentTextBoxTab: ''
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
      oTextBox.sTextArea = sNewText
    },
    fnFilterFilter(oFilter)
    {
      return ~oFilter.sName.indexOf(this.sFiltersFilterText);
    },
    fnAddFilter()
    {

    },
    fnRemoveFilters()
    {

    },
    fnExecuteFilters()
    {

    }
  },

  created()
  {
    this.sCurrentTextBoxTab = utils.fnGetFirstKey(this.oTextBoxes);
  }
}
</script>
