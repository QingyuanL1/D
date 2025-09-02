<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ getCompanyTitle() }}</h1>
        <p class="text-gray-600 mt-2">欢迎回来，{{ dashboardData?.user?.username }}</p>
      </div>

      <!-- 系统公告 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">系统公告</h3>
          <div class="flex items-center space-x-2">
            <button @click="refreshAnnouncements" class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="刷新公告">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
            </button>
            <span v-if="announcements.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ announcements.length }} 条未读
            </span>
          </div>
        </div>

        <div v-if="loadingAnnouncements" class="text-center py-8 text-gray-500">
          <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2">
          </div>
          <p class="text-sm">加载公告中...</p>
        </div>

        <div v-else-if="announcements.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
          </svg>
          <p class="text-sm">暂无新公告</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="announcement in announcements" :key="announcement.id"
            class="p-4 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-sm"
            :class="getAnnouncementClasses(announcement.type)" @click="viewAnnouncementDetail(announcement)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="font-medium text-gray-900">{{ announcement.title }}</h4>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="getTypeClasses(announcement.type)">
                    {{ getTypeText(announcement.type) }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-2 line-clamp-3">{{ announcement.content }}</p>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-500">{{ formatDate(announcement.created_at) }}</p>
                  <button @click.stop="markAsRead(announcement.id)"
                    class="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    标记已读
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 查看更多按钮 -->
        <div v-if="announcements.length > 0" class="mt-4 text-center">
          <router-link to="/admin/notifications"
            class="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            v-if="userStore.userInfo?.role_name === 'super_admin' || userStore.userInfo?.role_name === 'admin'">
            管理所有通知
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <!-- 概览卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">可访问模块</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardData?.overview?.total_readable_modules || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">可填写模块</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardData?.overview?.total_writable_modules || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">本月已提交</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardData?.overview?.current_month_submitted || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">待填写</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardData?.overview?.current_month_pending || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据分析入口 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">南华兰陵实业数据分析中心</h3>

        <!-- 第一行：基础财务分析指标 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <!-- ROE分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ Math.min(Math.max(roeData.roe / 21.18 * 100, 3),
                  100).toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">净资产收益率(ROE)</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析净资产收益率变化趋势</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(roeData.roe / 21.18 * 100, 3), 100)}%;`"></div>
              </div>
            </div>
            <router-link to="/analytics/roe-chart?company=nanhua"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="handleNavigation">
              查看详情
            </router-link>
          </div>

          <!-- 净利润分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ analysisModuleCompletionRates.netProfit }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">净利润分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析净利润结构与完成情况</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${analysisModuleCompletionRates.netProfit}%;`"></div>
              </div>
            </div>
            <router-link to="/analytics/net-profit-chart?company=nanhua"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="handleNavigation">
              查看详情
            </router-link>
          </div>

          <!-- 资产负债率分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                  </path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ Math.min(Math.max(assetLiabilityRatio / 74 * 100,
                  3), 100).toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">资产负债率分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析资产负债率变化与风险控制</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(assetLiabilityRatio / 74 * 100, 3), 100)}%;`"></div>
              </div>
            </div>
            <router-link to="/analytics/asset-liability-ratio-chart?company=nanhua"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="handleNavigation">
              查看详情
            </router-link>
          </div>

          <!-- 南华毛利率分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ Math.min(Math.max(nanhuaProfitMarginRate / 24 * 100,
                  3), 100).toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">南华毛利率分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析南华各客户类型毛利率结构与趋势</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(nanhuaProfitMarginRate / 24 * 100, 3), 100)}%;`"></div>
              </div>
            </div>
            <router-link to="/analytics/nanhua-profit-margin-chart"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="handleNavigation">
              查看详情
            </router-link>
          </div>
        </div>

        <!-- 第二行：业务分析指标 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 南华营业收入分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                  </path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ Math.min(Math.max(nanhuaBusinessIncomeRate /
                  20833.54 * 100, 3), 100).toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">南华营业收入分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析南华各客户累计收入与年度计划完成情况</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(nanhuaBusinessIncomeRate / 20833.54 * 100, 3), 100)}%;`"></div>
              </div>
            </div>
            <router-link to="/analytics/nanhua-business-income-chart"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="handleNavigation">
              查看详情
            </router-link>
          </div>

          <!-- 南华边际贡献率分析卡片 -->
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
                <div class="text-sm font-semibold text-blue-600">{{ nanhuaContributionRateData.currentRate }}%</div>
                <div class="text-xs text-gray-500">边际贡献率</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">边际贡献率分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析南华公司边际贡献率月度趋势</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${nanhuaContributionRateData.currentRate > 0 ? Math.min(nanhuaContributionRateData.currentRate / nanhuaContributionRateData.targetRate * 100, 100) : 3}%;`">
                </div>
              </div>
            </div>
            <router-link to="/analytics/nanhua-contribution-rate-chart"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              查看趋势
            </router-link>
          </div>

          <!-- 南华成本中心分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2m0 0V7a2 2 0 012-2h14a2 2 0 012 2v2M7 7V3a2 2 0 012-2h6a2 2 0 012 2v4M9 11v6">
                  </path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ nanhuaCostCenterCompletionRate }}%</div>
                <div class="text-xs text-gray-500">执行率</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">成本中心结构分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析南华成本中心月度趋势与计入损益完成情况</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${nanhuaCostCenterCompletionRate > 0 ? Math.min(nanhuaCostCenterCompletionRate, 100) : 3}%;`">
                </div>
              </div>
            </div>
            <router-link to="/analytics/nanhua-cost-center-chart"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              查看详情
            </router-link>
          </div>

          <!-- 南华新签订单分析卡片 -->
          <div
            class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ nanhuaNewOrdersCompletionRate }}%</div>
                <div class="text-xs text-gray-500">完成率</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">新签订单分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">分析南华新签订单月度趋势与年度计划完成情况</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${nanhuaNewOrdersCompletionRate > 0 ? Math.min(nanhuaNewOrdersCompletionRate, 100) : 3}%;`">
                </div>
              </div>
            </div>
            <router-link to="/analytics/nanhua-new-orders-chart"
              class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              查看详情
            </router-link>
          </div>
        </div>
      </div>


      <!-- 完成率和未完成表单 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 完成率饼图 -->
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">本月完成率</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-32 h-32">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-gray-300" stroke="currentColor" stroke-width="2" fill="none"
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831" />
                <path class="text-blue-600" stroke="currentColor" stroke-width="2" fill="none"
                  :stroke-dasharray="`${completionRate}, 100`"
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-900">{{ completionRate }}%</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>已完成: {{ dashboardData?.overview?.current_month_submitted || 0 }}</span>
              <span>待完成: {{ dashboardData?.overview?.current_month_pending || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 未完成表单列表 -->
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">待填写表单 (本月)</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto" v-if="dashboardData?.pending_forms?.length">
            <div v-for="form in dashboardData.pending_forms" :key="form.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">{{ form.module_name }}</p>
                <p class="text-sm text-gray-600">{{ form.module_category }}</p>
              </div>
              <router-link :to="form.route_path"
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                填写
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>恭喜！本月所有表单都已完成</p>
          </div>
        </div>
      </div>


      <!-- 分类统计 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">各分类完成情况</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="category in dashboardData?.category_statistics" :key="category.module_category"
            class="p-4 border rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ category.module_category }}</h4>
              <span class="text-sm font-bold text-blue-600">{{ category.completion_rate }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="`width: ${category.completion_rate}%`"></div>
            </div>
            <p class="text-sm text-gray-600">
              {{ category.submitted_count }} / {{ category.total_writable }} 已完成
            </p>
          </div>
        </div>
      </div>



    </div>

    <!-- 公告详情模态框 -->
    <div v-if="showAnnouncementDetail"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeAnnouncementDetail">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">公告详情</h3>
          <button @click="closeAnnouncementDetail" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedAnnouncement" class="space-y-4">
          <div class="flex items-center space-x-2">
            <h4 class="text-lg font-medium text-gray-900">{{ selectedAnnouncement.title }}</h4>
            <span class="px-2 py-1 text-xs rounded-full" :class="getTypeClasses(selectedAnnouncement.type)">
              {{ getTypeText(selectedAnnouncement.type) }}
            </span>
          </div>

          <div class="text-sm text-gray-500">
            发布时间: {{ formatDate(selectedAnnouncement.created_at) }}
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ selectedAnnouncement.content }}</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button @click="closeAnnouncementDetail"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              关闭
            </button>
            <button @click="markAsReadAndClose(selectedAnnouncement.id)"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              标记已读
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'
import storage from 'store'
import ContributionRateCard from '@/views/analytics/ContributionRateCard.vue'
import ProfitMarginCard from '@/views/analytics/ProfitMarginCard.vue'
import { safeFetch, handleApiError, retryWithDelay } from '@/utils/errorHandler'

interface DashboardData {
  user: {
    username: string
    email: string
    role_name: string
    role_description: string
  }
  current_period: string
  overview: {
    total_readable_modules: number
    total_writable_modules: number
    current_month_submitted: number
    current_month_pending: number
    completion_rate: number
  }
  pending_forms: Array<{
    id: number
    module_name: string
    module_category: string
    route_path: string
  }>
  category_statistics: Array<{
    module_category: string
    total_writable: number
    submitted_count: number
    completion_rate: string
  }>
}

interface Announcement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'error'
  created_at: string
}

// ECharts相关接口
interface IncomeStatementItem {
  period: string;
  data: string | {
    main_business_revenue?: {
      current_amount: number | null;
      year_amount: number | null;
    };
    net_profit?: {
      current_amount: number | null;
      year_amount: number | null;
    };
  };
}

interface ChartDataType {
  periods: string[];
  mainBusinessRevenue: number[];
  netProfit: number[];
}

interface ROEData {
  netProfit: number;
  shareholderEquity: number;
  roe: number;
  year: number;
  lastUpdated: string;
}

const router = useRouter()
const userStore = useUserStore()
const dashboardData = ref<DashboardData | null>(null)
const announcements = ref<Announcement[]>([])

// ROE数据
const roeData = ref<ROEData>({
  netProfit: 0,
  shareholderEquity: 0,
  roe: 0,
  year: new Date().getFullYear(),
  lastUpdated: ''
})

// 净利率数据
const netProfitMarginRate = ref(0)

// 资产负债率数据
const assetLiabilityRatio = ref(0)

// 南华毛利率数据
const nanhuaProfitMarginRate = ref(0)

// 南华营业收入数据
const nanhuaBusinessIncomeRate = ref(0)

// 南华边际贡献率数据
const nanhuaContributionRateData = ref({
  currentRate: 0,
  targetRate: 25.0
})

// 南华成本中心完成率数据
const nanhuaCostCenterCompletionRate = ref(0)

// 南华新签订单完成率数据
const nanhuaNewOrdersCompletionRate = ref(0)



// 公告详情相关
const showAnnouncementDetail = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)
const loading = ref(true)
const loadingAnnouncements = ref(false)

// 图表相关变量
const revenueChartRef = ref<HTMLElement | null>(null)
const profitChartRef = ref<HTMLElement | null>(null)
const selectedYear = ref(new Date().getFullYear().toString())
const availableYears = ref<string[]>([])
const revenueChartInstance = ref<echarts.ECharts | null>(null)
const profitChartInstance = ref<echarts.ECharts | null>(null)
const chartData = ref<ChartDataType>({
  periods: [],
  mainBusinessRevenue: [],
  netProfit: []
})

const completionRate = computed(() => {
  return dashboardData.value?.overview?.completion_rate || 0
})

// 各分析模块的完成率（从API获取真实数据）
const analysisModuleCompletionRates = ref({
  newOrders: 0,
  costCenter: 0,
  businessIncome: 0,
  netProfit: 0
})

// 计算属性：确保进度条数值的有效性
const safeCompletionRates = computed(() => {
  const getProgressWidth = (value: number) => {
    const safeValue = Math.max(0, Math.min(100, value || 0))
    // 如果数值大于0但小于3，设置最小宽度为3%，以便可见
    return safeValue > 0 && safeValue < 3 ? 3 : safeValue
  }

  return {
    newOrders: getProgressWidth(analysisModuleCompletionRates.value.newOrders),
    costCenter: getProgressWidth(analysisModuleCompletionRates.value.costCenter),
    businessIncome: getProgressWidth(analysisModuleCompletionRates.value.businessIncome),
    netProfit: getProgressWidth(analysisModuleCompletionRates.value.netProfit)
  }
})

const fetchDashboardData = async () => {
  try {
    const userId = userStore.userInfo?.id || 1

    // 从localStorage获取用户选择的公司
    const selectedCompany = localStorage.getItem('selectedCompany') || ''

    // 公司名称映射到数据库中的分类名
    const companyMapping: { [key: string]: string } = {
      '常州拓源电气集团有限公司': '拓源公司',
      '上海南华兰陵电气有限公司': '南华公司',
      '上海南华兰陵实业有限公司': '南华公司'
    }

    const companyName = companyMapping[selectedCompany] || '南华公司'  // 默认为南华公司

    // 使用重试机制获取数据
    const result = await retryWithDelay(async () => {
      const response = await safeFetch(
        `http://47.111.95.19:3000/dashboard/company/${userId}/${encodeURIComponent(companyName)}`,
        { method: 'GET' },
        '获取仪表板数据'
      )
      return await response.json()
    }, 2, 1000) // 最多重试2次，延迟1秒

    if (result.success) {
      dashboardData.value = result.data
    } else {
      console.warn('仪表板数据获取失败:', result.message)
      // 提供默认数据
      dashboardData.value = getDefaultDashboardData()
    }
  } catch (error) {
    const apiError = handleApiError(error, '获取仪表板数据')
    console.error('获取仪表板数据失败:', apiError.message)
    // 提供默认数据以防止页面崩溃
    dashboardData.value = getDefaultDashboardData()
  }
}

