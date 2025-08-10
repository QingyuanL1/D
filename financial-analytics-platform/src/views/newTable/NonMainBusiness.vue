<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">非主营业务情况（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-24">序号</th>
                        <th class="border border-gray-300 px-4 py-2">财务科目</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in businessData" :key="index">
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            {{ item.id }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ item.category }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model.number="item.yearlyPlan" type="number" class="w-full px-2 py-1 border rounded bg-gray-100" step="0.01" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model.number="item.currentPeriod" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ formatNumber(item.cumulative) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ calculateProgress(item.yearlyPlan, item.cumulative) }}%
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.yearlyPlan.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.currentPeriod.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.cumulative.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.progress.toFixed(2) }}%
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
            :module-id="MODULE_IDS.NON_MAIN_BUSINESS"
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

interface BusinessItem {
    id: number;
    category: string;
    yearlyPlan: number;
    currentPeriod: number;
    cumulative: number;
}

// 初始数据模板（当没有数据时使用）
const getInitialData = (): BusinessItem[] => [
    { id: 1, category: '固定收入', yearlyPlan: 100, currentPeriod: 0, cumulative: 0 }, // 固定收入年度计划硬编码为100
    { id: 2, category: '房屋租金', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
    { id: 3, category: '利息收入', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
    { id: 4, category: '投资收益', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
    { id: 5, category: '补贴收入', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
    { id: 6, category: '其他', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
]

const businessData = ref<BusinessItem[]>(getInitialData())

// 格式化数字，最多两位小数
const formatNumber = (value: number): string => {
    return (value || 0).toFixed(2);
}

// 计算执行进度
const calculateProgress = (plan: number, actual: number): string => {
    if (plan <= 0) return '0.00';
    return ((actual / plan) * 100).toFixed(2);
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentPeriod: 0,
        cumulative: 0,
        progress: 0
    }
    
    businessData.value.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0;
        total.currentPeriod += item.currentPeriod || 0;
        total.cumulative += item.cumulative || 0;
    });
    
    // 计算总进度
    total.progress = total.yearlyPlan > 0 ? (total.cumulative / total.yearlyPlan * 100) : 0;
    
    return total;
});

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: BusinessItem[], loadedData: any[]): BusinessItem[] => {
    if (!Array.isArray(loadedData) || loadedData.length === 0) {
        return templateData
    }
    
    return templateData.map(templateItem => {
        const loadedItem = loadedData.find(item => item.id === templateItem.id || item.category === templateItem.category)
        if (loadedItem) {
            return {
                id: templateItem.id,
                category: templateItem.category,
                // 固定收入的年度计划始终为100，不使用后端数据
                yearlyPlan: templateItem.category === '固定收入' ? 100 : (Number(loadedItem.yearlyPlan) || 0),
                currentPeriod: Number(loadedItem.currentPeriod) || Number(loadedItem.currentTotal) || 0,
                cumulative: Number(loadedItem.cumulative) || 0
            }
        }
        return templateItem
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载非主营业务数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/non-main-business/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持年度计划但清空当期和累计')
                // 保持现有的年度计划值，但将当期和累计重置为0
                // 确保固定收入的年度计划始终为100
                businessData.value = businessData.value.map(item => ({
                    ...item,
                    yearlyPlan: item.category === '固定收入' ? 100 : item.yearlyPlan,
                    currentPeriod: 0,
                    cumulative: 0
                }))
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data && Array.isArray(result.data)) {
            console.log('成功获取数据，开始合并...')
            businessData.value = mergeData(getInitialData(), result.data)
            // 确保固定收入的年度计划始终为100
            const fixedIncomeItem = businessData.value.find(item => item.category === '固定收入')
            if (fixedIncomeItem) {
                fixedIncomeItem.yearlyPlan = 100
            }
            console.log('合并后的数据:', businessData.value)
        } else {
            // 如果没有数据，尝试计算累计值
            await calculateCumulativeValues(targetPeriod)
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 缓存累计值计算结果，避免重复请求
const cumulativeCache = new Map<string, Map<string, number>>()

// 计算累计值函数
const calculateCumulativeValues = async (targetPeriod: string) => {
    try {
        // 检查缓存
        if (cumulativeCache.has(targetPeriod)) {
            const cachedData = cumulativeCache.get(targetPeriod)!
            businessData.value = businessData.value.map(item => ({
                ...item,
                cumulative: cachedData.get(`${item.category}-${item.id}`) || 0
            }))
            return
        }

        const [year] = targetPeriod.split('-')
        const cumulativeData = new Map<string, number>()

        // 获取从年初到当前期间的所有数据
        for (let month = 1; month <= parseInt(targetPeriod.split('-')[1]); month++) {
            const monthPeriod = `${year}-${month.toString().padStart(2, '0')}`

            try {
                const response = await fetch(`http://47.111.95.19:3000/non-main-business/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data && Array.isArray(result.data)) {
                        result.data.forEach((item: any) => {
                            const key = `${item.category}-${item.id}`
                            const currentValue = Number(item.currentPeriod || item.currentTotal || 0)
                            cumulativeData.set(key, (cumulativeData.get(key) || 0) + currentValue)
                        })
                    }
                }
            } catch (error) {
                console.log(`跳过期间 ${monthPeriod} 的数据计算:`, error)
            }
        }

        // 缓存结果
        cumulativeCache.set(targetPeriod, cumulativeData)

        // 更新累计值
        businessData.value = businessData.value.map(item => ({
            ...item,
            cumulative: cumulativeData.get(`${item.category}-${item.id}`) || 0
        }))

    } catch (error) {
        console.error('计算累计值失败:', error)
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
        // 清除缓存，确保获取最新数据
        cumulativeCache.clear()
        loadData(newPeriod)
        loadRemarksData()
    }
})

// 防抖函数
const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
}

// 防抖的累计值计算函数
const debouncedCalculateCumulative = debounce(async () => {
    await calculateCumulativeValues(period.value)
}, 1000) // 1秒防抖

// 监听当期值变化，使用防抖机制避免频繁请求
watch(() => businessData.value.map(item => item.currentPeriod), () => {
    debouncedCalculateCumulative()
}, { deep: true })

const handleSave = async () => {
    try {
        const saveData = {
            period: period.value,
            data: businessData.value
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 non_main_business 表
        const response = await fetch('http://47.111.95.19:3000/non-main-business', {
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
        await recordFormSubmission(MODULE_IDS.NON_MAIN_BUSINESS, period.value, businessData.value, remarks.value, suggestions.value)

        // 3. 清除缓存，确保下次加载最新数据
        cumulativeCache.clear()

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    businessData.value = getInitialData()
    console.log('已重置为初始数据，固定收入年度计划保持为100')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.NON_MAIN_BUSINESS, period.value)
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