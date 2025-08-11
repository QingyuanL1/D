<template>
  <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
    <!-- 报表头部组件 -->
    <ReportHeader
      :title="`${companyName} - 月度经济运行报表`"
      :period="selectedPeriod"
      :is-generating="false"
      @period-change="handlePeriodChange"
      @generate-pdf="generatePDF"
    />

    <div id="report-content" class="space-y-8">
      <!-- 报表标题和基本信息 -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold mb-2">香港大亚管理办公室 2025</h2>
        <h3 class="text-xl font-semibold mb-2">经济运行统计分析报告</h3>
        <p class="text-lg">{{ companyName }}</p>
        <p class="text-md text-gray-600">{{ formatPeriod(selectedPeriod) }}</p>
      </div>

      <!-- 一、经济运行关键指标进度情况概述 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">一、经济运行关键指标进度情况概述（单位：万元）</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IndicatorCard
            title="●新签订单："
            :data="keyIndicators.newOrders"
            type="basic"
          />
          <IndicatorCard
            title="●主营业务收入："
            :data="keyIndicators.mainRevenue"
            type="basic"
          />
          <IndicatorCard
            v-if="props.companyKey === 'shanghai-industry'"
            title="●净利润指标："
            :data="keyIndicators.netProfit"
            type="basic"
          />
          <IndicatorCard
            title="●成本中心（计入损益）："
            :data="keyIndicators.costCenter"
            type="cost-center"
          />
        </div>
      </div>

      <!-- 二、经济运行关键指标质量情况概述 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">二、经济运行关键指标质量情况概述（金额单位：万元）</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IndicatorCard
            title="●边际贡献率指标："
            :data="qualityIndicators.marginContribution"
            type="percentage"
          />
          <IndicatorCard
            title="●毛利率指标："
            :data="qualityIndicators.grossMargin"
            type="percentage"
          />
          <IndicatorCard
            title="●净利率指标："
            :data="qualityIndicators.netMargin"
            type="percentage"
          />
          <IndicatorCard
            v-if="props.companyKey === 'shanghai-industry'"
            title="●净资产收益率指标（年化）："
            :data="qualityIndicators.roe"
            type="percentage"
          />
          <IndicatorCard
            v-if="props.companyKey === 'shanghai-industry'"
            title="●资产负债率指标："
            :data="qualityIndicators.assetLiabilityRatio"
            type="percentage"
          />
        </div>
      </div>

      <!-- 三、经济运行风险提示 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">三、经济运行风险提示</h3>
        <RiskAlert :risks="riskAlertsArray" />
      </div>

      <!-- 四、对本月经济运行统计分析质量评估 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">四、对本月经济运行统计分析质量评估</h3>
        <div class="bg-gray-50 p-4 rounded">
          <div class="mb-4">
            <h4 class="text-lg font-semibold mb-3">1、数据质量评估：</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-gray-700 mb-2">数据完整性</h5>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 95%"></div>
                  </div>
                  <span class="ml-2 text-sm font-medium">95%</span>
                </div>
              </div>
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-gray-700 mb-2">数据准确性</h5>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: 92%"></div>
                  </div>
                  <span class="ml-2 text-sm font-medium">92%</span>
                </div>
              </div>
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-gray-700 mb-2">数据及时性</h5>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 88%"></div>
                  </div>
                  <span class="ml-2 text-sm font-medium">88%</span>
                </div>
              </div>
              <div class="bg-white p-3 rounded border">
                <h5 class="font-medium text-gray-700 mb-2">数据一致性</h5>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 94%"></div>
                  </div>
                  <span class="ml-2 text-sm font-medium">94%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="text-lg font-semibold mb-3">2、分析方法评估：</h4>
            <div class="bg-white p-4 rounded border">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">85%</div>
                  <div class="text-sm text-gray-600">指标覆盖度</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">90%</div>
                  <div class="text-sm text-gray-600">分析深度</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">88%</div>
                  <div class="text-sm text-gray-600">逻辑性</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="text-lg font-semibold mb-3">3、报告质量评估：</h4>
            <div class="bg-white p-4 rounded border">
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">结构清晰度</span>
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">优秀</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">内容完整性</span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">良好</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">表达准确性</span>
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">优秀</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">可理解性</span>
                  <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">中等</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="text-lg font-semibold mb-3">4、综合评价：</h4>
            <div class="bg-white p-4 rounded border">
              <div class="flex items-center justify-between mb-3">
                <span class="text-lg font-medium">总体质量评分</span>
                <div class="flex items-center">
                  <div class="text-3xl font-bold text-blue-600 mr-2">89</div>
                  <div class="text-sm text-gray-600">/ 100</div>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 h-3 rounded-full" style="width: 89%"></div>
              </div>
              <div class="mt-3 text-sm text-gray-600">
                本月经济运行统计分析整体质量良好，数据准确性和完整性较高，分析方法科学合理，建议进一步提升数据及时性和报告可理解性。
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3">5、改进建议：</h4>
            <div class="bg-white p-4 rounded border">
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span>加强数据收集的及时性，建立更完善的数据监控机制</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span>优化报告表达方式，提高内容的可读性和理解性</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span>增加行业对比分析，提升分析的深度和广度</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span>建立质量评估的常态化机制，持续改进统计分析质量</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="mt-4 text-right">
            <p class="text-sm text-gray-500">香港大亚管理办公室 2025</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>正在加载数据...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { getNanhuaNewOrders, getNanhuaCostCenterStructure } from '@/api/index'