// 提供默认仪表板数据的辅助函数
const getDefaultDashboardData = (): DashboardData => ({
  user: { username: '用户', email: '', role_name: '', role_description: '' },
  current_period: new Date().toISOString().slice(0, 7),
  overview: {
    total_readable_modules: 0,
    total_writable_modules: 0,
    current_month_submitted: 0,
    current_month_pending: 0,
    completion_rate: 0
  },
  pending_forms: [],
  category_statistics: []
})

const fetchAnnouncements = async () => {
  try {
    loadingAnnouncements.value = true
    const userId = userStore.userInfo?.id || 1
    const response = await fetch(`http://47.111.95.19:3000/notifications/unread/${userId}?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加超时处理
      signal: AbortSignal.timeout(8000) // 8秒超时
    })

    if (!response.ok) {
      throw new Error(`获取公告失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      // 将通知数据转换为公告格式
      announcements.value = result.data.map((notification: any) => ({
        id: notification.id,
        title: notification.title || '无标题',
        content: notification.content || '无内容',
        type: notification.type || 'info',
        created_at: notification.created_at || new Date().toISOString()
      }))
    } else {
      announcements.value = []
    }
  } catch (error) {
    console.error('获取公告失败:', error)
    // 如果新API失败，回退到旧的API
    try {
      const response = await fetch('http://47.111.95.19:3000/dashboard/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000)
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          announcements.value = result.data
        } else {
          announcements.value = []
        }
      } else {
        announcements.value = []
      }
    } catch (fallbackError) {
      console.error('回退API也失败:', fallbackError)
      announcements.value = []
    }
  } finally {
    loadingAnnouncements.value = false
  }
}

