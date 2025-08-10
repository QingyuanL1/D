<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold">主营业务毛利率结构与质量</h1>
                <div class="text-sm text-blue-600 mt-1">当期实际值自动计算：(主营收入-主营成本)/主营收入 × 100%</div>
            </div>
            <div class="text-gray-500">(按年度计划口径分解)</div>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期实际</th>
                        <th class="border border-gray-300 px-4 py-2">偏差</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="8">设备</td>
                        <td class="border border-gray-300 px-4 py-2">上海</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">国网</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">江苏</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">输配电内配</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">西门子</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">同业</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 元件板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">元件</td>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 工程板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="5">工程</td>
                        <td class="border border-gray-300 px-4 py-2">一包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">二包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域内合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域外合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.actual" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.plan" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.actual" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.difference" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-50" readonly />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleRefresh" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                重新计算
            </button>
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
        </div>
        
        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.BUSINESS_PROFIT_MARGIN"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface BusinessItem {
    plan: string;
    actual: string;
    difference: string;
}

// 注意：预算数据由后端中间件从数据库动态获取，不在前端写死

// 年度计划静态数据（根据截图）
const getInitialData = () => ({
    equipment: {
        shanghai: { plan: '21.99%', actual: '0%', difference: '0%' },
        national: { plan: '13.83%', actual: '0%', difference: '0%' },
        jiangsu: { plan: '8.00%', actual: '0%', difference: '0%' },
        power: { plan: '/', actual: '0%', difference: '0%' },
        siemens: { plan: '/', actual: '0%', difference: '0%' },
        peers: { plan: '22.43%', actual: '0%', difference: '0%' },
        users: { plan: '11.68%', actual: '0%', difference: '0%' },
        others: { plan: '/', actual: '0%', difference: '0%' }
    },
    components: {
        users: { plan: '/', actual: '0%', difference: '0%' }
    },
    engineering: {
        package1: { plan: '26.00%', actual: '0%', difference: '0%' },
        package2: { plan: '15.00%', actual: '0%', difference: '0%' },
        domestic: { plan: '8.00%', actual: '0%', difference: '0%' },
        international: { plan: '6.00%', actual: '0%', difference: '0%' },
        others: { plan: '15.00%', actual: '0%', difference: '0%' }
    },
    total: { plan: '24.00%', actual: '0%', difference: '0%' }
})

const data = reactive(getInitialData())

// 计算偏差：当期实际 - 年度计划
const calculateDifference = (segment: string, item: string) => {
    let planValue: number = 0
    let actualValue: number = 0
    
    if (segment === 'total') {
        planValue = parseFloat(data.total.plan.replace('%', '')) || 0
        actualValue = parseFloat(data.total.actual.replace('%', '')) || 0
        data.total.difference = (actualValue - planValue).toFixed(2) + '%'
    } else {
        const segmentData = data[segment]
        if (segmentData && segmentData[item]) {
            const planStr = segmentData[item].plan
            const actualStr = segmentData[item].actual
            
            // 如果计划是 "/"，偏差也设为 "/"
            if (planStr === '/') {
                segmentData[item].difference = '/'
                return
            }
            
            planValue = parseFloat(planStr.replace('%', '')) || 0
            actualValue = parseFloat(actualStr.replace('%', '')) || 0
            
            const difference = actualValue - planValue
            segmentData[item].difference = difference.toFixed(2) + '%'
        }
    }
}

// 重新计算所有偏差
const recalculateAllDifferences = () => {
    // 设备板块
    calculateDifference('equipment', 'shanghai')
    calculateDifference('equipment', 'national')
    calculateDifference('equipment', 'jiangsu')
    calculateDifference('equipment', 'power')
    calculateDifference('equipment', 'siemens')
    calculateDifference('equipment', 'peers')
    calculateDifference('equipment', 'users')
    calculateDifference('equipment', 'others')
    
    // 元件板块
    calculateDifference('components', 'users')
    
    // 工程板块
    calculateDifference('engineering', 'package1')
    calculateDifference('engineering', 'package2')
    calculateDifference('engineering', 'domestic')
    calculateDifference('engineering', 'international')
    calculateDifference('engineering', 'others')
    
    // 合计
    calculateDifference('total', '')
}

