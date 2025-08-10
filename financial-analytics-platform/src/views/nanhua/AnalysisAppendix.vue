<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">应收账款情况（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初应收余额</th>
                        <th class="border border-gray-300 px-4 py-2">当期新增开票</th>
                        <th class="border border-gray-300 px-4 py-2">累计新增开票</th>
                        <th class="border border-gray-300 px-4 py-2">当期收款</th>
                        <th class="border border-gray-300 px-4 py-2">累计收款</th>
                        <th class="border border-gray-300 px-4 py-2">当期应收余额 <span class="text-xs text-gray-500">已减去坏账准备</span></th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="equipmentData.length">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.initialBalance" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newInvoice" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalNewInvoice }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalReceipt }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.currentBalance }}
                            </td>
                        </tr>
                    </template>

                    <!-- 元件板块 -->
                    <template v-for="(item, index) in componentData" :key="`component-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="componentData.length">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.initialBalance" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newInvoice" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalNewInvoice }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalReceipt }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.currentBalance }}
                            </td>
                        </tr>
                    </template>

                    <!-- 工程板块 -->
                    <template v-for="(item, index) in projectData" :key="`project-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="projectData.length">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.initialBalance" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newInvoice" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalNewInvoice }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateCurrentBalance(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.totalReceipt }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.currentBalance }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.initialBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.newInvoice) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.totalNewInvoice) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentReceipt) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.totalReceipt) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentBalance) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_ANALYSIS_APPENDIX"
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
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface AccountsReceivableItem {
    customerType: string;
    initialBalance: string;
    newInvoice: string;
    totalNewInvoice: string;
    currentReceipt: string;
    totalReceipt: string;
    currentBalance: string;
    yearlyPlan?: number;
}

// 南华公司的初始数据模板（根据原有数据调整）
const getInitialEquipmentData = (): AccountsReceivableItem[] => [
    { customerType: '设备外服', initialBalance: '0.00', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '0.00' }
]

const getInitialComponentData = (): AccountsReceivableItem[] => [
    { customerType: '元件销售', initialBalance: '0.00', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '0.00' }
]

const getInitialProjectData = (): AccountsReceivableItem[] => [
    { customerType: '一包项目', initialBalance: '1.08', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '1.08' },
    { customerType: '二包项目', initialBalance: '396.72', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '396.72' },
    { customerType: '域内合作项目', initialBalance: '1121.48', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '1121.48' },
    { customerType: '域外合作项目', initialBalance: '2009.38', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '2009.38' },
    { customerType: '新能源项目', initialBalance: '297.69', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '297.69' },
    { customerType: '苏州项目', initialBalance: '295.75', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '295.75' },
    { customerType: '抢修项目', initialBalance: '22.96', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '22.96' },
    { customerType: '运检项目', initialBalance: '101.12', newInvoice: '0', totalNewInvoice: '0', currentReceipt: '0', totalReceipt: '0', currentBalance: '101.12' }
]

const equipmentData = ref<AccountsReceivableItem[]>(getInitialEquipmentData())
const componentData = ref<AccountsReceivableItem[]>(getInitialComponentData())
const projectData = ref<AccountsReceivableItem[]>(getInitialProjectData())

// 存储所有历史月份数据，用于计算累计收款
const allMonthsData = ref<Array<{ period: string; data: any[] }>>([])

// 坏账准备数据
const badDebtProvisionData = ref<any>(null)

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 加载坏账准备数据
const loadBadDebtProvisionData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-bad-debt-provision/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                badDebtProvisionData.value = result.data
                console.log('加载的坏账准备数据:', result.data)
            }
        } else {
            console.warn('无法加载坏账准备数据')
            badDebtProvisionData.value = null
        }
    } catch (error) {
        console.error('加载坏账准备数据失败:', error)
        badDebtProvisionData.value = null
    }
}