// 导入组件
import ReportHeader from '@/components/reports/ReportHeader.vue'
import IndicatorCard from '@/components/reports/IndicatorCard.vue'
import RiskAlert from '@/components/reports/RiskAlert.vue'

// Props
const props = defineProps({
  companyKey: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  selectedPeriod: {
    type: String,
    required: true
  }
})

// 事件
const emit = defineEmits(['period-change'])
const isLoading = ref(false)

// 关键指标数据
const keyIndicators = ref({
  newOrders: { yearlyPlan: 0, cumulative: 0, completionRate: 0 },
  mainRevenue: { yearlyPlan: 0, cumulative: 0, completionRate: 0 },
  netProfit: { yearlyPlan: 0, cumulative: 0, completionRate: 0 },
  costCenter: { yearlyPlan: 0, cumulative: 0, ratio: 0, executionRate: 0 }
})

// 质量指标数据 - 从各个南华API获取动态数据
const qualityIndicators = ref({
  marginContribution: { yearlyPlan: 0, current: 0 },
  grossMargin: { yearlyPlan: 0, current: 0 },
  netMargin: { yearlyPlan: 0, current: 0 },
  roe: { yearlyPlan: 0, current: 0 },
  assetLiabilityRatio: { yearlyPlan: 0, current: 0 }
})

// 风险提示数据
const riskAlerts = ref({
  financial: '当期无风险披露。',
  marketing: '当期无风险披露。',
  production: '当期无风险披露。',
  management: '当期无风险披露。',
  research: '当期无风险披露。',
  others: '当期无风险披露。'
})

// 风险提示数组（用于组件）
const riskAlertsArray = computed(() => [
  { type: 'financial', title: '1、财务风险披露情况：', content: riskAlerts.value.financial },
  { type: 'marketing', title: '2、营销风险披露情况：', content: riskAlerts.value.marketing },
  { type: 'production', title: '3、生产/施工风险披露情况：', content: riskAlerts.value.production },
  { type: 'management', title: '4、管理风险披露情况：', content: riskAlerts.value.management },
  { type: 'research', title: '5、研发风险披露情况：', content: riskAlerts.value.research },
  { type: 'others', title: '6、其他风险披露情况：', content: riskAlerts.value.others }
])

// 日期格式化函数
const formatPeriod = (period) => {
  if (!period || typeof period !== 'string') {
    console.warn('formatPeriod received invalid period:', period)
    return '未知期间'
  }
  const parts = period.split('-')
  if (parts.length !== 2) {
    console.warn('formatPeriod received invalid period format:', period)
    return period
  }
  const [year, month] = parts
  return `${year}年${month}月`
}

// 加载新签订单数据
const loadNewOrdersData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaNewOrdersData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanNewOrdersData(period)
  }
}

// 加载南华新签订单数据
const loadNanhuaNewOrdersData = async (period: string) => {
  
  try {
    console.log('开始加载南华新签订单数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('新签订单API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      getNanhuaNewOrders(period),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('南华新签订单数据响应:', response.data)
    
    let engineeringData = null
    if (response.data?.success && response.data?.data?.engineering) {
      // 标准响应格式
      engineeringData = response.data.data.engineering
    } else if (response.data?.engineering && Array.isArray(response.data.engineering)) {
      // 直接响应格式
      engineeringData = response.data.engineering
    }
    
    if (engineeringData && Array.isArray(engineeringData)) {
      
      // 计算总的年度计划和累计金额
      const totalYearlyPlan = engineeringData.reduce((sum: number, item: any) => sum + (item.yearlyPlan || item.yearlyPlannedIncome || 0), 0)
      const totalAccumulated = engineeringData.reduce((sum: number, item: any) => sum + (item.accumulated || item.accumulatedIncome || 0), 0)
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? (totalAccumulated / totalYearlyPlan) * 100 : 0
      
      // 更新新签订单指标
      keyIndicators.value.newOrders = {
        yearlyPlan: totalYearlyPlan,
        cumulative: totalAccumulated,
        completionRate: parseFloat(completionRate.toFixed(2))
      }
      console.log('南华新签订单数据加载成功:', keyIndicators.value.newOrders)
    } else {
      console.log('南华新签订单数据响应无效:', response.data)
      // 设置默认值
      keyIndicators.value.newOrders = {
        yearlyPlan: 0,
        cumulative: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('加载南华新签订单数据失败:', error)
    // 设置默认值
    keyIndicators.value.newOrders = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
  }
}

// 加载拓源新签订单数据
const loadTuoyuanNewOrdersData = async (period: string) => {
  try {
    console.log('开始加载拓源新签订单数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('拓源新签订单API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      fetch(`http://47.111.95.19:3000/tuoyuan-new-order-structure/${period}`),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('拓源新签订单数据响应状态:', response.ok)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源新签订单数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCumulative = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算总的年度计划和当期累计
        result.data.items.forEach((item: any) => {
          totalYearlyPlan += item.annualPlan || 0
          totalCumulative += item.currentCumulative || 0
        })
      }
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? (totalCumulative / totalYearlyPlan) * 100 : 0
      
      // 更新新签订单指标
      keyIndicators.value.newOrders = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalCumulative.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2))
      }
      console.log('拓源新签订单数据加载成功:', keyIndicators.value.newOrders)
    } else {
      console.log('拓源新签订单数据响应失败:', response.status)
      // 设置默认值
      keyIndicators.value.newOrders = {
        yearlyPlan: 0,
        cumulative: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('加载拓源新签订单数据失败:', error)
    // 设置默认值
    keyIndicators.value.newOrders = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
  }
}

// 加载成本中心数据
const loadCostCenterData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaCostCenterData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanCostCenterData(period)
  }
}

