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
            title="●净资产收益率指标（年化）："
            :data="qualityIndicators.roe"
            type="percentage"
          />
          <IndicatorCard
            title="●资产负债率指标："
            :data="qualityIndicators.assetLiabilityRatio"
            type="percentage"
          />
          <IndicatorCard
            title="●应收账款指标："
            :data="qualityIndicators.receivables"
            type="amount-with-fluctuation"
          />
          <IndicatorCard
            title="●存量指标："
            :data="qualityIndicators.inventory"
            type="amount-with-fluctuation"
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
  mainRevenue: { yearlyPlan: 30000, cumulative: 1000, completionRate: 3.33 },
  netProfit: { yearlyPlan: 2000, cumulative: 5, completionRate: 0.25 },
  costCenter: { yearlyPlan: 4500, cumulative: 250, ratio: 25.00, executionRate: 5.55 }
})

// 质量指标数据 - 使用静态数据
const qualityIndicators = ref({
  marginContribution: { yearlyPlan: 20.00, current: 18.50 },
  grossMargin: { yearlyPlan: 22.00, current: 19.00 },
  netMargin: { yearlyPlan: 6.00, current: 0.02 },
  roe: { yearlyPlan: 20.00, current: 0.05 },
  assetLiabilityRatio: { yearlyPlan: 75.00, current: 79.00 },
  receivables: { initial: 18000, current: 22000, fluctuation: 22.22 },
  inventory: { initial: 120000, current: 125000, fluctuation: 4.17 }
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
  const [year, month] = period.split('-')
  return `${year}年${month}月`
}

// 加载南华新签订单数据
const loadNewOrdersData = async (period: string) => {
  if (props.companyKey !== 'nanhua') {
    return
  }
  
  try {
    const response = await getNanhuaNewOrders(period)
    
    if (response.data?.success && response.data?.data?.engineering) {
      const engineeringData = response.data.data.engineering
      
      // 计算总的年度计划和累计金额
      const totalYearlyPlan = engineeringData.reduce((sum: number, item: any) => sum + (item.yearlyPlan || 0), 0)
      const totalAccumulated = engineeringData.reduce((sum: number, item: any) => sum + (item.accumulated || 0), 0)
      
      // 计算完成率
      const completionRate = totalYearlyPlan > 0 ? (totalAccumulated / totalYearlyPlan) * 100 : 0
      
      // 更新新签订单指标
      keyIndicators.value.newOrders = {
        yearlyPlan: totalYearlyPlan,
        cumulative: totalAccumulated,
        completionRate: parseFloat(completionRate.toFixed(2))
      }
    }
  } catch (error) {
    console.error('加载南华新签订单数据失败:', error)
  }
}

// 加载南华成本中心数据
const loadCostCenterData = async (period: string) => {
  if (props.companyKey !== 'nanhua') {
    return
  }
  
  try {
    const response = await getNanhuaCostCenterStructure(period)
    
    if (response.data?.success && response.data?.data) {
      const { engineering, nonMainBusiness } = response.data.data
      
      // 计算工程项目总计
      const engineeringYearlyPlan = engineering.reduce((sum: number, item: any) => sum + (item.yearlyPlannedIncome || 0), 0)
      const engineeringAccumulated = engineering.reduce((sum: number, item: any) => sum + (item.accumulatedIncome || 0), 0)
      
      // 计算非主营业务总计
      const nonMainYearlyPlan = nonMainBusiness.reduce((sum: number, item: any) => sum + (item.yearlyPlannedIncome || 0), 0)
      const nonMainAccumulated = nonMainBusiness.reduce((sum: number, item: any) => sum + (item.accumulatedIncome || 0), 0)
      
      // 总的年度计划和累计金额
      const totalYearlyPlan = engineeringYearlyPlan + nonMainYearlyPlan
      const totalAccumulated = engineeringAccumulated + nonMainAccumulated
      
      // 计算成本中心损益占比 (累计/年度计划)
      const ratio = totalYearlyPlan > 0 ? (totalAccumulated / totalYearlyPlan) * 100 : 0
      
      // 计算执行率 (与年度计划的比较)
      const executionRate = totalYearlyPlan > 0 ? (totalAccumulated / totalYearlyPlan) * 100 : 0
      
      // 更新成本中心指标
      keyIndicators.value.costCenter = {
        yearlyPlan: parseFloat(totalYearlyPlan.toFixed(2)),
        cumulative: parseFloat(totalAccumulated.toFixed(2)),
        ratio: parseFloat(ratio.toFixed(2)),
        executionRate: parseFloat(executionRate.toFixed(2))
      }
    }
  } catch (error) {
    console.error('加载南华成本中心数据失败:', error)
  }
}

// 加载南华所有数据
const loadNanhuaData = async (period: string) => {
  if (props.companyKey !== 'nanhua') {
    return
  }
  
  try {
    isLoading.value = true
    await Promise.all([
      loadNewOrdersData(period),
      loadCostCenterData(period)
    ])
  } catch (error) {
    console.error('加载南华数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理时间周期变化
const handlePeriodChange = (newPeriod) => {
  emit('period-change', newPeriod)
  loadNanhuaData(newPeriod)
  console.log('简化版报表期间已更改:', newPeriod)
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
  loadNanhuaData(props.selectedPeriod)
})

// 监听期间变化
watch(() => props.selectedPeriod, (newPeriod) => {
  loadNanhuaData(newPeriod)
})
</script> 