<template>
  <div class="bg-gray-100 p-8">
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">资产负债表(主表)（单位：万元）</h1>
        <div class="flex items-center space-x-4">
          <input v-model="period" type="month" class="px-3 py-2 border rounded" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- 左侧：资产部分 -->
        <div class="overflow-y-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="sticky top-0 bg-white">
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-4 py-2">资产</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期末余额</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期初余额</th>
              </tr>
            </thead>
            <tbody>
              <!-- 流动资产部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">流动资产：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.assets.current" :key="`current-asset-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 一年内到期的长期债权投资等 -->
              <tr v-for="(item, index) in data.assets.nonCurrentLongTerm" :key="`noncurrent-longterm-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.currentTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('currentAssets').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.assets.currentTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 长期投资部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">长期投资：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.assets.longTermInvestment" :key="`longterm-investment-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 固定资产部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">固定资产：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.assets.fixedAssets" :key="`fixed-assets-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 固定资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.fixedAssetsTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('fixedAssets').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.assets.fixedAssetsTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 无形资产及其他资产部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">无形资产及其他资产：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.assets.intangibleAssets" :key="`intangible-assets-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 无形资产及其他资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.intangibleAssetsTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('intangibleAssets').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.assets.intangibleAssetsTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 递延税款借项 -->
              <tr v-for="(item, index) in data.assets.deferredTaxAssets" :key="`deferred-tax-assets-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
              </tr>

              <!-- 资产总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.assetsTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-blue-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('assetsTotal').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-blue-50 font-bold text-blue-700">{{
                    data.assets.assetsTotal.beginBalance || 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 右侧：负债和所有者权益部分 -->
        <div class="overflow-y-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="sticky top-0 bg-white">
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-4 py-2">负债和所有者权益</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期末余额</th>
                <th class="border border-gray-300 px-4 py-2 w-40">期初余额</th>
              </tr>
            </thead>
            <tbody>
              <!-- 流动负债部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">流动负债：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.liabilities.current" :key="`current-liability-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.currentLiabilitiesTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('currentLiabilities').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.liabilities.currentLiabilitiesTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 长期负债部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">长期负债：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.liabilities.longTermLiabilities" :key="`longterm-liability-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 长期负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.longTermLiabilitiesTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('longTermLiabilities').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.liabilities.longTermLiabilitiesTotal.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 递延税款贷项 -->
              <tr v-for="(item, index) in data.liabilities.deferredTaxLiabilities" :key="`deferred-tax-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.liabilitiesTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getTotalLiabilities().toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    data.liabilities.liabilitiesTotal.beginBalance || 0
                    }}</span>
                </td>
              </tr>

              <!-- 所有者权益部分 -->
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-bold">所有者权益（或股东权益）：</td>
                <td class="border border-gray-300 px-4 py-2"></td>
                <td class="border border-gray-300 px-4 py-2"></td>
              </tr>

              <tr v-for="(item, index) in data.equity.items" :key="`equity-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded"
                    step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance"
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 所有者权益合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.equityTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getCurrentPeriodTotal('equity').toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{
                    getBeginBalanceTotal('equity').toLocaleString() }}</span>
                </td>
              </tr>

              <!-- 负债和所有者权益总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.liabilitiesAndEquityTotal.name }} <span
                    class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-blue-50 font-bold text-blue-800">{{
                    getGrandTotal().toLocaleString() }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-blue-50 font-bold text-blue-800">{{
                    data.equity.liabilitiesAndEquityTotal.beginBalance || 0
                    }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      <!-- 操作按钮 -->
      <div class="mt-4 flex justify-end space-x-4">
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="save">
          保存
        </button>
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" @click="reset">
          重置
        </button>
      </div>

      <!-- 附件和备注组件 -->
      <FormAttachmentAndRemarks :module-id="moduleId" :period="period" v-model:remarks="remarks"
        v-model:suggestions="suggestions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'
import balanceSheetData from './shanghaiNanhuaLanlingBalanceSheetData'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.BALANCE_SHEET
const remarks = ref('')
const suggestions = ref('')

const data = ref(balanceSheetData)





// 计算期初余额合计
const getBeginBalanceTotal = (category: string): number => {
  switch (category) {
    case 'equity':
      const minorityBeginBalance = data.value.equity.items?.find(item => item.special)?.beginBalance || 0
      const parentCompanyBeginBalance = data.value.equity.items?.filter(item => !item.special).reduce((sum, item) => sum + (item.beginBalance || 0), 0) || 0
      return parentCompanyBeginBalance + minorityBeginBalance
    default:
      return 0
  }
}

