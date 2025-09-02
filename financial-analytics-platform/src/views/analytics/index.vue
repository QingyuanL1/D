<template>
  <div class="mb-8">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">数据分析中心</h2>
        <p class="text-gray-600 mt-2">财务数据综合分析与可视化展示</p>

        <!-- 指标统计概览 -->
        <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">指标统计概览</h2>
            <div class="text-sm text-gray-500">
              数据更新时间: {{ lastUpdateTime }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 总指标数 -->
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div class="flex items-center">
                <div class="p-2 bg-blue-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-blue-600">总指标数</p>
                  <p class="text-2xl font-bold text-blue-900">{{ totalMetrics }}</p>
                </div>
              </div>
            </div>

            <!-- 有数据指标 -->
            <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div class="flex items-center">
                <div class="p-2 bg-green-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-600">有数据指标</p>
                  <p class="text-2xl font-bold text-green-900">{{ activeMetrics }}</p>
                </div>
              </div>
            </div>

            <!-- API接口数 -->
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div class="flex items-center">
                <div class="p-2 bg-purple-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0">
                    </path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-purple-600">API接口数</p>
                  <p class="text-2xl font-bold text-purple-900">{{ totalApis }}</p>
                </div>
              </div>
            </div>

            <!-- 数据完整度 -->
            <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div class="flex items-center">
                <div class="p-2 bg-orange-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z">
                    </path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-orange-600">数据完整度</p>
                  <p class="text-2xl font-bold text-orange-900">{{ dataCompleteness }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 指标详情表格 -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">指标详情统计</h2>
            <button @click="refreshMetricsData"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              :disabled="isRefreshing">
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              {{ isRefreshing ? '刷新中...' : '刷新数据' }}
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API接口</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据状态</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据量</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计算公式</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(metric, index) in metricsDetails" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ metric.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600 font-mono">{{ metric.api }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="metric.hasData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ metric.hasData ? '有数据' : '无数据' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ metric.dataCount }} 条
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 max-w-xs">{{ metric.formula }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 max-w-xs">{{ metric.description }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 数据分析中心 -->
      <DataAnalysisCenter />

      <!-- 月度分析图表 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">月度分析图表</h2>

        <!-- 营业收入月度分析 -->
        <BusinessIncomeTrendChart :show-detail-link="true" height="h-[400px]" class="mb-6" />

        <!-- 净利润月度分析 -->
        <NetProfitTrendChart :show-detail-link="true" height="h-[400px]" class="mb-6" />

        <!-- ROE月度分析 -->
        <ROETrendChart />

        <!-- 边际贡献率月度分析 -->
        <ContributionRateTrendChart />

        <!-- 毛利率月度分析 -->
        <ProfitMarginTrendChart />

        <!-- 净利率月度分析 -->
        <NetProfitMarginTrendChart />

        <!-- 资产负债率月度分析 -->
        <AssetLiabilityRatioTrendChart />

        <!-- 存量指标月度分析 -->
        <InventoryMetricsTrendChart />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataAnalysisCenter from '@/components/DataAnalysisCenter.vue'
import BusinessIncomeTrendChart from '@/components/BusinessIncomeTrendChart.vue'
import NetProfitTrendChart from '@/components/NetProfitTrendChart.vue'
import ROETrendChart from '@/components/ROETrendChart.vue'
import ContributionRateTrendChart from '@/components/ContributionRateTrendChart.vue'
import ProfitMarginTrendChart from '@/components/ProfitMarginTrendChart.vue'
import NetProfitMarginTrendChart from '@/components/NetProfitMarginTrendChart.vue'
import AssetLiabilityRatioTrendChart from '@/components/AssetLiabilityRatioTrendChart.vue'
import InventoryMetricsTrendChart from '@/components/InventoryMetricsTrendChart.vue'



// 当前年份
const currentYear = ref(new Date().getFullYear().toString())

// 指标统计数据
const totalMetrics = ref(8) // 总指标数
const activeMetrics = ref(0) // 有数据的指标数
const totalApis = ref(17) // 总API接口数（从analytics.js统计）
const dataCompleteness = ref(0) // 数据完整度百分比
const lastUpdateTime = ref('')

// 指标详细信息
const metricsDetails = ref([
  {
    name: '营业收入分析',
    api: '/analytics/business-income/:year',
    hasData: false,
    dataCount: 0,
    formula: '主营业务收入 + 非主营业务收入',
    description: '分析营业收入结构与变化趋势，包含主营和非主营业务收入'
  },
  {
    name: '净利润数据分析',
    api: '/analytics/net-profit/:year',
    hasData: false,
    dataCount: 0,
    formula: '营业收入 - 营业成本 - 税金及附加 - 销售费用 - 管理费用 - 财务费用',
    description: '分析净利润结构与完成情况，反映企业盈利能力'
  },
  {
    name: '净资产收益率(ROE)',
    api: '/analytics/roe/:year',
    hasData: false,
    dataCount: 0,
    formula: 'ROE = 净利润 / 股东权益 × 100%',
    description: '衡量企业运用股东权益获取收益的能力'
  },
  {
    name: '边际贡献率',
    api: '/analytics/contribution-rate/:year',
    hasData: false,
    dataCount: 0,
    formula: '边际贡献率 = (营业收入 - 变动成本) / 营业收入 × 100%',
    description: '反映产品或服务对企业利润的贡献程度'
  },
  {
    name: '毛利率',
    api: '/analytics/profit-margin/:year',
    hasData: false,
    dataCount: 0,
    formula: '毛利率 = (营业收入 - 营业成本) / 营业收入 × 100%',
    description: '反映企业产品或服务的盈利能力'
  },
  {
    name: '净利率',
    api: '/analytics/net-profit-margin/:year',
    hasData: false,
    dataCount: 0,
    formula: '净利率 = 净利润 / 营业收入 × 100%',
    description: '反映企业每单位营业收入的净利润水平'
  },
  {
    name: '资产负债率',
    api: '/analytics/asset-liability-ratio/:year',
    hasData: false,
    dataCount: 0,
    formula: '资产负债率 = 负债总额 / 资产总额 × 100%',
    description: '反映企业财务风险和偿债能力'
  },
  {
    name: '存量指标',
    api: '/analytics/inventory-metrics/:year',
    hasData: false,
    dataCount: 0,
    formula: '存量总计 = 预中标 + 在产 + 库存',
    description: '综合反映企业生产经营存量情况'
  }
])













// 刷新状态
const isRefreshing = ref(false)













// 刷新指标数据统计
const refreshMetricsData = async () => {
  isRefreshing.value = true
  try {
    // 并行检查所有API接口的数据状态
    const promises = metricsDetails.value.map(async (metric) => {
      try {
        const apiUrl = metric.api.replace(':year', currentYear.value)
        const response = await fetch(`http://47.111.95.19:3000${apiUrl}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            metric.hasData = true
            // 计算数据量
            if (result.data.months && result.data.monthlyData) {
              metric.dataCount = result.data.months.length
            } else if (result.data.monthlyData && Array.isArray(result.data.monthlyData)) {
              metric.dataCount = result.data.monthlyData.length
            } else if (result.data.summary) {
              metric.dataCount = 1
            } else {
              metric.dataCount = 0
            }
          } else {
            metric.hasData = false
            metric.dataCount = 0
          }
        } else {
          metric.hasData = false
          metric.dataCount = 0
        }
      } catch (error) {
        console.error(`检查指标 ${metric.name} 失败:`, error)
        metric.hasData = false
        metric.dataCount = 0
      }
    })

    await Promise.all(promises)

    // 更新统计数据
    updateMetricsStatistics()

  } catch (error) {
    console.error('刷新指标数据失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 更新指标统计数据
const updateMetricsStatistics = () => {
  // 计算有数据的指标数
  activeMetrics.value = metricsDetails.value.filter(metric => metric.hasData).length

  // 计算数据完整度
  dataCompleteness.value = Math.round((activeMetrics.value / totalMetrics.value) * 100)

  // 更新时间
  lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}













onMounted(async () => {
  // 初始化统计数据
  updateMetricsStatistics()
  await refreshMetricsData()
})
</script>