// 获取坏账准备余额
const getBadDebtProvision = (customerType: string): number => {
    if (!badDebtProvisionData.value) return 0
    
    // 在工程项目中查找对应的客户类型
    const badDebtItem = badDebtProvisionData.value.items?.find((item: any) => 
        item.customerAttribute === customerType
    )
    
    if (badDebtItem) {
        // 计算坏账准备余额 = 年初余额 + 本年新增 - 累计已收款
        const yearBeginningBalance = parseFloat(badDebtItem.yearBeginningBalance) || 0
        const yearNewAddition = parseFloat(badDebtItem.yearNewAddition) || 0
        const cumulativeCollection = parseFloat(badDebtItem.currentPeriodAccumulatedCollection) || 0
        
        const provisionBalance = yearBeginningBalance + yearNewAddition - cumulativeCollection
        return provisionBalance
    }
    
    return 0
}

// 计算当期应收余额、累计收款和累计新增开票
const calculateCurrentBalance = (item: AccountsReceivableItem) => {
    // 移除逗号并转换为数字
    const initialBalance = parseFloat(item.initialBalance.replace(/,/g, '')) || 0
    const newInvoice = parseFloat(item.newInvoice.replace(/,/g, '')) || 0
    const currentReceipt = parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
    
    // 计算累计收款
    const totalReceipt = calculateTotalReceipt(item.customerType, getSegmentFromItem(item))
    item.totalReceipt = totalReceipt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    
    // 计算累计新增开票
    const totalNewInvoice = calculateTotalNewInvoice(item.customerType, getSegmentFromItem(item))
    item.totalNewInvoice = totalNewInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    
    // 获取坏账准备余额
    const badDebtProvision = getBadDebtProvision(item.customerType)
    
    // 计算当期应收余额 = 年初应收余额 + 累计新增开票 - 累计收款 - 坏账准备余额
    const currentBalance = initialBalance + totalNewInvoice - totalReceipt - badDebtProvision
    
    // 格式化为带千分位的数字
    item.currentBalance = currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取项目所属的板块
const getSegmentFromItem = (item: AccountsReceivableItem): string => {
    if (equipmentData.value.includes(item)) return '设备'
    if (componentData.value.includes(item)) return '元件'
    if (projectData.value.includes(item)) return '工程'
    return ''
}

// 计算累计收款
const calculateTotalReceipt = (customerType: string, segment: string): number => {
    let total = 0
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.period === period.value) continue
        
        const item = monthData.data?.find((d: any) => d.segment === segment && d.customerType === customerType)
        if (item && item.currentReceipt) {
            const value = parseFloat(item.currentReceipt.toString().replace(/,/g, '')) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    const currentData = segment === '设备' ? equipmentData.value : 
                       segment === '元件' ? componentData.value : projectData.value
    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem && currentItem.currentReceipt) {
        const currentValue = parseFloat(currentItem.currentReceipt.toString().replace(/,/g, '')) || 0
        total += currentValue
    }
    
    return total
}

// 计算累计新增开票
const calculateTotalNewInvoice = (customerType: string, segment: string): number => {
    let total = 0
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.period === period.value) continue
        
        const item = monthData.data?.find((d: any) => d.segment === segment && d.customerType === customerType)
        if (item && item.newInvoice) {
            const value = parseFloat(item.newInvoice.toString().replace(/,/g, '')) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    const currentData = segment === '设备' ? equipmentData.value : 
                       segment === '元件' ? componentData.value : projectData.value
    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem && currentItem.newInvoice) {
        const currentValue = parseFloat(currentItem.newInvoice.toString().replace(/,/g, '')) || 0
        total += currentValue
    }
    
    return total
}