// 加载南华成本中心数据
const loadNanhuaCostCenterData = async (period: string) => {
  
  try {
    console.log('开始加载南华成本中心数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('成本中心API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      getNanhuaCostCenterStructure(period),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('南华成本中心数据响应:', response.data)
    
    let engineering = null
    let nonMainBusiness = null
    
    if (response.data?.success && response.data?.data) {
      // 标准响应格式
      engineering = response.data.data.engineering
      nonMainBusiness = response.data.data.nonMainBusiness
    } else if (response.data?.engineering && response.data?.nonMainBusiness) {
      // 直接响应格式
      engineering = response.data.engineering
      nonMainBusiness = response.data.nonMainBusiness
    }
    
    if (engineering && nonMainBusiness && Array.isArray(engineering) && Array.isArray(nonMainBusiness)) {
      
      // 计算工程项目总计（使用当期数据）
      const engineeringYearlyPlan = engineering.reduce((sum: number, item: any) => sum + (item.yearlyPlannedIncome || 0), 0)
      const engineeringCurrent = engineering.reduce((sum: number, item: any) => sum + (item.currentIncome || 0), 0)
      
      // 计算非主营业务总计（使用当期数据）
      const nonMainYearlyPlan = nonMainBusiness.reduce((sum: number, item: any) => sum + (item.yearlyPlannedIncome || 0), 0)
      const nonMainCurrent = nonMainBusiness.reduce((sum: number, item: any) => sum + (item.currentIncome || 0), 0)
      
      // 总的年度计划和当期金额
      const totalYearlyPlan = engineeringYearlyPlan + nonMainYearlyPlan
      const totalCurrent = engineeringCurrent + nonMainCurrent
      
      // 计算成本中心损益占比 (当期/年度计划)
      const ratio = totalYearlyPlan > 0 ? (totalCurrent / totalYearlyPlan) * 100 : 0
      
      // 计算执行率 (与年度计划的比较)
      const executionRate = totalYearlyPlan > 0 ? (totalCurrent / totalYearlyPlan) * 100 : 0
      
      // 更新成本中心指标
      keyIndicators.value.costCenter = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalCurrent.toFixed(2)), // 这里改为显示当期数据
        ratio: parseFloat(ratio.toFixed(2)),
        executionRate: parseFloat(executionRate.toFixed(2))
      }
      console.log('南华成本中心数据加载成功:', keyIndicators.value.costCenter)
    } else {
      console.log('南华成本中心数据响应无效:', response.data)
      // 设置默认值
      keyIndicators.value.costCenter = {
        yearlyPlan: 0,
        cumulative: 0,
        ratio: 0,
        executionRate: 0
      }
    }
  } catch (error) {
    console.error('加载南华成本中心数据失败:', error)
    // 设置默认值
    keyIndicators.value.costCenter = {
      yearlyPlan: 0,
      cumulative: 0,
      ratio: 0,
      executionRate: 0
    }
  }
}

// 加载拓源成本中心数据
const loadTuoyuanCostCenterData = async (period: string) => {
  try {
    console.log('开始加载拓源成本中心数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('拓源成本中心API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      fetch(`http://47.111.95.19:3000/tuoyuan-cost-center-profit-loss/${period}`),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('拓源成本中心数据响应状态:', response.ok)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源成本中心数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCurrent = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算总的年度预算和当期金额
        result.data.items.forEach((item: any) => {
          totalYearlyPlan += item.annualBudget || 0
          totalCurrent += item.currentPeriod || 0
        })
      }
      
      // 计算成本中心损益占比和执行率
      const ratio = totalYearlyPlan > 0 ? (totalCurrent / totalYearlyPlan) * 100 : 0
      const executionRate = totalYearlyPlan > 0 ? (totalCurrent / totalYearlyPlan) * 100 : 0
      
      // 更新成本中心指标
      keyIndicators.value.costCenter = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalCurrent.toFixed(2)), // 这里显示当期数据
        ratio: parseFloat(ratio.toFixed(2)),
        executionRate: parseFloat(executionRate.toFixed(2))
      }
      console.log('拓源成本中心数据加载成功:', keyIndicators.value.costCenter)
    } else {
      console.log('拓源成本中心数据响应失败:', response.status)
      // 设置默认值
      keyIndicators.value.costCenter = {
        yearlyPlan: 0,
        cumulative: 0,
        ratio: 0,
        executionRate: 0
      }
    }
  } catch (error) {
    console.error('加载拓源成本中心数据失败:', error)
    // 设置默认值
    keyIndicators.value.costCenter = {
      yearlyPlan: 0,
      cumulative: 0,
      ratio: 0,
      executionRate: 0
    }
  }
}