// 刷新公告
const refreshAnnouncements = () => {
  fetchAnnouncements()
}

// 查看公告详情
const viewAnnouncementDetail = (announcement: Announcement) => {
  selectedAnnouncement.value = announcement
  showAnnouncementDetail.value = true
}

// 关闭公告详情
const closeAnnouncementDetail = () => {
  showAnnouncementDetail.value = false
  selectedAnnouncement.value = null
}

// 标记已读并关闭详情
const markAsReadAndClose = async (notificationId: number) => {
  await markAsRead(notificationId)
  closeAnnouncementDetail()
}

// 标记公告为已读
const markAsRead = async (notificationId: number) => {
  try {
    const userId = userStore.userInfo?.id || 1
    const response = await fetch(`http://47.111.95.19:3000/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    })

    if (response.ok) {
      // 从列表中移除已读的公告
      announcements.value = announcements.value.filter(a => a.id !== notificationId)
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 获取公告样式类
const getAnnouncementClasses = (type: string) => {
  const classes = {
    'info': 'border-blue-400 bg-blue-50',
    'warning': 'border-yellow-400 bg-yellow-50',
    'error': 'border-red-400 bg-red-50',
    'success': 'border-green-400 bg-green-50'
  }
  return classes[type as keyof typeof classes] || classes.info
}

// 获取类型样式类
const getTypeClasses = (type: string) => {
  const classes = {
    'info': 'bg-blue-100 text-blue-800',
    'warning': 'bg-yellow-100 text-yellow-800',
    'error': 'bg-red-100 text-red-800',
    'success': 'bg-green-100 text-green-800'
  }
  return classes[type as keyof typeof classes] || classes.info
}

// 获取类型文本
const getTypeText = (type: string) => {
  const texts = {
    'info': '信息',
    'warning': '警告',
    'error': '错误',
    'success': '成功'
  }
  return texts[type as keyof typeof texts] || '信息'
}

// 获取分析模块完成率
const fetchAnalysisCompletionRates = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/completion-rates/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取分析模块完成率失败')
    }

    const result = await response.json()
    if (result.success) {
      analysisModuleCompletionRates.value = {
        newOrders: result.data.newOrders || 0,
        costCenter: result.data.costCenter || 0,
        businessIncome: result.data.businessIncome || 0,
        netProfit: result.data.netProfit || 0
      }
    }
  } catch (error) {
    console.error('获取分析模块完成率失败:', error)
    // 如果API失败，使用默认值
    analysisModuleCompletionRates.value = {
      newOrders: 0,
      costCenter: 0,
      businessIncome: 0,
      netProfit: 0
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化数字显示（万元）
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toFixed(1)
}

// 获取净资产收益率数据
const fetchROEData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/roe/${currentYear}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000) // 8秒超时
    })

    if (!response.ok) {
      throw new Error(`获取净资产收益率数据失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    if (result.success && result.data) {
      // 适配新的API响应格式
      const apiData = result.data
      roeData.value = {
        netProfit: apiData.summary?.netProfit || 0,
        shareholderEquity: apiData.summary?.shareholderEquity || 0,
        roe: apiData.summary?.currentROE || 0,
        year: apiData.year || currentYear,
        lastUpdated: apiData.lastUpdated || new Date().toISOString()
      }
    } else {
      // API返回失败，显示无数据状态
      console.warn('ROE数据获取失败:', result.message)
      roeData.value = {
        netProfit: 0,
        shareholderEquity: 0,
        roe: 0,
        year: currentYear,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('获取净资产收益率数据失败:', error)
    // 网络错误或其他错误，显示无数据状态
    roeData.value = {
      netProfit: 0,
      shareholderEquity: 0,
      roe: 0,
      year: new Date().getFullYear(),
      lastUpdated: new Date().toISOString()
    }
  }
}

// 获取净利率数据
const fetchNetProfitMarginData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/net-profit-margin/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取净利率数据失败')
    }

    const result = await response.json()
    if (result.success && result.data) {
      netProfitMarginRate.value = result.data.currentRate || 0
    } else {
      console.warn('净利率数据获取失败:', result.message)
      netProfitMarginRate.value = 0
    }
  } catch (error) {
    console.error('获取净利率数据失败:', error)
    netProfitMarginRate.value = 0
  }
}