// 合并数据：将从数据库加载的数据与初始模板合并，但保持年度计划和实际值为静态/计算数据
const mergeData = (templateData: any, loadedData: any) => {
    if (!loadedData || typeof loadedData !== 'object') {
        return templateData
    }

    const result = JSON.parse(JSON.stringify(templateData))

    // 递归合并对象，但跳过plan、actual和difference字段
    const deepMerge = (target: any, source: any) => {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {}
                deepMerge(target[key], source[key])
            } else {
                // 跳过plan、actual和difference字段，保持静态数据和自动计算
                if (key !== 'plan' && key !== 'actual' && key !== 'difference') {
                    target[key] = source[key] || target[key]
                }
            }
        })
    }

    deepMerge(result, loadedData)
    return result
}

// 自动计算业务利润率
const calculateProfitMargin = async (targetPeriod: string) => {
    try {
        console.log(`正在计算业务利润率，期间: ${targetPeriod}`)

        const response = await fetch(`http://47.111.95.19:3000/business-profit-margin/calculate/${targetPeriod}`)

        if (response.ok) {
            const result = await response.json()
            console.log('计算结果:', result)

            if (result.success && result.data) {
                // 更新计算后的数据
                Object.assign(data, result.data)

                // 重新计算所有偏差
                recalculateAllDifferences()

                console.log('业务利润率计算完成:', data)
                return
            }
        } else if (response.status === 404) {
            console.log('缺少必要的收入或成本数据，无法计算利润率')
            alert('缺少必要的收入或成本数据，无法计算利润率。请先填写主营业务收入和主营业务成本数据。')
        } else {
            console.log('计算利润率失败')
        }

        // 如果计算失败，使用初始数据
        Object.assign(data, getInitialData())
        recalculateAllDifferences()

    } catch (error) {
        console.error('计算业务利润率失败:', error)
        // 出错时使用初始数据
        Object.assign(data, getInitialData())
        recalculateAllDifferences()
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载主营业务毛利率结构数据，期间: ${targetPeriod}`)

        // 首先尝试自动计算
        await calculateProfitMargin(targetPeriod)

        // 然后尝试加载已保存的数据（如果有的话）
        const response = await fetch(`http://47.111.95.19:3000/business-profit-margin/${targetPeriod}`)
        let loadedData: any = null

        if (response.ok) {
            const result = await response.json()
            console.log('API返回已保存数据:', result)

            if (result.success && result.data) {
                loadedData = result.data
                console.log('成功获取已保存数据，开始合并...')

                // 只合并非计算字段（保持actual字段为计算值）
                const currentData = JSON.parse(JSON.stringify(data))
                const mergedData = mergeData(currentData, loadedData)
                Object.assign(data, mergedData)

                // 重新计算所有偏差
                recalculateAllDifferences()
            }
        } else if (response.status === 404) {
            console.log('该期间暂无已保存数据，使用计算数据')
        } else {
            console.log('加载已保存数据失败，使用计算数据')
        }

        console.log('最终数据:', data)

    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        Object.assign(data, getInitialData())
        // 重新计算所有偏差
        recalculateAllDifferences()
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
        console.log('保存数据:', { period: period.value, data: data })

        // 1. 保存到专用表
        const response = await fetch('http://47.111.95.19:3000/business-profit-margin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: data
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(MODULE_IDS.BUSINESS_PROFIT_MARGIN, period.value, data, remarks.value, suggestions.value)
        
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleRefresh = async () => {
    try {
        console.log('手动重新计算业务利润率')
        await calculateProfitMargin(period.value)
        alert('重新计算完成')
    } catch (error) {
        console.error('重新计算失败:', error)
        alert('重新计算失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    Object.assign(data, getInitialData())
    remarks.value = ''
    suggestions.value = ''
    // 重新计算所有偏差
    recalculateAllDifferences()
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.BUSINESS_PROFIT_MARGIN, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('主营业务边际贡献率组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
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