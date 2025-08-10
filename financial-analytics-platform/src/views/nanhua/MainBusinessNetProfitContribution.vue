<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务净利润贡献情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
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
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">分解占比</th>
                        <th class="border border-gray-300 px-4 py-2">年度比重</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in netProfitData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="netProfitData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.currentPeriod) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.decompositionRatio) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.annualRatio) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriod) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.decompositionRatio) }}%</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">100.00%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_MAIN_BUSINESS_NET_PROFIT"
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

interface NetProfitContributionItem {
    customerName: string;
    yearlyPlan: number;
    currentPeriod: number;
    cumulative: number;
    decompositionRatio: number;
    annualRatio: number;
}

interface NetProfitContributionData {
    customers: NetProfitContributionItem[];
}

// 固定的客户列表数据
const fixedCustomerData: NetProfitContributionData = {
    customers: [
        { customerName: '一包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '二包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域内合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域外合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '新能源项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '苏州项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '抢修项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '运检项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '运检', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '派遣', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '自接', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 }
    ]
}

const netProfitData = ref<NetProfitContributionData>(JSON.parse(JSON.stringify(fixedCustomerData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化百分比显示
const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算累计数据（从年初到当前月份）
const calculateCumulative = async (targetPeriod: string) => {
    try {
        const [year, month] = targetPeriod.split('-')
        const currentMonth = parseInt(month)
        
        // 为每个客户计算累计值
        for (let customer of netProfitData.value.customers) {
            let cumulative = 0
            
            // 从1月累计到当前月份
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/nanhua-main-business-net-profit/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const customerData = result.data.customers.find((c: any) => c.customerName === customer.customerName)
                        if (customerData) {
                            cumulative += customerData.currentPeriod || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            customer.cumulative = cumulative
            
            // 计算分解占比（累计/年度目标）
            if (customer.yearlyPlan > 0) {
                customer.decompositionRatio = (customer.cumulative / customer.yearlyPlan) * 100
            } else {
                customer.decompositionRatio = 0
            }
        }
        
        // 计算年度比重
        const totalYearlyPlan = netProfitData.value.customers.reduce((sum, item) => sum + (item.yearlyPlan || 0), 0)
        netProfitData.value.customers.forEach(customer => {
            if (totalYearlyPlan > 0) {
                customer.annualRatio = (customer.yearlyPlan / totalYearlyPlan) * 100
            } else {
                customer.annualRatio = 0
            }
        })
        
    } catch (error) {
        console.error('计算累计数据失败:', error)
    }
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentPeriod: 0,
        cumulative: 0,
        decompositionRatio: 0
    }
    
    netProfitData.value.customers.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.currentPeriod += item.currentPeriod || 0
        total.cumulative += item.cumulative || 0
    })
    
    // 计算总分解占比
    if (total.yearlyPlan > 0) {
        total.decompositionRatio = (total.cumulative / total.yearlyPlan) * 100
    }
    
    return total
})

// 加载计算出的净利润数据
const loadCalculatedData = async (targetPeriod: string) => {
    try {
        console.log(`正在调用计算接口，期间: ${targetPeriod}`);
        const response = await fetch(`http://127.0.0.1:3000/nanhua-main-business-net-profit/calculate/${targetPeriod}`)
        
        if (!response.ok) {
            if (response.status !== 404) {
                console.error('计算接口调用失败:', response.status);
            }
            return;
        }
        
        const result = await response.json();
        if (result.success && result.data && result.data.customers) {
            console.log('计算结果:', result);
            
            // 更新计算出的当期净利润值
            result.data.customers.forEach((calculatedItem: any) => {
                const customerInList = netProfitData.value.customers.find(
                    (customer: any) => customer.customerName === calculatedItem.customerName
                );
                if (customerInList) {
                    customerInList.currentPeriod = calculatedItem.currentPeriod;
                    console.log(`更新 ${calculatedItem.customerName} 当期净利润: ${calculatedItem.currentPeriod}`);
                }
            });
        }
    } catch (error) {
        console.error('加载计算数据失败:', error);
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-main-business-net-profit/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 合并后端数据和固定客户列表
            netProfitData.value.customers = fixedCustomerData.customers.map(fixed => {
                const dbItem = result.data.customers.find((item: any) => item.customerName === fixed.customerName)
                return {
                    customerName: fixed.customerName,
                    yearlyPlan: dbItem ? Number(dbItem.yearlyPlan) || 0 : 0,
                    currentPeriod: dbItem ? Number(dbItem.currentPeriod) || 0 : 0,
                    cumulative: dbItem ? Number(dbItem.cumulative) || 0 : 0,
                    decompositionRatio: dbItem ? Number(dbItem.decompositionRatio) || 0 : 0,
                    annualRatio: dbItem ? Number(dbItem.annualRatio) || 0 : 0
                }
            })
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
    
    // 加载计算出的净利润数据
    await loadCalculatedData(targetPeriod);
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_MAIN_BUSINESS_NET_PROFIT}/${targetPeriod}`)
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

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        await loadData(newPeriod.toString())
        await calculateCumulative(newPeriod.toString())
        await loadCalculatedData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        await calculateCumulative(newPeriod)
        await loadCalculatedData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/nanhua-main-business-net-profit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: netProfitData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_MAIN_BUSINESS_NET_PROFIT, period.value, netProfitData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    netProfitData.value = JSON.parse(JSON.stringify(fixedCustomerData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    if (route.query.period) {
        await loadData(route.query.period.toString())
        await calculateCumulative(route.query.period.toString())
        await loadCalculatedData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        await loadData(period.value)
        await calculateCumulative(period.value)
        await loadCalculatedData(period.value)
        loadRemarksAndSuggestions(period.value)
    }
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