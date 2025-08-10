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
                <th class="border border-gray-300 px-4 py-2 w-40">当期</th>
                <th class="border border-gray-300 px-4 py-2 w-40">累计</th>
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
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                  {{ getCumulative(item.name, item.yearInitial).toLocaleString() }}
                </td>
              </tr>

              <!-- 一年内到期的长期债权投资等 -->
              <tr v-for="(item, index) in data.assets.nonCurrentLongTerm" :key="`noncurrent-longterm-${index}`">
                <td class="border border-gray-300 px-4 py-2 pl-8">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 流动资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.currentTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.currentTotal.yearInitial" class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.assets.currentTotal.periodEnd" class="w-full px-2 py-1 border rounded bg-yellow-50 font-bold" step="0.01" />
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
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
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

                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 固定资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.fixedAssetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.fixedAssetsTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.fixedAssetsTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

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

                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 无形资产及其他资产合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.intangibleAssetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.intangibleAssetsTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.intangibleAssetsTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 递延税款借项 -->
              <tr v-for="(item, index) in data.assets.deferredTaxAssets" :key="`deferred-tax-assets-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
              </tr>

              <!-- 资产总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.assets.assetsTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.assetsTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />

                </td>
                <td class="border border-gray-300 px-4 py-2">

                  <input type="number" v-model.number="data.assets.assetsTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />

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
                <th class="border border-gray-300 px-4 py-2 w-40">当期</th>
                <th class="border border-gray-300 px-4 py-2 w-40">累计</th>
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
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 流动负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.currentLiabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentLiabilitiesTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.currentLiabilitiesTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
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
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 长期负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.longTermLiabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.longTermLiabilitiesTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.longTermLiabilitiesTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 递延税款贷项 -->
              <tr v-for="(item, index) in data.liabilities.deferredTaxLiabilities" :key="`deferred-tax-${index}`">
                <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 负债合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.liabilities.liabilitiesTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.liabilitiesTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.liabilities.liabilitiesTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
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
                  <input type="number" v-model.number="item.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="item.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 所有者权益合计 -->
              <tr class="bg-yellow-50 font-bold">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.equityTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.equityTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.equityTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
              </tr>

              <!-- 负债和所有者权益总计 -->
              <tr class="bg-blue-50 font-bold text-lg">
                <td class="border border-gray-300 px-4 py-2">{{ data.equity.liabilitiesAndEquityTotal.name }}</td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.liabilitiesAndEquityTotal.yearInitial" class="w-full px-2 py-1 border rounded" step="0.01" />
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  <input type="number" v-model.number="data.equity.liabilitiesAndEquityTotal.periodEnd" class="w-full px-2 py-1 border rounded" step="0.01" />
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
import { ref, watch, onMounted, computed } from 'vue'
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

// 计算累计值（从年初到当前期间的所有当期数据之和）
const getCumulative = (itemName: string, currentValue: number | null): number => {
  let cumulative = 0
  
  // 累加历史期间的数据（只统计当前期间之前的数据）
  Object.keys(historicalPeriodData.value)
    .filter(periodKey => periodKey < period.value) // 只统计之前的期间
    .forEach(periodKey => {
      const periodData = historicalPeriodData.value[periodKey]
      if (periodData) {
        // 查找对应项目的数据
        const findItemValue = (data: any, name: string): number => {
          if (!data) return 0
          
          // 递归搜索所有级别的数据
          const searchInObject = (obj: any): number => {
            if (Array.isArray(obj)) {
              for (const item of obj) {
                if (item.name === name && item.yearInitial !== null && item.yearInitial !== undefined) {
                  return Number(item.yearInitial)
                }
                const found = searchInObject(item)
                if (found) return found
              }
            } else if (typeof obj === 'object') {
              for (const key in obj) {
                const found = searchInObject(obj[key])
                if (found) return found
              }
            }
            return 0
          }
          
          return searchInObject(data)
        }
        
        cumulative += findItemValue(periodData, itemName)
      }
    })
  
  // 加上当前期间的数据（如果有的话）
  if (currentValue !== null && currentValue !== undefined) {
    cumulative += Number(currentValue)
  }
  
  return cumulative
}

// 清空当期数据（保持累计计算不受影响）
const clearCurrentData = () => {
  // 递归清空所有yearInitial字段
  const clearYearInitial = (obj: any) => {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (item && typeof item === 'object') {
          if ('yearInitial' in item) {
            item.yearInitial = null
          }
          clearYearInitial(item)
        }
      })
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key === 'yearInitial') {
          obj[key] = null
        } else {
          clearYearInitial(obj[key])
        }
      }
    }
  }
  
  clearYearInitial(data.value)
}

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
        console.log('当前期间没有保存的数据，显示空值')
      }
    } else {
      console.log('请求失败，显示空值')
    }
  } catch (error) {
    console.log('没有找到保存的数据或加载失败，显示空值:', error)
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