<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-[1400px] mx-auto px-4">
            <!-- 页面头部 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="text-center flex-1">
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">现金流量表</h1>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div class="font-medium">编制单位：常州拓源电气有限公司</div>
                            <div>2025年2月</div>
                            <div>单位：元</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">选择期间：</label>
                        <input 
                            v-model="period" 
                            type="month" 
                            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>
            </div>

            <!-- 现金流量表主体 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-80">项目</th>
                                <th class="border border-gray-300 px-2 py-3 text-sm font-semibold text-gray-700 w-16">行次</th>
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-32">本期金额</th>
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-32">本年累计金额</th>
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-80">项目</th>
                                <th class="border border-gray-300 px-2 py-3 text-sm font-semibold text-gray-700 w-16">行次</th>
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-32">本期金额</th>
                                <th class="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-32">本年累计金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(section, sectionIndex) in cashFlowData" :key="sectionIndex">
                                <!-- 章节标题 -->
                                <tr class="bg-gray-50">
                                    <td 
                                        class="border border-gray-300 px-3 py-2 font-bold text-gray-800 text-sm" 
                                        :colspan="section.rightItems ? 4 : 8"
                                    >
                                        {{ section.title }}
                                    </td>
                                    <template v-if="section.rightItems">
                                        <td class="border border-gray-300 px-3 py-2"></td>
                                        <td class="border border-gray-300 px-3 py-2"></td>
                                        <td class="border border-gray-300 px-3 py-2"></td>
                                        <td class="border border-gray-300 px-3 py-2"></td>
                                    </template>
                                </tr>

                                <!-- 左列和右列内容 -->
                                <template v-for="(item, itemIndex) in section.leftItems" :key="`${sectionIndex}-left-${itemIndex}`">
                                    <tr class="hover:bg-blue-50 transition-colors duration-150">
                                        <!-- 左列 -->
                                        <td :class="[
                                            'border border-gray-300 px-3 py-2 text-sm',
                                            item.isSubItem ? 'pl-6 text-gray-600' : 'text-gray-700',
                                            item.isBold ? 'font-bold bg-gray-50' : ''
                                        ]">
                                            {{ item.name }}
                                        </td>
                                        <td class="border border-gray-300 px-2 py-2 text-center text-sm text-gray-600">
                                            {{ item.rowNumber }}
                                        </td>
                                        <td class="border border-gray-300 px-1 py-1">
                                            <input 
                                                v-model="item.currentAmount" 
                                                type="number"
                                                class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                step="0.01" 
                                                :data-field="item.field"
                                                :class="item.isBold ? 'font-bold bg-gray-50' : ''"
                                            />
                                        </td>
                                        <td class="border border-gray-300 px-1 py-1">
                                            <input 
                                                v-model="item.yearAmount" 
                                                type="number"
                                                class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                step="0.01"
                                                :data-field="`${item.field}_year`"
                                                :class="item.isBold ? 'font-bold bg-gray-50' : ''"
                                            />
                                        </td>

                                        <!-- 右列 -->
                                        <template v-if="section.rightItems && section.rightItems[itemIndex]">
                                            <td :class="[
                                                'border border-gray-300 px-3 py-2 text-sm',
                                                section.rightItems[itemIndex].isSubItem ? 'pl-6 text-gray-600' : 'text-gray-700',
                                                section.rightItems[itemIndex].isBold ? 'font-bold bg-gray-50' : ''
                                            ]">
                                                {{ section.rightItems[itemIndex].name }}
                                            </td>
                                            <td class="border border-gray-300 px-2 py-2 text-center text-sm text-gray-600">
                                                {{ section.rightItems[itemIndex].rowNumber }}
                                            </td>
                                            <td class="border border-gray-300 px-1 py-1">
                                                <input 
                                                    v-model="section.rightItems[itemIndex].currentAmount" 
                                                    type="number"
                                                    class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                    step="0.01" 
                                                    :data-field="section.rightItems[itemIndex].field"
                                                    :class="section.rightItems[itemIndex].isBold ? 'font-bold bg-gray-50' : ''"
                                                />
                                            </td>
                                            <td class="border border-gray-300 px-1 py-1">
                                                <input 
                                                    v-model="section.rightItems[itemIndex].yearAmount" 
                                                    type="number"
                                                    class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                    step="0.01"
                                                    :data-field="`${section.rightItems[itemIndex].field}_year`"
                                                    :class="section.rightItems[itemIndex].isBold ? 'font-bold bg-gray-50' : ''"
                                                />
                                            </td>
                                        </template>
                                        <template v-else>
                                            <td class="border border-gray-300 px-3 py-2 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-2 py-2 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-1 py-1 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-1 py-1 bg-gray-25"></td>
                                        </template>
                                    </tr>
                                </template>

                                <!-- 处理右列剩余项 -->
                                <template v-if="section.rightItems && section.rightItems.length > section.leftItems.length">
                                    <template v-for="(item, itemIndex) in section.rightItems.slice(section.leftItems.length)" :key="`${sectionIndex}-right-${itemIndex + section.leftItems.length}`">
                                        <tr class="hover:bg-blue-50 transition-colors duration-150">
                                            <td class="border border-gray-300 px-3 py-2 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-2 py-2 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-1 py-1 bg-gray-25"></td>
                                            <td class="border border-gray-300 px-1 py-1 bg-gray-25"></td>
                                            <td :class="[
                                                'border border-gray-300 px-3 py-2 text-sm',
                                                item.isSubItem ? 'pl-6 text-gray-600' : 'text-gray-700',
                                                item.isBold ? 'font-bold bg-gray-50' : ''
                                            ]">
                                                {{ item.name }}
                                            </td>
                                            <td class="border border-gray-300 px-2 py-2 text-center text-sm text-gray-600">
                                                {{ item.rowNumber }}
                                            </td>
                                            <td class="border border-gray-300 px-1 py-1">
                                                <input 
                                                    v-model="item.currentAmount" 
                                                    type="number"
                                                    class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                    step="0.01" 
                                                    :data-field="item.field"
                                                    :class="item.isBold ? 'font-bold bg-gray-50' : ''"
                                                />
                                            </td>
                                            <td class="border border-gray-300 px-1 py-1">
                                                <input 
                                                    v-model="item.yearAmount" 
                                                    type="number"
                                                    class="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded"
                                                    step="0.01"
                                                    :data-field="`${item.field}_year`"
                                                    :class="item.isBold ? 'font-bold bg-gray-50' : ''"
                                                />
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 操作按钮区域 -->
            <div class="mt-6 flex justify-center">
                <button 
                    @click="handleSave" 
                    class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <i class="fas fa-save mr-2"></i>保存数据
                </button>
            </div>

            <!-- 附件和备注组件 -->
            <div class="mt-8">
                <FormAttachmentAndRemarks
                  :module-id="moduleId"
                  :period="period"
                  v-model:remarks="remarks"
                  v-model:suggestions="suggestions"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChangzhouTuoyuanCashFlowData } from './changzhouTuoyuanCashFlowData'
