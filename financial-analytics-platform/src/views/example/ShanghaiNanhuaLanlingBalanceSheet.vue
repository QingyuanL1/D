<template>
  <div class="bg-gray-100 p-8">
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-6">{{ data.companyInfo.name }} - 资产负债表</h1>
      <div class="text-center mb-4">
        <p class="text-sm text-gray-600">金额单位：{{ data.companyInfo.unit }}</p>
      </div>
      
      <!-- 添加期间输入 -->
      <div class="mb-4">
        <label class="block text-gray-700">期间：</label>
        <input type="month" v-model="period" class="w-full px-2 py-1 border rounded" />
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
                  <input type="number" v-model.number="item.endBalance" 
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance" 
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 一年内到期的长期债权投资等 -->
              <tr v-for="(item, index) in data.assets.nonCurrentLongTerm" :key="`noncurrent-longterm-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance" 
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.currentTotal.name }} <span class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.currentTotal.endBalance || 0 }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.currentTotal.beginBalance || 0 }}</span>
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
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance" 
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
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
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input v-if="period.endsWith('-01')" type="number" v-model.number="item.beginBalance" 
                    class="w-full px-2 py-1 border rounded" step="0.01" />
                  <span v-else class="block w-full px-2 py-1 text-gray-700">{{ item.beginBalance || 0 }}</span>
                </td>
              </tr>

              <!-- 固定资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.fixedAssetsTotal.name }} <span class="text-blue-600 text-xs">[自动计算]</span></td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.fixedAssetsTotal.endBalance || 0 }}</span>
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <span class="block w-full px-2 py-1 bg-yellow-50 font-bold text-blue-700">{{ data.assets.fixedAssetsTotal.beginBalance || 0 }}</span>
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

                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 无形资产及其他资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.intangibleAssetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.intangibleAssetsTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.intangibleAssetsTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 递延税款借项 -->
              <tr v-for="(item, index) in data.assets.deferredTaxAssets" :key="`deferred-tax-assets-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 资产总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.assetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.assetsTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.assetsTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />

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
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.currentLiabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentLiabilitiesTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentLiabilitiesTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
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
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 长期负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.longTermLiabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.longTermLiabilitiesTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.longTermLiabilitiesTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 递延税款贷项 -->
              <tr v-for="(item, index) in data.liabilities.deferredTaxLiabilities" :key="`deferred-tax-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.liabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.liabilitiesTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.liabilitiesTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
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
                  <input type="number" v-model.number="item.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 所有者权益合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.equityTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.equityTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.equityTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 负债和所有者权益总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.liabilitiesAndEquityTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.liabilitiesAndEquityTotal.beginBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.liabilitiesAndEquityTotal.endBalance" class="w-full px-2 py-1 border rounded" step="0.01" />
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
      <FormAttachmentAndRemarks
        :module-id="moduleId"
        :period="period"
        v-model:remarks="remarks"
        v-model:suggestions="suggestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'
import balanceSheetData from './shanghaiNanhuaLanlingBalanceSheetData'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.BALANCE_SHEET
const remarks = ref('')
const suggestions = ref('')

const data = ref(balanceSheetData)

// 历史期间数据存储 - 用于累计计算
const historicalPeriodData = ref<{[period: string]: any}>({})

