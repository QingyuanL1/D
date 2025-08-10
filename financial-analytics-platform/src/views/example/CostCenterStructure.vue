<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">成本中心结构(主表)（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">费用情况</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">一包</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">二包</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">新能源</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">抢修</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">运检</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">监理</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">域内</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">域外</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">域外苏州</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">设备外服</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">累计数</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in costData" :key="index">
                        <td class="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                            {{ item.name }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2" v-for="key in columns" :key="key">
                            <input v-model="item[key]" type="number" class="w-full px-2 py-1 border rounded"
                                step="0.01" />
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.EXAMPLE_COST_CENTER
const remarks = ref('')
const suggestions = ref('')

interface CostItem {
    name: string;
    yibao: number | null;
    erbao: number | null;
    xinnengyuan: number | null;
    qiangxiu: number | null;
    yunjian: number | null;
    jianli: number | null;
    yunei: number | null;
    yuwai: number | null;
    yuwaisuzhou: number | null;
    shebeiwaifu: number | null;
    total: number | null;
    [key: string]: string | number | null | boolean | undefined;
}

const columns = [
    'yibao', 'erbao', 'xinnengyuan', 'qiangxiu', 'yunjian', 'jianli',
    'yunei', 'yuwai', 'yuwaisuzhou', 'shebeiwaifu', 'total'
];

// 创建空行数据
const createEmptyRow = (): CostItem => ({
    name: '',
    yibao: null,
    erbao: null,
    xinnengyuan: null,
    qiangxiu: null,
    yunjian: null,
    jianli: null,
    yunei: null,
    yuwai: null,
    yuwaisuzhou: null,
    shebeiwaifu: null,
    total: null
})

// 初始数据
const initialData: CostItem[] = [
    {
        name: '总经理室',
        yibao: 116.80, erbao: 37.53, xinnengyuan: 34.00, qiangxiu: 9.38,
        yunjian: 37.53, jianli: null, yunei: 6.80, yuwai: null,
        yuwaisuzhou: 13.60, shebeiwaifu: null, total: 255.63
    },
    {
        name: '经营部',
        yibao: 160.55, erbao: 19.80, xinnengyuan: 86.34, qiangxiu: null,
        yunjian: 7.45, jianli: 2.72, yunei: 10.87, yuwai: 13.88,
        yuwaisuzhou: 2.95, shebeiwaifu: null, total: 304.45
    },
    {
        name: '经管部',
        yibao: -9.89, erbao: -5.89, xinnengyuan: -4.85, qiangxiu: null,
        yunjian: -2.21, jianli: -0.15, yunei: -6.34, yuwai: -8.09,
        yuwaisuzhou: -1.15, shebeiwaifu: 0.00, total: -38.57
    },
    {
        name: '安质部',
        yibao: 35.29, erbao: 23.13, xinnengyuan: null, qiangxiu: null,
        yunjian: 9.70, jianli: null, yunei: null, yuwai: null,
        yuwaisuzhou: null, shebeiwaifu: null, total: 67.12
    },
    {
        name: '工程部',
        yibao: 302.02, erbao: 113.29, xinnengyuan: null, qiangxiu: null,
        yunjian: 84.89, jianli: 0.67, yunei: null, yuwai: null,
        yuwaisuzhou: null, shebeiwaifu: null, total: 500.87
    },
    {
        name: '运检部',
        yibao: null, erbao: null, xinnengyuan: 136.34, qiangxiu: 132.14,
        yunjian: 17.43, jianli: 7.50, yunei: null, yuwai: null,
        yuwaisuzhou: null, shebeiwaifu: null, total: 293.41
    },
    {
        name: '营销部-销售',
        yibao: 97.98, erbao: 108.40, xinnengyuan: 48.11, qiangxiu: 0.00,
        yunjian: 13.28, jianli: 0.82, yunei: 0.00, yuwai: 0.00,
        yuwaisuzhou: 0.00, shebeiwaifu: 0.00, total: 268.69
    },
    {
        name: '营销部-商务',
        yibao: 45.76, erbao: 24.40, xinnengyuan: 20.10, qiangxiu: 0.95,
        yunjian: 9.18, jianli: 0.00, yunei: 26.27, yuwai: 35.54,
        yuwaisuzhou: 0.00, shebeiwaifu: 0.00, total: 160.19
    },
    {
        name: '营销部-设备',
        yibao: 0.00, erbao: 0.00, xinnengyuan: 0.00, qiangxiu: 0.00,
        yunjian: 0.00, jianli: 0.00, yunei: 0.00, yuwai: 0.00,
        yuwaisuzhou: 0.00, shebeiwaifu: 3.04, total: 3.04
    },
    {
        name: '营销部-拓展',
        yibao: 0.00, erbao: 0.00, xinnengyuan: 0.00, qiangxiu: 0.00,
        yunjian: 0.00, jianli: 0.00, yunei: 32.80, yuwai: 30.54,
        yuwaisuzhou: 8.48, shebeiwaifu: 0.00, total: 71.82
    },
    {
        name: '营销部-监理',
        yibao: null, erbao: null, xinnengyuan: null, qiangxiu: null,
        yunjian: null, jianli: null, yunei: null, yuwai: null,
        yuwaisuzhou: null, shebeiwaifu: null, total: 0.00
    },
    {
        name: '合计',
        yibao: 748.51, erbao: 320.66, xinnengyuan: 320.04, qiangxiu: 142.48,
        yunjian: 176.23, jianli: 11.65, yunei: 70.40, yuwai: 69.87,
        yuwaisuzhou: 23.77, shebeiwaifu: 3.04, total: 1886.65
    },
    {
        name: '占收入比',
        yibao: 8.07, erbao: 3.46, xinnengyuan: 3.45, qiangxiu: 1.54,
        yunjian: 1.90, jianli: 0.13, yunei: 0.76, yuwai: 0.75,
        yuwaisuzhou: 0.26, shebeiwaifu: 0.03, total: 20.35
    }
]

const costData = ref<CostItem[]>(initialData)

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/cost-center-structure/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data) {
            costData.value = result.data
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

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/cost-center-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: costData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录表单提交
        await recordFormSubmission(moduleId, period.value, costData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    costData.value = JSON.parse(JSON.stringify(initialData))
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