// 计算当期合计值
const getCurrentPeriodTotal = (category: string): number => {
  switch (category) {
    case 'currentAssets':
      return (data.value.assets.current?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0) +
        (data.value.assets.nonCurrentLongTerm?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0)
    case 'longTermInvestment':
      return data.value.assets.longTermInvestment?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
    case 'fixedAssets':
      return data.value.assets.fixedAssets?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
    case 'intangibleAssets':
      return data.value.assets.intangibleAssets?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
    case 'assetsTotal':
      return getCurrentPeriodTotal('currentAssets') + getCurrentPeriodTotal('longTermInvestment') +
        getCurrentPeriodTotal('fixedAssets') + getCurrentPeriodTotal('intangibleAssets') +
        (data.value.assets.deferredTaxAssets?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0)
    case 'currentLiabilities':
      return data.value.liabilities.current?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
    case 'longTermLiabilities':
      return data.value.liabilities.longTermLiabilities?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
    case 'liabilitiesTotal':
      return getCurrentPeriodTotal('currentLiabilities') + getCurrentPeriodTotal('longTermLiabilities') +
        (data.value.liabilities.deferredTaxLiabilities?.reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0)
    case 'equity':
      const minorityEquity = data.value.equity.items?.find(item => item.special)?.endBalance || 0
      const parentCompanyEquity = data.value.equity.items?.filter(item => !item.special).reduce((sum, item) => sum + (item.endBalance || 0), 0) || 0
      return parentCompanyEquity + minorityEquity
    case 'liabilitiesAndEquityTotal':
      return getCurrentPeriodTotal('liabilitiesTotal') + getCurrentPeriodTotal('equity')
    default:
      return 0
  }
}