// 从后端加载历史期间数据
const loadHistoricalPeriodData = async () => {
  try {
    // 获取当前年份的所有期间数据
    const currentYear = new Date().getFullYear()
    const periods = []
    for (let month = 1; month <= 12; month++) {
      periods.push(`${currentYear}-${month.toString().padStart(2, '0')}`)
    }
    
    historicalPeriodData.value = {}
    
    for (const periodStr of periods) {
      // 只加载当前期间之前的数据用于累计计算
      if (periodStr < period.value) {
        try {
          const response = await fetch(`http://47.111.95.19:3000/forms/submission/${moduleId}/${periodStr}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data && result.data.submission_data) {
              const savedData = typeof result.data.submission_data === 'string' 
                ? JSON.parse(result.data.submission_data) 
                : result.data.submission_data
              
              historicalPeriodData.value[periodStr] = savedData
            }
          }
        } catch (error) {
          console.log(`加载期间 ${periodStr} 数据失败:`, error)
        }
      }
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
  }
}

// 自动从上月期末余额设置期初余额（非1月份）
const autoSetBeginBalanceFromPreviousMonth = async (currentPeriod: string) => {
  // 如果是1月份，不需要自动设置期初余额
  if (currentPeriod.endsWith('-01')) {
    console.log('1月份数据，期初余额需要手动输入')
    return
  }

  try {
    // 计算前一个月
    const [year, month] = currentPeriod.split('-').map(Number)
    let prevYear = year
    let prevMonth = month - 1

    if (prevMonth === 0) {
      prevYear = year - 1
      prevMonth = 12
    }

    const prevPeriod = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`
    
    const response = await fetch(`http://47.111.95.19:3000/forms/submission/${moduleId}/${prevPeriod}`)
    
    if (!response.ok) {
      console.log(`前一个月(${prevPeriod})暂无数据，期初余额保持为0`)
      return
    }

    const result = await response.json()
    if (result.success && result.data && result.data.submission_data) {
      const previousData = typeof result.data.submission_data === 'string' 
        ? JSON.parse(result.data.submission_data) 
        : result.data.submission_data
      
      console.log(`自动获取到前一个月(${prevPeriod})数据，设置期初余额`)

      // 递归设置期初余额
      const setBeginBalance = (current: any, previous: any) => {
        if (Array.isArray(current) && Array.isArray(previous)) {
          current.forEach((item, index) => {
            if (previous[index] && item.name === previous[index].name) {
              item.beginBalance = previous[index].endBalance || 0
            }
          })
        } else if (current && previous && typeof current === 'object' && typeof previous === 'object') {
          Object.keys(current).forEach(key => {
            if (previous[key]) {
              if (key.includes('Total') && current[key].endBalance !== undefined) {
                current[key].beginBalance = previous[key].endBalance || 0
              } else {
                setBeginBalance(current[key], previous[key])
              }
            }
          })
        }
      }

      setBeginBalance(data.value, previousData)
    }
  } catch (error) {
    console.error('自动设置期初余额失败:', error)
  }
}

// 清空所有数据
const clearCurrentData = () => {
  // 递归清空所有beginBalance和endBalance字段
  const clearAllBalances = (obj: any) => {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (item && typeof item === 'object') {
          if ('beginBalance' in item) {
            item.beginBalance = 0
          }
          if ('endBalance' in item) {
            item.endBalance = 0
          }
          clearAllBalances(item)
        }
      })
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key === 'beginBalance' || key === 'endBalance') {
          obj[key] = 0
        } else {
          clearAllBalances(obj[key])
        }
      }
    }
  }
  
  clearAllBalances(data.value)
}