// 加载主营业务收入数据
const loadBusinessIncomeData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaBusinessIncomeData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanBusinessIncomeData(period)
  }
}

// 加载南华主营业务收入数据
const loadNanhuaBusinessIncomeData = async (period: string) => {
  
  try {
    console.log('开始加载南华主营业务收入数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('主营业务收入API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('南华主营业务收入数据响应状态:', response.ok)
    
    if (response.ok) {
      const result = await response.json()
      console.log('南华主营业务收入数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCumulative = 0
      
      if (result.data && result.data.customers && Array.isArray(result.data.customers)) {
        // 计算主营业务总计
        result.data.customers.forEach((item: any) => {
          totalYearlyPlan += item.yearlyPlan || item.yearlyPlannedIncome || 0
          totalCumulative += item.accumulated || item.accumulatedIncome || 0
        })
      }
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? (totalCumulative / totalYearlyPlan) * 100 : 0
      
      // 更新主营业务收入指标
      keyIndicators.value.mainRevenue = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalCumulative.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2))
      }
      console.log('南华主营业务收入数据加载成功:', keyIndicators.value.mainRevenue)
    } else {
      console.log('南华主营业务收入数据响应失败:', response.status)
      // 设置默认值
      keyIndicators.value.mainRevenue = {
        yearlyPlan: 0,
        cumulative: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('加载南华主营业务收入数据失败:', error)
    // 设置默认值
    keyIndicators.value.mainRevenue = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
  }
}

// 加载拓源主营业务收入数据
const loadTuoyuanBusinessIncomeData = async (period: string) => {
  try {
    console.log('开始加载拓源主营业务收入数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('拓源主营业务收入API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      fetch(`http://47.111.95.19:3000/tuoyuan-main-business-income-breakdown/${period}`),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('拓源主营业务收入数据响应状态:', response.ok)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源主营业务收入数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCumulative = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算主营业务总计
        result.data.items.forEach((item: any) => {
          totalYearlyPlan += item.annualPlan || 0
          totalCumulative += item.currentCumulative || 0
        })
      }
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? (totalCumulative / totalYearlyPlan) * 100 : 0
      
      // 更新主营业务收入指标
      keyIndicators.value.mainRevenue = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalCumulative.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2))
      }
      console.log('拓源主营业务收入数据加载成功:', keyIndicators.value.mainRevenue)
    } else {
      console.log('拓源主营业务收入数据响应失败:', response.status)
      // 设置默认值
      keyIndicators.value.mainRevenue = {
        yearlyPlan: 0,
        cumulative: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('加载拓源主营业务收入数据失败:', error)
    // 设置默认值
    keyIndicators.value.mainRevenue = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
  }
}

// 加载净利润数据
const loadNetProfitData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaNetProfitData(period)
  } else if (props.companyKey === 'changzhou') {
    // 拓源没有净利润指标，设置默认值
    keyIndicators.value.netProfit = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
    console.log('拓源公司没有净利润指标，设置默认值')
  }
}

// 加载南华净利润数据
const loadNanhuaNetProfitData = async (period: string) => {
  
  try {
    console.log('开始加载南华净利润数据，期间:', period)
    
    // 添加超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('净利润API调用超时')), 10000)
    })
    
    const response = await Promise.race([
      fetch(`http://47.111.95.19:3000/nanhua-net-profit-structure/${period}`),
      timeoutPromise
    ])
    
    // 检查响应数据结构
    console.log('南华净利润数据响应状态:', response.ok)
    
    if (response.ok) {
      const result = await response.json()
      console.log('南华净利润数据响应:', result)
      
      let totalPlan = 0
      let totalCumulative = 0
      
      if (result.success && result.data) {
        // 从汇总数据中获取总计
        if (result.data.total) {
          totalPlan = parseFloat(result.data.total.plan) || 0
          totalCumulative = parseFloat(result.data.total.cumulative) || 0
        }
      }
      
      // 计算完成率
      const completionRate = totalPlan > 0 ? (totalCumulative / totalPlan) * 100 : 0
      
      // 更新净利润指标
      keyIndicators.value.netProfit = {
        yearlyPlan: parseFloat(totalPlan.toFixed(2)),
        cumulative: parseFloat(totalCumulative.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2))
      }
      console.log('南华净利润数据加载成功:', keyIndicators.value.netProfit)
    } else {
      console.log('南华净利润数据响应失败:', response.status)
      // 设置默认值
      keyIndicators.value.netProfit = {
        yearlyPlan: 0,
        cumulative: 0,
        completionRate: 0
      }
    }
  } catch (error) {
    console.error('加载南华净利润数据失败:', error)
    // 设置默认值
    keyIndicators.value.netProfit = {
      yearlyPlan: 0,
      cumulative: 0,
      completionRate: 0
    }
  }
}

