<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">利润总额结构与质量（单位：万元）</h1>
            <div class="text-gray-500">(按年度计划口径分解)</div>
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
                    <!-- 主营业务 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-center">1</td>
                        <td class="border border-gray-300 px-4 py-2">主营业务利润总额</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.plan" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.current" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.progress" type="text"
                                class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>

                    <!-- 非主营业务 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-center">2</td>
                        <td class="border border-gray-300 px-4 py-2">非主营业务</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.plan" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.current" type="text"
                                class="w-full px-2 py-1 border rounded" @input="calculateProgress('nonMainBusiness')" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.progress" type="text"
                                class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.plan" type="text"
                                class="w-full px-2 py-1 border rounded font-bold" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.current" type="text"
                                class="w-full px-2 py-1 border rounded font-bold" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded font-bold" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.progress" type="text"
                                class="w-full px-2 py-1 border rounded font-bold" readonly />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 主营业务净利润贡献情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">主营业务利润总额贡献情况（单位：万元）</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">板块</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">年度计划</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">当月值</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">累计值</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">分类贡献占比</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 设备板块 -->
                        <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                            <tr>
                                <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center"
                                    :rowspan="equipmentData.length">
                                    设备
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input v-model="item.plan" type="text"
                                        class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{
                                        formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0)
                                        }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{ item.actual }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.contribution }}
                                </td>
                            </tr>
                        </template>

                        <!-- 元件板块 -->
                        <template v-for="(item, index) in componentData" :key="`component-${index}`">
                            <tr>
                                <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center"
                                    :rowspan="componentData.length">
                                    元件
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input v-model="item.plan" type="text"
                                        class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{
                                        formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0)
                                        }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{ item.actual }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.contribution }}
                                </td>
                            </tr>
                        </template>

                        <!-- 工程板块 -->
                        <template v-for="(item, index) in projectData" :key="`project-${index}`">
                            <tr>
                                <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center"
                                    :rowspan="projectData.length">
                                    工程
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input v-model="item.plan" type="text"
                                        class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{
                                        formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0)
                                        }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="font-medium">{{ item.actual }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.contribution }}
                                </td>
                            </tr>
                        </template>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(mainBusinessTotalData.plan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(mainBusinessTotalData.currentMonthValue) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(mainBusinessTotalData.actual) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                100.00%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 非主营业务净利润贡献情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">非主营业务净利润贡献情况（单位：万元）</h2>
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
                        <tr v-for="(item, index) in nonMainItems" :key="index">
                            <td class="border border-gray-300 px-4 py-2 text-center">{{ item.id }}</td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="w-full px-2 py-1">{{ item.plan }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentPeriod" type="text" class="w-full px-2 py-1 border rounded"
                                    @input="calculateNonMainProgress(index)" />
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
                                {{ formatNumber(nonMainTotalData.plan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(nonMainTotalData.currentPeriod) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(nonMainTotalData.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ nonMainTotalData.progress }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
        <FormAttachmentAndRemarks :module-id="MODULE_IDS.NET_PROFIT_STRUCTURE" :period="period"
            v-model:remarks="remarks" v-model:suggestions="suggestions" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface ProfitItem {
    plan: string;
    current: string;
    cumulative: string;
    progress: string;
}

interface MainBusinessProfitItem {
    customerType: string;
    plan: string;
    currentMonthValue: string;
    actual: string;
    contribution: string;
    yearlyPlan?: number;
}

interface NonMainBusinessProfitItem {
    id: number;
    name: string;
    plan: string;
    currentPeriod: string;
    accumulated: string;
    progress: string;
}

// 注意：预算数据由后端中间件从数据库动态获取，不在前端写死

// 初始化数据模板（当没有数据时使用）
const getInitialData = () => ({
    mainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    nonMainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    total: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' }
})

// 主营业务净利润数据初始化 - 使用原始数据结构
const getInitialEquipmentData = (): MainBusinessProfitItem[] => [
    { customerType: '上海', plan: '2145.03', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '国网', plan: '621.55', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '江苏', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '输配电内配', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '西门子', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '同业', plan: '553.08', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '用户', plan: '323.8', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '其它', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialComponentData = (): MainBusinessProfitItem[] => [
    { customerType: '用户', plan: '-26.21', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialProjectData = (): MainBusinessProfitItem[] => [
    { customerType: '一包', plan: '328.91', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '二包', plan: '14.4', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '域内合作', plan: '-35.24', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '域外合作', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '其它', plan: '69.6', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

// 非主营业务净利润数据初始化 - 使用原始数据结构
const getInitialNonMainItems = (): NonMainBusinessProfitItem[] => [
    { id: 1, name: '固废收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 2, name: '房屋租金', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 3, name: '利息收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 4, name: '投资收益', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 5, name: '补贴收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
    { id: 6, name: '其他', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' }
]

// 响应式数据
const data = reactive<{
    mainBusiness: ProfitItem;
    nonMainBusiness: ProfitItem;
    total: ProfitItem;
}>(getInitialData())

// 主营业务数据
const equipmentData = ref<MainBusinessProfitItem[]>(getInitialEquipmentData())
const componentData = ref<MainBusinessProfitItem[]>(getInitialComponentData())
const projectData = ref<MainBusinessProfitItem[]>(getInitialProjectData())

// 非主营业务数据
const nonMainItems = ref<NonMainBusinessProfitItem[]>(getInitialNonMainItems())
const allMonthsData = ref<any[]>([]) // 存储所有月份的数据

// 格式化数字函数
const formatNumber = (num: number): string => {
    if (isNaN(num)) return '0.00'
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算主营业务合计数据
const mainBusinessTotalData = computed(() => {
    let totalPlan = 0
    let totalCurrentMonth = 0
    let totalActual = 0

    // 计算设备板块合计
    equipmentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })

    // 计算元件板块合计
    componentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })

    // 计算工程板块合计
    projectData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })

    return {
        plan: totalPlan,
        currentMonthValue: totalCurrentMonth,
        actual: totalActual,
        contribution: '100.00%'
    }
})

// 计算非主营业务合计数据
const nonMainTotalData = computed(() => {
    let totalPlan = 0
    let totalCurrent = 0
    let totalAccumulated = 0

    nonMainItems.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrent += parseFloat(item.currentPeriod.replace(/,/g, '')) || 0
        totalAccumulated += parseFloat(item.accumulated.replace(/,/g, '')) || 0
    })

    const progress = totalPlan !== 0 ? ((totalAccumulated / totalPlan) * 100).toFixed(2) + '%' : '0.00%'

    return {
        plan: totalPlan,
        currentPeriod: totalCurrent,
        accumulated: totalAccumulated,
        progress: progress
    }
})

// 计算执行进度
const calculateProgress = (type: 'mainBusiness' | 'nonMainBusiness') => {
    // 移除逗号并转换为数字
    const plan = parseFloat(data[type].plan.replace(/,/g, ''))
    const cumulative = parseFloat(data[type].cumulative.replace(/,/g, ''))

    if (!isNaN(plan) && !isNaN(cumulative) && plan !== 0) {
        const progress = (cumulative / plan * 100).toFixed(2)
        data[type].progress = `${progress}%`
    } else {
        data[type].progress = '0.00%'
    }

    calculateTotal()
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
    const currentItem = nonMainItems.value.find(d => d.id === itemId)
    if (currentItem && currentItem.currentPeriod) {
        const currentValue = parseFloat(currentItem.currentPeriod.toString().replace(/,/g, '')) || 0
        total += currentValue
    }

    return total.toFixed(2)
}

// 更新累计值
const updateAccumulated = () => {
    nonMainItems.value.forEach(item => {
        item.accumulated = calculateAccumulated(item.id, item.name)
    })
}

// 计算非主营业务进度
const calculateNonMainProgress = (index: number) => {
    // 更新累计值
    updateAccumulated()

    // 移除逗号并转换为数字
    const plan = parseFloat(nonMainItems.value[index].plan.replace(/,/g, ''))
    const accumulated = parseFloat(nonMainItems.value[index].accumulated.replace(/,/g, ''))

    if (!isNaN(plan) && !isNaN(accumulated) && plan !== 0) {
        const progress = (accumulated / plan * 100).toFixed(2)
        nonMainItems.value[index].progress = `${progress}%`
    } else if (accumulated > 0) {
        nonMainItems.value[index].progress = '0.00%'
    } else {
        nonMainItems.value[index].progress = '0.00%'
    }
}

// 计算合计
const calculateTotal = () => {
    // 移除逗号并转换为数字
    const mainPlan = parseFloat(data.mainBusiness.plan.replace(/,/g, '')) || 0
    const nonMainPlan = parseFloat(data.nonMainBusiness.plan.replace(/,/g, '')) || 0
    const mainCurrent = parseFloat(data.mainBusiness.current.replace(/,/g, '')) || 0
    const nonMainCurrent = parseFloat(data.nonMainBusiness.current.replace(/,/g, '')) || 0
    const mainCumulative = parseFloat(data.mainBusiness.cumulative.replace(/,/g, '')) || 0
    const nonMainCumulative = parseFloat(data.nonMainBusiness.cumulative.replace(/,/g, '')) || 0

    const totalPlan = mainPlan + nonMainPlan
    const totalCurrent = mainCurrent + nonMainCurrent
    const totalCumulative = mainCumulative + nonMainCumulative

    // 格式化为带千分位的数字
    data.total.plan = totalPlan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    data.total.current = totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    data.total.cumulative = totalCumulative.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    if (totalPlan !== 0) {
        const totalProgress = (totalCumulative / totalPlan * 100).toFixed(2)
        data.total.progress = `${totalProgress}%`
    } else {
        data.total.progress = '0.00%'
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



// 监听非主营业务当期值变化，重新计算非主营业务累计值
watch(() => data.nonMainBusiness.current, async () => {
    await calculateNonMainBusinessCumulative()
    calculateTotal()
}, { deep: true })

// 计算累计值函数 - 只计算主营业务，非主营业务保持手动输入
const calculateCumulativeValues = async () => {
    try {
        const [year] = period.value.split('-')
        let mainBusinessCumulative = 0

        // 获取从年初到当前期间的主营业务数据
        for (let month = 1; month <= parseInt(period.value.split('-')[1]); month++) {
            const monthPeriod = `${year}-${month.toString().padStart(2, '0')}`

            try {
                // 获取主营业务净利润数据
                const mainBusinessResponse = await fetch(`http://47.111.95.19:3000/main-business-net-profit/monthly-data/${monthPeriod}`)
                if (mainBusinessResponse.ok) {
                    const mainBusinessResult = await mainBusinessResponse.json()
                    if (mainBusinessResult.success && mainBusinessResult.data) {
                        // 计算主营业务当期净利润总和
                        let monthlyMainBusiness = 0

                        // 累加设备板块
                        if (mainBusinessResult.data.equipment) {
                            mainBusinessResult.data.equipment.forEach((item: any) => {
                                monthlyMainBusiness += item.currentMonthValue || 0
                            })
                        }

                        // 累加元件板块
                        if (mainBusinessResult.data.components) {
                            mainBusinessResult.data.components.forEach((item: any) => {
                                monthlyMainBusiness += item.currentMonthValue || 0
                            })
                        }

                        // 累加工程板块
                        if (mainBusinessResult.data.engineering) {
                            mainBusinessResult.data.engineering.forEach((item: any) => {
                                monthlyMainBusiness += item.currentMonthValue || 0
                            })
                        }

                        mainBusinessCumulative += monthlyMainBusiness
                    }
                }

            } catch (error) {
                console.log(`跳过期间 ${monthPeriod} 的数据计算:`, error)
            }
        }

        // 更新主营业务累计值
        data.mainBusiness.cumulative = mainBusinessCumulative.toFixed(2)

        // 更新主营业务当期值（当前月的数据）
        await updateMainBusinessCurrentValue()

        // 非主营业务累计值基于手动输入的当期值计算
        await calculateNonMainBusinessCumulative()

        // 重新计算进度和合计
        calculateProgress('mainBusiness')
        calculateProgress('nonMainBusiness')
        calculateTotal()

    } catch (error) {
        console.error('计算累计值失败:', error)
    }
}

// 更新主营业务当期值函数
const updateMainBusinessCurrentValue = async () => {
    try {
        // 获取当前月的主营业务净利润数据
        const mainBusinessResponse = await fetch(`http://47.111.95.19:3000/main-business-net-profit/monthly-data/${period.value}`)
        if (mainBusinessResponse.ok) {
            const mainBusinessResult = await mainBusinessResponse.json()
            if (mainBusinessResult.success && mainBusinessResult.data) {
                // 计算主营业务当期净利润总和
                let currentMainBusiness = 0

                // 累加设备板块
                if (mainBusinessResult.data.equipment) {
                    mainBusinessResult.data.equipment.forEach((item: any) => {
                        currentMainBusiness += item.currentMonthValue || 0
                    })
                }

                // 累加元件板块
                if (mainBusinessResult.data.components) {
                    mainBusinessResult.data.components.forEach((item: any) => {
                        currentMainBusiness += item.currentMonthValue || 0
                    })
                }

                // 累加工程板块
                if (mainBusinessResult.data.engineering) {
                    mainBusinessResult.data.engineering.forEach((item: any) => {
                        currentMainBusiness += item.currentMonthValue || 0
                    })
                }

                // 获取利润表数据，减去营业税金及附加和所得税的当期值
                try {
                    const incomeStatementResponse = await fetch(`http://47.111.95.19:3000/income-statement/${period.value}`)
                    if (incomeStatementResponse.ok) {
                        const incomeStatementResult = await incomeStatementResponse.json()
                        if (incomeStatementResult.success && incomeStatementResult.data) {
                            const taxesAndSurcharges = parseFloat(incomeStatementResult.data.taxes_and_surcharges?.current_amount) || 0
                            const incomeTaxExpense = parseFloat(incomeStatementResult.data.income_tax_expense?.current_amount) || 0

                            console.log(`营业税金及附加当期值: ${taxesAndSurcharges}`)
                            console.log(`所得税当期值: ${incomeTaxExpense}`)
                            console.log(`主营业务利润总额(扣减前): ${currentMainBusiness}`)

                            // 从主营业务利润总额中减去营业税金及附加和所得税
                            currentMainBusiness = currentMainBusiness - taxesAndSurcharges - incomeTaxExpense

                            console.log(`主营业务利润总额(扣减后): ${currentMainBusiness}`)
                        }
                    }
                } catch (incomeStatementError) {
                    console.error('获取利润表数据失败:', incomeStatementError)
                }

                data.mainBusiness.current = currentMainBusiness.toFixed(2)
            }
        }

    } catch (error) {
        console.error('更新主营业务当期值失败:', error)
    }
}

// 计算非主营业务累计值（基于手动输入的当期值）
const calculateNonMainBusinessCumulative = async () => {
    try {
        const [year] = period.value.split('-')
        let nonMainBusinessCumulative = 0

        // 获取从年初到当前期间的所有非主营业务当期值
        for (let month = 1; month <= parseInt(period.value.split('-')[1]); month++) {
            const monthPeriod = `${year}-${month.toString().padStart(2, '0')}`

            try {
                // 从数据库获取该月的非主营业务当期值
                const response = await fetch(`http://47.111.95.19:3000/net-profit-structure/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data && result.data.nonMainBusiness) {
                        const monthlyValue = parseFloat(result.data.nonMainBusiness.current || result.data.nonMainBusiness.actual || 0)
                        nonMainBusinessCumulative += monthlyValue
                    }
                }
            } catch (error) {
                console.log(`跳过期间 ${monthPeriod} 的非主营业务数据计算:`, error)
            }
        }

        // 更新非主营业务累计值
        data.nonMainBusiness.cumulative = nonMainBusinessCumulative.toFixed(2)

    } catch (error) {
        console.error('计算非主营业务累计值失败:', error)
    }
}

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: any, loadedData: any): any => {
    if (!loadedData) return templateData

    return {
        mainBusiness: {
            plan: loadedData.mainBusiness?.plan || templateData.mainBusiness.plan,
            current: loadedData.mainBusiness?.current || loadedData.mainBusiness?.actual || templateData.mainBusiness.current,
            cumulative: loadedData.mainBusiness?.cumulative || templateData.mainBusiness.cumulative,
            progress: loadedData.mainBusiness?.progress || templateData.mainBusiness.progress
        },
        nonMainBusiness: {
            plan: loadedData.nonMainBusiness?.plan || templateData.nonMainBusiness.plan,
            current: loadedData.nonMainBusiness?.current || loadedData.nonMainBusiness?.actual || templateData.nonMainBusiness.current,
            cumulative: loadedData.nonMainBusiness?.cumulative || templateData.nonMainBusiness.cumulative,
            progress: loadedData.nonMainBusiness?.progress || templateData.nonMainBusiness.progress
        },
        total: {
            plan: loadedData.total?.plan || templateData.total.plan,
            current: loadedData.total?.current || loadedData.total?.actual || templateData.total.current,
            cumulative: loadedData.total?.cumulative || templateData.total.cumulative,
            progress: loadedData.total?.progress || templateData.total.progress
        }
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载净利润结构数据，期间: ${targetPeriod}`)

        // 初始化预算数据
        const initialData = getInitialData()
        data.mainBusiness = { ...initialData.mainBusiness }
        data.nonMainBusiness = { ...initialData.nonMainBusiness }
        data.total = { ...initialData.total }

        // 计算当期值和累计值（使用计算API）
        await calculateCumulativeValues()

        // 加载主营业务净利润数据
        await loadMainBusinessData(targetPeriod)

        // 加载非主营业务净利润数据
        await loadNonMainBusinessData(targetPeriod)

    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        const initialData = getInitialData()
        data.mainBusiness = { ...initialData.mainBusiness }
        data.nonMainBusiness = { ...initialData.nonMainBusiness }
        data.total = { ...initialData.total }
    }
}

// 获取月度数据
const fetchMonthlyData = async (monthPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/monthly-data/${monthPeriod}`)

        if (response.ok) {
            const result = await response.json()
            if (result.success) {
                return result.data
            }
        }

        console.error(`获取${monthPeriod}月度数据失败:`, response.status)
        return null
    } catch (error) {
        console.error(`获取${monthPeriod}月度数据失败:`, error)
        return null
    }
}

// 更新数据项
const updateDataItem = (item: MainBusinessProfitItem, apiItem: any) => {
    if (apiItem) {
        // 不更新年度计划，保持初始模板数据
        item.currentMonthValue = formatNumber(apiItem.currentMonthValue || 0)
        item.actual = formatNumber(apiItem.cumulativeValue || 0)
        item.contribution = apiItem.contribution || '0.00%'
    }
}

// 加载主营业务净利润数据
const loadMainBusinessData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载主营净利润贡献数据，期间: ${targetPeriod}`)

        const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/${targetPeriod}`)
        let loadedData: any[] = []

        if (response.ok) {
            const result = await response.json()
            console.log('API返回数据:', result)

            if (result.success && result.data && Array.isArray(result.data)) {
                loadedData = result.data
                console.log('成功获取数据，开始合并...')
            }
        } else if (response.status === 404) {
            console.log('该期间暂无数据，使用初始模板')
            // 使用初始模板数据
            equipmentData.value = getInitialEquipmentData()
            componentData.value = getInitialComponentData()
            projectData.value = getInitialProjectData()
        } else {
            console.log('加载数据失败，使用预算数据填充')
        }

        // 合并数据：将从数据库加载的数据与初始模板合并
        const mergeDataArray = (templateArray: MainBusinessProfitItem[], loadedArray: any[], segment: string) => {
            return templateArray.map(templateItem => {
                const loadedItem = loadedArray.find(item =>
                    item.segment === segment && item.customerType === templateItem.customerType
                )

                if (loadedItem) {
                    return {
                        ...templateItem,
                        // 保持模板中的年度计划，不使用数据库中的plan
                        currentMonthValue: loadedItem.currentMonthValue || templateItem.currentMonthValue,
                        actual: loadedItem.actual || templateItem.actual,
                        contribution: loadedItem.contribution || templateItem.contribution
                    }
                }
                return templateItem
            })
        }

        // 分别合并三个板块的数据
        equipmentData.value = mergeDataArray(equipmentData.value, loadedData, '设备')
        componentData.value = mergeDataArray(componentData.value, loadedData, '元件')
        projectData.value = mergeDataArray(projectData.value, loadedData, '工程')

        // 计算所有项目的累计值
        await calculateAllCumulativeValues()

    } catch (error) {
        console.error('加载主营业务数据失败:', error)
    }
}

// 计算所有项目的累计值
const calculateAllCumulativeValues = async () => {
    try {
        console.log('开始获取月度数据，期间:', period.value)

        const monthlyData = await fetchMonthlyData(period.value)

        if (!monthlyData) {
            console.error('获取月度数据失败')
            return
        }

        // 更新设备板块数据
        equipmentData.value.forEach(item => {
            const apiItem = monthlyData.equipment?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        // 更新元件板块数据
        componentData.value.forEach(item => {
            const apiItem = monthlyData.components?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        // 更新工程板块数据
        projectData.value.forEach(item => {
            const apiItem = monthlyData.engineering?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        console.log('累计值计算完成')
    } catch (error) {
        console.error('计算累计值失败:', error)
    }
}

// 加载非主营业务净利润数据
const loadNonMainBusinessData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载非主营业务净利润数据，期间: ${targetPeriod}`)

        const response = await fetch(`http://47.111.95.19:3000/non-main-business-net-profit/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持年度计划但清空当期值')
                // 保持现有的年度计划值，但将当期值重置为0
                nonMainItems.value = nonMainItems.value.map(item => ({
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
        console.log('非主营业务API返回数据:', result)

        if (result.success && result.data && Array.isArray(result.data)) {
            const loadedData = result.data
            console.log('成功获取数据，开始合并...')

            // 合并数据：将从数据库加载的数据与初始模板合并
            const mergeData = (templateArray: NonMainBusinessProfitItem[], loadedArray: any[]): NonMainBusinessProfitItem[] => {
                return templateArray.map(templateItem => {
                    const loadedItem = loadedArray.find(item => item.id === templateItem.id || item.name === templateItem.name)

                    if (loadedItem) {
                        return {
                            ...templateItem,
                            plan: loadedItem.plan || templateItem.plan,
                            currentPeriod: loadedItem.currentPeriod || templateItem.currentPeriod,
                            accumulated: loadedItem.accumulated || templateItem.accumulated,
                            progress: loadedItem.progress || templateItem.progress
                        }
                    }
                    return templateItem
                })
            }

            nonMainItems.value = mergeData(nonMainItems.value, loadedData)
            console.log('合并后的数据:', nonMainItems.value)
        }

        // 加载所有月份数据并计算累计值
        await loadAllMonthsData(targetPeriod)
        updateAccumulated()

    } catch (error) {
        console.error('加载非主营业务数据失败:', error)
        // 出错时也要确保预算数据显示
        const initialItems = getInitialNonMainItems()
        nonMainItems.value = [...initialItems]
    }
}

// 保存数据
const handleSave = async () => {
    try {
        // 1. 保存净利润结构数据
        const formData = {
            mainBusiness: data.mainBusiness,
            nonMainBusiness: data.nonMainBusiness,
            total: data.total
        }

        const saveData = {
            period: period.value,
            data: formData
        }

        console.log('保存净利润结构数据:', saveData)

        const response = await fetch('http://47.111.95.19:3000/net-profit-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存净利润结构数据失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存主营业务净利润数据
        await saveMainBusinessData()

        // 3. 保存非主营业务净利润数据
        await saveNonMainBusinessData()

        // 4. 保存到 form_submissions 表
        await recordFormSubmission(MODULE_IDS.NET_PROFIT_STRUCTURE, period.value, formData, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

// 保存主营业务净利润数据
const saveMainBusinessData = async () => {
    try {
        // 准备要保存的数据
        const allData = [
            ...equipmentData.value.map(item => ({ ...item, segment: '设备' })),
            ...componentData.value.map(item => ({ ...item, segment: '元件' })),
            ...projectData.value.map(item => ({ ...item, segment: '工程' }))
        ]

        const saveData = {
            period: period.value,
            data: allData
        }

        console.log('保存主营业务数据:', saveData)

        // 1. 保存到 main_business_net_profit 表
        const response = await fetch('http://47.111.95.19:3000/main-business-net-profit', {
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
        const formData = {
            equipment: equipmentData.value,
            component: componentData.value,
            project: projectData.value
        }
        await recordFormSubmission(MODULE_IDS.MAIN_BUSINESS_NET_PROFIT, period.value, formData, '', '')

    } catch (error) {
        console.error('保存主营业务数据失败:', error)
        throw error
    }
}

// 保存非主营业务净利润数据
const saveNonMainBusinessData = async () => {
    try {
        // 更新累计值
        updateAccumulated()

        const saveData = {
            period: period.value,
            data: nonMainItems.value
        }

        console.log('保存非主营业务数据:', saveData)

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
        await recordFormSubmission(MODULE_IDS.NON_MAIN_BUSINESS_NET_PROFIT, period.value, nonMainItems.value, '', '')

    } catch (error) {
        console.error('保存非主营业务数据失败:', error)
        throw error
    }
}

// 重置数据
const handleReset = () => {
    const initialData = getInitialData()
    data.mainBusiness = { ...initialData.mainBusiness }
    data.nonMainBusiness = { ...initialData.nonMainBusiness }
    data.total = { ...initialData.total }

    // 重置主营业务数据
    equipmentData.value = getInitialEquipmentData()
    componentData.value = getInitialComponentData()
    projectData.value = getInitialProjectData()

    // 重置非主营业务数据
    nonMainItems.value = getInitialNonMainItems()

    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.NET_PROFIT_STRUCTURE, period.value)
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