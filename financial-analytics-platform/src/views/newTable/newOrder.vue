<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">新签订单结构与质量（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块属性</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当月新增</th>
                        <th class="border border-gray-300 px-4 py-2">累计新签订单</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备类别 -->
                    <template v-for="(item, index) in orderData.equipment" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyRevenue" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="updateCumulativeRevenue" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.cumulativeRevenue) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="text-sm font-medium">{{ calculateProgress(item.yearlyPlan, item.cumulativeRevenue) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 元件类别 -->
                    <template v-for="(item, index) in orderData.components" :key="`components-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyRevenue" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="updateCumulativeRevenue" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.cumulativeRevenue) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="text-sm font-medium">{{ calculateProgress(item.yearlyPlan, item.cumulativeRevenue) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 工程类别 -->
                    <template v-for="(item, index) in orderData.engineering" :key="`engineering-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyRevenue" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="updateCumulativeRevenue" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="text-sm font-medium">{{ formatNumber(item.cumulativeRevenue) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="text-sm font-medium">{{ calculateProgress(item.yearlyPlan, item.cumulativeRevenue) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.yearlyPlan) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.monthlyRevenue) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.cumulativeRevenue) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="text-sm font-bold">{{ totalData.progress }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NEW_ORDERS"
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

interface OrderItem {
    customer: string;
    yearlyPlan: number;
    monthlyRevenue: number;
    cumulativeRevenue: number;
}

interface OrderData {
    equipment: OrderItem[];
    components: OrderItem[];
    engineering: OrderItem[];
}

const getInitialData = (): OrderData => ({
    equipment: [
        { customer: '上海项目', yearlyPlan: 30000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '国网项目', yearlyPlan: 8000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '江苏项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '输配电内配', yearlyPlan: 4000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '西门子项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '同业项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '用户项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '其它项目', yearlyPlan: 0.00, monthlyRevenue: 0, cumulativeRevenue: 0 }
    ],
    components: [
        { customer: '用户项目', yearlyPlan: 4000.00, monthlyRevenue: 0, cumulativeRevenue: 0 }
    ],
    engineering: [
        { customer: '一包项目', yearlyPlan: 3900.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '二包项目', yearlyPlan: 2200.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '域内合作项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '域外合作项目', yearlyPlan: 1000.00, monthlyRevenue: 0, cumulativeRevenue: 0 },
        { customer: '其它项目', yearlyPlan: 1900.00, monthlyRevenue: 0, cumulativeRevenue: 0 }
    ]
})

const orderData = ref<OrderData>(getInitialData())

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 计算进度函数
const calculateProgress = (yearlyPlan: number, cumulativeRevenue: number): string => {
  if (!yearlyPlan || yearlyPlan === 0) return '0.00'
  const progress = (cumulativeRevenue / yearlyPlan) * 100
  return progress.toFixed(2)
}

// 格式化数字显示
const formatNumber = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.00'
  }
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算累计收入
const calculateCumulativeRevenue = async (customer: string, category: string): Promise<number> => {
  try {
    const currentYear = period.value.split('-')[0]
    const currentMonth = parseInt(period.value.split('-')[1])
    let totalCumulative = 0

    // 从1月到当前月份累计所有月份的收入
    for (let month = 1; month <= currentMonth; month++) {
      const periodStr = `${currentYear}-${month.toString().padStart(2, '0')}`
      
      try {
        const response = await fetch(`http://47.111.95.19:3000/new-orders/${periodStr}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            const categoryData = result.data[category]
            if (categoryData && Array.isArray(categoryData)) {
              const item = categoryData.find((item: any) => item.customer === customer)
              if (item) {
                totalCumulative += Number(item.currentPeriod) || 0
              }
            }
          }
        }
      } catch (error) {
        console.warn(`获取${periodStr}期间数据失败:`, error)
      }
    }
    
    return totalCumulative
  } catch (error) {
    console.error('计算累计收入失败:', error)
    return 0
  }
}

// 更新累计收入（现在由后端自动计算，这里只是触发重新加载）
const updateCumulativeRevenue = async () => {
  // 累计收入现在由后端自动计算，这里可以触发数据重新加载
  console.log('当月收入已更新，累计收入将在保存后由后端自动计算')
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        monthlyRevenue: 0,
        cumulativeRevenue: 0,
        progress: 0
    }
    
    // 计算所有项的总和
    const allItems = [
        ...orderData.value.equipment,
        ...orderData.value.components,
        ...orderData.value.engineering
    ]
    
    allItems.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.monthlyRevenue += item.monthlyRevenue || 0
        total.cumulativeRevenue += item.cumulativeRevenue || 0
    })
    
    // 计算总进度
    total.progress = total.yearlyPlan > 0 ? (total.cumulativeRevenue / total.yearlyPlan * 100) : 0
    total.progress = parseFloat(total.progress.toFixed(2))
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/new-orders/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data) {
            // 合并API数据，保持年度计划来自预算中间件
            const mergedData = getInitialData()
            
            // 合并设备数据
            if (result.data.equipment) {
                mergedData.equipment = mergedData.equipment.map(item => {
                    const apiItem = result.data.equipment.find((api: any) => api.customer === item.customer)
                    return {
                        ...item,
                        yearlyPlan: apiItem?.yearlyPlan || item.yearlyPlan,
                        monthlyRevenue: apiItem?.currentPeriod || 0,
                        cumulativeRevenue: apiItem?.cumulativeTotal || 0
                    }
                })
            }

            // 合并元件数据
            if (result.data.components) {
                mergedData.components = mergedData.components.map(item => {
                    const apiItem = result.data.components.find((api: any) => api.customer === item.customer)
                    return {
                        ...item,
                        yearlyPlan: apiItem?.yearlyPlan || item.yearlyPlan,
                        monthlyRevenue: apiItem?.currentPeriod || 0,
                        cumulativeRevenue: apiItem?.cumulativeTotal || 0
                    }
                })
            }

            // 合并工程数据
            if (result.data.engineering) {
                mergedData.engineering = mergedData.engineering.map(item => {
                    const apiItem = result.data.engineering.find((api: any) => api.customer === item.customer)
                    return {
                        ...item,
                        yearlyPlan: apiItem?.yearlyPlan || item.yearlyPlan,
                        monthlyRevenue: apiItem?.currentPeriod || 0,
                        cumulativeRevenue: apiItem?.cumulativeTotal || 0
                    }
                })
            }
            
            orderData.value = mergedData
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NEW_ORDERS}/${targetPeriod}`)
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
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/new-orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    equipment: orderData.value.equipment.map(item => ({
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentPeriod: item.monthlyRevenue
                    })),
                    components: orderData.value.components.map(item => ({
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentPeriod: item.monthlyRevenue
                    })),
                    engineering: orderData.value.engineering.map(item => ({
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentPeriod: item.monthlyRevenue
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NEW_ORDERS, period.value, orderData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    orderData.value = getInitialData()
    remarks.value = ''
    suggestions.value = ''
}


onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        loadData(period.value)
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
