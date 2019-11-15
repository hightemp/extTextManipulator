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
                  @input="fnOnCmCodeChange"
                  class="col"
                >
                </codemirror>
              </div>
              <div class="col-4 column q-px-md">
                <div class="col-auto text-h5 q-mb-md">Filters</div>
                <div class="col-5">
                  <!--div class="row col"-->
                    <q-input 
                      outlined 
                      v-model="sFiltersFilterText" 
                      dense
                      label="Filter..." 
                      class="col"
                    />
                    <!--q-btn 
                      color="primary" 
                      label="Primary" 
                      class="col-2"
                    /-->
                  <!--/div-->
                  <q-scroll-area
                    :thumb-style="thumbStyle"
                    :content-style="contentStyle"
                    :content-active-style="contentActiveStyle"
                    style=""
                    class="col-auto"
                  >
                    <q-list>
                      <q-item v-for="(oFilter, sFilterID) in oFilters">
                        <q-item-section>
                          <q-item-label>{{ oFilter.sName }}</q-item-label>
                          <q-item-label caption lines="2"></q-item-label>
                        </q-item-section>

                        <q-item-section side top>
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
          sName: "Remove spaces",
          sType: "regexp",
          sRegExp: "\s+",
          sFlags: "g",
          sReplacement: ""
        },
        guid2: {
          sName: "Remove test",
          sType: "text",
          sSubString: "test",
          sReplacement: ""
        },
        guid3: {
          sName: "Remove with function",
          sType: "function",
          sFunction: "function(sText) { return ''; }"
        }
      },

      oApplicationSettings: {
        sHomePath: '',
        sConfigurationPath: ''
      },
      oConfiguration: {
        
      },

      oCmOptions: {

      },
      sFiltersFilterText: '',

      iTextBoxSplitter: 10,
      sCurrentTextBoxTab: ''
    }
  },

  methods: {
    fnOnCmReady(oCM)
    {

    },
    fnOnCmFocus(oCM)
    {

    },
    fnOnCmCodeChange(sNewText)
    {

    }
  },

  created()
  {
    this.sCurrentTextBoxTab = utils.fnGetFirstKey(this.oTextBoxes);
  }
}
</script>