// 加载边际贡献率数据
const loadMarginContributionData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaMarginContributionData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanMarginContributionData(period)
  } else {
    qualityIndicators.value.marginContribution = { yearlyPlan: 0, current: 0 }
  }
}

// 加载南华边际贡献率数据
const loadNanhuaMarginContributionData = async (period: string) => {
  
  try {
    console.log('开始加载南华边际贡献率数据，期间:', period)
    
    // 获取当前月份的边际贡献率数据
    const response = await fetch(`http://47.111.95.19:3000/nanhua-business-contribution-with-self-built/${period}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('南华边际贡献率数据响应:', result)
      
      let currentRate = 0
      const yearlyPlan = 25.0 // 目标值
      
      if (result.success && result.data && result.data.customers) {
        // 计算当月加权平均边际贡献率
        const validCustomers = result.data.customers
          .filter((customer: any) => {
            const rate = customer.current
            // 只过滤掉明显异常的0值，保留其他所有有效值
            return rate > 0
          })
        
        if (validCustomers.length > 0) {
          // 计算加权平均，使用yearlyPlan作为权重
          let totalWeightedRate = 0
          let totalWeight = 0
          
          validCustomers.forEach((customer: any) => {
            const rate = customer.current
            const weight = customer.yearlyPlan || 1
            totalWeightedRate += rate * weight
            totalWeight += weight
          })
          
          if (totalWeight > 0) {
            currentRate = totalWeightedRate / totalWeight
          }
        }
      }
      
      // 更新边际贡献率指标
      qualityIndicators.value.marginContribution = {
        yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
        current: parseFloat(currentRate.toFixed(2))
      }
      console.log('南华边际贡献率数据加载成功:', qualityIndicators.value.marginContribution)
    } else {
      console.log('南华边际贡献率数据响应失败:', response.status)
      qualityIndicators.value.marginContribution = { yearlyPlan: 25.0, current: 0 }
    }
  } catch (error) {
    console.error('加载南华边际贡献率数据失败:', error)
    qualityIndicators.value.marginContribution = { yearlyPlan: 25.0, current: 0 }
  }
}

// 加载拓源边际贡献率数据
const loadTuoyuanMarginContributionData = async (period: string) => {
  try {
    console.log('开始加载拓源边际贡献率数据，期间:', period)
    
    // 获取拓源边际贡献率数据
    const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-contribution-rate/${period}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源边际贡献率数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCurrentActual = 0
      let totalWeightPlan = 0
      let totalWeightActual = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算加权平均边际贡献率
        result.data.items.forEach((item: any) => {
          const planRate = item.yearlyPlan || 0
          const actualRate = item.currentActual || 0
          const weight = Math.max(planRate, 1) // 使用计划值作为权重
          
          totalYearlyPlan += planRate * weight
          totalCurrentActual += actualRate * weight
          totalWeightPlan += weight
          totalWeightActual += weight
        })
        
        // 计算加权平均
        const avgYearlyPlan = totalWeightPlan > 0 ? totalYearlyPlan / totalWeightPlan : 0
        const avgCurrentActual = totalWeightActual > 0 ? totalCurrentActual / totalWeightActual : 0
        
        // 更新边际贡献率指标
        qualityIndicators.value.marginContribution = {
          yearlyPlan: parseFloat(avgYearlyPlan.toFixed(2)),
          current: parseFloat(avgCurrentActual.toFixed(2))
        }
      } else {
        // 设置默认值
        qualityIndicators.value.marginContribution = { yearlyPlan: 0, current: 0 }
      }
      
      console.log('拓源边际贡献率数据加载成功:', qualityIndicators.value.marginContribution)
    } else {
      console.log('拓源边际贡献率数据响应失败:', response.status)
      qualityIndicators.value.marginContribution = { yearlyPlan: 0, current: 0 }
    }
  } catch (error) {
    console.error('加载拓源边际贡献率数据失败:', error)
    qualityIndicators.value.marginContribution = { yearlyPlan: 0, current: 0 }
  }
}

// 加载毛利率数据
const loadGrossMarginData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaGrossMarginData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanGrossMarginData(period)
  } else {
    qualityIndicators.value.grossMargin = { yearlyPlan: 0, current: 0 }
  }
}

// 加载南华毛利率数据（使用当期数据，不是累计）
const loadNanhuaGrossMarginData = async (period: string) => {
  
  try {
    console.log('开始加载南华毛利率数据，期间:', period)
    
    // 尝试使用单月毛利率API获取当期数据
    const response = await fetch(`http://47.111.95.19:3000/nanhua-business-profit-margin-with-self-built/${period}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('南华单月毛利率数据响应:', result)
      
      let currentRate = 0
      const yearlyPlan = 24.0 // 目标值
      
      if (result.success && result.data && result.data.customers) {
        // 计算当期毛利率，使用加权平均
        const validCustomers = result.data.customers.filter((customer: any) => {
          return customer.current > 0 && customer.yearlyPlan > 0
        })
        
        if (validCustomers.length > 0) {
          let totalWeightedRate = 0
          let totalWeight = 0
          
          validCustomers.forEach((customer: any) => {
            const rate = customer.current || 0
            const weight = customer.yearlyPlan || 1
            totalWeightedRate += rate * weight
            totalWeight += weight
          })
          
          if (totalWeight > 0) {
            currentRate = totalWeightedRate / totalWeight
          }
        }
      }
      
      // 更新毛利率指标
      qualityIndicators.value.grossMargin = {
        yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
        current: parseFloat(currentRate.toFixed(2))
      }
      console.log('南华毛利率数据加载成功:', qualityIndicators.value.grossMargin)
    } else {
      console.log('南华单月毛利率API不可用，尝试年度API:', response.status)
      // 如果单月API不可用，回退到从年度API提取对应月份数据
      await loadGrossMarginFromYearlyData(period)
    }
  } catch (error) {
    console.error('加载南华毛利率数据失败:', error)
    // 回退到年度API
    await loadGrossMarginFromYearlyData(period)
  }
}

