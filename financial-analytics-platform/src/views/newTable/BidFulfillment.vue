<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">中标未履约情况（中标标包履约率详见公司附表）（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">期初余额</th>
                        <th class="border border-gray-300 px-4 py-2">当期余额</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount || 0) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount || 0) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount || 0) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateFluctuation(totalData.initialAmount, totalData.currentAmount) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.BID_FULFILLMENT"
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
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface BidItem {
    customerType: string;
    initialAmount: number;
    currentAmount: number;
}

// 静态期初余额数据（根据截图中的数据）
const staticInitialAmounts = {
    equipment: {
        '上海': 31055.26,
        '国网': 2798.76,
        '江苏': 5085.93,
        '输配电内配': 0.00,
        '西门子': 0.00,
        '同业': 0.00,
        '用户': 0.00,
        '其它': 0.00
    },
    component: {
        '用户': 0.00
    },
    project: {
        '一包': 8281.13,
        '二包': 444.83,
        '域内合作': 702.04,
        '域外合作': 0.00,
        '其它': 21.93
    }
}

// 获取初始数据模板
const getInitialData = () => {
    return {
        equipment: [
            { customerType: '上海', initialAmount: staticInitialAmounts.equipment['上海'], currentAmount: 0 },
            { customerType: '国网', initialAmount: staticInitialAmounts.equipment['国网'], currentAmount: 0 },
            { customerType: '江苏', initialAmount: staticInitialAmounts.equipment['江苏'], currentAmount: 0 },
            { customerType: '输配电内配', initialAmount: staticInitialAmounts.equipment['输配电内配'], currentAmount: 0 },
            { customerType: '西门子', initialAmount: staticInitialAmounts.equipment['西门子'], currentAmount: 0 },
            { customerType: '同业', initialAmount: staticInitialAmounts.equipment['同业'], currentAmount: 0 },
            { customerType: '用户', initialAmount: staticInitialAmounts.equipment['用户'], currentAmount: 0 },
            { customerType: '其它', initialAmount: staticInitialAmounts.equipment['其它'], currentAmount: 0 }
        ],
        component: [
            { customerType: '用户', initialAmount: staticInitialAmounts.component['用户'], currentAmount: 0 }
        ],
        project: [
            { customerType: '一包', initialAmount: staticInitialAmounts.project['一包'], currentAmount: 0 },
            { customerType: '二包', initialAmount: staticInitialAmounts.project['二包'], currentAmount: 0 },
            { customerType: '域内合作', initialAmount: staticInitialAmounts.project['域内合作'], currentAmount: 0 },
            { customerType: '域外合作', initialAmount: staticInitialAmounts.project['域外合作'], currentAmount: 0 },
            { customerType: '其它', initialAmount: staticInitialAmounts.project['其它'], currentAmount: 0 }
        ]
    }
}

// 数据合并函数
const mergeData = (initialData: any, loadedData: any) => {
    if (!loadedData || typeof loadedData !== 'object') {
        return initialData
    }
    
    // 合并设备数据
    if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
        initialData.equipment = initialData.equipment.map((templateItem: BidItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 期初余额始终使用静态数据，不从后端获取
                    initialAmount: templateItem.initialAmount,
                    currentAmount: Number(loadedItem.currentAmount) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = initialData.component.map((templateItem: BidItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 期初余额始终使用静态数据，不从后端获取
                    initialAmount: templateItem.initialAmount,
                    currentAmount: Number(loadedItem.currentAmount) || 0
                }
            }
            return templateItem
        })
    }

    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = initialData.project.map((templateItem: BidItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 期初余额始终使用静态数据，不从后端获取
                    initialAmount: templateItem.initialAmount,
                    currentAmount: Number(loadedItem.currentAmount) || 0
                }
            }
            return templateItem
        })
    }
    
    return initialData
}

// 初始化数据
const initializeData = () => {
    const initialData = getInitialData()
    equipmentData.value = initialData.equipment
    componentData.value = initialData.component
    projectData.value = initialData.project
}

const equipmentData = ref<BidItem[]>([])
const componentData = ref<BidItem[]>([])
const projectData = ref<BidItem[]>([])

// 计算波动率
const calculateFluctuation = (initial: number, current: number): string => {
    if (initial === 0) return current === 0 ? '0.00' : '0.00';
    const fluctuation = ((current - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 格式化数字
const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        initialAmount: 0,
        currentAmount: 0
    }

    const allData = [...equipmentData.value, ...componentData.value, ...projectData.value];

    allData.forEach(item => {
        total.initialAmount += Number(item.initialAmount) || 0;
        total.currentAmount += Number(item.currentAmount) || 0;
    });

    return total;
});

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.BID_FULFILLMENT}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                remarks.value = result.data.remarks || ''
                suggestions.value = result.data.suggestions || ''
            }
        }
    } catch (error) {
        console.error('加载备注和建议失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载标书履约状况数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://47.111.95.19:3000/bid-fulfillment/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，使用预算数据初始化')
                // 404时使用空数据，让预算中间件处理预算数据的加载
                const initialData = getInitialData()
                equipmentData.value = initialData.equipment
                componentData.value = initialData.component
                projectData.value = initialData.project
                return
            }
            throw new Error('加载数据失败')
        }
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            const initialData = getInitialData()
            const mergedData = mergeData(initialData, result.data)

            equipmentData.value = mergedData.equipment
            componentData.value = mergedData.component
            projectData.value = mergedData.project

            console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })
        }

    } catch (error) {
        console.error('加载数据失败:', error)
        initializeData()
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod && newPeriod !== period.value) {
        period.value = newPeriod.toString()
    }
}, { immediate: true })

// 监听period值变化，当用户手动修改月份下拉框或路由变化时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/bid-fulfillment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    equipment: equipmentData.value,
                    component: componentData.value,
                    project: projectData.value
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录表单提交
        await recordFormSubmission(
            MODULE_IDS.BID_FULFILLMENT,
            period.value,
            {
                equipment: equipmentData.value,
                component: componentData.value,
                project: projectData.value
            },
            remarks.value,
            suggestions.value
        )

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    initializeData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('标书履约状况组件挂载，当前期间:', period.value)
    if (period.value) {
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