<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">新签订单已排产未入库项目（在产）（不包含预投）（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初余额</th>
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.yearlyBudget || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.yearlyBudget || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.yearlyBudget || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyBudget) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.monthlyIncome) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateCompletionRate(totalData.monthlyIncome, totalData.yearlyBudget) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
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
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.INVENTORY_IN_PROGRESS"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
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

interface InventoryItem {
    customerType: string;
    yearlyBudget: number;
    monthlyIncome: number;
}

// 获取初始数据模板
const getInitialData = () => {
    return {
        equipment: [
            { customerType: '上海', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '国网', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '江苏', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '输配电内配', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '西门子', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '同业', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
        ],
        component: [
            { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 }
        ],
        project: [
            { customerType: '一包', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '二包', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '域内合作', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '域外合作', yearlyBudget: 0, monthlyIncome: 0 },
            { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
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
        initialData.equipment = initialData.equipment.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
                    monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = initialData.component.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
                    monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = initialData.project.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
                    monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
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

const equipmentData = ref<InventoryItem[]>([])
const componentData = ref<InventoryItem[]>([])
const projectData = ref<InventoryItem[]>([])

// 计算累计收入 - 传入客户类型和板块类型，计算当期及之前的所有月份总和
const calculateCumulativeIncome = async (customerType: string, category: string): Promise<number> => {
    try {
        // 获取当前年份
        const currentYear = period.value.split('-')[0];
        const currentMonth = parseInt(period.value.split('-')[1]);
        
        let totalCumulative = 0;
        
        // 遍历当年的所有月份（从1月到当前月份）
        for (let month = 1; month <= currentMonth; month++) {
            const periodStr = `${currentYear}-${month.toString().padStart(2, '0')}`;
            
            try {
                const response = await fetch(`http://127.0.0.1:3000/inventory-in-progress/${periodStr}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        const categoryData = result.data[category];
                        if (categoryData && Array.isArray(categoryData)) {
                            const item = categoryData.find((item: any) => item.customerType === customerType);
                            if (item) {
                                totalCumulative += Number(item.monthlyIncome) || 0;
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn(`获取${periodStr}期间数据失败:`, error);
            }
        }
        
        return totalCumulative;
    } catch (error) {
        console.error('计算累计收入失败:', error);
        // 如果计算失败，返回当月数据作为备选
        const currentData = category === 'equipment' ? equipmentData.value.find(item => item.customerType === customerType) :
                            category === 'component' ? componentData.value.find(item => item.customerType === customerType) :
                            projectData.value.find(item => item.customerType === customerType);
        return Number(currentData?.monthlyIncome) || 0;
    }
}

// 简化版本 - 仅返回当月数据（临时使用）
const getCumulativeIncomeSync = (customerType: string, category: string): number => {
    const currentData = category === 'equipment' ? equipmentData.value.find(item => item.customerType === customerType) :
                        category === 'component' ? componentData.value.find(item => item.customerType === customerType) :
                        projectData.value.find(item => item.customerType === customerType);
    return Number(currentData?.monthlyIncome) || 0;
}

// 计算完成率
const calculateCompletionRate = (cumulative: number, budget: number): string => {
    if (budget === 0) return '0.00';
    const rate = ((cumulative / budget) * 100) - 100;
    return rate.toFixed(2);
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyBudget: 0,
        monthlyIncome: 0
    }
    
    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        total.yearlyBudget += Number(item.yearlyBudget) || 0;
        total.monthlyIncome += Number(item.monthlyIncome) || 0;
    });
    
    // 汇总元件板块数据
    componentData.value.forEach(item => {
        total.yearlyBudget += Number(item.yearlyBudget) || 0;
        total.monthlyIncome += Number(item.monthlyIncome) || 0;
    });
    
    // 汇总工程板块数据
    projectData.value.forEach(item => {
        total.yearlyBudget += Number(item.yearlyBudget) || 0;
        total.monthlyIncome += Number(item.monthlyIncome) || 0;
    });
    
    return total;
});

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载在产情况数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/inventory-in-progress/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持年度预算但清空当月收入')
                // 保持现有的年度预算值，但将当月收入重置为0
                equipmentData.value = equipmentData.value.map(item => ({ ...item, monthlyIncome: 0 }))
                componentData.value = componentData.value.map(item => ({ ...item, monthlyIncome: 0 }))
                projectData.value = projectData.value.map(item => ({ ...item, monthlyIncome: 0 }))
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

// 加载备注数据
const loadRemarks = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.INVENTORY_IN_PROGRESS}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.data) {
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
        loadRemarks(newPeriod.toString())
    }
})

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarks(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const formData = {
            equipment: equipmentData.value,
            component: componentData.value,
            project: projectData.value
        }
        
        const response = await fetch('http://127.0.0.1:3000/inventory-in-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: formData
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 业务数据保存成功后，记录提交状态
        await recordFormSubmission(MODULE_IDS.INVENTORY_IN_PROGRESS, period.value, formData, remarks.value, suggestions.value)
        
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

// 格式化数字
const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleReset = () => {
    initializeData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('在产情况组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarks(route.query.period.toString())
    } else {
        loadData(period.value)
        loadRemarks(period.value)
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