// 从年度毛利率API获取对应月份的数据
const loadGrossMarginFromYearlyData = async (period: string) => {
  try {
    const [year, month] = period.split('-')
    const response = await fetch(`http://47.111.95.19:3000/analytics/nanhua-profit-margin/${year}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('南华年度毛利率数据响应:', result)
      
      let currentRate = 0
      const yearlyPlan = 24.0 // 目标值
      
      if (result.success && result.data && !result.data.hasData === false) {
        const monthNames = result.data.months || []
        const monthlyData = result.data.monthlyData || []
        
        // 找到对应月份的数据
        const targetMonth = `${month}月`
        const monthIndex = monthNames.findIndex((m: string) => m === targetMonth)
        
        if (monthIndex >= 0 && monthlyData[monthIndex] !== undefined) {
          currentRate = monthlyData[monthIndex]
          console.log(`找到${targetMonth}的毛利率数据:`, currentRate)
        } else {
          console.log(`未找到${targetMonth}的数据，使用当前毛利率:`, result.data.currentRate)
          currentRate = result.data.currentRate || 0
        }
      }
      
      // 更新毛利率指标
      qualityIndicators.value.grossMargin = {
        yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
        current: parseFloat(currentRate.toFixed(2))
      }
      console.log('南华毛利率数据加载成功:', qualityIndicators.value.grossMargin)
    } else {
      console.log('南华年度毛利率数据响应失败:', response.status)
      qualityIndicators.value.grossMargin = { yearlyPlan: 24.0, current: 0 }
    }
  } catch (error) {
    console.error('从年度数据加载毛利率失败:', error)
    qualityIndicators.value.grossMargin = { yearlyPlan: 24.0, current: 0 }
  }
}

// 加载拓源毛利率数据
const loadTuoyuanGrossMarginData = async (period: string) => {
  try {
    console.log('开始加载拓源毛利率数据，期间:', period)
    
    // 获取拓源毛利率数据
    const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-profit-margin/${period}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源毛利率数据响应:', result)
      
      let totalYearlyPlan = 0
      let totalCurrentActual = 0
      let totalWeightPlan = 0
      let totalWeightActual = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算加权平均毛利率
        result.data.items.forEach((item: any) => {
          const planRate = item.yearlyPlan || 0
          const actualRate = item.currentActual || 0
          const weight = Math.max(planRate, 1) // 使用计划值作为权重
          
          totalYearlyPlan += planRate * weight
          totalCurrentActual += actualRate * weight
          totalWeightPlan += weight
          totalWeightActual += weight
        })
        
        // 计算加权平均
        const avgYearlyPlan = totalWeightPlan > 0 ? totalYearlyPlan / totalWeightPlan : 0
        const avgCurrentActual = totalWeightActual > 0 ? totalCurrentActual / totalWeightActual : 0
        
        // 更新毛利率指标
        qualityIndicators.value.grossMargin = {
          yearlyPlan: parseFloat(avgYearlyPlan.toFixed(2)),
          current: parseFloat(avgCurrentActual.toFixed(2))
        }
      } else {
        // 设置默认值
        qualityIndicators.value.grossMargin = { yearlyPlan: 0, current: 0 }
      }
      
      console.log('拓源毛利率数据加载成功:', qualityIndicators.value.grossMargin)
    } else {
      console.log('拓源毛利率数据响应失败:', response.status)
      qualityIndicators.value.grossMargin = { yearlyPlan: 0, current: 0 }
    }
  } catch (error) {
    console.error('加载拓源毛利率数据失败:', error)
    qualityIndicators.value.grossMargin = { yearlyPlan: 0, current: 0 }
  }
}

// 加载净利率数据
const loadNetMarginData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaNetMarginData(period)
  } else if (props.companyKey === 'changzhou') {
    await loadTuoyuanNetMarginData(period)
  } else {
    qualityIndicators.value.netMargin = { yearlyPlan: 0, current: 0 }
  }
}

// 加载南华净利率数据（从净利润数据计算）
const loadNanhuaNetMarginData = async (period: string) => {
  
  try {
    console.log('开始加载南华净利率数据，期间:', period)
    
    // 获取净利润数据和主营业务收入数据来计算净利率
    const [netProfitResponse, revenueResponse] = await Promise.all([
      fetch(`http://47.111.95.19:3000/nanhua-net-profit-structure/${period}`),
      fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`)
    ])
    
    let currentNetMargin = 0
    const yearlyPlan = 6.85 // 目标值
    
    if (netProfitResponse.ok && revenueResponse.ok) {
      const netProfitResult = await netProfitResponse.json()
      const revenueResult = await revenueResponse.json()
      
      console.log('南华净利润数据:', netProfitResult)
      console.log('南华主营业务收入数据:', revenueResult)
      
      let currentNetProfit = 0
      let currentRevenue = 0
      
      // 获取当期净利润
      if (netProfitResult.success && netProfitResult.data && netProfitResult.data.total) {
        currentNetProfit = parseFloat(netProfitResult.data.total.current) || 0
      }
      
      // 获取当期主营业务收入
      if (revenueResult.data && revenueResult.data.customers) {
        currentRevenue = revenueResult.data.customers.reduce((sum: number, customer: any) => {
          return sum + (customer.current || 0)
        }, 0)
      }
      
      // 计算净利率
      if (currentRevenue > 0) {
        currentNetMargin = (currentNetProfit / currentRevenue) * 100
      }
    }
    
    // 更新净利率指标
    qualityIndicators.value.netMargin = {
      yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
      current: parseFloat(currentNetMargin.toFixed(2))
    }
    console.log('南华净利率数据加载成功:', qualityIndicators.value.netMargin)
  } catch (error) {
    console.error('加载南华净利率数据失败:', error)
    qualityIndicators.value.netMargin = { yearlyPlan: 6.85, current: 0 }
  }
}

// 加载拓源净利率数据（从净利润贡献数据计算）
const loadTuoyuanNetMarginData = async (period: string) => {
  try {
    console.log('开始加载拓源净利率数据，期间:', period)
    
    // 获取拓源净利润贡献数据
    const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-net-profit-contribution/${period}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('拓源净利润贡献数据响应:', result)
      
      let totalAnnualBudget = 0
      let totalCurrentPeriod = 0
      
      if (result.data && result.data.items && Array.isArray(result.data.items)) {
        // 计算总的年度预算和当期净利润
        result.data.items.forEach((item: any) => {
          // 只计算主营业务的净利润
          if (item.businessType === '主营业务') {
            totalAnnualBudget += item.annualBudget || 0
            totalCurrentPeriod += item.currentPeriod || 0
          }
        })
        
        // 获取主营业务收入数据来计算净利率
        const revenueResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-income-breakdown/${period}`)
        let totalRevenuePlan = 0
        let totalRevenueCurrent = 0
        
        if (revenueResponse.ok) {
          const revenueResult = await revenueResponse.json()
          if (revenueResult.data && revenueResult.data.items) {
            revenueResult.data.items.forEach((item: any) => {
              totalRevenuePlan += item.annualPlan || 0
              totalRevenueCurrent += item.currentPeriod || 0 // 使用当期收入而不是累计
            })
          }
        }
        
        // 计算净利率 = 净利润 / 主营业务收入 * 100
        const planNetMargin = totalRevenuePlan > 0 ? (totalAnnualBudget / totalRevenuePlan) * 100 : 0
        const currentNetMargin = totalRevenueCurrent > 0 ? (totalCurrentPeriod / totalRevenueCurrent) * 100 : 0
        
        // 更新净利率指标
        qualityIndicators.value.netMargin = {
          yearlyPlan: parseFloat(planNetMargin.toFixed(2)),
          current: parseFloat(currentNetMargin.toFixed(2))
        }
      } else {
        // 设置默认值
        qualityIndicators.value.netMargin = { yearlyPlan: 0, current: 0 }
      }
      
      console.log('拓源净利率数据加载成功:', qualityIndicators.value.netMargin)
    } else {
      console.log('拓源净利润贡献数据响应失败:', response.status)
      qualityIndicators.value.netMargin = { yearlyPlan: 0, current: 0 }
    }
  } catch (error) {
    console.error('加载拓源净利率数据失败:', error)
    qualityIndicators.value.netMargin = { yearlyPlan: 0, current: 0 }
  }
}

