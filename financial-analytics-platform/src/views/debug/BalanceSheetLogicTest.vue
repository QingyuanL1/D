<template>
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-6 text-center">资产负债表逻辑测试</h1>
        
        <!-- 期间选择 -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">测试设置</h2>
            <div class="grid grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">当前期间</label>
                    <input v-model="currentPeriod" type="month" class="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">上期期间</label>
                    <input :value="previousPeriod" type="month" class="w-full px-3 py-2 border rounded bg-gray-100" readonly />
                </div>
                <div class="flex items-end">
                    <button @click="generateTestData" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        生成测试数据
                    </button>
                </div>
            </div>
        </div>

        <!-- 逻辑说明 -->
        <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">📋 逻辑说明</h3>
            <div class="text-sm space-y-1">
                <p><strong>期末余额</strong>：用户输入当前期间的期末余额</p>
                <p><strong>期初余额</strong>：自动显示上期的期末余额（只读）</p>
                <p><strong>数据流</strong>：当前期间的期末余额 → 下期的期初余额</p>
            </div>
        </div>

        <!-- 模拟资产负债表 -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">资产负债表（{{ currentPeriod }}）</h3>
            <table class="w-full border-collapse border border-black">
                <thead>
                    <tr>
                        <th class="border border-gray-300 px-4 py-2 bg-gray-100">资产</th>
                        <th class="border border-gray-300 px-4 py-2 bg-blue-100">期末余额</th>
                        <th class="border border-gray-300 px-4 py-2 bg-green-100">期初余额</th>
                        <th class="border border-gray-300 px-4 py-2 bg-gray-100">负债和所有者权益</th>
                        <th class="border border-gray-300 px-4 py-2 bg-blue-100">期末余额</th>
                        <th class="border border-gray-300 px-4 py-2 bg-green-100">期初余额</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">货币资金</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.monetary_funds_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="输入期末余额"
                                @input="onInputChange('monetary_funds_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-green-50">
                            {{ formatNumber(getPreviousValue('monetary_funds_ending')) }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">短期借款</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.short_term_loans_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="输入期末余额"
                                @input="onInputChange('short_term_loans_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-green-50">
                            {{ formatNumber(getPreviousValue('short_term_loans_ending')) }}
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收账款</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.accounts_receivable_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="输入期末余额"
                                @input="onInputChange('accounts_receivable_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-green-50">
                            {{ formatNumber(getPreviousValue('accounts_receivable_ending')) }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付账款</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.accounts_payable_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="输入期末余额"
                                @input="onInputChange('accounts_payable_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-green-50">
                            {{ formatNumber(getPreviousValue('accounts_payable_ending')) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 历史数据显示 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">📊 历史数据</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-medium mb-2">当前期间数据 ({{ currentPeriod }})</h4>
                    <pre class="text-xs bg-white p-2 rounded border">{{ JSON.stringify(testData, null, 2) }}</pre>
                </div>
                <div>
                    <h4 class="font-medium mb-2">上期数据 ({{ previousPeriod }})</h4>
                    <pre class="text-xs bg-white p-2 rounded border">{{ JSON.stringify(historicalData[previousPeriod] || {}, null, 2) }}</pre>
                </div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mb-6 flex space-x-4">
            <button @click="saveCurrentData" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                💾 保存当前数据
            </button>
            <button @click="loadNextPeriod" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                ⏭️ 切换到下期
            </button>
            <button @click="clearAllData" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                🗑️ 清空所有数据
            </button>
        </div>

        <!-- 操作日志 -->
        <div class="p-4 bg-gray-100 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">📝 操作日志</h3>
            <div class="max-h-40 overflow-y-auto bg-white p-2 rounded border">
                <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono mb-1">
                    <span class="text-gray-500">{{ log.time }}</span> - {{ log.message }}
                </div>
            </div>
            <button @click="clearLogs" class="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm">
                清空日志
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'

// 当前期间
const currentPeriod = ref(new Date().toISOString().slice(0, 7))

// 计算上期期间
const previousPeriod = computed(() => {
    const [year, month] = currentPeriod.value.split('-').map(Number)
    let prevYear = year
    let prevMonth = month - 1
    
    if (prevMonth === 0) {
        prevMonth = 12
        prevYear = year - 1
    }
    
    return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`
})

// 测试数据
const testData = reactive({
    monetary_funds_ending: null as number | null,
    accounts_receivable_ending: null as number | null,
    short_term_loans_ending: null as number | null,
    accounts_payable_ending: null as number | null
})

// 历史数据存储
const historicalData = ref<{ [period: string]: any }>({})

// 日志
const logs = ref<Array<{ time: string, message: string }>>([])

// 添加日志
const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    logs.value.unshift({ time, message })
    if (logs.value.length > 50) {
        logs.value = logs.value.slice(0, 50)
    }
    console.log(`[${time}] ${message}`)
}

// 清空日志
const clearLogs = () => {
    logs.value = []
    addLog('日志已清空')
}

// 格式化数字
const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '0.00'
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取上期值
const getPreviousValue = (fieldName: string): number => {
    const prevData = historicalData.value[previousPeriod.value]
    if (prevData && prevData[fieldName]) {
        return Number(prevData[fieldName])
    }
    return 0
}

// 输入变化处理
const onInputChange = (fieldName: string) => {
    const value = (testData as any)[fieldName]
    addLog(`输入变化: ${fieldName} = ${value}`)
}

// 保存当前数据
const saveCurrentData = () => {
    historicalData.value[currentPeriod.value] = { ...testData }
    addLog(`已保存 ${currentPeriod.value} 期间数据`)
}

// 切换到下期
const loadNextPeriod = () => {
    // 先保存当前数据
    saveCurrentData()
    
    // 计算下期
    const [year, month] = currentPeriod.value.split('-').map(Number)
    let nextYear = year
    let nextMonth = month + 1
    
    if (nextMonth > 12) {
        nextMonth = 1
        nextYear = year + 1
    }
    
    const nextPeriod = `${nextYear}-${nextMonth.toString().padStart(2, '0')}`
    currentPeriod.value = nextPeriod
    
    // 清空当前数据
    Object.keys(testData).forEach(key => {
        (testData as any)[key] = null
    })
    
    addLog(`切换到 ${nextPeriod} 期间`)
}

// 生成测试数据
const generateTestData = () => {
    testData.monetary_funds_ending = Math.round((Math.random() * 100000 + 50000) * 100) / 100
    testData.accounts_receivable_ending = Math.round((Math.random() * 80000 + 30000) * 100) / 100
    testData.short_term_loans_ending = Math.round((Math.random() * 60000 + 20000) * 100) / 100
    testData.accounts_payable_ending = Math.round((Math.random() * 40000 + 15000) * 100) / 100
    
    addLog('已生成测试数据')
}

// 清空所有数据
const clearAllData = () => {
    Object.keys(testData).forEach(key => {
        (testData as any)[key] = null
    })
    historicalData.value = {}
    addLog('已清空所有数据')
}

// 初始化
addLog('资产负债表逻辑测试页面已加载')
addLog(`当前期间: ${currentPeriod.value}, 上期: ${previousPeriod.value}`)
</script>

<style scoped>
input[type="number"] {
    -webkit-appearance: none;
    -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

table {
    font-size: 14px;
}

td input {
    font-size: 14px;
    background: transparent;
}
</style>
