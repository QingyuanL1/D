<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">财务分析首页</h1>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
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
            <button
              @click="refreshMetricsData"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              :disabled="isRefreshing"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
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
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="metric.hasData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
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

      <!-- 分析模块卡片 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">分析模块</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 营业收入分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ analysisModuleCompletionRates.businessIncome }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">营业收入分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析营业收入结构与变化趋势</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${analysisModuleCompletionRates.businessIncome}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/business-income-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>

          <!-- 净利润分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${analysisModuleCompletionRates.netProfit}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/net-profit-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>

          <!-- ROE分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
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
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${roeData.roe > 0 ? Math.min(roeData.roe, 100) : 0}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/roe-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>

          <!-- 边际贡献率卡片 -->
          <ContributionRateCard />

          <!-- 毛利率卡片 -->
          <ProfitMarginCard />

          <!-- 净利率分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 01 2-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(netProfitMarginRate / 6.85 * 100, 3), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/net-profit-margin-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>

          <!-- 资产负债率分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h3m0 0v-3m0 3h3m-6 0h6m-6-3v3"></path>
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
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(assetLiabilityRatio / 74 * 100, 3), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/asset-liability-ratio-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>

          <!-- 存量指标分析卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ inventoryMetricsTotal }}万</div>
                <div class="text-xs text-gray-500">存量总计</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">存量指标分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析预中标+在产+库存综合情况</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(inventoryMetricsTotal / 100000 * 100, 3), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/inventory-metrics-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              质量情况
            </router-link>
          </div>
        </div>
      </div>

      <!-- 月度分析图表 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">月度分析图表</h2>

        <!-- 营业收入月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年营业收入月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">主营业务</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">非主营业务</span>
              </div>
              <router-link to="/analytics/business-income-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="revenueChartRef"></div>
        </div>

        <!-- 净利润月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年净利润月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">净利润变化</span>
              </div>
              <router-link to="/analytics/net-profit-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="netProfitChartRef"></div>
        </div>

        <!-- ROE月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年ROE月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">实际ROE</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">目标线</span>
              </div>
              <router-link to="/analytics/roe-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="roeChartRef"></div>
        </div>

        <!-- 边际贡献率月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年边际贡献率月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">实际贡献率</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">计划目标线</span>
              </div>
              <router-link to="/analytics/contribution-rate-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="contributionRateChartRef"></div>
        </div>

        <!-- 毛利率月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年毛利率月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">实际毛利率</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">目标毛利率</span>
              </div>
              <router-link to="/analytics/profit-margin-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="profitMarginChartRef"></div>
        </div>

        <!-- 净利率月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年净利率月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">实际净利率</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">目标线</span>
              </div>
              <router-link to="/analytics/net-profit-margin-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="netProfitMarginChartRef"></div>
        </div>

        <!-- 资产负债率月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年资产负债率月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">实际负债率</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">目标线</span>
              </div>
              <router-link to="/analytics/asset-liability-ratio-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="assetLiabilityChartRef"></div>
        </div>

        <!-- 存量指标月度分析 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}年存量指标月度趋势</h3>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">存量总计</span>
              </div>
              <router-link to="/analytics/inventory-metrics-chart" class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情 →
              </router-link>
            </div>
          </div>
          <div class="h-[400px]" ref="inventoryChartRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import ContributionRateCard from '@/views/analytics/ContributionRateCard.vue'
import ProfitMarginCard from '@/views/analytics/ProfitMarginCard.vue'

// 图表引用
const revenueChartRef = ref<HTMLElement | null>(null)
const netProfitChartRef = ref<HTMLElement | null>(null)
const roeChartRef = ref<HTMLElement | null>(null)
const contributionRateChartRef = ref<HTMLElement | null>(null)
const profitMarginChartRef = ref<HTMLElement | null>(null)
const netProfitMarginChartRef = ref<HTMLElement | null>(null)
const assetLiabilityChartRef = ref<HTMLElement | null>(null)
const inventoryChartRef = ref<HTMLElement | null>(null)

