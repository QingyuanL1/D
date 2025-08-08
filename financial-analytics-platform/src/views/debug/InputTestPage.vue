<template>
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold mb-6 text-center">输入字段测试页面</h1>
        
        <!-- 状态显示 -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">当前状态</h2>
            <div class="grid grid-cols-4 gap-4 text-sm">
                <div>
                    <strong>测试字段1:</strong> {{ testData.field1 }}
                </div>
                <div>
                    <strong>测试字段2:</strong> {{ testData.field2 }}
                </div>
                <div>
                    <strong>货币资金:</strong> {{ testData.monetary_funds }}
                </div>
                <div>
                    <strong>应收账款:</strong> {{ testData.accounts_receivable }}
                </div>
            </div>
        </div>

        <!-- 基础测试 -->
        <div class="mb-6 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold mb-3">基础输入测试</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">普通 v-model</label>
                    <input 
                        v-model="testData.field1" 
                        type="number" 
                        class="w-full px-3 py-2 border rounded"
                        step="0.01"
                        placeholder="输入数字"
                        data-field="field1"
                        @input="onInputChange"
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
                        data-field="field2"
                        @input="onInputChange"
                    />
                </div>
            </div>
        </div>

        <!-- 模拟资产负债表 -->
        <div class="mb-6 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold mb-3">模拟资产负债表输入</h3>
            <table class="w-full border-collapse border border-black">
                <thead>
                    <tr>
                        <th class="border border-gray-300 px-4 py-2">资产</th>
                        <th class="border border-gray-300 px-4 py-2">期初余额</th>
                        <th class="border border-gray-300 px-4 py-2">期末余额</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">货币资金</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input 
                                v-model.number="testData.monetary_funds" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="0"
                                data-field="monetary_funds"
                                @input="onInputChange"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ (testData.monetary_funds || 0).toLocaleString() }}
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收账款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input 
                                v-model.number="testData.accounts_receivable" 
                                type="number"
                                class="w-full text-right border-0 p-0 bg-transparent" 
                                step="0.01" 
                                placeholder="0"
                                data-field="accounts_receivable"
                                @input="onInputChange"
                            />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ (testData.accounts_receivable || 0).toLocaleString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 控制按钮 -->
        <div class="mb-6 flex space-x-4">
            <button @click="runDiagnostics" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                🔍 诊断输入字段
            </button>
            <button @click="fixInputs" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                🔧 修复输入字段
            </button>
            <button @click="clearData" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                🗑️ 清空数据
            </button>
            <button @click="fillTestData" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                📝 填充测试数据
            </button>
        </div>

        <!-- 日志显示 -->
        <div class="p-4 bg-gray-100 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">操作日志</h3>
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
import { ref, reactive } from 'vue'

// 测试数据
const testData = reactive({
    field1: null as number | null,
    field2: null as number | null,
    monetary_funds: null as number | null,
    accounts_receivable: null as number | null
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

// 输入变化处理
const onInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const field = target.getAttribute('data-field')
    const value = target.value
    
    addLog(`输入变化: ${field} = "${value}" (类型: ${typeof value})`)
    
    // 验证数据绑定
    if (field && field in testData) {
        const dataValue = (testData as any)[field]
        addLog(`数据绑定值: ${field} = ${dataValue} (类型: ${typeof dataValue})`)
    }
}

// 诊断功能
const runDiagnostics = () => {
    addLog('开始诊断输入字段...')
    
    const inputs = document.querySelectorAll('input[type="number"]')
    addLog(`找到 ${inputs.length} 个数字输入字段`)
    
    inputs.forEach((input, index) => {
        const field = input.getAttribute('data-field')
        const value = (input as HTMLInputElement).value
        const disabled = (input as HTMLInputElement).disabled
        const readOnly = (input as HTMLInputElement).readOnly
        
        addLog(`字段 ${index + 1}: ${field} = "${value}" (禁用: ${disabled}, 只读: ${readOnly})`)
    })
    
    addLog('诊断完成')
}

// 修复功能
const fixInputs = () => {
    addLog('开始修复输入字段...')
    
    const inputs = document.querySelectorAll('input[type="number"]')
    let fixedCount = 0
    
    inputs.forEach((input) => {
        const field = input.getAttribute('data-field')
        if (field) {
            (input as HTMLInputElement).disabled = false;
            (input as HTMLInputElement).readOnly = false;
            (input as HTMLElement).style.outline = '2px solid #10b981';
            fixedCount++
        }
    })
    
    addLog(`修复完成，处理了 ${fixedCount} 个字段`)
}

// 清空数据
const clearData = () => {
    Object.keys(testData).forEach(key => {
        (testData as any)[key] = null
    })
    addLog('数据已清空')
}

// 填充测试数据
const fillTestData = () => {
    testData.field1 = 1000.50
    testData.field2 = 2000.75
    testData.monetary_funds = 50000.00
    testData.accounts_receivable = 30000.25
    addLog('测试数据已填充')
}

// 初始化
addLog('测试页面已加载')
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
    font-size: 12px;
}

td input {
    font-size: 12px;
    background: transparent;
}
</style>
