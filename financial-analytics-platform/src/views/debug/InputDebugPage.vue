<template>
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold mb-6">输入字段调试页面</h1>
        
        <!-- 调试信息 -->
        <div class="mb-6 p-4 bg-gray-100 rounded">
            <h2 class="text-lg font-semibold mb-2">调试信息</h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <strong>测试字段1值:</strong> {{ testData.field1 }}
                </div>
                <div>
                    <strong>测试字段2值:</strong> {{ testData.field2 }}
                </div>
                <div>
                    <strong>测试字段3值:</strong> {{ testData.field3 }}
                </div>
                <div>
                    <strong>最后输入时间:</strong> {{ lastInputTime }}
                </div>
            </div>
        </div>

        <!-- 测试不同类型的输入字段 -->
        <div class="space-y-6">
            <!-- 基础输入测试 -->
            <div class="border p-4 rounded">
                <h3 class="text-lg font-semibold mb-3">基础输入测试</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">普通 v-model</label>
                        <input 
                            v-model="testData.field1" 
                            type="number" 
                            class="w-full px-3 py-2 border rounded"
                            step="0.01"
                            placeholder="输入数字"
                            @input="onInputChange('field1', $event)"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">v-model.number</label>
                        <input 
                            v-model.number="testData.field2" 
                            type="number" 
                            class="w-full px-3 py-2 border rounded"
                            step="0.01"
                            placeholder="输入数字"
                            @input="onInputChange('field2', $event)"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">手动绑定</label>
                        <input 
                            :value="testData.field3" 
                            type="number" 
                            class="w-full px-3 py-2 border rounded"
                            step="0.01"
                            placeholder="输入数字"
                            @input="onManualInput"
                        />
                    </div>
                </div>
            </div>

            <!-- 模拟资产负债表样式 -->
            <div class="border p-4 rounded">
                <h3 class="text-lg font-semibold mb-3">模拟资产负债表样式</h3>
                <table class="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            <th class="border border-gray-300 px-4 py-2">项目</th>
                            <th class="border border-gray-300 px-4 py-2">期初余额</th>
                            <th class="border border-gray-300 px-4 py-2">期末余额</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border border-black px-2 py-1">货币资金</td>
                            <td class="border border-black px-2 py-1 text-right">
                                <input 
                                    v-model.number="balanceSheetTest.monetary_funds_beginning" 
                                    type="number"
                                    class="w-full text-right border-0 p-0 bg-transparent" 
                                    step="0.01" 
                                    placeholder="0"
                                    @input="onBalanceSheetInput('monetary_funds_beginning', $event)"
                                />
                            </td>
                            <td class="border border-black px-2 py-1 text-right bg-gray-50">
                                {{ balanceSheetTest.monetary_funds_ending || 0 }}
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-black px-2 py-1">应收账款</td>
                            <td class="border border-black px-2 py-1 text-right">
                                <input 
                                    v-model.number="balanceSheetTest.accounts_receivable_beginning" 
                                    type="number"
                                    class="w-full text-right border-0 p-0 bg-transparent" 
                                    step="0.01" 
                                    placeholder="0"
                                    @input="onBalanceSheetInput('accounts_receivable_beginning', $event)"
                                />
                            </td>
                            <td class="border border-black px-2 py-1 text-right bg-gray-50">
                                {{ balanceSheetTest.accounts_receivable_ending || 0 }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 模拟现金流量表样式 -->
            <div class="border p-4 rounded">
                <h3 class="text-lg font-semibold mb-3">模拟现金流量表样式</h3>
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th class="border border-gray-300 px-4 py-2">项目</th>
                            <th class="border border-gray-300 px-4 py-2">本期金额</th>
                            <th class="border border-gray-300 px-4 py-2">本年累计金额</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in cashFlowTest" :key="index">
                            <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model.number="item.currentAmount" 
                                    type="number"
                                    class="w-full px-2 py-1 border rounded"
                                    step="0.01" 
                                    placeholder="0"
                                    @input="onCashFlowInput(index, $event)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.yearAmount || 0 }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 控制台日志 -->
        <div class="mt-6 p-4 bg-gray-100 rounded">
            <h3 class="text-lg font-semibold mb-2">控制台日志</h3>
            <div class="max-h-40 overflow-y-auto">
                <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono">
                    {{ log }}
                </div>
            </div>
            <button @click="clearLogs" class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm">
                清空日志
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

// 测试数据
const testData = reactive({
    field1: null as number | null,
    field2: null as number | null,
    field3: null as number | null
})

const balanceSheetTest = reactive({
    monetary_funds_beginning: null as number | null,
    monetary_funds_ending: null as number | null,
    accounts_receivable_beginning: null as number | null,
    accounts_receivable_ending: null as number | null
})

const cashFlowTest = ref([
    { name: '销售商品收到的现金', currentAmount: null as number | null, yearAmount: null as number | null },
    { name: '收到的税费返还', currentAmount: null as number | null, yearAmount: null as number | null },
    { name: '购买商品支付的现金', currentAmount: null as number | null, yearAmount: null as number | null }
])

const lastInputTime = ref('')
const logs = ref<string[]>([])

// 添加日志
const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    logs.value.push(`[${timestamp}] ${message}`)
    console.log(message)
}

// 清空日志
const clearLogs = () => {
    logs.value = []
}

// 输入事件处理
const onInputChange = (field: string, event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    lastInputTime.value = new Date().toLocaleTimeString()
    addLog(`${field} 输入变化: "${value}" (类型: ${typeof value})`)
}

const onManualInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    testData.field3 = value === '' ? null : Number(value)
    lastInputTime.value = new Date().toLocaleTimeString()
    addLog(`手动绑定输入: "${value}" -> ${testData.field3} (类型: ${typeof testData.field3})`)
}

const onBalanceSheetInput = (field: string, event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    lastInputTime.value = new Date().toLocaleTimeString()
    addLog(`资产负债表 ${field} 输入: "${value}"`)
}

const onCashFlowInput = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    lastInputTime.value = new Date().toLocaleTimeString()
    addLog(`现金流量表 项目${index} 输入: "${value}"`)
}

// 初始化日志
addLog('调试页面已加载')
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
</style>