// 获取资产负债率数据
const fetchAssetLiabilityRatioData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/asset-liability-ratio/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取资产负债率数据失败')
    }

    const result = await response.json()
    if (result.success && result.data) {
      assetLiabilityRatio.value = result.data.currentRate || 0
    } else {
      console.warn('资产负债率数据获取失败:', result.message)
      assetLiabilityRatio.value = 0
    }
  } catch (error) {
    console.error('获取资产负债率数据失败:', error)
    assetLiabilityRatio.value = 0
  }
}

// 获取南华毛利率数据
const fetchNanhuaProfitMarginData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/nanhua-profit-margin/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取南华毛利率数据失败')
    }

    const result = await response.json()
    if (result.success && result.data) {
      nanhuaProfitMarginRate.value = result.data.currentRate || 0
    } else {
      console.warn('南华毛利率数据获取失败:', result.message)
      nanhuaProfitMarginRate.value = 0
    }
  } catch (error) {
    console.error('获取南华毛利率数据失败:', error)
    nanhuaProfitMarginRate.value = 0
  }
}

// 获取南华营业收入数据
const fetchNanhuaBusinessIncomeData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const period = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`

    const response = await fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`)

    if (!response.ok) {
      throw new Error('获取南华营业收入数据失败')
    }

    const result = await response.json()
    if (result.success && result.data && result.data.customers) {
      // 计算总累计收入（年初到当前月份的累计收入）
      const totalAccumulated = result.data.customers.reduce((sum: number, customer: any) => {
        return sum + (customer.accumulated || 0)
      }, 0)
      nanhuaBusinessIncomeRate.value = totalAccumulated
    } else {
      console.warn('南华营业收入数据获取失败:', result.message)
      nanhuaBusinessIncomeRate.value = 0
    }
  } catch (error) {
    console.error('获取南华营业收入数据失败:', error)
    nanhuaBusinessIncomeRate.value = 0
  }
}

