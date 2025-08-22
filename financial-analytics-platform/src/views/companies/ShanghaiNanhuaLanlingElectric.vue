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
            <button 
              @click="refreshAnnouncements"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="刷新公告"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
            <span v-if="announcements.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ announcements.length }} 条未读
            </span>
          </div>
        </div>
        
        <div v-if="loadingAnnouncements" class="text-center py-8 text-gray-500">
          <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p class="text-sm">加载公告中...</p>
        </div>
        
        <div v-else-if="announcements.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
          </svg>
          <p class="text-sm">暂无新公告</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="announcement in announcements" :key="announcement.id" 
               class="p-4 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-sm"
               :class="getAnnouncementClasses(announcement.type)"
               @click="viewAnnouncementDetail(announcement)">
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
                  <button 
                    @click.stop="markAsRead(announcement.id)"
                    class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    标记已读
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 查看更多按钮 -->
        <div v-if="announcements.length > 0" class="mt-4 text-center">
          <router-link 
            to="/admin/notifications" 
            class="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            v-if="userStore.userInfo?.role_name === 'super_admin' || userStore.userInfo?.role_name === 'admin'"
          >
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">本月已提交</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardData?.overview?.current_month_submitted || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
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
        <h3 class="text-lg font-semibold text-gray-900 mb-4">数据分析中心</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
                <div 
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${analysisModuleCompletionRates.newOrders}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/new-orders-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>
          
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
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
                <div 
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(costCenterData.completionRate, 0), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/cost-center-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>
          
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
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
                <div 
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(businessIncomeData.completionRate, 0), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/business-income-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>
          
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
            <router-link to="/analytics/net-profit-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>
          
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
            <router-link to="/analytics/roe-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>

          <!-- 边际贡献率卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-600">{{ contributionRateData.completionRate }}%</div>
                <div class="text-xs text-gray-500">完成度</div>
              </div>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">边际贡献率分析</h4>
            <p class="text-sm text-gray-600 mb-3 h-12">计划值: {{ contributionRateData.targetRate }}%</p>
            <div class="mb-4">
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px;">
                <div 
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${Math.min(Math.max(contributionRateData.completionRate, 0), 100)}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/contribution-rate-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>

          <!-- 毛利率卡片 -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all relative">
            <div class="flex items-center justify-between mb-4">
              <div class="p-2 bg-blue-100 rounded-md">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
                <div 
                  style="height: 8px; border-radius: 4px; background-color: #2563eb; transition: width 0.3s ease;"
                  :style="`width: ${profitMarginData.currentRate > 0 ? Math.min(profitMarginData.currentRate, 100) : 0}%;`"
                ></div>
              </div>
            </div>
            <router-link to="/analytics/profit-margin-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
            </router-link>
          </div>

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
            <router-link to="/analytics/net-profit-margin-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
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
            <router-link to="/analytics/asset-liability-ratio-chart" class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" @click="handleNavigation">
              质量情况
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
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"/>
                <path class="text-blue-600" stroke="currentColor" stroke-width="2" fill="none"
                  :stroke-dasharray="`${completionRate}, 100`"
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"/>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
              <div class="bg-blue-600 h-2 rounded-full"
                   :style="`width: ${category.completion_rate}%`"></div>
            </div>
            <p class="text-sm text-gray-600">
              {{ category.submitted_count }} / {{ category.total_writable }} 已完成
            </p>
          </div>
        </div>
      </div>



    </div>
    
    <!-- 公告详情模态框 -->
    <div v-if="showAnnouncementDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeAnnouncementDetail">
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
            <button 
              @click="closeAnnouncementDetail"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              关闭
            </button>
            <button 
              @click="markAsReadAndClose(selectedAnnouncement.id)"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
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

// 成本中心年度完成情况数据
const costCenterData = ref({
  yearlyPlan: 0,
  totalCumulativeIncome: 0,
  completionRate: 0
})

// 营业收入年度完成情况数据
const businessIncomeData = ref({
  totalYearlyPlan: 0,
  totalCurrentTotal: 0,
  completionRate: 0
})