// 加载净资产收益率数据
const loadROEData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaROEData(period)
  } else {
    // 拓源公司暂时不需要这个指标，设置默认值
    qualityIndicators.value.roe = { yearlyPlan: 0, current: 0 }
  }
}

// 加载南华净资产收益率数据
const loadNanhuaROEData = async (period: string) => {
  
  try {
    console.log('开始加载净资产收益率数据，期间:', period)
    
    const [year] = period.split('-')
    const response = await fetch(`http://47.111.95.19:3000/analytics/roe/${year}?company=shanghai-industry`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('净资产收益率数据响应:', result)
      
      let currentROE = 0
      const yearlyPlan = 21.18 // 目标值
      
      if (result.success && result.data && result.data.currentRate) {
        currentROE = parseFloat(result.data.currentRate) || 0
      }
      
      // 更新净资产收益率指标
      qualityIndicators.value.roe = {
        yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
        current: parseFloat(currentROE.toFixed(2))
      }
      console.log('净资产收益率数据加载成功:', qualityIndicators.value.roe)
    } else {
      console.log('净资产收益率数据响应失败:', response.status)
      qualityIndicators.value.roe = { yearlyPlan: 21.18, current: 0 }
    }
  } catch (error) {
    console.error('加载净资产收益率数据失败:', error)
    qualityIndicators.value.roe = { yearlyPlan: 21.18, current: 0 }
  }
}