// 计算合计数据
const totalData = computed(() => {
    let initialBalanceTotal = 0
    let newInvoiceTotal = 0
    let totalNewInvoiceTotal = 0
    let currentReceiptTotal = 0
    let totalReceiptTotal = 0
    let currentBalanceTotal = 0
    
    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        initialBalanceTotal += parseFloat(item.initialBalance.replace(/,/g, '')) || 0
        newInvoiceTotal += parseFloat(item.newInvoice.replace(/,/g, '')) || 0
        totalNewInvoiceTotal += parseFloat(item.totalNewInvoice.replace(/,/g, '')) || 0
        currentReceiptTotal += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += parseFloat(item.totalReceipt.replace(/,/g, '')) || 0
        currentBalanceTotal += parseFloat(item.currentBalance.replace(/,/g, '')) || 0
    })
    
    // 汇总元件板块数据
    componentData.value.forEach(item => {
        initialBalanceTotal += parseFloat(item.initialBalance.replace(/,/g, '')) || 0
        newInvoiceTotal += parseFloat(item.newInvoice.replace(/,/g, '')) || 0
        totalNewInvoiceTotal += parseFloat(item.totalNewInvoice.replace(/,/g, '')) || 0
        currentReceiptTotal += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += parseFloat(item.totalReceipt.replace(/,/g, '')) || 0
        currentBalanceTotal += parseFloat(item.currentBalance.replace(/,/g, '')) || 0
    })
    
    // 汇总工程板块数据
    projectData.value.forEach(item => {
        initialBalanceTotal += parseFloat(item.initialBalance.replace(/,/g, '')) || 0
        newInvoiceTotal += parseFloat(item.newInvoice.replace(/,/g, '')) || 0
        totalNewInvoiceTotal += parseFloat(item.totalNewInvoice.replace(/,/g, '')) || 0
        currentReceiptTotal += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += parseFloat(item.totalReceipt.replace(/,/g, '')) || 0
        currentBalanceTotal += parseFloat(item.currentBalance.replace(/,/g, '')) || 0
    })
    
    return {
        initialBalance: initialBalanceTotal,
        newInvoice: newInvoiceTotal,
        totalNewInvoice: totalNewInvoiceTotal,
        currentReceipt: currentReceiptTotal,
        totalReceipt: totalReceiptTotal,
        currentBalance: currentBalanceTotal
    }
})

// 年初应收余额数据映射（静态数据）
const budgetDataMap = {
    '设备': {
        '设备外服': 0.00
    },
    '元件': {
        '元件销售': 0.00
    },
    '工程': {
        '一包项目': 1.08,
        '二包项目': 396.72,
        '域内合作项目': 1121.48,
        '域外合作项目': 2009.38,
        '新能源项目': 297.69,
        '苏州项目': 295.75,
        '抢修项目': 22.96,
        '运检项目': 101.12
    }
}

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: AccountsReceivableItem[], loadedData: any[], segment: string): AccountsReceivableItem[] => {
    return templateData.map(templateItem => {
        const loadedItem = loadedData?.find(item => item.segment === segment && item.customerType === templateItem.customerType)
        const budgetValue = budgetDataMap[segment]?.[templateItem.customerType] || 0
        
        if (loadedItem) {
            return {
                customerType: templateItem.customerType,
                // 年初应收余额始终使用静态数据，不受后端数据影响
                initialBalance: budgetValue.toString(),
                newInvoice: loadedItem.newInvoice || '0',
                totalNewInvoice: '0', // 累计新增开票需要重新计算，不使用后端数据
                currentReceipt: loadedItem.currentReceipt || '0',
                totalReceipt: '0', // 累计收款需要重新计算，不使用后端数据
                currentBalance: loadedItem.currentBalance || budgetValue.toString(),
                yearlyPlan: budgetValue
            }
        } else {
            // 没有实际数据时，使用静态预算数据
            return {
                customerType: templateItem.customerType,
                initialBalance: budgetValue.toString(),
                newInvoice: '0',
                totalNewInvoice: '0',
                currentReceipt: '0',
                totalReceipt: '0',
                currentBalance: budgetValue.toString(),
                yearlyPlan: budgetValue
            }
        }
    })
}