// 获取南华边际贡献率数据
const fetchNanhuaContributionRateData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const period = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`

    const response = await fetch(`http://47.111.95.19:3000/nanhua-business-contribution-with-self-built/${period}`)

    if (!response.ok) {
      throw new Error('获取南华边际贡献率数据失败')
    }

    const result = await response.json()
    if (result.success && result.data && result.data.customers) {
      // 计算加权平均边际贡献率，过滤异常数据
      const validRates = result.data.customers
        .filter((customer: any) => {
          const rate = customer.current
          // 过滤掉异常数据：0, 100%, 超过100%的值
          return rate > 0 && rate < 100 && rate !== 100
        })
        .map((customer: any) => customer.current)

      if (validRates.length > 0) {
        const avgRate = validRates.reduce((sum: number, rate: number) => sum + rate, 0) / validRates.length
        // 确保边际贡献率在合理范围内(0-100%)
        const normalizedRate = Math.min(Math.max(avgRate, 0), 100)
        nanhuaContributionRateData.value.currentRate = Math.round(normalizedRate * 100) / 100
      } else {
        // 如果没有有效数据，检查是否存在数据，存在则取最大55.56%
        const hasData = result.data.customers.some((customer: any) => customer.current > 0)
        if (hasData) {
          // 如果当前月有数据但都是异常值，设为最大合理值55.56%
          nanhuaContributionRateData.value.currentRate = 55.56
        } else {
          nanhuaContributionRateData.value.currentRate = 0
        }
      }

      console.log(`南华边际贡献率${period}:`, nanhuaContributionRateData.value.currentRate)
    } else {
      console.warn('南华边际贡献率数据获取失败:', result.message)
      nanhuaContributionRateData.value.currentRate = 0
    }
  } catch (error) {
    console.error('获取南华边际贡献率数据失败:', error)
    nanhuaContributionRateData.value.currentRate = 0
  }
}