import type { CashFlowStatement } from './types/cashFlow'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const { cashFlowData, convertToStorageFormat, restoreFromStorageFormat } = useChangzhouTuoyuanCashFlowData()
const moduleId = MODULE_IDS.TUOYUAN_CASH_FLOW
const remarks = ref('')
const suggestions = ref('')

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载常州拓源现金流量表数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://127.0.0.1:3000/changzhou-tuoyuan-cash-flow/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，使用初始模板')
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
    try {
        const dataToSave = convertToStorageFormat(period.value)

        const response = await fetch('http://127.0.0.1:3000/changzhou-tuoyuan-cash-flow', {
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

        // 显示成功提示
        showSuccessMessage('数据保存成功！')
    } catch (error) {
        console.error('保存失败:', error)
        showErrorMessage('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}



// 显示成功消息
const showSuccessMessage = (message: string) => {
    // 这里可以集成更好的通知组件，暂时使用alert
    alert(`✅ ${message}`)
}

// 显示错误消息
const showErrorMessage = (message: string) => {
    // 这里可以集成更好的通知组件，暂时使用alert
    alert(`❌ ${message}`)
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('常州拓源现金流量表组件挂载，当前期间:', period.value)
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
/* 自定义样式 */
.bg-gray-25 {
    background-color: #fafafa;
}

/* 输入框聚焦效果 */
input[type="number"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 表格行hover效果 */
tbody tr:hover {
    background-color: rgba(59, 130, 246, 0.02);
}

/* 粗体项目特殊样式 */
.font-bold {
    background-color: rgba(243, 244, 246, 0.5);
}

/* 响应式优化 */
@media (max-width: 1200px) {
    .max-w-\[1400px\] {
        max-width: 100%;
    }
}

/* 打印样式 */
@media print {
    .bg-gradient-to-r {
        background: #f8fafc !important;
    }
    
    button {
        display: none !important;
    }
    
    .shadow-md {
        box-shadow: none !important;
    }
}
</style> 