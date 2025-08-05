<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务边际贡献率结构与质量</h1>
            <div class="text-gray-500">(按年度计划口径分解)</div>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <h2 class="text-xl font-semibold my-4">对应主营收入：</h2>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期实际</th>
                        <th class="border border-gray-300 px-4 py-2">偏差</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="8">设备</td>
                        <td class="border border-gray-300 px-4 py-2">上海</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.shanghai.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">国网</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.national.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">江苏</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.jiangsu.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">输配电内配</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.power.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">西门子</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.siemens.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">同业</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.peers.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.users.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.equipment.others.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 元件板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">元件</td>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.components.users.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 工程板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="5">工程</td>
                        <td class="border border-gray-300 px-4 py-2">一包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.engineering.package1.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">二包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.engineering.package2.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域内合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.engineering.domestic.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域外合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.engineering.international.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ data.engineering.others.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.difference" type="text" class="w-full px-2 py-1 border rounded bg-gray-50" readonly />
                        </td>
                    </tr>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.plan" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-50" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ data.total.actual }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.difference" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-50" readonly />
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
            :module-id="MODULE_IDS.BUSINESS_CONTRIBUTION"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface BusinessItem {
    plan: string;
    actual: string;
    difference: string;
}

// 年度计划静态数据（主营业务边际贡献率）
const getInitialData = () => {
    return {
        equipment: {
            shanghai: { plan: '28.00%', actual: '0%', difference: '0%' },
            national: { plan: '18.50%', actual: '0%', difference: '0%' },
            jiangsu: { plan: '12.00%', actual: '0%', difference: '0%' },
            power: { plan: '/', actual: '0%', difference: '0%' },
            siemens: { plan: '/', actual: '0%', difference: '0%' },
            peers: { plan: '30.00%', actual: '0%', difference: '0%' },
            users: { plan: '15.80%', actual: '0%', difference: '0%' },
            others: { plan: '/', actual: '0%', difference: '0%' }
        },
        components: {
            users: { plan: '/', actual: '0%', difference: '0%' }
        },
        engineering: {
            package1: { plan: '35.00%', actual: '0%', difference: '0%' },
            package2: { plan: '20.00%', actual: '0%', difference: '0%' },
            domestic: { plan: '12.00%', actual: '0%', difference: '0%' },
            international: { plan: '8.50%', actual: '0%', difference: '0%' },
            others: { plan: '18.00%', actual: '0%', difference: '0%' }
        },
        total: { plan: '32.00%', actual: '0%', difference: '0%' }
    }
}

// 数据合并函数，保护年度计划静态数据
const mergeData = (defaultData: any, savedData: any) => {
    const merged = JSON.parse(JSON.stringify(defaultData))

    if (savedData) {
        console.log('开始合并数据:', { defaultData, savedData })

        // 如果savedData中有automation数据，需要迁移到equipment中
        if (savedData.automation) {
            console.log('检测到automation数据，迁移到equipment中')
            if (!savedData.equipment) {
                savedData.equipment = {}
            }
            // 将automation的数据迁移到equipment中
            Object.keys(savedData.automation).forEach(key => {
                if (savedData.automation[key] && typeof savedData.automation[key] === 'object') {
                    savedData.equipment[key] = savedData.automation[key]
                }
            })
            // 删除automation数据
            delete savedData.automation
        }

        // 深度合并对象数据，但跳过plan和difference字段
        Object.keys(merged).forEach(category => {
            if (savedData[category]) {
                console.log(`合并类别: ${category}`)

                if (category === 'total') {
                    // total是直接包含plan/actual/difference的对象
                    console.log(`合并total对象:`, savedData[category])
                    // 只合并actual字段，保持plan和difference为静态数据
                    if (savedData[category].actual !== undefined) {
                        merged[category].actual = savedData[category].actual
                    }
                } else {
                    // 其他类别是嵌套对象结构
                    Object.keys(merged[category]).forEach(key => {
                        if (savedData[category][key] && typeof savedData[category][key] === 'object') {
                            console.log(`合并项目: ${category}.${key}`, savedData[category][key])
                            // 只合并actual字段，保持plan和difference为静态数据
                            if (savedData[category][key].actual !== undefined) {
                                merged[category][key].actual = savedData[category][key].actual
                            }
                        }
                    })
                }
            }
        })
        console.log('合并完成:', merged)
    }

    return merged
}

