<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">库存情况</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <h2 class="text-xl font-semibold my-4">对应库存：</h2>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年初数据</th>
                        <th class="border border-gray-300 px-4 py-2">当期数据</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="8">设备</td>
                        <td class="border border-gray-300 px-4 py-2">上海</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.shanghai.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">国网</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.national.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">江苏</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.jiangsu.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">输配电内配</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.power.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">西门子</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.siemens.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">同业</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.peers.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.users.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.equipment.others.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    
                    <!-- 元件板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">元件</td>
                        <td class="border border-gray-300 px-4 py-2">用户</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.components.users.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    
                    <!-- 工程板块 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2" rowspan="5">工程</td>
                        <td class="border border-gray-300 px-4 py-2">一包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package1.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">二包</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.package2.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域内合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.domestic.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">域外合作</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.international.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">其它</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.initial" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.current" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.engineering.others.fluctuation" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                    </tr>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.initial" type="text" class="w-full px-2 py-1 border rounded font-bold" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.current" type="text" class="w-full px-2 py-1 border rounded font-bold" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.fluctuation" type="text" class="w-full px-2 py-1 border rounded font-bold" />
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

        <!-- 附件和备注组件 -->
        <FormAttachmentAndRemarks
          :module-id="moduleId"
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
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.INVENTORY_STOCK
const remarks = ref('')
const suggestions = ref('')

interface InventoryItem {
    initial: string;
    current: string;
    fluctuation: string;
}

// 使用图片中的数据初始化
const initialData = {
    equipment: {
        shanghai: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        national: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        jiangsu: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        power: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        siemens: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        peers: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        users: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        others: { initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    },
    components: {
        users: { initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    },
    engineering: {
        package1: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        package2: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        domestic: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        international: { initial: '缺少数据', current: '缺少数据', fluctuation: '' },
        others: { initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    },
    total: { initial: '', current: '', fluctuation: '' }
}

const data = reactive(JSON.parse(JSON.stringify(initialData)))

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/inventory-stock/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data) {
            Object.assign(data, result.data)
        }
    } catch (error) {
        console.error('加载数据失败:', error)
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

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/inventory-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录表单提交
        await recordFormSubmission(moduleId, period.value, data, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    Object.assign(data, JSON.parse(JSON.stringify(initialData)))
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
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