// 获取南华成本中心完成率数据
const fetchNanhuaCostCenterData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/nanhua-cost-center/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取南华成本中心数据失败')
    }

    const result = await response.json()
    if (result.success && result.data) {
      const totalCumulativeIncome = (result.data.summary?.engineering?.cumulativeIncome || 0) +
        (result.data.summary?.nonMainBusiness?.cumulativeIncome || 0)
      const yearlyPlan = result.data.yearlyPlan || 735.03

      const completionRate = yearlyPlan > 0 ?
        Number(((totalCumulativeIncome / yearlyPlan) * 100).toFixed(1)) : 0

      nanhuaCostCenterCompletionRate.value = completionRate

      console.log(`南华成本中心完成率${currentYear}:`, nanhuaCostCenterCompletionRate.value)
    } else {
      console.warn('南华成本中心数据获取失败:', result.message)
      nanhuaCostCenterCompletionRate.value = 0
    }
  } catch (error) {
    console.error('获取南华成本中心数据失败:', error)
    nanhuaCostCenterCompletionRate.value = 0
  }
}

// 获取南华新签订单完成率数据
const fetchNanhuaNewOrdersData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/nanhua-new-orders/${currentYear}`)

    if (!response.ok) {
      throw new Error('获取南华新签订单数据失败')
    }

    const result = await response.json()
    if (result.success && result.data && result.data.summary) {
      const engineeringData = result.data.summary['工程']
      if (engineeringData) {
        nanhuaNewOrdersCompletionRate.value = engineeringData.completion_rate || 0
      } else {
        nanhuaNewOrdersCompletionRate.value = 0
      }

      console.log(`南华新签订单完成率${currentYear}:`, nanhuaNewOrdersCompletionRate.value)
    } else {
      console.warn('南华新签订单数据获取失败:', result.message)
      nanhuaNewOrdersCompletionRate.value = 0
    }
  } catch (error) {
    console.error('获取南华新签订单数据失败:', error)
    nanhuaNewOrdersCompletionRate.value = 0
  }
}



// 显示ROE详情
const showROEDetail = () => {
  alert(`净资产收益率详情：
