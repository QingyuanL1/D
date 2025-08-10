<template>
    <div class="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">利润表(主表)（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" @change="handlePeriodChange" />
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">项目</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本期金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本年累计</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(section, sectionIndex) in incomeStatementData" :key="sectionIndex">
                        <tr>
                            <td class="border border-gray-300 px-4 py-2 font-bold">
                                {{ section.title }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2"></td>
                            <td class="border border-gray-300 px-4 py-2"></td>
                        </tr>

                        <template v-for="(item, itemIndex) in section.items" :key="`${sectionIndex}-${itemIndex}`">
                            <tr>
                                <td :class="['border border-gray-300 px-4 py-2',
                                    item.isSubItem ? 'pl-8' : '',
                                    item.isBold ? 'font-bold' : '']">
                                    {{ item.name }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input 
                                        v-if="!item.isCalculated" 
                                        v-model="item.currentAmount" 
                                        type="number"
                                        class="w-full px-2 py-1 border rounded" 
                                        step="0.01" 
                                        :data-field="item.field" 
                                        @input="handleInputChange" />
                                    <span 
                                        v-else 
                                        class="w-full px-2 py-1 bg-gray-100 rounded inline-block font-semibold"
                                        :class="{ 'text-blue-600': item.currentAmount !== null }">
                                        {{ item.currentAmount?.toFixed(2) || '0.00' }}
                                    </span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span 
                                        class="w-full px-2 py-1 bg-gray-100 rounded inline-block font-semibold"
                                        :class="{ 'text-blue-600': item.yearAmount !== null }">
                                        {{ item.yearAmount?.toFixed(2) || '0.00' }}
                                    </span>
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
import { useIncomeStatementData } from './incomeStatementData'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const router = useRouter()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { 
    incomeStatementData, 
    convertToStorageFormat, 
    restoreFromStorageFormat,
    calculateTotals
} = useIncomeStatementData()
const moduleId = MODULE_IDS.INCOME_STATEMENT
const remarks = ref('')
const suggestions = ref('')

// 处理输入变化，自动计算合计值
const handleInputChange = () => {
    calculateTotals()
}

// 加载数据
const loadData = async (targetPeriod: string) => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/income-statement/${targetPeriod}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      return
    }
    const result = await response.json()
    if (result.data) {
      const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      Object.keys(parsedData).forEach(key => {
        const item = incomeStatementData.value.flatMap(section => section.items)
          .find(item => item.field === key)
        if (item) {
          item.currentAmount = parsedData[key].current_amount
          item.yearAmount = parsedData[key].cumulative_amount || parsedData[key].year_amount
        }
      })
      calculateTotals()
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

    const response = await fetch('http://47.111.95.19:3000/income-statement', {
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
    
    await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)
    
    alert('保存成功')
    console.log('保存成功:', result.message)
    
    // 保存后重新加载数据以获取更新的累计值
    await loadData(period.value)
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + error.message)
  }
}

const handleReset = () => {
  incomeStatementData.value.forEach(section => {
    section.items.forEach(item => {
      item.currentAmount = null
      item.yearAmount = null
    })
  })
}

const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

onMounted(() => {
  loadData(period.value)
  loadRemarksData()
})
</script>