// 加载资产负债率数据
const loadAssetLiabilityRatioData = async (period: string) => {
  if (props.companyKey === 'shanghai-industry') {
    await loadNanhuaAssetLiabilityRatioData(period)
  } else {
    // 拓源公司暂时不需要这个指标，设置默认值
    qualityIndicators.value.assetLiabilityRatio = { yearlyPlan: 0, current: 0 }
  }
}

// 加载南华资产负债率数据
const loadNanhuaAssetLiabilityRatioData = async (period: string) => {
  
  try {
    console.log('开始加载资产负债率数据，期间:', period)
    
    const [year] = period.split('-')
    const response = await fetch(`http://47.111.95.19:3000/analytics/asset-liability-ratio/${year}?company=shanghai-industry`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('资产负债率数据响应:', result)
      
      let currentRatio = 0
      const yearlyPlan = 74.0 // 目标值
      
      if (result.success && result.data && result.data.currentRate) {
        currentRatio = parseFloat(result.data.currentRate) || 0
      }
      
      // 更新资产负债率指标
      qualityIndicators.value.assetLiabilityRatio = {
        yearlyPlan: parseFloat(yearlyPlan.toFixed(2)),
        current: parseFloat(currentRatio.toFixed(2))
      }
      console.log('资产负债率数据加载成功:', qualityIndicators.value.assetLiabilityRatio)
    } else {
      console.log('资产负债率数据响应失败:', response.status)
      qualityIndicators.value.assetLiabilityRatio = { yearlyPlan: 74.0, current: 0 }
    }
  } catch (error) {
    console.error('加载资产负债率数据失败:', error)
    qualityIndicators.value.assetLiabilityRatio = { yearlyPlan: 74.0, current: 0 }
  }
}

// 加载所有数据
const loadAllData = async (period: string) => {
  if (props.companyKey !== 'shanghai-industry' && props.companyKey !== 'changzhou') {
    console.log('不支持的公司类型，跳过数据加载:', props.companyKey)
    return
  }
  
  if (isLoading.value) {
    console.log('正在加载中，跳过重复加载')
    return
  }
  
  try {
    const companyName = props.companyKey === 'shanghai-industry' ? '南华' : '拓源'
    console.log(`开始加载${companyName}所有数据，期间:`, period)
    isLoading.value = true
    
    // 使用Promise.allSettled代替Promise.all，避免一个失败导致全部失败
    const results = await Promise.allSettled([
      loadNewOrdersData(period),
      loadCostCenterData(period),
      loadBusinessIncomeData(period),
      loadNetProfitData(period),
      loadMarginContributionData(period),
      loadGrossMarginData(period),
      loadNetMarginData(period),
      loadROEData(period),
      loadAssetLiabilityRatioData(period)
    ])
    
    // 检查结果
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`${companyName}数据加载失败 [${index}]:`, result.reason)
      }
    })
    
    console.log(`${companyName}所有数据加载完成`)
  } catch (error) {
    console.error(`加载${companyName}数据失败:`, error)
  } finally {
    isLoading.value = false
  }
}

// 处理时间周期变化
const handlePeriodChange = (newPeriod) => {
  console.log('简化版报表期间变化:', newPeriod)
  
  if (!newPeriod || typeof newPeriod !== 'string') {
    console.warn('handlePeriodChange收到无效期间:', newPeriod)
    return
  }
  
  emit('period-change', newPeriod)
  
  // 防止重复加载
  if (newPeriod !== props.selectedPeriod && newPeriod.includes('-')) {
    loadAllData(newPeriod)
  }
}

// 生成PDF
const generatePDF = async () => {
  const element = document.getElementById('report-content')
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${props.companyName}-月度经济运行报表-${props.selectedPeriod}.pdf`)
  } catch (error) {
    console.error('生成PDF失败:', error)
  }
}

onMounted(() => {
  console.log(`简化版月度报表已加载，公司: ${props.companyName}，期间: ${props.selectedPeriod}`)
  if (props.selectedPeriod && typeof props.selectedPeriod === 'string' && props.selectedPeriod.includes('-')) {
    loadAllData(props.selectedPeriod)
  } else {
    console.warn('onMounted收到无效期间:', props.selectedPeriod)
  }
})

// 监听期间变化
watch(() => props.selectedPeriod, (newPeriod, oldPeriod) => {
  console.log('监听到期间变化:', oldPeriod, '->', newPeriod)
  if (newPeriod !== oldPeriod && newPeriod && typeof newPeriod === 'string' && newPeriod.includes('-')) {
    loadAllData(newPeriod)
  } else if (!newPeriod || typeof newPeriod !== 'string') {
    console.warn('收到无效的期间值:', newPeriod)
  }
})
</script> 