// 加载所有月份数据用于累计计算
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const [year, month] = currentPeriod.split('-')
        const currentMonth = parseInt(month)
        const allData = []
        
        // 获取当年1月到当前月的所有数据
        for (let i = 1; i <= currentMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/nanhua-analysis-appendix/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data && Array.isArray(result.data)) {
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

// 更新累计收款数据
const updateAccumulatedReceipts = () => {
    equipmentData.value.forEach(item => {
        const totalReceipt = calculateTotalReceipt(item.customerType, '设备')
        item.totalReceipt = totalReceipt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    
    componentData.value.forEach(item => {
        const totalReceipt = calculateTotalReceipt(item.customerType, '元件')
        item.totalReceipt = totalReceipt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    
    projectData.value.forEach(item => {
        const totalReceipt = calculateTotalReceipt(item.customerType, '工程')
        item.totalReceipt = totalReceipt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
}

// 更新累计新增开票数据
const updateAccumulatedInvoices = () => {
    equipmentData.value.forEach(item => {
        const totalNewInvoice = calculateTotalNewInvoice(item.customerType, '设备')
        item.totalNewInvoice = totalNewInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    
    componentData.value.forEach(item => {
        const totalNewInvoice = calculateTotalNewInvoice(item.customerType, '元件')
        item.totalNewInvoice = totalNewInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    
    projectData.value.forEach(item => {
        const totalNewInvoice = calculateTotalNewInvoice(item.customerType, '工程')
        item.totalNewInvoice = totalNewInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载南华分析附表数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/nanhua-analysis-appendix/${targetPeriod}`)
        let loadedData: any[] = []
        
        if (response.ok) {
            const result = await response.json()
            console.log('API返回数据:', result)
            
            if (result.success && result.data && Array.isArray(result.data)) {
                loadedData = result.data
                console.log('成功获取数据，开始合并...')
            }
        } else if (response.status === 404) {
            console.log('该期间暂无数据，使用预算数据填充')
        } else {
            console.log('加载数据失败，使用预算数据填充')
        }
        
        // 无论是否有数据，都进行合并（确保预算数据始终显示）
        equipmentData.value = mergeData(getInitialEquipmentData(), loadedData, '设备')
        componentData.value = mergeData(getInitialComponentData(), loadedData, '元件')
        projectData.value = mergeData(getInitialProjectData(), loadedData, '工程')
        console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })
        
        // 加载所有月份数据并计算累计收款和累计新增开票
        await loadAllMonthsData(targetPeriod)
        // 加载坏账准备数据
        await loadBadDebtProvisionData(targetPeriod)
        updateAccumulatedReceipts()
        updateAccumulatedInvoices()
        
        // 重新计算所有项目的当期应收余额（包含坏账准备扣减）
        const allItems = [...equipmentData.value, ...componentData.value, ...projectData.value]
        allItems.forEach(item => calculateCurrentBalance(item))
        
    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        equipmentData.value = mergeData(getInitialEquipmentData(), [], '设备')
        componentData.value = mergeData(getInitialComponentData(), [], '元件')
        projectData.value = mergeData(getInitialProjectData(), [], '工程')
        
        // 即使出错也要尝试加载历史数据
        try {
            await loadAllMonthsData(targetPeriod)
            await loadBadDebtProvisionData(targetPeriod)
            updateAccumulatedReceipts()
            updateAccumulatedInvoices()
            
            // 重新计算所有项目的当期应收余额（包含坏账准备扣减）
            const allItems = [...equipmentData.value, ...componentData.value, ...projectData.value]
            allItems.forEach(item => calculateCurrentBalance(item))
        } catch (historyError) {
            console.error('加载历史数据失败:', historyError)
        }
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.NANHUA_ANALYSIS_APPENDIX, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
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

        console.log('保存数据:', saveData)

        // 1. 保存到 nanhua_analysis_appendix 表
        const response = await fetch('http://47.111.95.19:3000/nanhua-analysis-appendix', {
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
        await recordFormSubmission(MODULE_IDS.NANHUA_ANALYSIS_APPENDIX, period.value, formData, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    equipmentData.value = getInitialEquipmentData()
    componentData.value = getInitialComponentData()
    projectData.value = getInitialProjectData()
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('组件挂载，当前期间:', period.value)
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