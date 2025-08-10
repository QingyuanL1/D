<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">施工计划执行情况（可修订）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：%）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度目标</th>
                        <th class="border border-gray-300 px-4 py-2">准时完工率</th>
                        <th class="border border-gray-300 px-4 py-2">验收合格率</th>
                        <th class="border border-gray-300 px-4 py-2">计划达成率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程板块项目 -->
                    <template v-for="(item, index) in constructionData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="constructionData.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.annualTarget" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.onTimeCompletionRate" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.acceptanceQualificationRate" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.planAchievementRate" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualTarget) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.onTimeCompletionRate) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.acceptanceQualificationRate) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.planAchievementRate) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_CONSTRUCTION_PLAN_EXECUTION"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface ConstructionPlanItem {
    customerAttribute: string;
    annualTarget: number;
    onTimeCompletionRate: number;
    acceptanceQualificationRate: number;
    planAchievementRate: number;
}

interface ConstructionPlanData {
    items: ConstructionPlanItem[];
}

const fixedPlanData: ConstructionPlanData = {
    items: [
        { customerAttribute: '一包项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '二包项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '域内合作项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '域外合作项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '新能源项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '苏州项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '抢修项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 },
        { customerAttribute: '运检项目', annualTarget: 0, onTimeCompletionRate: 0, acceptanceQualificationRate: 0, planAchievementRate: 0 }
    ]
}

const constructionData = ref<ConstructionPlanData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualTarget: 0,
        onTimeCompletionRate: 0,
        acceptanceQualificationRate: 0,
        planAchievementRate: 0
    }
    
    const validItems = constructionData.value.items.filter(item => 
        item.annualTarget > 0 || item.onTimeCompletionRate > 0 || 
        item.acceptanceQualificationRate > 0 || item.planAchievementRate > 0
    )
    
    if (validItems.length === 0) {
        return total
    }
    
    validItems.forEach(item => {
        total.annualTarget += item.annualTarget || 0
        total.onTimeCompletionRate += item.onTimeCompletionRate || 0
        total.acceptanceQualificationRate += item.acceptanceQualificationRate || 0
        total.planAchievementRate += item.planAchievementRate || 0
    })
    
    // 计算平均值（除了年度目标是求和）
    total.onTimeCompletionRate = total.onTimeCompletionRate / validItems.length
    total.acceptanceQualificationRate = total.acceptanceQualificationRate / validItems.length
    total.planAchievementRate = total.planAchievementRate / validItems.length
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-construction-plan-execution/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            constructionData.value.items = result.data.items.map((item: any) => ({
                customerAttribute: item.customerAttribute,
                annualTarget: Number(item.annualTarget) || 0,
                onTimeCompletionRate: Number(item.onTimeCompletionRate) || 0,
                acceptanceQualificationRate: Number(item.acceptanceQualificationRate) || 0,
                planAchievementRate: Number(item.planAchievementRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    constructionData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_CONSTRUCTION_PLAN_EXECUTION}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                remarks.value = result.data.remarks || ''
                suggestions.value = result.data.suggestions || ''
            }
        }
    } catch (error) {
        console.error('加载备注失败:', error)
    }
}

watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        resetToDefaultData()
        await loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-construction-plan-execution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: constructionData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_CONSTRUCTION_PLAN_EXECUTION, period.value, { items: constructionData.value.items }, remarks.value, suggestions.value)
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    resetToDefaultData()
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    resetToDefaultData()
    const targetPeriod = route.query.period?.toString() || period.value
    await loadData(targetPeriod)
    loadRemarksAndSuggestions(targetPeriod)
})
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>