净利润：${formatNumber(roeData.value.netProfit)} 元
股东权益：${formatNumber(roeData.value.shareholderEquity)} 元
净资产收益率：${roeData.value.roe}%
计算公式：ROE = 净利润 / 股东权益 × 100%

数据来源：
- 净利润：来自利润表
- 股东权益：来自资产负债表`)
}

// 处理导航，确保路由正常跳转
const handleNavigation = (event: Event) => {
  // 让router-link正常工作，这里可以添加额外的逻辑
  console.log('Navigation triggered')
}

// 获取公司标题
const getCompanyTitle = () => {
  return '上海南华兰陵实业有限公司'
}

// 图表相关函数
const initCharts = () => {
  initRevenueChart()
  initProfitChart()
}


const initRevenueChart = () => {
  if (!revenueChartRef.value) return

  revenueChartInstance.value = echarts.init(revenueChartRef.value)

  // 确保数据不为空，如果为空则使用默认值
  const periods = chartData.value.periods.length > 0 ? chartData.value.periods : ['1月', '2月', '3月']
  const mainBusinessRevenue = chartData.value.mainBusinessRevenue.length > 0 ? chartData.value.mainBusinessRevenue : [0, 0, 0]

  const option = {
    title: {
      text: '主营收入趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      },
      left: 'center',
      top: 5,
      subtext: selectedYear.value + '年',
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any[]) {
        const value = params[0].value;
        return `${params[0].name}<br/>${params[0].seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元`;
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periods,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '主营收入',
        type: 'bar',
        data: mainBusinessRevenue,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }

  revenueChartInstance.value.setOption(option)
}

const initProfitChart = () => {
  if (!profitChartRef.value) return

  profitChartInstance.value = echarts.init(profitChartRef.value)

  // 确保数据不为空，如果为空则使用默认值
  const periods = chartData.value.periods.length > 0 ? chartData.value.periods : ['1月', '2月', '3月']
  const netProfit = chartData.value.netProfit.length > 0 ? chartData.value.netProfit : [0, 0, 0]

  const option = {
    title: {
      text: '净利润趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      },
      left: 'center',
      top: 5,
      subtext: selectedYear.value + '年',
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any[]) {
        const value = params[0].value;
        return `${params[0].name}<br/>${params[0].seriesName}: ${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元`;
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periods,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '净利润',
        type: 'bar',
        data: netProfit,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 0.5, color: '#4ca636' },
            { offset: 1, color: '#4ca636' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }

  profitChartInstance.value.setOption(option)
}

const updateCharts = () => {
  // 确保数据不为空
  const periods = chartData.value.periods.length > 0 ? chartData.value.periods : ['1月', '2月', '3月']
  const mainBusinessRevenue = chartData.value.mainBusinessRevenue.length > 0 ? chartData.value.mainBusinessRevenue : [0, 0, 0]
  const netProfit = chartData.value.netProfit.length > 0 ? chartData.value.netProfit : [0, 0, 0]

  if (revenueChartInstance.value) {
    revenueChartInstance.value.setOption({
      xAxis: {
        data: periods
      },
      series: [
        {
          data: mainBusinessRevenue
        }
      ]
    })
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.setOption({
      xAxis: {
        data: periods
      },
      series: [
        {
          data: netProfit
        }
      ]
    })
  }
}

const fetchChartData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/income-statement/annual/${selectedYear.value}`)
    if (!response.ok) {
      console.warn('获取图表数据失败')
      return
    }

    const result = await response.json()

    const periods: string[] = []
    const mainBusinessRevenue: number[] = []
    const netProfit: number[] = []

    if (result.data && Array.isArray(result.data)) {
      result.data.forEach((item: IncomeStatementItem) => {
        // 从period中提取月份
        const month = item.period.split('-')[1]
        periods.push(`${month}月`)

        // 解析JSON字符串中的数据
        const itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data

        // 提取主营收入和净利润数据
        mainBusinessRevenue.push(itemData.main_business_revenue?.current_amount || 0)
        netProfit.push(itemData.net_profit?.current_amount || 0)
      })
    }

    chartData.value.periods = periods
    chartData.value.mainBusinessRevenue = mainBusinessRevenue
    chartData.value.netProfit = netProfit

    updateCharts()
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
}