// 图表实例
const revenueChartInstance = ref<echarts.ECharts | null>(null)
const netProfitChartInstance = ref<echarts.ECharts | null>(null)
const roeChartInstance = ref<echarts.ECharts | null>(null)
const contributionRateChartInstance = ref<echarts.ECharts | null>(null)
const profitMarginChartInstance = ref<echarts.ECharts | null>(null)
const netProfitMarginChartInstance = ref<echarts.ECharts | null>(null)
const assetLiabilityChartInstance = ref<echarts.ECharts | null>(null)
const inventoryChartInstance = ref<echarts.ECharts | null>(null)

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

// 营业收入数据
const revenueMonths = ref<string[]>([])
const revenueMonthlyData = ref<any>({})
const revenueSummary = ref<any>({})

// 营业收入类别配置
const revenueCategories = {
  main: { name: '主营业务', color: '#3B82F6' },
  nonMain: { name: '非主营业务', color: '#10B981' }
}

// 净利润数据
const netProfitMonths = ref<string[]>([])
const netProfitMonthlyData = ref<any>({})
const netProfitSummary = ref<any>({})

// ROE数据
const roeMonths = ref<string[]>([])
const roeMonthlyData = ref<any>({})
const roeSummary = ref<any>({})

// 边际贡献率数据
const contributionRateMonths = ref<string[]>([])
const contributionRateMonthlyData = ref<number[]>([])
const contributionRateCurrentRate = ref(0)
const contributionRateTargetRate = ref(21.98)

// 毛利率数据
const profitMarginMonths = ref<string[]>([])
const profitMarginMonthlyData = ref<number[]>([])
const profitMarginCurrentRate = ref(0)
const profitMarginTargetRate = ref(21.99)

// 净利率数据
const netProfitMarginMonths = ref<string[]>([])
const netProfitMarginMonthlyData = ref<number[]>([])
const netProfitMarginCurrentRate = ref(0)
const netProfitMarginTargetRate = ref(8.0)

// 资产负债率数据
const assetLiabilityMonths = ref<string[]>([])
const assetLiabilityMonthlyData = ref<number[]>([])
const assetLiabilityCurrentRate = ref(0)
const assetLiabilityTargetRate = ref(74.0)

// 存量指标数据
const inventoryMonths = ref<string[]>([])
const inventoryMonthlyData = ref<any[]>([])
const inventoryCurrentTotal = ref(0)

// 概览数据
const overview = ref({
  revenue: 125680000, // 营业收入（万元）
  netProfit: 8950000,  // 净利润（万元）
  assetLiabilityRatio: 65.8, // 资产负债率
  roe: 12.5 // ROE
})

// 分析模块完成率数据
const analysisModuleCompletionRates = ref({
  businessIncome: 85,
  netProfit: 92,
  contributionRate: 78,
  profitMargin: 88,
  netProfitMargin: 76,
  assetLiabilityRatio: 90,
  roe: 82,
  inventoryMetrics: 75
})

// ROE数据
const roeData = ref({
  roe: 12.5
})

// 净利率数据
const netProfitMarginRate = ref(6.85)

// 资产负债率数据
const assetLiabilityRatio = ref(65.8)

// 存量指标数据
const inventoryMetricsTotal = ref(85000)

// 刷新状态
const isRefreshing = ref(false)

