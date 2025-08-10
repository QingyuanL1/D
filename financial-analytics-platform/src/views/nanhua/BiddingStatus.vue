<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">招投标情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">单位：万元</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">投标金额</th>
                        <th class="border border-gray-300 px-4 py-2">中标金额</th>
                        <th class="border border-gray-300 px-4 py-2">中标率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 项目列表 -->
                    <template v-for="(item, index) in biddingData.projects" :key="`project-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="biddingData.projects.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.projectName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.bidCount" type="number" min="0" class="w-full px-2 py-1 border rounded text-center" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.winCount" type="number" min="0" class="w-full px-2 py-1 border rounded text-center" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                <span class="text-sm font-medium">{{ calculateWinRate(item.bidCount, item.winCount) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            {{ totalData.bidCount }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            {{ totalData.winCount }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            <span class="text-sm font-bold">{{ totalData.winRate }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BIDDING_STATUS"
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
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface BiddingItem {
    projectName: string;
    bidCount: number;
    winCount: number;
    winRate: number;
}

interface BiddingData {
    projects: BiddingItem[];
}

// 固定的项目数据
const fixedPlanData: BiddingData = {
    projects: [
        { projectName: '一包项目', bidCount: 0, winCount: 0, winRate: 0 },
        { projectName: '二包项目', bidCount: 0, winCount: 0, winRate: 0 },
        { projectName: '域内合作项目', bidCount: 0, winCount: 0, winRate: 0 },
        { projectName: '域外合作项目', bidCount: 0, winCount: 0, winRate: 0 },
        { projectName: '新能源项目', bidCount: 0, winCount: 0, winRate: 0 },
        { projectName: '苏州项目', bidCount: 0, winCount: 0, winRate: 0 }
    ]
}

const biddingData = ref<BiddingData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 计算中标率函数
const calculateWinRate = (bidCount: number, winCount: number): string => {
    if (!bidCount || bidCount === 0) return '0.00'
    const rate = (winCount / bidCount) * 100
    return rate.toFixed(2)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        bidCount: 0,
        winCount: 0,
        winRate: 0
    }
    
    biddingData.value.projects.forEach(item => {
        total.bidCount += item.bidCount || 0
        total.winCount += item.winCount || 0
    })
    
    // 计算总中标率
    total.winRate = total.bidCount > 0 ? (total.winCount / total.bidCount * 100) : 0
    total.winRate = parseFloat(total.winRate.toFixed(2))
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-bidding-status/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.projects) {
            // 直接使用后端返回的数据
            biddingData.value.projects = result.data.projects.map((item: any) => ({
                projectName: item.projectName,
                bidCount: Number(item.bidCount) || 0,
                winCount: Number(item.winCount) || 0,
                winRate: Number(item.winRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_BIDDING_STATUS}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
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
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-bidding-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: biddingData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_BIDDING_STATUS, period.value, biddingData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    biddingData.value = JSON.parse(JSON.stringify(fixedPlanData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
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