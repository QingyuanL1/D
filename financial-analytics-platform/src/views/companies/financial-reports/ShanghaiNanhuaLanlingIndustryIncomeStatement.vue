<template>
    <div class="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">上海南华兰陵实业有限公司 - 利润表(主表)（单位：万元）</h1>
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
                                    <input v-model.number="item.currentAmount" type="number"
                                        class="w-full px-2 py-1 border rounded" step="0.01" :data-field="item.field" 
                                        placeholder="0" @input="onCurrentAmountChange" />
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="w-full px-2 py-1 text-right block">
                                        {{ item.yearAmount !== null && item.yearAmount !== undefined ? item.yearAmount.toLocaleString() : '' }}
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
import { useIncomeStatementData } from './ShanghaiincomeStatementData'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const router = useRouter()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { incomeStatementData, convertToStorageFormat, restoreFromStorageFormat } = useIncomeStatementData()
const moduleId = MODULE_IDS.NANHUA_INCOME_STATEMENT
const remarks = ref('')
const suggestions = ref('')

// 加载数据
const loadData = async (targetPeriod: string) => {
  try {
    // 验证期间格式
    if (!targetPeriod || targetPeriod === 'undefined' || !/^\d{4}-\d{2}$/.test(targetPeriod)) {
      console.error('无效的期间格式:', targetPeriod)
      return
    }

    console.log(`正在加载上海南华兰陵利润表数据，期间: ${targetPeriod}`)
    
    // 首先清空所有本期金额，累计金额将重新计算
    resetAllAmounts()
    console.log('已清空本期金额，准备加载新数据')

    const response = await fetch(`http://127.0.0.1:3000/shanghai-nanhua-lanling-income-statement/${targetPeriod}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，使用初始模板')
        // 即使没有数据，也要重新计算累计金额
        await calculateYearAmounts(targetPeriod)
        return
      } else {
        throw new Error(`加载数据失败: ${response.status} ${response.statusText}`)
      }
    }
    
    const result = await response.json()
    console.log('API返回数据:', result)
    
    if (result.success && result.data && Object.keys(result.data).length > 0) {
      console.log('成功获取数据，开始恢复...')
      
      // 解析JSON字符串
      let parsedData
      try {
        // 处理可能的双重JSON编码
        if (typeof result.data === 'string') {
          parsedData = JSON.parse(result.data)
          if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData)
          }
        } else {
          parsedData = result.data
        }
        console.log('解析后的数据:', parsedData)
      } catch (error) {
        console.error('数据解析失败:', error)
        return
      }
      
      // 将数据恢复到表单中
      Object.keys(parsedData).forEach(key => {
        const item = incomeStatementData.value.flatMap(section => section.items)
          .find(item => item.field === key)
        if (item) {
          // 只恢复本期金额，累计金额将通过calculateYearAmounts重新计算
          item.currentAmount = parsedData[key].current_amount !== null ? 
            parsedData[key].current_amount : null
          console.log(`恢复字段 ${key} 本期金额:`, parsedData[key].current_amount)
        }
      })
      console.log('数据恢复完成')
    } else {
      console.log('该期间暂无数据，使用初始模板')
    }
    
    // 计算累计金额
    await calculateYearAmounts(targetPeriod)
    
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 重置本期金额为null，累计金额保持不变（将通过calculateYearAmounts重新计算）
const resetAllAmounts = () => {
  incomeStatementData.value.forEach(section => {
    section.items.forEach(item => {
      item.currentAmount = null
    })
  })
}

// 计算累计金额
const calculateYearAmounts = async (targetPeriod: string) => {
  try {
    const currentYear = targetPeriod.substring(0, 4)
    const currentMonth = parseInt(targetPeriod.substring(5, 7))
    
    console.log(`计算${currentYear}年累计金额，截止到${currentMonth}月`)
    
    const yearAmounts: { [key: string]: number } = {}
    
    for (let month = 1; month <= currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      
      try {
                 const response = await fetch(`http://127.0.0.1:3000/shanghai-nanhua-lanling-income-statement/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            let parsedData
            if (typeof result.data === 'string') {
              parsedData = JSON.parse(result.data)
              if (typeof parsedData === 'string') {
                parsedData = JSON.parse(parsedData)
              }
            } else {
              parsedData = result.data
            }
            
            Object.keys(parsedData).forEach(key => {
              const currentAmount = parsedData[key].current_amount
              if (currentAmount !== null && currentAmount !== undefined && !isNaN(currentAmount)) {
                yearAmounts[key] = (yearAmounts[key] || 0) + parseFloat(currentAmount)
              }
            })
          }
        }
      } catch (error) {
        console.warn(`无法获取${monthPeriod}的数据:`, error)
      }
    }
    
    // 更新累计金额
    incomeStatementData.value.forEach(section => {
      section.items.forEach(item => {
        if (yearAmounts.hasOwnProperty(item.field)) {
          item.yearAmount = yearAmounts[item.field]
        } else {
          item.yearAmount = 0
        }
      })
    })
    
    console.log('本年累计金额计算完成:', yearAmounts)
    
  } catch (error) {
    console.error('计算本年累计金额失败:', error)
  }
}

// 处理期间变更
const handlePeriodChange = () => {
  router.replace({
    query: { ...route.query, period: period.value }
  })
  loadData(period.value)
  loadRemarksData()
}

// 当本期金额变化时重新计算累计金额
let calculateTimeout: NodeJS.Timeout | null = null

const onCurrentAmountChange = () => {
  if (calculateTimeout) {
    clearTimeout(calculateTimeout)
  }
  calculateTimeout = setTimeout(() => {
    calculateYearAmounts(period.value)
  }, 1000)
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
  if (newPeriod) {
    period.value = newPeriod.toString()
    loadData(newPeriod.toString())
    loadRemarksData()
  }
})

const handleSave = async () => {
  try {
    const dataToSave = convertToStorageFormat(period.value)

    const response = await fetch('http://127.0.0.1:3000/shanghai-nanhua-lanling-income-statement', {
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
    // 可以添加保存失败的提示
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