// 工具函数
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 }) + '万'
  }
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 获取营业收入数据
const fetchBusinessIncomeData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/business-income/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        revenueMonths.value = result.data.months || []
        revenueMonthlyData.value = result.data.monthlyData || {}

        // 使用固定的年度计划值
        const hardcodedPlans = {
          main: 59400,
          nonMain: 600
        }

        // 使用API返回的汇总数据，但覆盖年度计划值
        revenueSummary.value = {
          main: {
            yearlyPlan: hardcodedPlans.main,
            currentTotal: result.data.summary?.main?.currentTotal || 0,
            completion_rate: result.data.summary?.main?.currentTotal ? Math.round((result.data.summary.main.currentTotal / hardcodedPlans.main) * 100) : 0
          },
          nonMain: {
            yearlyPlan: hardcodedPlans.nonMain,
            currentTotal: result.data.summary?.nonMain?.currentTotal || 0,
            completion_rate: result.data.summary?.nonMain?.currentTotal ? Math.round((result.data.summary.nonMain.currentTotal / hardcodedPlans.nonMain) * 100) : 0
          }
        }

        // 更新monthlyData中的yearlyPlan
        if (revenueMonthlyData.value.main) revenueMonthlyData.value.main.yearlyPlan = hardcodedPlans.main
        if (revenueMonthlyData.value.nonMain) revenueMonthlyData.value.nonMain.yearlyPlan = hardcodedPlans.nonMain
      } else {
        // 没有数据时重置为默认值
        resetRevenueData()
      }
    } else {
      // 请求失败时重置为默认值
      resetRevenueData()
    }
  } catch (error) {
    console.error('获取营业收入数据失败:', error)
    // 出错时重置为默认值
    resetRevenueData()
  }
}

// 重置营业收入数据
const resetRevenueData = () => {
  revenueMonths.value = []
  revenueMonthlyData.value = {}
  revenueSummary.value = {}
}

