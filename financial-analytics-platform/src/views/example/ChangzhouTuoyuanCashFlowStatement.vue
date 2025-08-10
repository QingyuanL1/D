<template>
    <div class="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">现金流量表（常州拓源电气有限公司）（单位：元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-60">项目</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本期金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本年累计金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-60">项目</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本期金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">本年累计金额</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(section, sectionIndex) in cashFlowData" :key="sectionIndex">
                        <tr>
                            <td 
                                class="border border-gray-300 px-4 py-2 font-bold" 
                                :colspan="section.rightItems ? 4 : 8"
                            >
                                {{ section.title }}
                            </td>
                            <template v-if="section.rightItems">
                                <td class="border border-gray-300 px-4 py-2"></td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                                <td class="border border-gray-300 px-4 py-2"></td>
                            </template>
                        </tr>

                        <template v-for="(item, itemIndex) in section.leftItems" :key="`${sectionIndex}-left-${itemIndex}`">
                            <tr>
                                <td :class="[
                                    'border border-gray-300 px-4 py-2',
                                    item.isSubItem ? 'pl-8' : '',
                                    item.isBold ? 'font-bold' : ''
                                ]">
                                    {{ item.name }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-center">
                                    {{ item.rowNumber }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input 
                                        v-model="item.currentAmount" 
                                        type="number"
                                        class="w-full px-2 py-1 border rounded"
                                        step="0.01" 
                                        :data-field="item.field"
                                        @input="onCurrentAmountChange"
                                    />
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="w-full px-2 py-1 text-right block">
                                        {{ item.yearAmount ? item.yearAmount.toLocaleString() : '' }}
                                    </span>
                                </td>

                                <template v-if="section.rightItems && section.rightItems[itemIndex]">
                                    <td :class="[
                                        'border border-gray-300 px-4 py-2',
                                        section.rightItems[itemIndex].isSubItem ? 'pl-8' : '',
                                        section.rightItems[itemIndex].isBold ? 'font-bold' : ''
                                    ]">
                                        {{ section.rightItems[itemIndex].name }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-center">
                                        {{ section.rightItems[itemIndex].rowNumber }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <input 
                                            v-model="section.rightItems[itemIndex].currentAmount" 
                                            type="number"
                                            class="w-full px-2 py-1 border rounded"
                                            step="0.01" 
                                            :data-field="section.rightItems[itemIndex].field"
                                            @input="onCurrentAmountChange"
                                        />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <span class="w-full px-2 py-1 text-right block">
                                            {{ section.rightItems[itemIndex].yearAmount ? section.rightItems[itemIndex].yearAmount.toLocaleString() : '' }}
                                        </span>
                                    </td>
                                </template>
                                <template v-else>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                </template>
                            </tr>
                        </template>

                        <template v-if="section.rightItems && section.rightItems.length > section.leftItems.length">
                            <template v-for="(item, itemIndex) in section.rightItems.slice(section.leftItems.length)" :key="`${sectionIndex}-right-${itemIndex + section.leftItems.length}`">
                                <tr>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td class="border border-gray-300 px-4 py-2"></td>
                                    <td :class="[
                                        'border border-gray-300 px-4 py-2',
                                        item.isSubItem ? 'pl-8' : '',
                                        item.isBold ? 'font-bold' : ''
                                    ]">
                                        {{ item.name }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-center">
                                        {{ item.rowNumber }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <input 
                                            v-model="item.currentAmount" 
                                            type="number"
                                            class="w-full px-2 py-1 border rounded"
                                            step="0.01" 
                                            :data-field="item.field"
                                            @input="onCurrentAmountChange"
                                        />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2">
                                        <span class="w-full px-2 py-1 text-right block">
                                            {{ item.yearAmount ? item.yearAmount.toLocaleString() : '' }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
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
import { useRoute } from 'vue-router'
import { useChangzhouTuoyuanCashFlowData } from '@/views/companies/financial-reports/changzhouTuoyuanCashFlowData'
import type { CashFlowStatement } from '@/views/companies/financial-reports/types/cashFlow'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { cashFlowData, convertToStorageFormat, restoreFromStorageFormat } = useChangzhouTuoyuanCashFlowData()
const moduleId = MODULE_IDS.TUOYUAN_CASH_FLOW
const remarks = ref('')
const suggestions = ref('')

let calculateTimeout: NodeJS.Timeout | null = null

const onCurrentAmountChange = () => {
    if (calculateTimeout) {
        clearTimeout(calculateTimeout)
    }
    calculateTimeout = setTimeout(() => {
        calculateYearAmounts(period.value)
    }, 1000)
}

const calculateYearAmounts = async (targetPeriod: string) => {
    try {
        const currentYear = targetPeriod.substring(0, 4)
        const currentMonth = parseInt(targetPeriod.substring(5, 7))
        
        console.log(`计算${currentYear}年累计金额，截止到${currentMonth}月`)
        
        const yearAmounts: { [key: string]: number } = {}
        
        for (let month = 1; month <= currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            
            try {
                const response = await fetch(`http://47.111.95.19:3000/changzhou-tuoyuan-cash-flow/${monthPeriod}`)
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
                            if (currentAmount && !isNaN(currentAmount)) {
                                yearAmounts[key] = (yearAmounts[key] || 0) + parseFloat(currentAmount)
                            }
                        })
                    }
                }
            } catch (error) {
                console.warn(`无法获取${monthPeriod}的数据:`, error)
            }
        }
        
        cashFlowData.value.forEach(section => {
            section.leftItems.forEach(item => {
                if (yearAmounts[item.field] !== undefined) {
                    item.yearAmount = yearAmounts[item.field]
                }
            })
            if (section.rightItems) {
                section.rightItems.forEach(item => {
                    if (yearAmounts[item.field] !== undefined) {
                        item.yearAmount = yearAmounts[item.field]
                    }
                })
            }
        })
        
        console.log('本年累计金额计算完成:', yearAmounts)
        
    } catch (error) {
        console.error('计算本年累计金额失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string): Promise<void> => {
    try {
        console.log(`正在加载常州拓源现金流量表数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/changzhou-tuoyuan-cash-flow/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，清空表单')
                // 清空表单数据
                cashFlowData.value.forEach(section => {
                    section.leftItems.forEach(item => {
                        item.currentAmount = null
                        item.yearAmount = null
                    })
                    if (section.rightItems) {
                        section.rightItems.forEach(item => {
                            item.currentAmount = null
                            item.yearAmount = null
                        })
                    }
                })
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始恢复...')
            
            let parsedData
            try {
                // 处理可能的双重JSON编码
                if (typeof result.data === 'string') {
                    parsedData = JSON.parse(result.data)
                    // 如果解析结果仍然是字符串，说明有双重编码
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
                const item = cashFlowData.value.flatMap(section => [...section.leftItems, ...(section.rightItems || [])])
                    .find(item => item.field === key)
                if (item) {
                    item.currentAmount = parsedData[key].current_amount
                    item.yearAmount = parsedData[key].year_amount
                    console.log(`恢复字段 ${key}:`, parsedData[key])
                }
            })
            console.log('数据恢复完成')
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString()).then(() => {
            calculateYearAmounts(newPeriod.toString())
        })
        loadRemarksData()
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod).then(() => {
        calculateYearAmounts(newPeriod)
    })
    loadRemarksData()
})

const handleSave = async () => {
    try {
        const dataToSave = convertToStorageFormat(period.value)

        const response = await fetch('http://47.111.95.19:3000/changzhou-tuoyuan-cash-flow', {
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
        console.log('保存成功:', result.message)

        // 记录表单提交
        await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    cashFlowData.value.forEach(section => {
        section.leftItems.forEach(item => {
            item.currentAmount = null
            item.yearAmount = null
        })
        if (section.rightItems) {
            section.rightItems.forEach(item => {
                item.currentAmount = null
                item.yearAmount = null
            })
        }
    })
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

onMounted(async () => {
    console.log('常州拓源现金流量表组件挂载，当前期间:', period.value)
    // 加载当前期间的数据
    if (route.query.period) {
        await loadData(route.query.period.toString())
        await calculateYearAmounts(route.query.period.toString())
    } else {
        await loadData(period.value)
        await calculateYearAmounts(period.value)
    }
    loadRemarksData()
})
</script>

<style scoped>
/* 可以添加需要的样式 */
</style> 