<template>
  <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">利润表（月报）（单位：万元）</h1>
          <div class="flex items-center space-x-4">
              <input v-model="period" type="month" class="px-3 py-2 border rounded" @change="handlePeriodChange" />
          </div>
      </div>

      <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead class="sticky top-0 bg-white">
                  <tr class="bg-gray-50">
                      <th class="border border-gray-300 px-2 py-2 w-48">项目</th>
                      <th class="border border-gray-300 px-2 py-2 w-16">当月</th>
                      <th class="border border-gray-300 px-2 py-2 w-16">累计</th>
                  </tr>
              </thead>
              <tbody>
                  <template v-for="(section, sectionIndex) in changzhouTuoyuanIncomeStatementData" :key="sectionIndex">
                      <tr v-if="section.title">
                          <td class="border border-gray-300 px-2 py-2 font-bold">
                              {{ section.title }}
                          </td>
                          <td class="border border-gray-300 px-2 py-2"></td>
                          <td class="border border-gray-300 px-2 py-2"></td>
                      </tr>

                      <template v-for="(item, itemIndex) in section.items" :key="`${sectionIndex}-${itemIndex}`">
                          <tr>
                              <td :class="['border border-gray-300 px-2 py-2',
                                  item.isSubItem ? 'pl-6' : '',
                                  item.isBold ? 'font-bold' : '']">
                                  {{ item.name }}
                              </td>
                              <td class="border border-gray-300 px-2 py-2">
                                  <input v-model="item.currentAmount" type="number"
                                      class="w-full px-1 py-0.5 border rounded text-xs" step="0.01" 
                                      :data-field="item.field" 
                                      @input="onCurrentAmountChange(item)" />
                              </td>
                              <td class="border border-gray-300 px-2 py-2">
                                  <span 
                                      class="block w-full px-1 py-0.5 text-xs text-right text-gray-700"
                                      title="累计值"
                                  >
                                      {{ formatAmount(item.cumulativeAmount) }}
                                  </span>
                              </td>
                          </tr>
                      </template>
                  </template>
              </tbody>
          </table>
      </div>

      <div class="mt-4 flex justify-end space-x-4">
          <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存' }}
          </button>
          <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
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
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChangzhouTuoyuanIncomeStatementData } from './changzhouTuoyuanIncomeStatementData'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const router = useRouter()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { changzhouTuoyuanIncomeStatementData, convertToStorageFormat, restoreFromStorageFormat } = useChangzhouTuoyuanIncomeStatementData()
const moduleId = MODULE_IDS.TUOYUAN_INCOME_STATEMENT
const remarks = ref('')
const suggestions = ref('')

// 状态管理
const isCalculating = ref(false)
const isSaving = ref(false)

// 格式化金额显示
const formatAmount = (amount: number | null): string => {
if (amount === null || amount === undefined) {
  return ''
}
return amount.toLocaleString('zh-CN', { 
  minimumFractionDigits: 0, 
  maximumFractionDigits: 2 
})
}

// 当月金额变化时的处理
const onCurrentAmountChange = (item: any) => {
// 清除该项的计算标记
item.isCalculated = false
}

// 静默计算累计值（不显示消息）
const calculateCumulative = async (silent = true) => {
if (isCalculating.value) return

try {
  isCalculating.value = true
  
  // 收集当前数据（只包含当月金额）
  const currentData = convertToStorageFormat(period.value)
  
  const response = await fetch('http://47.111.95.19:3000/changzhou-tuoyuan-income-statement/calculate-cumulative', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      period: period.value,
      data: JSON.parse(currentData.data)
    })
  })

  if (!response.ok) {
    if (!silent) {
      const errorData = await response.json()
      throw new Error(errorData.error || '计算累计值失败')
    }
    return
  }

  const result = await response.json()
  
  // 更新累计值到表单中
  const calculatedData = result.data
  Object.keys(calculatedData).forEach(key => {
    const item = changzhouTuoyuanIncomeStatementData.value.flatMap(section => section.items)
      .find(item => item.field === key)
    if (item) {
      item.cumulativeAmount = calculatedData[key].cumulative_amount
      item.isCalculated = true // 标记为已计算
    }
  })
  
} catch (error) {
  if (!silent) {
    console.error('计算累计值失败:', error)
  }
} finally {
  isCalculating.value = false
}
}

// 加载数据
const loadData = async (targetPeriod: string) => {
try {
  const response = await fetch(`http://47.111.95.19:3000/changzhou-tuoyuan-income-statement/${targetPeriod}`)
  if (!response.ok) {
    if (response.status !== 404) { // 404是正常的（新建报表时）
      throw new Error('加载数据失败')
    }
    // 如果没有数据，自动计算累计值
    setTimeout(() => {
      calculateCumulative()
    }, 500)
    return
  }
  const result = await response.json()
  if (result.data) {
    // 解析JSON字符串
    const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
    // 将数据恢复到表单中
    Object.keys(parsedData).forEach(key => {
      const item = changzhouTuoyuanIncomeStatementData.value.flatMap(section => section.items)
        .find(item => item.field === key)
      if (item) {
        item.currentAmount = parsedData[key].current_amount
        item.cumulativeAmount = parsedData[key].cumulative_amount
        // 清除计算标记（已保存的数据不显示为计算状态）
        item.isCalculated = false
      }
    })
    
    // 加载数据后，自动刷新累计值以确保准确性
    setTimeout(() => {
      calculateCumulative()
    }, 500)
  }
} catch (error) {
  console.error('加载数据失败:', error)
}
}

// 处理期间变更
const handlePeriodChange = () => {
router.replace({
  query: { ...route.query, period: period.value }
})
loadData(period.value)
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
if (newPeriod) {
  period.value = newPeriod.toString()
  loadData(newPeriod.toString())
}
})

const handleSave = async () => {
if (isSaving.value) return

try {
  isSaving.value = true
  
  // 保存前自动计算累计值
  await calculateCumulative()
  
  const dataToSave = convertToStorageFormat(period.value)

  const response = await fetch('http://47.111.95.19:3000/changzhou-tuoyuan-income-statement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...dataToSave,
      autoCalculateCumulative: true // 始终启用自动计算
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '保存失败')
  }

  const result = await response.json()
  
  // 如果返回了计算后的数据，更新表单
  if (result.calculatedData) {
    Object.keys(result.calculatedData).forEach(key => {
      const item = changzhouTuoyuanIncomeStatementData.value.flatMap(section => section.items)
        .find(item => item.field === key)
      if (item) {
        item.cumulativeAmount = result.calculatedData[key].cumulative_amount
        item.isCalculated = true
      }
    })
  }
  
  // 记录表单提交
  await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)
  
  console.log('保存成功:', result.message)
  
} catch (error) {
  console.error('保存失败:', error)
  alert('保存失败：' + (error as Error).message)
} finally {
  isSaving.value = false
}
}

const handleReset = () => {
changzhouTuoyuanIncomeStatementData.value.forEach(section => {
  section.items.forEach(item => {
    item.currentAmount = null
    item.cumulativeAmount = null
    item.isCalculated = false
  })
})
}

// 加载备注和建议
const loadRemarksData = async () => {
const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
remarks.value = loadedRemarks
suggestions.value = loadedSuggestions
}

onMounted(() => {
// 组件挂载时加载数据
loadData(period.value)
loadRemarksData()
})
</script> 