// 获取净利润数据
const fetchNetProfitData = async () => {
  try {
    console.log('Fetching net profit data for year:', currentYear.value)
    const response = await fetch(`http://127.0.0.1:3000/analytics/net-profit/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      console.log('Net profit data response:', result)
      if (result.success && result.data) {
        netProfitMonths.value = result.data.months || []
        netProfitMonthlyData.value = result.data.monthlyData || {}
        netProfitSummary.value = result.data.summary || {}
        console.log('Net profit chart data:', {
          months: netProfitMonths.value,
          monthlyData: netProfitMonthlyData.value,
          hasCurrentTotal: !!(netProfitMonthlyData.value && netProfitMonthlyData.value.currentTotal)
        })
      } else {
        console.log('No net profit data available')
        resetNetProfitData()
      }
    } else {
      console.log('Net profit API request failed')
      resetNetProfitData()
    }
  } catch (error) {
    console.error('获取净利润数据失败:', error)
    resetNetProfitData()
  }
}

const resetNetProfitData = () => {
  netProfitMonths.value = []
  netProfitMonthlyData.value = {}
  netProfitSummary.value = {}
}

// 获取ROE数据
const fetchROEData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/roe/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        roeMonths.value = result.data.months || []
        roeMonthlyData.value = result.data.monthlyData || { roe: [] }

        const latestROE = result.data.monthlyData?.roe && result.data.monthlyData.roe.length > 0 ?
          result.data.monthlyData.roe[result.data.monthlyData.roe.length - 1] / 1000 : 0

        roeSummary.value = {
          currentROE: latestROE,
          completion_rate: latestROE / 20 * 100,
          targetROE: 20
        }
      } else {
        resetROEData()
      }
    } else {
      resetROEData()
    }
  } catch (error) {
    console.error('获取ROE数据失败:', error)
    resetROEData()
  }
}

const resetROEData = () => {
  roeMonths.value = []
  roeMonthlyData.value = { roe: [] }
  roeSummary.value = { currentROE: 0, completion_rate: 0, targetROE: 20 }
}

// 获取边际贡献率数据
const fetchContributionRateData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/contribution-rate/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.hasData !== false) {
        contributionRateMonths.value = result.data.months || []
        contributionRateMonthlyData.value = result.data.monthlyData || []
        contributionRateCurrentRate.value = result.data.currentRate || 0
      } else {
        resetContributionRateData()
      }
    } else {
      resetContributionRateData()
    }
  } catch (error) {
    console.error('获取边际贡献率数据失败:', error)
    resetContributionRateData()
  }
}

const resetContributionRateData = () => {
  contributionRateMonths.value = []
  contributionRateMonthlyData.value = []
  contributionRateCurrentRate.value = 0
}

// 获取毛利率数据
const fetchProfitMarginData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/profit-margin/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.hasData !== false) {
        profitMarginMonths.value = result.data.months || []
        profitMarginMonthlyData.value = result.data.monthlyData || []
        profitMarginCurrentRate.value = result.data.currentRate || 0
      } else {
        resetProfitMarginData()
      }
    } else {
      resetProfitMarginData()
    }
  } catch (error) {
    console.error('获取毛利率数据失败:', error)
    resetProfitMarginData()
  }
}

const resetProfitMarginData = () => {
  profitMarginMonths.value = []
  profitMarginMonthlyData.value = []
  profitMarginCurrentRate.value = 0
}

// 获取净利率数据
const fetchNetProfitMarginData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/net-profit-margin/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.hasData !== false) {
        netProfitMarginMonths.value = result.data.months || []
        netProfitMarginMonthlyData.value = result.data.monthlyData || []
        netProfitMarginCurrentRate.value = result.data.currentRate || 0
        netProfitMarginTargetRate.value = result.data.targetRate || 8.0
      } else {
        resetNetProfitMarginData()
      }
    } else {
      resetNetProfitMarginData()
    }
  } catch (error) {
    console.error('获取净利率数据失败:', error)
    resetNetProfitMarginData()
  }
}

const resetNetProfitMarginData = () => {
  netProfitMarginMonths.value = []
  netProfitMarginMonthlyData.value = []
  netProfitMarginCurrentRate.value = 0
}

// 获取资产负债率数据
const fetchAssetLiabilityData = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/analytics/asset-liability-ratio/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.hasData !== false) {
        assetLiabilityMonths.value = result.data.months || []
        assetLiabilityMonthlyData.value = result.data.monthlyData || []
        assetLiabilityCurrentRate.value = result.data.currentRate || 0
        assetLiabilityTargetRate.value = result.data.targetRate || 74.0
      } else {
        resetAssetLiabilityData()
      }
    } else {
      resetAssetLiabilityData()
    }
  } catch (error) {
    console.error('获取资产负债率数据失败:', error)
    resetAssetLiabilityData()
  }
}

const resetAssetLiabilityData = () => {
  assetLiabilityMonths.value = []
  assetLiabilityMonthlyData.value = []
  assetLiabilityCurrentRate.value = 0
}

// 获取存量指标数据
const fetchInventoryData = async () => {
  try {
    console.log('Fetching inventory data for year:', currentYear.value)
    const response = await fetch(`http://127.0.0.1:3000/analytics/inventory-metrics/${currentYear.value}`)
    if (response.ok) {
      const result = await response.json()
      console.log('Inventory data response:', result)
      if (result.success && result.data) {
        inventoryMonths.value = result.data.months || []
        inventoryMonthlyData.value = result.data.monthlyData || []
        inventoryCurrentTotal.value = result.data.currentTotal || 0
        console.log('Inventory chart data:', {
          months: inventoryMonths.value,
          monthlyData: inventoryMonthlyData.value,
          currentTotal: inventoryCurrentTotal.value,
          hasData: inventoryMonths.value.length > 0 && inventoryMonthlyData.value.length > 0
        })
      } else {
        console.log('No inventory data available')
        resetInventoryData()
      }
    } else {
      console.log('Inventory API request failed')
      resetInventoryData()
    }
  } catch (error) {
    console.error('获取存量指标数据失败:', error)
    resetInventoryData()
  }
}

const resetInventoryData = () => {
  inventoryMonths.value = []
  inventoryMonthlyData.value = []
  inventoryCurrentTotal.value = 0
}

// 获取分析数据
const fetchAnalyticsData = async () => {
  try {
    await Promise.all([
      fetchBusinessIncomeData(),
      fetchNetProfitData(),
      fetchROEData(),
      fetchContributionRateData(),
      fetchProfitMarginData(),
      fetchNetProfitMarginData(),
      fetchAssetLiabilityData(),
      fetchInventoryData()
    ])
    updateAllCharts()
    // 同时更新指标统计
    await refreshMetricsData()
  } catch (error) {
    console.error('获取分析数据失败:', error)
  }
}

// 刷新指标数据统计
const refreshMetricsData = async () => {
  isRefreshing.value = true
  try {
    // 并行检查所有API接口的数据状态
    const promises = metricsDetails.value.map(async (metric) => {
      try {
        const apiUrl = metric.api.replace(':year', currentYear.value)
        const response = await fetch(`http://127.0.0.1:3000${apiUrl}`)
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

// 初始化图表
const initCharts = () => {
  // 营业收入趋势图
  if (revenueChartRef.value) {
    revenueChartInstance.value = echarts.init(revenueChartRef.value)
  }
  // 净利润趋势图
  if (netProfitChartRef.value) {
    netProfitChartInstance.value = echarts.init(netProfitChartRef.value)
  }
  // ROE趋势图
  if (roeChartRef.value) {
    roeChartInstance.value = echarts.init(roeChartRef.value)
  }
  // 边际贡献率趋势图
  if (contributionRateChartRef.value) {
    contributionRateChartInstance.value = echarts.init(contributionRateChartRef.value)
  }
  // 毛利率趋势图
  if (profitMarginChartRef.value) {
    profitMarginChartInstance.value = echarts.init(profitMarginChartRef.value)
  }
  // 净利率趋势图
  if (netProfitMarginChartRef.value) {
    netProfitMarginChartInstance.value = echarts.init(netProfitMarginChartRef.value)
  }
  // 资产负债率趋势图
  if (assetLiabilityChartRef.value) {
    assetLiabilityChartInstance.value = echarts.init(assetLiabilityChartRef.value)
  }
  // 存量指标趋势图
  if (inventoryChartRef.value) {
    inventoryChartInstance.value = echarts.init(inventoryChartRef.value)
  }
}

// 更新营业收入图表
const updateRevenueChart = () => {
  if (!revenueChartInstance.value) return

  const series: any[] = []

  // 检查是否有数据
  const hasData = revenueMonths.value.length > 0 && Object.keys(revenueMonthlyData.value).length > 0

  if (hasData) {
    // 为每个类别创建月度变化趋势线
    Object.keys(revenueCategories).forEach((key) => {
      const categoryData = revenueMonthlyData.value[key]
      const categoryInfo = revenueCategories[key as keyof typeof revenueCategories]

      if (categoryData && categoryData.currentTotal) {
        // 当期累计线
        series.push({
          name: `${categoryInfo.name}`,
          type: 'line',
          data: categoryData.currentTotal,
          smooth: true,
          lineStyle: {
            color: categoryInfo.color,
            width: 3
          },
          itemStyle: {
            color: categoryInfo.color
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: categoryInfo.color + '40' },
              { offset: 1, color: categoryInfo.color + '10' }
            ])
          }
        })
      }
    })
  }

  const option = {
    title: {
      text: `${currentYear.value}年营业收入月度趋势`,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any[]) {
        if (!hasData) return '暂无数据'
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>`
        })
        return result
      }
    },
    legend: {
      top: 40,
      type: 'scroll'
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hasData ? revenueMonths.value : [],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: function(value: number) {
          return formatNumber(value)
        },
        fontSize: 12
      }
    },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '暂无数据',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#999'
      }
    }]
  }

  revenueChartInstance.value.setOption(option, true)
}

// 更新净利润图表
const updateNetProfitChart = () => {
  if (!netProfitChartInstance.value) {
    console.log('Net profit chart instance not available')
    return
  }

  // 检查数据结构，NetProfitChart.vue中使用的是monthlyData.currentTotal
  const hasData = netProfitMonths.value.length > 0 && netProfitMonthlyData.value && netProfitMonthlyData.value.currentTotal
  console.log('Net profit chart update:', {
    hasMonths: netProfitMonths.value.length > 0,
    hasMonthlyData: !!netProfitMonthlyData.value,
    hasCurrentTotal: !!(netProfitMonthlyData.value && netProfitMonthlyData.value.currentTotal),
    hasData,
    months: netProfitMonths.value,
    currentTotal: netProfitMonthlyData.value?.currentTotal
  })
  const series: any[] = []

  if (hasData) {
    series.push({
      name: '净利润',
      type: 'line',
      data: netProfitMonthlyData.value.currentTotal,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })
  }

  const option = {
    title: { text: `${currentYear.value}年净利润月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? netProfitMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '万元', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  netProfitChartInstance.value.setOption(option, true)
}

// 更新ROE图表
const updateROEChart = () => {
  if (!roeChartInstance.value) return

  const hasData = roeMonths.value.length > 0 && roeMonthlyData.value.roe && roeMonthlyData.value.roe.length > 0
  const series: any[] = []

  if (hasData) {
    const roeData = roeMonthlyData.value.roe.map((value: number) => value / 1000)
    const targetData = roeMonths.value.map(() => 20)

    series.push({
      name: '实际ROE',
      type: 'line',
      data: roeData,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })

    series.push({
      name: '目标线',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年ROE月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? roeMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  roeChartInstance.value.setOption(option, true)
}

// 更新边际贡献率图表
const updateContributionRateChart = () => {
  if (!contributionRateChartInstance.value) return

  const hasData = contributionRateMonths.value.length > 0 && contributionRateMonthlyData.value.length > 0
  const series: any[] = []

  if (hasData) {
    const targetData = contributionRateMonths.value.map(() => contributionRateTargetRate.value)

    series.push({
      name: '实际贡献率',
      type: 'line',
      data: contributionRateMonthlyData.value,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })

    series.push({
      name: '计划目标线',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年边际贡献率月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? contributionRateMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  contributionRateChartInstance.value.setOption(option, true)
}

// 更新毛利率图表
const updateProfitMarginChart = () => {
  if (!profitMarginChartInstance.value) return

  const hasData = profitMarginMonths.value.length > 0 && profitMarginMonthlyData.value.length > 0
  const series: any[] = []

  if (hasData) {
    const targetData = profitMarginMonths.value.map(() => profitMarginTargetRate.value)

    series.push({
      name: '实际毛利率',
      type: 'line',
      data: profitMarginMonthlyData.value,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })

    series.push({
      name: '目标毛利率',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年毛利率月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? profitMarginMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  profitMarginChartInstance.value.setOption(option, true)
}

// 更新净利率图表
const updateNetProfitMarginChart = () => {
  if (!netProfitMarginChartInstance.value) return

  const hasData = netProfitMarginMonths.value.length > 0 && netProfitMarginMonthlyData.value.length > 0
  const series: any[] = []

  if (hasData) {
    const targetData = netProfitMarginMonths.value.map(() => netProfitMarginTargetRate.value)

    series.push({
      name: '实际净利率',
      type: 'line',
      data: netProfitMarginMonthlyData.value,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })

    series.push({
      name: '目标线',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年净利率月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? netProfitMarginMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  netProfitMarginChartInstance.value.setOption(option, true)
}

// 更新资产负债率图表
const updateAssetLiabilityChart = () => {
  if (!assetLiabilityChartInstance.value) return

  const hasData = assetLiabilityMonths.value.length > 0 && assetLiabilityMonthlyData.value.length > 0
  const series: any[] = []

  if (hasData) {
    const targetData = assetLiabilityMonths.value.map(() => assetLiabilityTargetRate.value)

    series.push({
      name: '实际负债率',
      type: 'line',
      data: assetLiabilityMonthlyData.value,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })

    series.push({
      name: '目标线',
      type: 'line',
      data: targetData,
      lineStyle: { color: '#EF4444', width: 2, type: 'dashed' },
      itemStyle: { color: '#EF4444' },
      symbol: 'none'
    })
  }

  const option = {
    title: { text: `${currentYear.value}年资产负债率月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)}%<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? assetLiabilityMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '百分比(%)', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) + '%' }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  assetLiabilityChartInstance.value.setOption(option, true)
}

// 更新存量指标图表
const updateInventoryChart = () => {
  if (!inventoryChartInstance.value) {
    console.log('Inventory chart instance not available')
    return
  }

  const hasData = inventoryMonths.value.length > 0 && inventoryMonthlyData.value.length > 0
  console.log('Inventory chart update:', {
    hasMonths: inventoryMonths.value.length > 0,
    hasMonthlyData: inventoryMonthlyData.value.length > 0,
    hasData,
    months: inventoryMonths.value,
    monthlyData: inventoryMonthlyData.value
  })
  const series: any[] = []

  if (hasData) {
    // 从monthlyData中提取total数据
    const totalData = inventoryMonthlyData.value.map(item => item.total || 0)

    series.push({
      name: '存量总计',
      type: 'line',
      data: totalData,
      smooth: true,
      lineStyle: { color: '#3B82F6', width: 3 },
      itemStyle: { color: '#3B82F6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3B82F640' },
          { offset: 1, color: '#3B82F610' }
        ])
      }
    })
  }

  const option = {
    title: { text: `${currentYear.value}年存量指标月度趋势`, textStyle: { fontSize: 16, fontWeight: 'bold', color: '#374151' }, left: 'center', top: 10 },
    tooltip: { trigger: 'axis', formatter: function(params: any[]) { if (!hasData) return '暂无数据'; let result = `${params[0].name}<br/>`; params.forEach(param => { result += `${param.seriesName}: ${formatNumber(param.value)} 万元<br/>` }); return result } },
    legend: { top: 40, type: 'scroll' },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: hasData ? inventoryMonths.value : [], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '万元', nameTextStyle: { fontSize: 12 }, axisLabel: { formatter: function(value: number) { return formatNumber(value) }, fontSize: 12 } },
    series: hasData ? series : [],
    graphic: hasData ? [] : [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无数据', fontSize: 16, fontWeight: 'bold', fill: '#999' } }]
  }

  inventoryChartInstance.value.setOption(option, true)
}

// 更新所有图表
const updateAllCharts = () => {
  updateRevenueChart()
  updateNetProfitChart()
  updateROEChart()
  updateContributionRateChart()
  updateProfitMarginChart()
  updateNetProfitMarginChart()
  updateAssetLiabilityChart()
  updateInventoryChart()
}

// 响应式处理
const handleResize = () => {
  revenueChartInstance.value?.resize()
  netProfitChartInstance.value?.resize()
  roeChartInstance.value?.resize()
  contributionRateChartInstance.value?.resize()
  profitMarginChartInstance.value?.resize()
  netProfitMarginChartInstance.value?.resize()
  assetLiabilityChartInstance.value?.resize()
  inventoryChartInstance.value?.resize()
}

onMounted(async () => {
  initCharts()
  // 初始化统计数据
  updateMetricsStatistics()
  await fetchAnalyticsData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  revenueChartInstance.value?.dispose()
  netProfitChartInstance.value?.dispose()
  roeChartInstance.value?.dispose()
  contributionRateChartInstance.value?.dispose()
  profitMarginChartInstance.value?.dispose()
  netProfitMarginChartInstance.value?.dispose()
  assetLiabilityChartInstance.value?.dispose()
  inventoryChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
