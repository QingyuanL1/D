<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">非主营业务净利润贡献情况（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">序号</th>
                        <th class="border border-gray-300 px-4 py-2">财务科目</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in items" :key="index">
                        <td class="border border-gray-300 px-4 py-2 text-center">{{ item.id }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.plan }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="item.currentPeriod" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(index)" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.accumulated }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.progress }}</span>
                        </td>
                    </tr>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.plan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentPeriod) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.accumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.progress }}
                        </td>
                    </tr>
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
        
        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NON_MAIN_BUSINESS_NET_PROFIT"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')
const allMonthsData = ref<any[]>([]) // 存储所有月份的数据

interface ProfitItem {
    id: number;
    name: string;
    plan: string;
    currentPeriod: string;
    accumulated: string;
    progress: string;
}

// 初始化数据模板（当没有数据时使用）
const getInitialItems = (): ProfitItem[] => [
    { id: 1, name: '固废收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 2, name: '房屋租金', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 3, name: '利息收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 4, name: '投资收益', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 5, name: '补贴收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 6, name: '其他', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' }
]

const items = ref<ProfitItem[]>(getInitialItems())

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取所有月份数据用于累计计算
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const [year, month] = currentPeriod.split('-')
        const currentMonth = parseInt(month)
        const allData = []
        
        // 获取当年1月到当前月的所有数据
        for (let i = 1; i <= currentMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/non-main-business-net-profit/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.data && Array.isArray(result.data)) {
                        allData.push({ period: monthPeriod, data: result.data })
                    }
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error)
            }
        }
        
        allMonthsData.value = allData
        console.log('加载的所有月份数据:', allData)
    } catch (error) {
        console.error('加载所有月份数据失败:', error)
    }
}

// 计算单个项目的累计值
const calculateAccumulated = (itemId: number, itemName: string) => {
    let total = 0
    const currentPeriod = period.value
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.period === currentPeriod) continue
        
        const item = monthData.data.find((d: any) => d.id === itemId || d.name === itemName)
        if (item && item.currentPeriod) {
            const value = parseFloat(item.currentPeriod.toString().replace(/,/g, '')) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    const currentItem = items.value.find(d => d.id === itemId)
    if (currentItem && currentItem.currentPeriod) {
        const currentValue = parseFloat(currentItem.currentPeriod.toString().replace(/,/g, '')) || 0
        total += currentValue
    }
    
    return total.toFixed(2)
}

// 更新累计值
const updateAccumulated = () => {
    items.value.forEach(item => {
        item.accumulated = calculateAccumulated(item.id, item.name)
    })
}

// 计算执行进度
const calculateProgress = (index: number) => {
    // 更新累计值
    updateAccumulated()
    
    // 移除逗号并转换为数字
    const plan = parseFloat(items.value[index].plan.replace(/,/g, ''))
    const accumulated = parseFloat(items.value[index].accumulated.replace(/,/g, ''))
    
    if (!isNaN(plan) && !isNaN(accumulated) && plan !== 0) {
        const progress = (accumulated / plan * 100).toFixed(2)
        items.value[index].progress = `${progress}%`
    } else if (accumulated > 0) {
        items.value[index].progress = '0.00%'
    } else {
        items.value[index].progress = '0.00%'
    }
}

// 计算合计数据
const totalData = computed(() => {
    let totalPlan = 0
    let totalCurrentPeriod = 0
    let totalAccumulated = 0
    
    items.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentPeriod += parseFloat(item.currentPeriod.replace(/,/g, '')) || 0
        totalAccumulated += parseFloat(item.accumulated.replace(/,/g, '')) || 0
    })
    
    // 计算总执行进度
    let progress = '0.00%'
    if (totalPlan !== 0) {
        progress = `${(totalAccumulated / totalPlan * 100).toFixed(2)}%`
    }
    
    return {
        plan: totalPlan,
        currentPeriod: totalCurrentPeriod,
        accumulated: totalAccumulated,
        progress
    }
})

// 合并数据：将从数据库加载的数据与初始模板合并，优先使用预算数据
const mergeData = (templateData: ProfitItem[], loadedData: any[]): ProfitItem[] => {
    if (!Array.isArray(loadedData) || loadedData.length === 0) {
        return templateData
    }
    
    return templateData.map(templateItem => {
        const loadedItem = loadedData.find(item => item.id === templateItem.id || item.name === templateItem.name)
        if (loadedItem) {
            return {
                id: templateItem.id,
                name: templateItem.name,
                plan: loadedItem.yearlyPlan ? loadedItem.yearlyPlan.toString() : (loadedItem.plan || '0'),
                currentPeriod: loadedItem.currentPeriod ? loadedItem.currentPeriod.toString() : (loadedItem.actual || '0'),
                accumulated: loadedItem.accumulated ? loadedItem.accumulated.toString() : '0',
                progress: loadedItem.progress || '0.00%'
            }
        }
        return templateItem
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载非主营业务净利润数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/non-main-business-net-profit/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持年度计划但清空当期值')
                // 保持现有的年度计划值，但将当期值重置为0
                items.value = items.value.map(item => ({
                    ...item,
                    currentPeriod: '0',
                    accumulated: '0',
                    progress: '0.00%'
                }))
                // 加载所有月份数据并计算累计值
                await loadAllMonthsData(targetPeriod)
                updateAccumulated()
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data && Array.isArray(result.data)) {
            console.log('成功获取数据，开始合并...')
            items.value = mergeData(getInitialItems(), result.data)
            console.log('合并后的数据:', items.value)
        }
        
        // 加载所有月份数据并计算累计值
        await loadAllMonthsData(targetPeriod)
        updateAccumulated()
        
        // 重新计算所有项目的执行进度
        items.value.forEach((_, index) => {
            calculateProgress(index)
        })
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
    }
})

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksData()
    }
})

const handleSave = async () => {
    try {
        // 更新累计值
        updateAccumulated()
        
        const saveData = {
            period: period.value,
            data: items.value
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 non_main_business_net_profit 表
        const response = await fetch('http://47.111.95.19:3000/non-main-business-net-profit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(MODULE_IDS.NON_MAIN_BUSINESS_NET_PROFIT, period.value, items.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    items.value = getInitialItems()
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.NON_MAIN_BUSINESS_NET_PROFIT, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('组件挂载，当前期间:', period.value)
    loadData(period.value)
    loadRemarksData()
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