const data = reactive(getInitialData())

// 计算偏差：当期实际 - 年度计划
const calculateDifference = (segment: string, item: string) => {
    let planValue: number = 0
    let actualValue: number = 0
    
    if (segment === 'total') {
        planValue = parseFloat(data.total.plan.replace('%', '')) || 0
        actualValue = parseFloat(data.total.actual.replace('%', '')) || 0
        data.total.difference = (actualValue - planValue).toFixed(2) + '%'
    } else {
        const segmentData = data[segment]
        if (segmentData && segmentData[item]) {
            const planStr = segmentData[item].plan
            const actualStr = segmentData[item].actual
            
            // 如果计划是 "/"，偏差也设为 "/"
            if (planStr === '/') {
                segmentData[item].difference = '/'
                return
            }
            
            planValue = parseFloat(planStr.replace('%', '')) || 0
            actualValue = parseFloat(actualStr.replace('%', '')) || 0
            
            const difference = actualValue - planValue
            segmentData[item].difference = difference.toFixed(2) + '%'
        }
    }
}

// 重新计算所有偏差
const recalculateAllDifferences = () => {
    // 设备板块（包含原自动化项目）
    calculateDifference('equipment', 'shanghai')
    calculateDifference('equipment', 'national')
    calculateDifference('equipment', 'jiangsu')
    calculateDifference('equipment', 'power')
    calculateDifference('equipment', 'siemens')
    calculateDifference('equipment', 'peers')
    calculateDifference('equipment', 'users')
    calculateDifference('equipment', 'others')

    // 元件板块
    calculateDifference('components', 'users')

    // 工程板块
    calculateDifference('engineering', 'package1')
    calculateDifference('engineering', 'package2')
    calculateDifference('engineering', 'domestic')
    calculateDifference('engineering', 'international')
    calculateDifference('engineering', 'others')

    // 合计
    calculateDifference('total', '')
}

