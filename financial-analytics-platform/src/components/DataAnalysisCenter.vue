<template>
  <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">数据分析中心</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 新签订单分析 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ analysisModuleCompletionRates.newOrders }}%</div>
            <div class="text-xs text-gray-500">完成度</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">新签订单分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析新签订单结构及变化趋势</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${analysisModuleCompletionRates.newOrders}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/new-orders-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 成本中心分析 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ costCenterData.completionRate }}%</div>
            <div class="text-xs text-gray-500">年度完成率</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">成本中心分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析成本中心结构与分布情况</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${Math.min(Math.max(costCenterData.completionRate, 0), 100)}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/cost-center-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 营业收入分析 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ businessIncomeData.completionRate }}%</div>
            <div class="text-xs text-gray-500">年度完成率</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">营业收入分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析营业收入结构与变化趋势</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${Math.min(Math.max(businessIncomeData.completionRate, 0), 100)}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/business-income-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 净利润数据分析 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ analysisModuleCompletionRates.netProfit }}%</div>
            <div class="text-xs text-gray-500">完成度</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">净利润数据分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析净利润结构与完成情况</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${analysisModuleCompletionRates.netProfit}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/net-profit-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 净资产收益率 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">
              {{ roeData.roe > 0 ? roeData.roe + '%' : '暂无' }}
            </div>
            <div class="text-xs text-gray-500">ROE</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">净资产收益率</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析净利润与股东权益的比率</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${roeData.roe > 0 ? Math.min(roeData.roe, 100) : 0}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/roe-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 边际贡献率卡片 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ contributionRateData.currentRate }}%</div>
            <div class="text-xs text-gray-500">当期值</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">边际贡献率分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">计划值: {{ contributionRateData.targetRate }}%</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${Math.min(Math.max((contributionRateData.currentRate / contributionRateData.targetRate) * 100, 0), 100)}%;`">
            </div>
          </div>
        </div>
        <router-link to="/analytics/contribution-rate-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 毛利率卡片 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">
              {{ profitMarginData.currentRate > 0 ? profitMarginData.currentRate.toFixed(2) + '%' : '暂无' }}
            </div>
            <div class="text-xs text-gray-500">毛利率</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">毛利率分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析主营业务毛利率结构与趋势</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${profitMarginData.currentRate > 0 ? Math.min(profitMarginData.currentRate, 100) : 0}%;`">
            </div>
          </div>
        </div>
        <router-link to="/analytics/profit-margin-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 净利率分析卡片 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 01 2-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ netProfitMarginRate }}%</div>
            <div class="text-xs text-gray-500">净利率</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">净利率分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析净利润率趋势与变化情况</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${Math.min(Math.max(netProfitMarginRate / 6.85 * 100, 3), 100)}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/net-profit-margin-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

      <!-- 资产负债率分析卡片 -->
      <div
        class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-100 rounded-md">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h3m0 0v-3m0 3h3m-6 0h6m-6-3v3"></path>
            </svg>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-blue-600">{{ assetLiabilityRatio }}%</div>
            <div class="text-xs text-gray-500">资产负债率</div>
          </div>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">资产负债率分析</h4>
        <p class="text-sm text-gray-600 mb-3 h-12">分析资产负债率趋势与风险控制</p>
        <div class="mb-4">
          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
            <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
              :style="`width: ${Math.min(Math.max(assetLiabilityRatio / 74 * 100, 3), 100)}%;`"></div>
          </div>
        </div>
        <router-link to="/analytics/asset-liability-ratio-chart"
          class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="handleNavigation">
          质量情况
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// 定义接口类型
interface AnalysisModuleCompletionRates {
  newOrders: number
  costCenter: number
  businessIncome: number
  netProfit: number
}

interface CostCenterData {
  yearlyPlan: number
  totalCumulativeIncome: number
  completionRate: number
}

interface BusinessIncomeData {
  totalYearlyPlan: number
  totalCurrentTotal: number
  completionRate: number
}

interface ROEData {
  netProfit: number
  shareholderEquity: number
  roe: number
  year: number
  lastUpdated: string
}

interface ContributionRateData {
  targetRate: number
  currentRate: number
  completionRate: number
}

interface ProfitMarginData {
  targetRate: number
  currentRate: number
  completionRate: number
}

// 定义props
const props = defineProps<{
  analysisModuleCompletionRates: AnalysisModuleCompletionRates
  costCenterData: CostCenterData
  businessIncomeData: BusinessIncomeData
  roeData: ROEData
  contributionRateData: ContributionRateData
  profitMarginData: ProfitMarginData
  netProfitMarginRate: number
  assetLiabilityRatio: number
}>()

// 定义emits
const emit = defineEmits<{
  navigation: [event: Event]
}>()

// 处理导航事件
const handleNavigation = (event: Event) => {
  emit('navigation', event)
}
</script>
