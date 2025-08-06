<template>
    <div class="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">上海南华兰陵实业有限公司现金流量表（单位：元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" @change="handlePeriodChange" />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 左侧：主要现金流量表 -->
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">项目</th>
                            <th class="border border-gray-300 px-4 py-2 w-24">本期金额</th>
                            <th class="border border-gray-300 px-4 py-2 w-24">本年累计</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(section, sectionIndex) in mainCashFlowData" :key="sectionIndex">
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-bold">
                                    {{ section.title }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                            </tr>

                            <!-- 章节内容 -->
                            <template v-for="(item, itemIndex) in section.items" :key="`${sectionIndex}-${itemIndex}`">
                                <tr>
                                    <td :class="['border border-gray-300 px-4 py-2',
                                        item.isSubItem ? 'pl-8' : '',
                                        item.isBold ? 'font-bold' : '']">
                                        {{ item.name }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <input v-model="item.currentAmount" type="number"
                                            class="w-full px-2 py-1 border rounded text-sm" step="0.01" 
                                            :data-field="item.field" 
                                            @input="onCurrentAmountChange(item)" />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <span 
                                            class="block w-full px-2 py-1 text-sm text-right text-gray-700"
                                            title="本年累计金额"
                                        >
                                            {{ formatAmount(item.yearAmount) }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- 右侧：补充资料 -->
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">项目</th>
                            <th class="border border-gray-300 px-4 py-2 w-24">本期金额</th>
                            <th class="border border-gray-300 px-4 py-2 w-24">本年累计</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(section, sectionIndex) in supplementaryCashFlowData" :key="sectionIndex">
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-bold">
                                    {{ section.title }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                            </tr>

                            <!-- 章节内容 -->
                            <template v-for="(item, itemIndex) in section.items" :key="`supp-${sectionIndex}-${itemIndex}`">
                                <tr>
                                    <td :class="['border border-gray-300 px-4 py-2',
                                        item.isSubItem ? 'pl-8' : '',
                                        item.isBold ? 'font-bold' : '']">
                                        {{ item.name }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <input v-model="item.currentAmount" type="number"
                                            class="w-full px-2 py-1 border rounded text-sm" step="0.01" 
                                            :data-field="item.field"
                                            @input="onCurrentAmountChange(item)" />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <span 
                                            class="block w-full px-2 py-1 text-sm text-right text-gray-700"
                                            title="本年累计金额"
                                        >
                                            {{ formatAmount(item.yearAmount) }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </template>
                    </tbody>
                </table>
            </div>
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
import { useShanghaiNanhuaLanlingCashFlowData } from '@/views/companies/financial-reports/shanghaiNanhuaLanlingCashFlowData'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const router = useRouter()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { cashFlowData, supplementaryData, convertToStorageFormat, restoreFromStorageFormat } = useShanghaiNanhuaLanlingCashFlowData()
const moduleId = MODULE_IDS.SHANGHAI_NANHUA_LANLING_CASH_FLOW
const remarks = ref('')
const suggestions = ref('')

// 状态管理
const isCalculating = ref(false)
const isSaving = ref(false)

// 主要现金流量表和补充资料
const mainCashFlowData = cashFlowData
const supplementaryCashFlowData = supplementaryData

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

// 当期金额变化时的处理
const onCurrentAmountChange = (item: any) => {
  // 清除该项的计算标记
  item.isCalculated = false
}

// 静默计算本年累计值
const calculateCumulative = async (silent = true) => {
  if (isCalculating.value) return
  
  try {
    isCalculating.value = true
    
    // 收集当前数据
    const currentData = convertToStorageFormat(period.value)
    
    const response = await fetch('http://127.0.0.1:3000/shanghai-nanhua-lanling-cash-flow/calculate-cumulative', {
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
      // 在主表中查找
      const mainItem = cashFlowData.value.flatMap(section => section.items)
        .find(item => item.field === key)
      if (mainItem) {
        mainItem.yearAmount = calculatedData[key].cumulative_amount
        mainItem.isCalculated = true
      }
      
      // 在补充资料中查找
      const suppItem = supplementaryData.value.flatMap(section => section.items)
        .find(item => item.field === key)
      if (suppItem) {
        suppItem.yearAmount = calculatedData[key].cumulative_amount
        suppItem.isCalculated = true
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
        console.log(`正在加载上海南华兰陵实业有限公司现金流量表数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://127.0.0.1:3000/shanghai-nanhua-lanling-cash-flow/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，清空表单')
                // 清空主表数据
                cashFlowData.value.forEach(section => {
                    section.items.forEach(item => {
                        item.currentAmount = null
                        item.yearAmount = null
                        item.isCalculated = false
                    })
                })
                // 清空补充资料数据
                supplementaryData.value.forEach(section => {
                    section.items.forEach(item => {
                        item.currentAmount = null
                        item.yearAmount = null
                        item.isCalculated = false
                    })
                })
                // 自动计算累计值
                setTimeout(() => {
                    calculateCumulative()
                }, 500)
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始恢复...')
            // 解析JSON字符串
            const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
            console.log('解析后的数据:', parsedData)
            
            // 将数据恢复到表单中
            Object.keys(parsedData).forEach(key => {
                // 在主表中查找
                const mainItem = cashFlowData.value.flatMap(section => section.items)
                    .find(item => item.field === key)
                if (mainItem) {
                    mainItem.currentAmount = parsedData[key].current_amount
                    mainItem.yearAmount = parsedData[key].year_amount || parsedData[key].cumulative_amount
                    console.log(`恢复主表字段 ${key}:`, parsedData[key])
                }
                
                // 在补充资料中查找
                const suppItem = supplementaryData.value.flatMap(section => section.items)
                    .find(item => item.field === key)
                if (suppItem) {
                    suppItem.currentAmount = parsedData[key].current_amount
                    suppItem.yearAmount = parsedData[key].year_amount || parsedData[key].cumulative_amount
                    console.log(`恢复补充资料字段 ${key}:`, parsedData[key])
                }
            })
            console.log('数据恢复完成')
            
            // 加载数据后，自动刷新累计值
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
    loadRemarksData()
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksData()
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData()
})

const handleSave = async () => {
    if (isSaving.value) return
    
    try {
        isSaving.value = true
        
        // 保存前自动计算累计值
        await calculateCumulative()
        
        const dataToSave = convertToStorageFormat(period.value)

        const response = await fetch('http://127.0.0.1:3000/shanghai-nanhua-lanling-cash-flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...dataToSave,
                autoCalculateCumulative: true
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || '保存失败')
        }

        const result = await response.json()
        console.log('保存成功:', result.message)

        // 记录表单提交
        await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)

        // 如果返回了计算后的数据，更新表单
        if (result.calculatedData) {
            Object.keys(result.calculatedData).forEach(key => {
                // 更新主表
                const mainItem = cashFlowData.value.flatMap(section => section.items)
                    .find(item => item.field === key)
                if (mainItem) {
                    mainItem.yearAmount = result.calculatedData[key].cumulative_amount
                    mainItem.isCalculated = true
                }
                
                // 更新补充资料
                const suppItem = supplementaryData.value.flatMap(section => section.items)
                    .find(item => item.field === key)
                if (suppItem) {
                    suppItem.yearAmount = result.calculatedData[key].cumulative_amount
                    suppItem.isCalculated = true
                }
            })
        }

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
        isSaving.value = false
    }
}

const handleReset = () => {
    cashFlowData.value.forEach(section => {
        section.items.forEach(item => {
            item.currentAmount = null
            item.yearAmount = null
            item.isCalculated = false
        })
    })
    supplementaryData.value.forEach(section => {
        section.items.forEach(item => {
            item.currentAmount = null
            item.yearAmount = null
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
    console.log('上海南华兰陵实业有限公司现金流量表组件挂载，当前期间:', period.value)
    // 加载当前期间的数据
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
    loadRemarksData()
})
</script>

<style scoped>
/* 可以添加需要的样式 */
</style> 