// 加载备注数据
const loadRemarksData = async (targetPeriod: string) => {
    try {
        const result = await loadRemarksAndSuggestions(MODULE_IDS.BUSINESS_CONTRIBUTION, targetPeriod)
        remarks.value = result.remarks || ''
        suggestions.value = result.suggestions || ''
    } catch (error) {
        console.error('加载备注和建议失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    console.log('开始加载主营业务边际贡献率数据:', targetPeriod)
    try {
        // 首先尝试自动计算边际贡献率
        let calculatedData = null
        try {
            console.log('尝试自动计算边际贡献率...')
            const calculateResponse = await fetch(`http://127.0.0.1:3000/business-contribution/calculate/${targetPeriod}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (calculateResponse.ok) {
                const calculateResult = await calculateResponse.json()
                if (calculateResult.success) {
                    calculatedData = calculateResult.data
                    console.log('自动计算成功:', calculatedData)
                }
            }
        } catch (calcError) {
            console.log('自动计算失败，将使用现有数据:', calcError.message)
        }

        // 如果自动计算成功，使用计算结果；否则加载现有数据
        let finalData = calculatedData

        if (!finalData) {
            // 加载专用表数据（包含预算数据中间件处理）
            const response = await fetch(`http://127.0.0.1:3000/business-contribution/${targetPeriod}`)
            let businessData = null
            if (response.ok) {
                const result = await response.json()
                businessData = result.data
                console.log('专用表数据（含预算）:', businessData)
            } else if (response.status !== 404) {
                throw new Error('加载专用表数据失败')
            }

            // 再加载form_submissions表数据作为备份
            const formResponse = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.BUSINESS_CONTRIBUTION}/${targetPeriod}`)
            let formData = null
            if (formResponse.ok) {
                const formResult = await formResponse.json()
                formData = formResult.data?.formData
                console.log('系统表数据:', formData)
            }

            // 合并数据：专用表（含预算）优先，系统表补充
            finalData = businessData || formData
        }

        if (finalData) {
            console.log('最终使用的数据:', finalData)
            const mergedData = mergeData(getInitialData(), finalData)
            console.log('合并后的数据:', mergedData)

            // 逐个更新响应式数据以确保Vue能检测到变化
            Object.keys(mergedData).forEach(category => {
                if (typeof mergedData[category] === 'object' && !Array.isArray(mergedData[category])) {
                    if (category === 'total') {
                        // total是直接包含plan/actual/difference的对象
                        if (data[category]) {
                            Object.assign(data[category], mergedData[category])
                        }
                    } else {
                        // 其他类别是嵌套对象结构
                        Object.keys(mergedData[category]).forEach(key => {
                            if (data[category] && data[category][key] && typeof mergedData[category][key] === 'object') {
                                Object.assign(data[category][key], mergedData[category][key])
                            }
                        })
                    }
                }
            })
            console.log('响应式数据更新完成:', data)

            // 重新计算所有偏差
            recalculateAllDifferences()
        } else {
            // 重置为初始数据
            const initialData = getInitialData()
            Object.keys(initialData).forEach(category => {
                if (typeof initialData[category] === 'object' && !Array.isArray(initialData[category])) {
                    if (category === 'total') {
                        // total是直接包含plan/actual/difference的对象
                        if (data[category]) {
                            Object.assign(data[category], initialData[category])
                        }
                    } else {
                        // 其他类别是嵌套对象结构
                        Object.keys(initialData[category]).forEach(key => {
                            if (data[category] && data[category][key]) {
                                Object.assign(data[category][key], initialData[category][key])
                            }
                        })
                    }
                }
            })
            console.log('使用默认数据')

            // 重新计算所有偏差
            recalculateAllDifferences()
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        // 重置为初始数据
        const initialData = getInitialData()
        Object.keys(initialData).forEach(category => {
            if (typeof initialData[category] === 'object' && !Array.isArray(initialData[category])) {
                if (category === 'total') {
                    // total是直接包含plan/actual/difference的对象
                    if (data[category]) {
                        Object.assign(data[category], initialData[category])
                    }
                } else {
                    // 其他类别是嵌套对象结构
                    Object.keys(initialData[category]).forEach(key => {
                        if (data[category] && data[category][key]) {
                            Object.assign(data[category][key], initialData[category][key])
                        }
                    })
                }
            }
        })

        // 重新计算所有偏差
        recalculateAllDifferences()
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksData(newPeriod.toString())
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData(newPeriod)
})

const handleSave = async () => {
    try {
        // 双重保存：专用表 + 系统表
        const saveBusinessData = async () => {
            const response = await fetch('http://127.0.0.1:3000/business-contribution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    period: period.value,
                    data: data
                })
            })

            if (!response.ok) {
                throw new Error('保存专用表失败')
            }
        }
        
        // 先保存专用表数据
        await saveBusinessData()
        
        // 再记录系统表单提交
        await recordFormSubmission(
            MODULE_IDS.BUSINESS_CONTRIBUTION,
            period.value,
            data,
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
    const initialData = getInitialData()
    // 逐个更新响应式数据以确保Vue能检测到变化
    Object.keys(initialData).forEach(category => {
        if (typeof initialData[category] === 'object' && !Array.isArray(initialData[category])) {
            if (category === 'total') {
                // total是直接包含plan/actual/difference的对象
                if (data[category]) {
                    Object.assign(data[category], initialData[category])
                }
            } else {
                // 其他类别是嵌套对象结构
                Object.keys(initialData[category]).forEach(key => {
                    if (data[category] && data[category][key]) {
                        Object.assign(data[category][key], initialData[category][key])
                    }
                })
            }
        }
    })
    remarks.value = ''
    suggestions.value = ''

    // 重新计算所有偏差
    recalculateAllDifferences()

    console.log('数据已重置:', data)
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksData(route.query.period.toString())
    } else {
        loadData(period.value)
        loadRemarksData(period.value)
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