// 自动计算函数
const calculateTotals = () => {
  // 计算流动资产合计
  const currentAssetsEndBalance = data.value.assets.current.reduce((sum, item) => sum + (item.endBalance || 0), 0) +
    data.value.assets.nonCurrentLongTerm.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const currentAssetsBeginBalance = data.value.assets.current.reduce((sum, item) => sum + (item.beginBalance || 0), 0) +
    data.value.assets.nonCurrentLongTerm.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
    
  data.value.assets.currentTotal.endBalance = currentAssetsEndBalance
  data.value.assets.currentTotal.beginBalance = currentAssetsBeginBalance

  // 计算固定资产合计
  const fixedAssetsEndBalance = data.value.assets.fixedAssets.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const fixedAssetsBeginBalance = data.value.assets.fixedAssets.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
  
  data.value.assets.fixedAssetsTotal.endBalance = fixedAssetsEndBalance
  data.value.assets.fixedAssetsTotal.beginBalance = fixedAssetsBeginBalance

  // 计算无形资产及其他资产合计
  const intangibleAssetsEndBalance = data.value.assets.intangibleAssets.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const intangibleAssetsBeginBalance = data.value.assets.intangibleAssets.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
  
  data.value.assets.intangibleAssetsTotal.endBalance = intangibleAssetsEndBalance
  data.value.assets.intangibleAssetsTotal.beginBalance = intangibleAssetsBeginBalance

  // 计算资产总计
  const assetsEndBalance = currentAssetsEndBalance + fixedAssetsEndBalance + intangibleAssetsEndBalance +
    data.value.assets.longTermInvestment.reduce((sum, item) => sum + (item.endBalance || 0), 0) +
    data.value.assets.deferredTaxAssets.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const assetsBeginBalance = currentAssetsBeginBalance + fixedAssetsBeginBalance + intangibleAssetsBeginBalance +
    data.value.assets.longTermInvestment.reduce((sum, item) => sum + (item.beginBalance || 0), 0) +
    data.value.assets.deferredTaxAssets.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
    
  data.value.assets.assetsTotal.endBalance = assetsEndBalance
  data.value.assets.assetsTotal.beginBalance = assetsBeginBalance

  // 计算流动负债合计
  const currentLiabilitiesEndBalance = data.value.liabilities.current.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const currentLiabilitiesBeginBalance = data.value.liabilities.current.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
  
  data.value.liabilities.currentLiabilitiesTotal.endBalance = currentLiabilitiesEndBalance
  data.value.liabilities.currentLiabilitiesTotal.beginBalance = currentLiabilitiesBeginBalance

  // 计算长期负债合计
  const longTermLiabilitiesEndBalance = data.value.liabilities.longTermLiabilities.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const longTermLiabilitiesBeginBalance = data.value.liabilities.longTermLiabilities.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
  
  data.value.liabilities.longTermLiabilitiesTotal.endBalance = longTermLiabilitiesEndBalance
  data.value.liabilities.longTermLiabilitiesTotal.beginBalance = longTermLiabilitiesBeginBalance

  // 计算负债合计
  const liabilitiesEndBalance = currentLiabilitiesEndBalance + longTermLiabilitiesEndBalance +
    data.value.liabilities.deferredTaxLiabilities.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const liabilitiesBeginBalance = currentLiabilitiesBeginBalance + longTermLiabilitiesBeginBalance +
    data.value.liabilities.deferredTaxLiabilities.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
    
  data.value.liabilities.liabilitiesTotal.endBalance = liabilitiesEndBalance
  data.value.liabilities.liabilitiesTotal.beginBalance = liabilitiesBeginBalance

  // 计算所有者权益合计
  const equityEndBalance = data.value.equity.items.reduce((sum, item) => sum + (item.endBalance || 0), 0)
  const equityBeginBalance = data.value.equity.items.reduce((sum, item) => sum + (item.beginBalance || 0), 0)
  
  data.value.equity.equityTotal.endBalance = equityEndBalance
  data.value.equity.equityTotal.beginBalance = equityBeginBalance

  // 计算负债和所有者权益总计
  data.value.equity.liabilitiesAndEquityTotal.endBalance = liabilitiesEndBalance + equityEndBalance
  data.value.equity.liabilitiesAndEquityTotal.beginBalance = liabilitiesBeginBalance + equityBeginBalance
}

// 使用标志位防止无限循环
let isCalculating = false

// 深度监听data变化，自动重新计算
watch(data, () => {
  if (!isCalculating) {
    isCalculating = true
    calculateTotals()
    // 使用nextTick确保DOM更新完成后再重置标志位
    nextTick(() => {
      isCalculating = false
    })
  }
}, { deep: true })

// 加载保存的数据
const loadSavedData = async () => {
  // 首先清空当期数据
  clearCurrentData()
  
  try {
    const response = await fetch(`http://47.111.95.19:3000/forms/submission/${moduleId}/${period.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.submission_data) {
        // 解析保存的数据
        const savedData = typeof result.data.submission_data === 'string' 
          ? JSON.parse(result.data.submission_data) 
          : result.data.submission_data
        
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
        
        console.log('数据加载成功:', savedData)
      } else {
        console.log('当前期间没有保存的数据，自动设置期初余额')
        await autoSetBeginBalanceFromPreviousMonth(period.value)
      }
    } else {
      console.log('请求失败，自动设置期初余额')
      await autoSetBeginBalanceFromPreviousMonth(period.value)
    }
  } catch (error) {
    console.log('没有找到保存的数据或加载失败，自动设置期初余额:', error)
    await autoSetBeginBalanceFromPreviousMonth(period.value)
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
  await loadHistoricalPeriodData() // 重新加载历史数据
  await loadSavedData()
  await loadRemarksData()
})

// 保存功能
const save = async () => {
  try {
    console.log('保存上海南华兰陵资产负债表数据:', { period: period.value.slice(0, 7), data: data.value })
    
    // 记录表单提交
    await recordFormSubmission(moduleId, period.value, data.value, remarks.value, suggestions.value)
    alert('数据保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error instanceof Error ? error.message : '网络错误'))
  }
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
  await loadHistoricalPeriodData() // 加载历史数据用于累计计算
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