const fetchAvailableYears = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const years: string[] = []

    // 默认提供近5年选项
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString())
    }

    availableYears.value = years
  } catch (error) {
    console.error('获取年份列表失败:', error)
  }
}

const handleResize = () => {
  if (revenueChartInstance.value) {
    revenueChartInstance.value.resize()
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.resize()
  }
}

onMounted(async () => {
  await Promise.all([
    fetchDashboardData(),
    fetchAnnouncements(),
    fetchAvailableYears(),
    fetchAnalysisCompletionRates(),
    fetchROEData(),
    fetchNetProfitMarginData(),
    fetchAssetLiabilityRatioData(),
    fetchNanhuaProfitMarginData(),
    fetchNanhuaBusinessIncomeData(),
    fetchNanhuaContributionRateData(),
    fetchNanhuaCostCenterData(),
    fetchNanhuaNewOrdersData()
  ])

  // 先获取图表数据，再初始化图表
  await fetchChartData()

  // 等待DOM更新后再初始化图表
  await nextTick()
  initCharts()

  window.addEventListener('resize', handleResize)
  loading.value = false
})

onUnmounted(() => {
  if (revenueChartInstance.value) {
    revenueChartInstance.value.dispose()
  }

  if (profitChartInstance.value) {
    profitChartInstance.value.dispose()
  }

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>