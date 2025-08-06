<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">利润表（月报）</h1>
            <div class="text-sm text-gray-600">
                编制单位：常州拓源电气集团有限公司
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" @change="handlePeriodChange" />
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-2 py-2 w-48">项目</th>
                        <th class="border border-gray-300 px-2 py-2 w-16">行次</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年1月</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年2月</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年1-2月累计数</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年1-2月调整数</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年1-2月实际数</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年度预算</th>
                        <th class="border border-gray-300 px-2 py-2 w-16">完成率</th>
                        <th class="border border-gray-300 px-2 py-2 w-24">2025年02月产品库存</th>
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
                            <td class="border border-gray-300 px-2 py-2"></td>
                            <td class="border border-gray-300 px-2 py-2"></td>
                            <td class="border border-gray-300 px-2 py-2"></td>
                            <td class="border border-gray-300 px-2 py-2"></td>
                            <td class="border border-gray-300 px-2 py-2"></td>
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
                                <td class="border border-gray-300 px-2 py-2 text-center">
                                    {{ getRowNumber(sectionIndex, itemIndex) }}
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.currentAmount" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01" 
                                        :data-field="item.field" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.yearAmount" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_year`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.currentAmountActual" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_cumulative`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.yearAmountActual" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_adjustment`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.completionRate" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_actual`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.yearBudget" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_budget`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.completionRate" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_rate`" />
                                </td>
                                <td class="border border-gray-300 px-2 py-2">
                                    <input v-model="item.productInventory" type="number"
                                        class="w-full px-1 py-0.5 border rounded text-xs" step="0.01"
                                        :data-field="`${item.field}_inventory`" />
                                </td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
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

// 获取行号的函数
const getRowNumber = (sectionIndex: number, itemIndex: number): number => {
    let rowNumber = 1
    for (let i = 0; i < sectionIndex; i++) {
        rowNumber += changzhouTuoyuanIncomeStatementData.value[i].items.length
    }
    return rowNumber + itemIndex
}

// 加载数据
const loadData = async (targetPeriod: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/changzhou-tuoyuan-income-statement/${targetPeriod}`)
    if (!response.ok) {
      if (response.status !== 404) { // 404是正常的（新建报表时）
        throw new Error('加载数据失败')
      }
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
          item.yearAmount = parsedData[key].year_amount
          item.currentAmountActual = parsedData[key].current_amount_actual
          item.yearAmountActual = parsedData[key].year_amount_actual
          item.completionRate = parsedData[key].completion_rate
          item.yearBudget = parsedData[key].year_budget
          item.productInventory = parsedData[key].product_inventory
        }
      })
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
  try {
    const dataToSave = convertToStorageFormat(period.value)

    const response = await fetch('http://127.0.0.1:3000/changzhou-tuoyuan-income-statement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '保存失败')
    }

    const result = await response.json()
    
    // 记录表单提交
    await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)
    
    alert('保存成功')
    console.log('保存成功:', result.message)
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败：' + (error as Error).message)
  }
}

const handleReset = () => {
  changzhouTuoyuanIncomeStatementData.value.forEach(section => {
    section.items.forEach(item => {
      item.currentAmount = null
      item.yearAmount = null
      item.currentAmountActual = null
      item.yearAmountActual = null
      item.completionRate = null
      item.yearBudget = null
      item.productInventory = null
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