// 边际贡献率年度完成情况数据
const contributionRateData = ref({
  targetRate: 21.98,
  currentRate: 0,
  completionRate: 0
})

// 毛利率年度完成情况数据
const profitMarginData = ref({
  targetRate: 24.00,
  currentRate: 0,
  completionRate: 0
})

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
    const response = await fetch(`http://47.111.95.19:3000/dashboard/user/${userId}`)
    
    if (!response.ok) {
      throw new Error('获取仪表板数据失败')
    }
    
    const result = await response.json()
    if (result.success) {
      dashboardData.value = result.data
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
  }
}

const fetchAnnouncements = async () => {
  try {
    loadingAnnouncements.value = true
    const userId = userStore.userInfo?.id || 1
    const response = await fetch(`http://47.111.95.19:3000/notifications/unread/${userId}?limit=5`)
    
    if (!response.ok) {
      throw new Error('获取公告失败')
    }
    
    const result = await response.json()
    if (result.success) {
      // 将通知数据转换为公告格式
      announcements.value = result.data.map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        created_at: notification.created_at
      }))
    }
  } catch (error) {
    console.error('获取公告失败:', error)
    // 如果新API失败，回退到旧的API
    try {
      const response = await fetch('http://47.111.95.19:3000/dashboard/announcements')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          announcements.value = result.data
        }
      }
    } catch (fallbackError) {
      console.error('回退API也失败:', fallbackError)
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
    const response = await fetch(`http://47.111.95.19:3000/analytics/roe/${currentYear}`)
    
    if (!response.ok) {
      throw new Error('获取净资产收益率数据失败')
    }
    
    const result = await response.json()
    if (result.success) {
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

// 获取成本中心年度完成情况数据
const fetchCostCenterCompletionData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/cost-center/${currentYear}`)
    
    if (!response.ok) {
      throw new Error('获取成本中心数据失败')
    }
    
    const result = await response.json()
    if (result.success && result.data) {
      const summary = result.data.summary || {}
      const yearlyPlan = result.data.yearlyPlan || 0
      
      // 计算总累计收入
      const categories = ['equipment', 'component', 'engineering', 'nonMainBusiness']
      const totalCumulativeIncome = categories.reduce((sum, key) => {
        return sum + (summary[key]?.cumulativeIncome || 0)
      }, 0)
      
      // 计算完成率
      const completionRate = yearlyPlan > 0 ? 
        Number(((totalCumulativeIncome / yearlyPlan) * 100).toFixed(2)) : 0
      
      costCenterData.value = {
        yearlyPlan,
        totalCumulativeIncome,
        completionRate
      }
    } else {
      console.warn('成本中心数据获取失败:', result.message)
      costCenterData.value = {
        yearlyPlan: 0,
        totalCumulativeIncome: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('获取成本中心数据失败:', error)
    costCenterData.value = {
      yearlyPlan: 0,
      totalCumulativeIncome: 0,
      completionRate: 0
    }
  }
}

// 获取营业收入年度完成情况数据
const fetchBusinessIncomeCompletionData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/business-income/${currentYear}`)
    
    if (!response.ok) {
      throw new Error('获取营业收入数据失败')
    }
    
    const result = await response.json()
    if (result.success && result.data) {
      // 使用与BusinessIncomeChart.vue相同的固定年度计划值
      const hardcodedPlans = {
        main: 59400,
        nonMain: 600
      }
      
      // 计算总年度计划和当期累计
      const totalYearlyPlan = hardcodedPlans.main + hardcodedPlans.nonMain
      const mainCurrentTotal = result.data.summary?.main?.currentTotal || 0
      const nonMainCurrentTotal = result.data.summary?.nonMain?.currentTotal || 0
      const totalCurrentTotal = mainCurrentTotal + nonMainCurrentTotal
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? 
        Number(((totalCurrentTotal / totalYearlyPlan) * 100).toFixed(2)) : 0
      
      businessIncomeData.value = {
        totalYearlyPlan,
        totalCurrentTotal,
        completionRate
      }
    } else {
      console.warn('营业收入数据获取失败:', result.message)
      businessIncomeData.value = {
        totalYearlyPlan: 0,
        totalCurrentTotal: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('获取营业收入数据失败:', error)
    businessIncomeData.value = {
      totalYearlyPlan: 0,
      totalCurrentTotal: 0,
      completionRate: 0
    }
  }
}

// 获取边际贡献率年度完成情况数据
const fetchContributionRateCompletionData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/contribution-rate/${currentYear}`)
    
    if (!response.ok) {
      throw new Error('获取边际贡献率数据失败')
    }
    
    const result = await response.json()
    if (result.success && result.data) {
      if (result.data.hasData === false) {
        // 没有数据的情况
        contributionRateData.value = {
          targetRate: 21.98,
          currentRate: 0,
          completionRate: 0
        }
      } else {
        // 有数据的情况 - 直接取当月的边际贡献率
        const currentMonth = new Date().getMonth() + 1 // 1-12
        let currentRate = 0

        // 优先使用当月数据
        if (result.data.monthlyData && result.data.monthlyData.length >= currentMonth) {
          currentRate = result.data.monthlyData[currentMonth - 1] || 0
          console.log(`使用当月(${currentMonth}月)边际贡献率: ${currentRate}%`)
        } else if (result.data.currentRate !== undefined) {
          // 如果没有当月数据，使用API返回的currentRate
          currentRate = result.data.currentRate
          console.log(`使用API返回的边际贡献率: ${currentRate}%`)
        }

        const completionRate = Math.min(100, Math.round((currentRate / 21.98) * 100))

        contributionRateData.value = {
          targetRate: 21.98,
          currentRate,
          completionRate
        }
      }
    } else {
      console.warn('边际贡献率数据获取失败:', result.message)
      contributionRateData.value = {
        targetRate: 21.98,
        currentRate: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('获取边际贡献率数据失败:', error)
    contributionRateData.value = {
      targetRate: 21.98,
      currentRate: 0,
      completionRate: 0
    }
  }
}

// 获取毛利率年度完成情况数据
const fetchProfitMarginCompletionData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`http://47.111.95.19:3000/analytics/profit-margin/${currentYear}`)
    
    if (!response.ok) {
      throw new Error('获取毛利率数据失败')
    }
    
    const result = await response.json()
    if (result.success && result.data) {
      if (result.data.hasData === false) {
        // 没有数据的情况
        profitMarginData.value = {
          targetRate: 24.00,
          currentRate: 0,
          completionRate: 0
        }
      } else {
        // 有数据的情况 - 使用各板块数据计算加权平均
        const segmentData = result.data.segmentData || []
        let weightedSum = 0
        let totalWeight = 0
        
        // 根据各板块的计划值作为权重计算加权平均
        segmentData.forEach(segment => {
          if (segment.actual > 0 && segment.plan > 0) {
            weightedSum += segment.actual * segment.plan
            totalWeight += segment.plan
          }
        })
        
        // 如果没有有效的板块数据，尝试使用API返回的currentRate
        let currentRate = 0
        if (totalWeight > 0) {
          currentRate = Number((weightedSum / totalWeight).toFixed(2))
        } else {
          currentRate = result.data.currentRate || 0
        }
        
        const completionRate = Math.min(100, Math.round((currentRate / 24.00) * 100))
        
        profitMarginData.value = {
          targetRate: 24.00,
          currentRate,
          completionRate
        }
      }
    } else {
      console.warn('毛利率数据获取失败:', result.message)
      profitMarginData.value = {
        targetRate: 24.00,
        currentRate: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('获取毛利率数据失败:', error)
    profitMarginData.value = {
      targetRate: 24.00,
      currentRate: 0,
      completionRate: 0
    }
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
  return '上海南华兰陵电气有限公司'
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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any[]) {
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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any[]) {
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
    fetchCostCenterCompletionData(),
    fetchBusinessIncomeCompletionData(),
    fetchContributionRateCompletionData(),
    fetchProfitMarginCompletionData()
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>