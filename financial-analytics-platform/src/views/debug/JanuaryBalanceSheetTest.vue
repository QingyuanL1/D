<template>
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-6 text-center">一月份资产负债表测试</h1>
        
        <!-- 期间选择和说明 -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">测试说明</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">当前期间</label>
                    <input v-model="currentPeriod" type="month" class="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">是否为一月份</label>
                    <div class="px-3 py-2 border rounded bg-gray-100">
                        {{ isJanuary ? '是（期初余额可输入）' : '否（期初余额只读）' }}
                    </div>
                </div>
            </div>
            <div class="mt-3 text-sm text-gray-600">
                <p><strong>业务逻辑：</strong></p>
                <p>• 一月份：期初余额需要手动输入（年度开始，无上期数据）</p>
                <p>• 其他月份：期初余额自动显示上期期末余额（只读）</p>
            </div>
        </div>

        <!-- 资产负债表 -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">资产负债表（{{ currentPeriod }}）</h3>
            <table class="w-full border-collapse border border-black">
                <thead>
                    <tr>
                        <th class="border border-gray-300 px-4 py-2 bg-gray-100">资产</th>
                        <th class="border border-gray-300 px-4 py-2 bg-blue-100">期末余额</th>
                        <th class="border border-gray-300 px-4 py-2 bg-green-100">
                            期初余额
                            <span class="text-xs block">{{ isJanuary ? '(可输入)' : '(只读)' }}</span>
                        </th>
                        <th class="border border-gray-300 px-4 py-2 bg-gray-100">负债和所有者权益</th>
                        <th class="border border-gray-300 px-4 py-2 bg-blue-100">期末余额</th>
                        <th class="border border-gray-300 px-4 py-2 bg-green-100">
                            期初余额
                            <span class="text-xs block">{{ isJanuary ? '(可输入)' : '(只读)' }}</span>
                        </th>
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
                                placeholder="期末余额"
                                @input="onInputChange('monetary_funds_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right" 
                            :class="isJanuary ? 'bg-white' : 'bg-green-50'">
                            <input v-if="isJanuary"
                                v-model.number="testData.monetary_funds_beginning" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期初余额"
                                @input="onInputChange('monetary_funds_beginning')"
                            />
                            <span v-else class="text-gray-600">
                                {{ formatNumber(getPreviousValue('monetary_funds_ending')) }}
                            </span>
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">短期借款</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.short_term_loans_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期末余额"
                                @input="onInputChange('short_term_loans_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right" 
                            :class="isJanuary ? 'bg-white' : 'bg-green-50'">
                            <input v-if="isJanuary"
                                v-model.number="testData.short_term_loans_beginning" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期初余额"
                                @input="onInputChange('short_term_loans_beginning')"
                            />
                            <span v-else class="text-gray-600">
                                {{ formatNumber(getPreviousValue('short_term_loans_ending')) }}
                            </span>
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
                                placeholder="期末余额"
                                @input="onInputChange('accounts_receivable_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right" 
                            :class="isJanuary ? 'bg-white' : 'bg-green-50'">
                            <input v-if="isJanuary"
                                v-model.number="testData.accounts_receivable_beginning" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期初余额"
                                @input="onInputChange('accounts_receivable_beginning')"
                            />
                            <span v-else class="text-gray-600">
                                {{ formatNumber(getPreviousValue('accounts_receivable_ending')) }}
                            </span>
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付账款</td>
                        <td class="border border-black px-2 py-1 text-right bg-blue-50">
                            <input 
                                v-model.number="testData.accounts_payable_ending" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期末余额"
                                @input="onInputChange('accounts_payable_ending')"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right" 
                            :class="isJanuary ? 'bg-white' : 'bg-green-50'">
                            <input v-if="isJanuary"
                                v-model.number="testData.accounts_payable_beginning" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="期初余额"
                                @input="onInputChange('accounts_payable_beginning')"
                            />
                            <span v-else class="text-gray-600">
                                {{ formatNumber(getPreviousValue('accounts_payable_ending')) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 数据显示 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">📊 当前数据</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-medium mb-2">期末余额（用户输入）</h4>
                    <pre class="text-xs bg-white p-2 rounded border">{{
                        JSON.stringify({
                            monetary_funds_ending: testData.monetary_funds_ending,
                            accounts_receivable_ending: testData.accounts_receivable_ending,
                            short_term_loans_ending: testData.short_term_loans_ending,
                            accounts_payable_ending: testData.accounts_payable_ending
                        }, null, 2)
                    }}</pre>
                </div>
                <div>
                    <h4 class="font-medium mb-2">期初余额（{{ isJanuary ? '用户输入' : '自动计算' }}）</h4>
                    <pre class="text-xs bg-white p-2 rounded border">{{
                        JSON.stringify({
                            monetary_funds_beginning: isJanuary ? testData.monetary_funds_beginning : getPreviousValue('monetary_funds_ending'),
                            accounts_receivable_beginning: isJanuary ? testData.accounts_receivable_beginning : getPreviousValue('accounts_receivable_ending'),
                            short_term_loans_beginning: isJanuary ? testData.short_term_loans_beginning : getPreviousValue('short_term_loans_ending'),
                            accounts_payable_beginning: isJanuary ? testData.accounts_payable_beginning : getPreviousValue('accounts_payable_ending')
                        }, null, 2)
                    }}</pre>
                </div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mb-6 flex space-x-4">
            <button @click="setJanuary" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                📅 设置为一月份
            </button>
            <button @click="setFebruary" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                📅 设置为二月份
            </button>
            <button @click="generateTestData" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                🎲 生成测试数据
            </button>
            <button @click="clearData" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                🗑️ 清空数据
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
const currentPeriod = ref('2024-01') // 默认设置为一月份

// 计算是否为一月份
const isJanuary = computed(() => {
    const [year, month] = currentPeriod.value.split('-').map(Number)
    return month === 1
})

// 测试数据
const testData = reactive({
    // 期末余额
    monetary_funds_ending: null as number | null,
    accounts_receivable_ending: null as number | null,
    short_term_loans_ending: null as number | null,
    accounts_payable_ending: null as number | null,
    // 期初余额（仅一月份可输入）
    monetary_funds_beginning: null as number | null,
    accounts_receivable_beginning: null as number | null,
    short_term_loans_beginning: null as number | null,
    accounts_payable_beginning: null as number | null
})

// 模拟历史数据
const historicalData = ref<{ [period: string]: any }>({
    '2023-12': {
        monetary_funds_ending: 50000,
        accounts_receivable_ending: 30000,
        short_term_loans_ending: 20000,
        accounts_payable_ending: 15000
    }
})

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

// 获取上期值（模拟）
const getPreviousValue = (fieldName: string): number => {
    const [year, month] = currentPeriod.value.split('-').map(Number)
    let prevYear = year
    let prevMonth = month - 1
    
    if (prevMonth === 0) {
        prevMonth = 12
        prevYear = year - 1
    }
    
    const previousPeriod = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`
    const prevData = historicalData.value[previousPeriod]
    
    if (prevData && prevData[fieldName]) {
        return Number(prevData[fieldName])
    }
    return 0
}

// 输入变化处理
const onInputChange = (fieldName: string) => {
    const value = (testData as any)[fieldName]
    addLog(`${isJanuary.value ? '一月份' : '非一月份'} - ${fieldName} = ${value}`)
}

// 设置为一月份
const setJanuary = () => {
    currentPeriod.value = '2024-01'
    addLog('已设置为一月份，期初余额可输入')
}

// 设置为二月份
const setFebruary = () => {
    currentPeriod.value = '2024-02'
    addLog('已设置为二月份，期初余额只读')
}

// 生成测试数据
const generateTestData = () => {
    testData.monetary_funds_ending = Math.round((Math.random() * 100000 + 50000) * 100) / 100
    testData.accounts_receivable_ending = Math.round((Math.random() * 80000 + 30000) * 100) / 100
    testData.short_term_loans_ending = Math.round((Math.random() * 60000 + 20000) * 100) / 100
    testData.accounts_payable_ending = Math.round((Math.random() * 40000 + 15000) * 100) / 100
    
    if (isJanuary.value) {
        testData.monetary_funds_beginning = Math.round((Math.random() * 80000 + 40000) * 100) / 100
        testData.accounts_receivable_beginning = Math.round((Math.random() * 60000 + 25000) * 100) / 100
        testData.short_term_loans_beginning = Math.round((Math.random() * 50000 + 15000) * 100) / 100
        testData.accounts_payable_beginning = Math.round((Math.random() * 30000 + 10000) * 100) / 100
    }
    
    addLog(`已生成${isJanuary.value ? '一月份' : '非一月份'}测试数据`)
}

// 清空数据
const clearData = () => {
    Object.keys(testData).forEach(key => {
        (testData as any)[key] = null
    })
    addLog('已清空所有数据')
}

// 初始化
addLog('一月份资产负债表测试页面已加载')
addLog(`当前期间: ${currentPeriod.value}, 是否为一月份: ${isJanuary.value}`)
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