// 自动从一月份设置期初余额
const autoSetBeginBalanceFromJanuary = async () => {
  const currentPeriod = period.value.slice(0, 7)

  // 如果是1月份，不自动设置期初余额
  if (currentPeriod.endsWith('-01')) {
    console.log('1月份不自动设置期初余额')
    return
  }

  try {
    // 获取当年的1月份期间
    const currentYear = currentPeriod.slice(0, 4)
    const januaryPeriod = `${currentYear}-01`

    console.log(`尝试从一月份 ${januaryPeriod} 设置期初余额`)

    // 获取一月份的数据
    const response = await fetch(`http://47.111.95.19:3000/nanhua-balance-sheet/${januaryPeriod}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        const januaryData = result.data
        console.log('获取到一月份数据:', januaryData)

        // 设置期初余额为一月份的期初余额
        const setBeginBalanceFromJanuary = (current: any[], january: any[]) => {
          if (current && january) {
            current.forEach((item, index) => {
              if (january[index] && january[index].beginBalance !== undefined) {
                item.beginBalance = january[index].beginBalance || 0
              }
            })
          }
        }

        // 设置各部分的期初余额
        if (januaryData.assets) {
          setBeginBalanceFromJanuary(data.value.assets.current, januaryData.assets.current)
          setBeginBalanceFromJanuary(data.value.assets.nonCurrentLongTerm, januaryData.assets.nonCurrentLongTerm)
          setBeginBalanceFromJanuary(data.value.assets.longTermInvestment, januaryData.assets.longTermInvestment)
          setBeginBalanceFromJanuary(data.value.assets.fixedAssets, januaryData.assets.fixedAssets)
          setBeginBalanceFromJanuary(data.value.assets.intangibleAssets, januaryData.assets.intangibleAssets)
          setBeginBalanceFromJanuary(data.value.assets.deferredTaxAssets, januaryData.assets.deferredTaxAssets)
        }

        if (januaryData.liabilities) {
          setBeginBalanceFromJanuary(data.value.liabilities.current, januaryData.liabilities.current)
          setBeginBalanceFromJanuary(data.value.liabilities.longTermLiabilities, januaryData.liabilities.longTermLiabilities)
          setBeginBalanceFromJanuary(data.value.liabilities.deferredTaxLiabilities, januaryData.liabilities.deferredTaxLiabilities)
        }

        if (januaryData.equity) {
          setBeginBalanceFromJanuary(data.value.equity.items, januaryData.equity.items)
        }

        console.log('期初余额设置完成')
        
        // 计算合计项的期初余额
        const calculateBeginBalanceTotal = (category: string): number => {
          switch (category) {
            case 'equity':
              const minorityBeginBalance = data.value.equity.items?.find(item => item.special)?.beginBalance || 0
              const parentCompanyBeginBalance = data.value.equity.items?.filter(item => !item.special).reduce((sum, item) => sum + (item.beginBalance || 0), 0) || 0
              return parentCompanyBeginBalance + minorityBeginBalance
            default:
              return 0
          }
        }
        
        // 更新所有者权益合计的期初余额
        data.value.equity.equityTotal.beginBalance = calculateBeginBalanceTotal('equity')
        
      } else {
        console.log('一月份没有数据，无法自动设置期初余额')
      }
    } else {
      console.log('无法获取一月份数据，无法自动设置期初余额')
    }
  } catch (error) {
    console.error('自动设置期初余额失败:', error)
  }
}

// 清空当期数据（保持期初余额不受影响）
const clearCurrentData = () => {
  // 递归清空所有endBalance字段
  const clearEndBalance = (obj: any) => {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (item && typeof item === 'object') {
          if ('endBalance' in item) {
            item.endBalance = null
          }
          clearEndBalance(item)
        }
      })
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key === 'endBalance') {
          obj[key] = null
        } else {
          clearEndBalance(obj[key])
        }
      }
    }
  }

  clearEndBalance(data.value)
}



// 加载保存的数据
const loadSavedData = async () => {
  // 首先清空当期数据
  clearCurrentData()

  try {
    const response = await fetch(`http://47.111.95.19:3000/nanhua-balance-sheet/${period.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        // 直接使用返回的数据结构
        const savedData = result.data

        // 将保存的数据赋值给表单
        if (savedData && typeof savedData === 'object') {
          // 深度合并保存的数据到当前data中
          const mergeData = (target: any, source: any) => {
            for (const key in source) {
              if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {}
                mergeData(target[key], source[key])
              } else {
                target[key] = source[key]
              }
            }
          }
          mergeData(data.value, savedData)
        }

        console.log('南华兰陵数据加载成功:', savedData)
      } else {
        console.log('当前期间没有保存的数据，显示空值')
        // 如果没有数据且不是1月份，尝试从一月份设置期初余额
        await autoSetBeginBalanceFromJanuary()
      }
    } else if (response.status === 404) {
      console.log('当前期间没有保存的数据，显示空值')
      // 如果没有数据且不是1月份，尝试从一月份设置期初余额
      await autoSetBeginBalanceFromJanuary()
    } else {
      console.log('请求失败，显示空值')
    }
  } catch (error) {
    console.log('没有找到保存的数据或加载失败，显示空值:', error)
    // 如果没有数据且不是1月份，尝试从一月份设置期初余额
    await autoSetBeginBalanceFromJanuary()
  }

  // 如果有数据但不是1月份，也要自动设置期初余额
  const currentPeriod = period.value.slice(0, 7)
  if (!currentPeriod.endsWith('-01')) {
    console.log('非1月份数据，自动设置期初余额')
    await autoSetBeginBalanceFromJanuary()
  }
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
  if (newPeriod) {
    period.value = newPeriod.toString()
    await loadSavedData()
    await loadRemarksData()
  }
}, { immediate: true })

// 监听期间变化
watch(period, async () => {
  await loadSavedData()
  await loadRemarksData()
})

// 保存功能
const save = async () => {
  try {
    console.log('保存南华兰陵资产负债表数据:', { period: period.value.slice(0, 7), data: data.value })

    const requestData = {
      period: period.value.slice(0, 7),
      data: data.value,
      remarks: remarks.value,
      suggestions: suggestions.value
    }

    const response = await fetch('http://47.111.95.19:3000/nanhua-balance-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || '保存失败')
    }

    const result = await response.json()
    console.log('南华兰陵数据保存成功:', result)
    alert(result.message || '数据保存成功')

  } catch (error) {
    console.error('保存南华兰陵数据失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '网络错误'))
  }
}

// 计算总负债
const getTotalLiabilities = () => {
  return getCurrentPeriodTotal('liabilitiesTotal')
}

// 计算总计
const getGrandTotal = () => {
  return getCurrentPeriodTotal('liabilitiesAndEquityTotal')
}

// 重置功能
const reset = () => {
  // 重置为原始数据
  data.value = { ...balanceSheetData }
  remarks.value = ''
  suggestions.value = ''
  console.log('已重置为初始数据')
}



onMounted(async () => {
  console.log('上海南华兰陵资产负债表组件挂载，当前期间:', period.value)
  await loadSavedData()  // 先加载保存的数据
  await loadRemarksData() // 再加载备注和建议
})
</script>

<style scoped>
@media print {
  .bg-gray-100 {
    background: white;
  }

  button {
    display: none;
  }
}

table {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>