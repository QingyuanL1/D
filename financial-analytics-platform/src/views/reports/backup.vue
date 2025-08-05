<template>
  <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
    <!-- 报表头部组件 -->
    <ReportHeader
      title="上海南华兰陵电气有限公司 - 月度经济运行报表"
      v-model:period="selectedPeriod"
      :is-generating="isGenerating"
      @period-change="loadReportData"
      @generate-pdf="generatePDF"
    />

    <div id="report-content" class="space-y-8">
      <!-- 报表标题和基本信息 -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold mb-2">香港大亚管理办公室 2025</h2>
        <h3 class="text-xl font-semibold mb-2">经济运行统计分析报告</h3>
        <p class="text-lg">上海南华兰陵电气有限公司</p>
        <p class="text-md text-gray-600">{{ formatPeriod(selectedPeriod) }}</p>
      </div>

      <!-- 一、经济运行关键指标进度情况概述 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">一、经济运行关键指标进度情况概述（单位：万元）</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-semibold mb-2">●新签订单：</h4>
            <p>年度计划为 {{ formatNumber(keyIndicators.newOrders.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(keyIndicators.newOrders.cumulative) }} 万元，计划完成率为 {{ keyIndicators.newOrders.completionRate }}%</p>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-semibold mb-2">●主营业务收入：</h4>
            <p>年度计划为 {{ formatNumber(keyIndicators.mainRevenue.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(keyIndicators.mainRevenue.cumulative) }} 万元，计划完成率为 {{ keyIndicators.mainRevenue.completionRate }}%</p>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-semibold mb-2">●净利润指标：</h4>
            <p>年度计划为 {{ formatNumber(keyIndicators.netProfit.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(keyIndicators.netProfit.cumulative) }} 万元，计划完成率为 {{ keyIndicators.netProfit.completionRate }}%</p>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-semibold mb-2">●成本中心（计入损益）：</h4>
            <p>年度计划为 {{ formatNumber(keyIndicators.costCenter.yearlyPlan) }} 万元；当期累计为 {{ formatNumber(keyIndicators.costCenter.cumulative) }} 万元，占主营业务比率为 {{ keyIndicators.costCenter.ratio }}%，计划执行率为 {{ keyIndicators.costCenter.executionRate }}%</p>
          </div>
        </div>
      </div>

      <!-- 二、经济运行关键指标质量情况概述 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">二、经济运行关键指标质量情况概述（金额单位：万元）</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●边际贡献率指标：</h4>
            <p class="text-sm">年度计划为 {{ qualityIndicators.marginContribution.yearlyPlan }}%；当期为 {{ qualityIndicators.marginContribution.current }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●毛利率指标：</h4>
            <p class="text-sm">年度计划为 {{ qualityIndicators.grossMargin.yearlyPlan }}%；当期为 {{ qualityIndicators.grossMargin.current }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●净利率指标：</h4>
            <p class="text-sm">年度计划为 {{ qualityIndicators.netMargin.yearlyPlan }}%；当期为 {{ qualityIndicators.netMargin.current }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●净资产收益率指标（年化）：</h4>
            <p class="text-sm">年度计划为 {{ qualityIndicators.roe.yearlyPlan }}%；年化净资产收益率为 {{ qualityIndicators.roe.current }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●资产负债率指标：</h4>
            <p class="text-sm">年度计划为 {{ qualityIndicators.assetLiabilityRatio.yearlyPlan }}%；当期为 {{ qualityIndicators.assetLiabilityRatio.current }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●应收账款指标：</h4>
            <p class="text-sm">年度期初为 {{ formatNumber(qualityIndicators.receivables.initial) }} 万元；当期为 {{ formatNumber(qualityIndicators.receivables.current) }} 万元，波动率为 {{ qualityIndicators.receivables.fluctuation }}%；</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">●存量指标：</h4>
            <p class="text-sm">年度期初为 {{ formatNumber(qualityIndicators.inventory.initial) }} 万元；当期为 {{ formatNumber(qualityIndicators.inventory.current) }} 万元，波动率为 {{ qualityIndicators.inventory.fluctuation }}%；</p>
          </div>
        </div>
      </div>

      <!-- 三、经济运行风险提示 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">三、经济运行风险提示</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-red-50 p-3 rounded">
            <h4 class="font-semibold mb-1">1、财务风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.financial || '当期无风险披露。' }}</p>
          </div>
          <div class="bg-yellow-50 p-3 rounded">
            <h4 class="font-semibold mb-1">2、营销风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.marketing || '当期无风险披露。' }}</p>
          </div>
          <div class="bg-green-50 p-3 rounded">
            <h4 class="font-semibold mb-1">3、生产/施工风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.production || '当期无风险披露。' }}</p>
          </div>
          <div class="bg-blue-50 p-3 rounded">
            <h4 class="font-semibold mb-1">4、管理风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.management || '当期无风险披露。' }}</p>
          </div>
          <div class="bg-purple-50 p-3 rounded">
            <h4 class="font-semibold mb-1">5、研发风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.research || '当期无风险披露。' }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-1">6、其他风险披露情况：</h4>
            <p class="text-sm">{{ riskAlerts.others || '当期无风险披露。' }}</p>
          </div>
        </div>
      </div>

      <!-- 四、经济运行关键指标结构分解情况 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">四、经济运行关键指标结构分解情况</h3>
        
        <!-- 新签订单结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">1、新签订单结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块属性</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当月新增</th>
                  <th class="border border-gray-300 px-4 py-2">累计新签订单</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备类别 -->
                <template v-for="(item, index) in getEquipmentData()" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getEquipmentData().length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.monthlyRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.progress }}%</td>
                  </tr>
                </template>

                <!-- 元件类别 -->
                <template v-for="(item, index) in getComponentsData()" :key="`components-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getComponentsData().length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.monthlyRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.progress }}%</td>
                  </tr>
                </template>

                <!-- 工程类别 -->
                <template v-for="(item, index) in getEngineeringData()" :key="`engineering-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getEngineeringData().length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.monthlyRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeRevenue) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.progress }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(getNewOrderTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNewOrderTotal().monthlyRevenue) }}</td>
                  <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(getNewOrderTotal().cumulativeRevenue) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ getNewOrderTotal().progress }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 营业收入结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">2、营业收入结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-2 py-1">序号</th>
                  <th class="border border-gray-300 px-2 py-1">财务科目</th>
                  <th class="border border-gray-300 px-2 py-1">年度计划</th>
                  <th class="border border-gray-300 px-2 py-1">当月收入</th>
                  <th class="border border-gray-300 px-2 py-1">累计收入</th>
                  <th class="border border-gray-300 px-2 py-1">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in businessIncomeData" :key="item.id">
                  <td class="border border-gray-300 px-2 py-1 text-center">{{ item.id }}</td>
                  <td class="border border-gray-300 px-2 py-1">{{ item.category }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ formatNumber(item.currentMonthIncome) }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ formatNumber(item.accumulatedIncome) }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ item.progress }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 存量结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">3、存量结构与质量（按年度计划口径分解，不含合同负债）(单位：万元)</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初金额</th>
                  <th class="border border-gray-300 px-4 py-2">当期金额</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getInventoryEquipmentData()" :key="`inventory-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getInventoryEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.currentAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.fluctuation }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getInventoryComponentData()" :key="`inventory-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getInventoryComponentData().length" class="border border-gray-300 px-4 py-2 text-center">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.currentAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.fluctuation }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getInventoryProjectData()" :key="`inventory-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getInventoryProjectData().length" class="border border-gray-300 px-4 py-2 text-center">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.currentAmount) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ item.fluctuation }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getInventoryTotal().initialAmount) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getInventoryTotal().currentAmount) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ getInventoryTotal().fluctuation }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 主营业务成本结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">4、主营业务成本结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <h5 class="text-md font-medium mb-2">对应年度计划:</h5>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">计划执行率</th>
                  <th class="border border-gray-300 px-4 py-2">当期直接费用</th>
                  <th class="border border-gray-300 px-4 py-2">累计直接费用</th>
                  <th class="border border-gray-300 px-4 py-2">当期制造费用/间接成本</th>
                  <th class="border border-gray-300 px-4 py-2">累计制造费用/间接成本</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getMainBusinessCostEquipmentData()" :key="`cost-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMainBusinessCostEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ item.executionRate }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentLaborCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeLaborCost) }}</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getMainBusinessCostComponentData()" :key="`cost-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMainBusinessCostComponentData().length" class="border border-gray-300 px-4 py-2 text-center">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ item.executionRate }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentLaborCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeLaborCost) }}</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getMainBusinessCostProjectData()" :key="`cost-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMainBusinessCostProjectData().length" class="border border-gray-300 px-4 py-2 text-center">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ item.executionRate }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeMaterialCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentLaborCost) }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.cumulativeLaborCost) }}</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMainBusinessCostTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ getMainBusinessCostTotal().executionRate }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMainBusinessCostTotal().currentMaterialCost) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMainBusinessCostTotal().cumulativeMaterialCost) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMainBusinessCostTotal().currentLaborCost) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMainBusinessCostTotal().cumulativeLaborCost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 成本中心结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">5、成本中心结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <h5 class="text-md font-medium mb-2">对应当期收入:</h5>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">累计收入</th>
                  <th class="border border-gray-300 px-4 py-2">当期收入</th>
                  <th class="border border-gray-300 px-4 py-2">分项占收入比</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getCostCenterEquipmentData()" :key="`cost-center-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getCostCenterEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.cumulativeIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMonthIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getCostCenterPercentageColor(item.percentage)">{{ item.percentage }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getCostCenterComponentData()" :key="`cost-center-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getCostCenterComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.cumulativeIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMonthIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getCostCenterPercentageColor(item.percentage)">{{ item.percentage }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getCostCenterProjectData()" :key="`cost-center-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getCostCenterProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.cumulativeIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMonthIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getCostCenterPercentageColor(item.percentage)">{{ item.percentage }}%</td>
                  </tr>
                </template>

                <!-- 非主营业务 -->
                <template v-for="(item, index) in getCostCenterNonMainBusinessData()" :key="`cost-center-non-main-${index}`">
                  <tr class="bg-purple-50">
                    <td class="border border-gray-300 px-4 py-2 font-medium bg-purple-100 text-center">非主营业务</td>
                    <td class="border border-gray-300 px-4 py-2 font-medium bg-purple-50"></td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right font-medium">{{ formatNumber(item.cumulativeIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.currentMonthIncome) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium" :class="getCostCenterPercentageColor(item.percentage)">{{ item.percentage }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getCostCenterTotal().cumulativeIncome) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getCostCenterTotal().currentMonthIncome) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ getCostCenterTotal().percentage }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 主营业务边际贡献率结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">6、主营业务边际贡献率结构与质量（按年度计划口径分解）</h4>
          <h5 class="text-md font-medium mb-2">对应主营收入:</h5>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期实际</th>
                  <th class="border border-gray-300 px-4 py-2">偏差</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getMarginContributionEquipmentData()" :key="`margin-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMarginContributionEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getMarginContributionDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getMarginContributionComponentData()" :key="`margin-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMarginContributionComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getMarginContributionDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getMarginContributionProjectData()" :key="`margin-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getMarginContributionProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getMarginContributionDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMarginContributionTotal().yearlyPlan) }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getMarginContributionTotal().currentActual) }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right" :class="getMarginContributionDeviationColor(getMarginContributionTotal().deviation)">{{ formatNumber(getMarginContributionTotal().deviation) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 主营业务毛利率结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">7、主营业务毛利率结构与质量（按年度计划口径分解）</h4>
          <div class="text-sm text-blue-600 mb-2">当期实际值自动计算：(主营收入-主营成本)/主营收入 × 100%</div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期实际</th>
                  <th class="border border-gray-300 px-4 py-2">偏差</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getProfitMarginEquipmentData()" :key="`profit-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProfitMarginEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getProfitMarginDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getProfitMarginComponentData()" :key="`profit-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProfitMarginComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getProfitMarginDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getProfitMarginProjectData()" :key="`profit-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProfitMarginProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentActual) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right" :class="getProfitMarginDeviationColor(item.deviation)">{{ formatNumber(item.deviation) }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProfitMarginTotal().yearlyPlan) }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProfitMarginTotal().currentActual) }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right" :class="getProfitMarginDeviationColor(getProfitMarginTotal().deviation)">{{ formatNumber(getProfitMarginTotal().deviation) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 净利润结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">8、净利润结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">序号</th>
                  <th class="border border-gray-300 px-4 py-2">财务科目</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期</th>
                  <th class="border border-gray-300 px-4 py-2">累计</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in netProfitData" :key="item.id">
                  <td class="border border-gray-300 px-4 py-2 text-center">{{ item.id }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.category }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">{{ formatNumber(item.yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.current) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">{{ formatNumber(item.cumulative) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ calculateNetProfitProgress(item) }}%</td>
                </tr>
                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitMainTableTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitMainTableTotal().current) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitMainTableTotal().cumulative) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitMainTableTotal().progress) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 主营业务净利润贡献情况 - 暂时隐藏 -->
        <!--
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">主营业务净利润贡献情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当月值</th>
                  <th class="border border-gray-300 px-4 py-2">累计值</th>
                  <th class="border border-gray-300 px-4 py-2">分类贡献占比</th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitContributionTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitContributionTotal().currentMonth) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitContributionTotal().cumulative) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">100.00%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        -->

        <!-- 非主营业务净利润贡献情况 - 暂时隐藏 -->
        <!--
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">非主营业务净利润贡献情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">序号</th>
                  <th class="border border-gray-300 px-4 py-2">财务科目</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期</th>
                  <th class="border border-gray-300 px-4 py-2">累计</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitNonMainBusinessTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitNonMainBusinessTotal().current) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitNonMainBusinessTotal().cumulative) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getNetProfitNonMainBusinessTotal().progress) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        -->

        <!-- 收款结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">9、收款结构与质量（按年度计划口径分解）(单位：万元)</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期收款</th>
                  <th class="border border-gray-300 px-4 py-2">累计收款</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getReceiptEquipmentData()" :key="`receipt-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getReceiptEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.cumulativeReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getReceiptComponentData()" :key="`receipt-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getReceiptComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.cumulativeReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getReceiptProjectData()" :key="`receipt-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getReceiptProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.cumulativeReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getReceiptTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getReceiptTotal().currentReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getReceiptTotal().cumulativeReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getReceiptTotal().progress) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 应收账款情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">应收账款情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初应收余额</th>
                  <th class="border border-gray-300 px-4 py-2">当期新增开票</th>
                  <th class="border border-gray-300 px-4 py-2">累计新增开票</th>
                  <th class="border border-gray-300 px-4 py-2">当期收款</th>
                  <th class="border border-gray-300 px-4 py-2">累计收款</th>
                  <th class="border border-gray-300 px-4 py-2">当期应收余额</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getAccountsReceivableEquipmentData()" :key="`ar-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getAccountsReceivableEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalNewInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.currentBalance) }}</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getAccountsReceivableComponentData()" :key="`ar-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getAccountsReceivableComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalNewInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.currentBalance) }}</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getAccountsReceivableProjectData()" :key="`ar-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getAccountsReceivableProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalNewInvoice) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.currentBalance) }}</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().initialBalance) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().newInvoice) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().totalNewInvoice) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().currentReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().totalReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getAccountsReceivableTotal().currentBalance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 逾期应收账款情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">逾期应收账款情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余额</th>
                  <th class="border border-gray-300 px-4 py-2">本年新增</th>
                  <th class="border border-gray-300 px-4 py-2">当月收款</th>
                  <th class="border border-gray-300 px-4 py-2">累计已收款</th>
                  <th class="border border-gray-300 px-4 py-2">收款进度</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getOverdueReceivablesEquipmentData()" :key="`overdue-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getOverdueReceivablesEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.monthlyReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getOverdueReceivablesComponentData()" :key="`overdue-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getOverdueReceivablesComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.monthlyReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getOverdueReceivablesProjectData()" :key="`overdue-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getOverdueReceivablesProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.monthlyReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.totalReceipt) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.progress) }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getOverdueReceivablesTotal().initialBalance) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getOverdueReceivablesTotal().newAddition) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getOverdueReceivablesTotal().monthlyReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getOverdueReceivablesTotal().totalReceipt) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getOverdueReceivablesTotal().progress) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 坏账准备情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">坏账准备情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余额</th>
                  <th class="border border-gray-300 px-4 py-2">本年新增</th>
                  <th class="border border-gray-300 px-4 py-2">当月转回</th>
                  <th class="border border-gray-300 px-4 py-2">累计转回</th>
                  <th class="border border-gray-300 px-4 py-2">坏账准备余额</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getBadDebtProvisionEquipmentData()" :key="`bad-debt-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getBadDebtProvisionEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.accumulatedReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.finalBalance) }}</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getBadDebtProvisionComponentData()" :key="`bad-debt-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getBadDebtProvisionComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.accumulatedReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.finalBalance) }}</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getBadDebtProvisionProjectData()" :key="`bad-debt-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getBadDebtProvisionProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customer }}</td>
                    <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">{{ formatNumber(item.initialBalance) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.newAddition) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.accumulatedReversal) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.finalBalance) }}</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getBadDebtProvisionTotal().initialBalance) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getBadDebtProvisionTotal().newAddition) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getBadDebtProvisionTotal().currentReversal) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getBadDebtProvisionTotal().accumulatedReversal) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getBadDebtProvisionTotal().finalBalance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 年度重大投资情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">10、年度重大投资情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-2 py-1">序号</th>
                  <th class="border border-gray-300 px-2 py-1">项目名称</th>
                  <th class="border border-gray-300 px-2 py-1">年初计划</th>
                  <th class="border border-gray-300 px-2 py-1">当期执行</th>
                  <th class="border border-gray-300 px-2 py-1">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in majorInvestmentData" :key="item.id">
                  <td class="border border-gray-300 px-2 py-1 text-center">{{ item.id }}</td>
                  <td class="border border-gray-300 px-2 py-1">{{ item.projectName }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ formatNumber(item.initialPlan) }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ formatNumber(item.currentExecution) }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">{{ item.progress }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 产值结构情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">11、产值结构情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">公司设计产能</th>
                  <th class="border border-gray-300 px-4 py-2">年度产能计划</th>
                  <th class="border border-gray-300 px-4 py-2">当期产能</th>
                  <th class="border border-gray-300 px-4 py-2">累计产能</th>
                  <th class="border border-gray-300 px-4 py-2">计划执行进度</th>
                  <th class="border border-gray-300 px-4 py-2">产能利用率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getProductionValueEquipmentData()" :key="`production-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProductionValueEquipmentData().length" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.designCapacity) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentPeriod) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentAccumulated) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.executionProgress) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.utilizationRate) }}%</td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in getProductionValueComponentData()" :key="`production-component-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProductionValueComponentData().length" class="border border-gray-300 px-4 py-2 text-center bg-green-50">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.designCapacity) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentPeriod) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentAccumulated) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.executionProgress) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.utilizationRate) }}%</td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getProductionValueProjectData()" :key="`production-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProductionValueProjectData().length" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.designCapacity) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentPeriod) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.currentAccumulated) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.executionProgress) }}%</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ formatNumber(item.utilizationRate) }}%</td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().designCapacity) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().currentPeriod) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().currentAccumulated) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().executionProgress) }}%</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionValueTotal().utilizationRate) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 生产/施工订单生产施工执行情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">12、生产/施工订单生产施工执行情况（单位：万元）</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划产值</th>
                  <th class="border border-gray-300 px-4 py-2">自制/自行施工</th>
                  <th class="border border-gray-300 px-4 py-2">半自制/分包</th>
                  <th class="border border-gray-300 px-4 py-2">外发/转包</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in getProductionExecutionEquipmentData()" :key="`production-exec-equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProductionExecutionEquipmentData().length + 1" class="border border-gray-300 px-4 py-2 text-center bg-blue-50">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.selfProduction) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.semiProduction) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.outsourcing) }}</td>
                  </tr>
                </template>

                <!-- 设备自制率 -->
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-2">自制率%</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionEquipmentSelfRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionEquipmentSemiRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionEquipmentOutsourcingRate() }}</td>
                </tr>

                <!-- 元件板块 -->
                <tr>
                  <td class="border border-gray-300 px-4 py-2 text-center bg-green-50" rowspan="2">元件</td>
                  <td class="border border-gray-300 px-4 py-2">用户</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(productionExecutionComponentData.yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(productionExecutionComponentData.selfProduction) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(productionExecutionComponentData.semiProduction) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(productionExecutionComponentData.outsourcing) }}</td>
                </tr>

                <!-- 元件自制率 -->
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-2">自制率%</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionComponentSelfRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionComponentSemiRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionComponentOutsourcingRate() }}</td>
                </tr>

                <!-- 工程板块 -->
                <template v-for="(item, index) in getProductionExecutionProjectData()" :key="`production-exec-project-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="getProductionExecutionProjectData().length + 1" class="border border-gray-300 px-4 py-2 text-center bg-yellow-50">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearlyPlan) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.selfProduction) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.semiProduction) }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right font-medium">{{ formatNumber(item.outsourcing) }}</td>
                  </tr>
                </template>

                <!-- 工程自行施工率 -->
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-4 py-2">自行施工率%</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionProjectSelfRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionProjectSemiRate() }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right font-bold">{{ getProductionExecutionProjectOutsourcingRate() }}</td>
                </tr>

                <!-- 合计产值 -->
                <tr class="bg-gray-100 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计产值</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionExecutionTotal().yearlyPlan) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionExecutionTotal().selfProduction) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionExecutionTotal().semiProduction) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(getProductionExecutionTotal().outsourcing) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 办公室评估意见 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">办公室对{{ formatPeriod(selectedPeriod) }}经济运行情况的整体评估意见：</h3>
        <div class="bg-gray-50 p-4 rounded min-h-[100px]">
          <textarea 
            v-model="officeEvaluation" 
            class="w-full h-24 p-2 border rounded resize-none"
            placeholder="请输入办公室评估意见..."
          ></textarea>
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

<script setup>
import { ref, onMounted } from 'vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getAllReportData, calculateKeyIndicators } from '@/services/reportDataService.js'

// 响应式数据
const selectedPeriod = ref(new Date().toISOString().slice(0, 7))
const isLoading = ref(false)
const isGenerating = ref(false)
const officeEvaluation = ref('')

// 关键指标数据
const keyIndicators = ref({
  newOrders: { yearlyPlan: 80000, cumulative: 5559, completionRate: 6.95 },
  mainRevenue: { yearlyPlan: 55000, cumulative: 1999.18, completionRate: 3.33 },
  netProfit: { yearlyPlan: 4000, cumulative: 6.92, completionRate: 0.17 },
  costCenter: { yearlyPlan: 8343.71, cumulative: 499, ratio: 25.60, executionRate: 5.98 }
})

// 质量指标数据
const qualityIndicators = ref({
  marginContribution: { yearlyPlan: 21.98, current: 20.00 },
  grossMargin: { yearlyPlan: 24.00, current: 20.98 },
  netMargin: { yearlyPlan: 6.85, current: 0.01 },
  roe: { yearlyPlan: 21.18, current: 0.04 },
  assetLiabilityRatio: { yearlyPlan: 74.00, current: 78.00 },
  receivables: { initial: 19187.49, current: 23648.98, fluctuation: 23.25 },
  inventory: { initial: 121493.00, current: 126907.00, fluctuation: 4.46 }
})

// 风险提示数据
const riskAlerts = ref({
  financial: '',
  marketing: '当期无风险披露。',
  production: '当期无风险披露。',
  management: '当期无风险披露。',
  research: '当期无风险披露。',
  others: '当期无风险披露。'
})

// 新签订单数据
const newOrderData = ref([])

// 营业收入数据
const businessIncomeData = ref([])

// 存量数据
const inventoryData = ref([])

// 主营业务成本数据
const mainBusinessCostData = ref([])

// 成本中心数据
const costCenterData = ref([])

// 边际贡献率数据
const marginContributionData = ref([])

// 毛利率数据
const profitMarginData = ref([])

// 净利润数据
const netProfitData = ref([])

// 净利润主营业务贡献数据
const netProfitMainBusinessContributionData = ref([])

// 净利润非主营业务数据
const netProfitNonMainBusinessData = ref([])

// 收款数据
const receiptData = ref([])

// 应收账款数据
const accountsReceivableData = ref([])

// 逾期应收款数据
const overdueReceivablesData = ref([])

// 坏账准备数据
const badDebtProvisionData = ref([])

// 重大投资数据
const majorInvestmentData = ref([])

// 产值结构数据
const productionValueData = ref([])

// 生产执行分析数据
const productionExecutionData = ref([])
const productionExecutionComponentData = ref({
  yearlyPlan: 0,
  selfProduction: 0,
  semiProduction: 0,
  outsourcing: 0
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

// 格式化期间
const formatPeriod = (period) => {
  if (!period) return ''
  const [year, month] = period.split('-')
  return `${year} 年 ${month.padStart(2, '0')} 月`
}

// 获取设备数据
const getEquipmentData = () => {
  return newOrderData.value.filter(item => item.sector === '设备')
}

// 获取元件数据
const getComponentsData = () => {
  return newOrderData.value.filter(item => item.sector === '元件')
}

// 获取工程数据
const getEngineeringData = () => {
  return newOrderData.value.filter(item => item.sector === '工程')
}

// 计算新签订单合计
const getNewOrderTotal = () => {
  const total = {
    yearlyPlan: 0,
    monthlyRevenue: 0,
    cumulativeRevenue: 0,
    progress: 0
  }

  newOrderData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.monthlyRevenue += Number(item.monthlyRevenue) || 0
    total.cumulativeRevenue += Number(item.cumulativeRevenue) || 0
  })

  // 计算总进度
  total.progress = total.yearlyPlan > 0 ? (total.cumulativeRevenue / total.yearlyPlan * 100).toFixed(2) : '0.00'

  return total
}

// 获取存量设备数据
const getInventoryEquipmentData = () => {
  return inventoryData.value.filter(item => item.sector === '设备')
}

// 获取存量元件数据
const getInventoryComponentData = () => {
  return inventoryData.value.filter(item => item.sector === '元件')
}

// 获取存量工程数据
const getInventoryProjectData = () => {
  return inventoryData.value.filter(item => item.sector === '工程')
}

// 计算存量合计
const getInventoryTotal = () => {
  const total = {
    initialAmount: 0,
    currentAmount: 0,
    fluctuation: '0.00'
  }

  inventoryData.value.forEach(item => {
    total.initialAmount += Number(item.initialAmount) || 0
    total.currentAmount += Number(item.currentAmount) || 0
  })

  // 计算总波动率（与原始表格逻辑一致）
  if (total.initialAmount === 0) {
    total.fluctuation = total.currentAmount === 0 ? '0.00' : '0.00'
  } else {
    const fluctuation = ((total.currentAmount - total.initialAmount) / total.initialAmount) * 100
    total.fluctuation = fluctuation.toFixed(2)
  }

  return total
}

// 获取主营业务成本设备数据
const getMainBusinessCostEquipmentData = () => {
  return mainBusinessCostData.value.filter(item => item.sector === '设备')
}

// 获取主营业务成本元件数据
const getMainBusinessCostComponentData = () => {
  return mainBusinessCostData.value.filter(item => item.sector === '元件')
}

// 获取主营业务成本工程数据
const getMainBusinessCostProjectData = () => {
  return mainBusinessCostData.value.filter(item => item.sector === '工程')
}

// 计算主营业务成本合计
const getMainBusinessCostTotal = () => {
  const total = {
    yearlyPlan: 0,
    executionRate: '0.00',
    currentMaterialCost: 0,
    cumulativeMaterialCost: 0,
    currentLaborCost: 0,
    cumulativeLaborCost: 0
  }

  mainBusinessCostData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentMaterialCost += Number(item.currentMaterialCost) || 0
    total.cumulativeMaterialCost += Number(item.cumulativeMaterialCost) || 0
    total.currentLaborCost += Number(item.currentLaborCost) || 0
    total.cumulativeLaborCost += Number(item.cumulativeLaborCost) || 0
  })

  // 计算总执行率
  const totalCumulativeCost = total.cumulativeMaterialCost + total.cumulativeLaborCost
  total.executionRate = total.yearlyPlan > 0 ? (totalCumulativeCost / total.yearlyPlan * 100).toFixed(2) : '0.00'

  return total
}

// 获取成本中心设备数据
const getCostCenterEquipmentData = () => {
  return costCenterData.value.filter(item => item.sector === '设备')
}

// 获取成本中心元件数据
const getCostCenterComponentData = () => {
  return costCenterData.value.filter(item => item.sector === '元件')
}

// 获取成本中心工程数据
const getCostCenterProjectData = () => {
  return costCenterData.value.filter(item => item.sector === '工程')
}

// 获取成本中心非主营业务数据
const getCostCenterNonMainBusinessData = () => {
  return costCenterData.value.filter(item => item.sector === '非主营业务')
}

// 获取成本中心百分比颜色
const getCostCenterPercentageColor = (percentage) => {
  const num = parseFloat(percentage)
  if (num < 0) return 'text-red-600'
  if (num > 100) return 'text-orange-600'
  if (num > 50) return 'text-green-600'
  return 'text-gray-700'
}

// 计算成本中心合计
const getCostCenterTotal = () => {
  const total = {
    cumulativeIncome: 0,
    currentMonthIncome: 0,
    percentage: '0.00'
  }

  costCenterData.value.forEach(item => {
    total.cumulativeIncome += Number(item.cumulativeIncome) || 0
    total.currentMonthIncome += Number(item.currentMonthIncome) || 0
  })

  // 计算总百分比
  total.percentage = total.cumulativeIncome > 0 ? ((total.currentMonthIncome / total.cumulativeIncome) * 100).toFixed(2) : '0.00'

  return total
}

// 计算净利润执行进度
const calculateNetProfitProgress = (item) => {
  const yearlyPlan = Number(item.yearlyPlan) || 0
  const cumulative = Number(item.cumulative) || 0

  if (yearlyPlan === 0) return '0.00'
  return ((cumulative / yearlyPlan) * 100).toFixed(2)
}

// 计算净利润非主营业务执行进度
const calculateNetProfitNonMainBusinessProgress = (item) => {
  const yearlyPlan = Number(item.yearlyPlan) || 0
  const cumulative = Number(item.cumulative) || 0

  if (yearlyPlan === 0) return '0.00'
  return ((cumulative / yearlyPlan) * 100).toFixed(2)
}

// 计算净利润主表合计
const getNetProfitMainTableTotal = () => {
  const total = {
    yearlyPlan: 0,
    current: 0,
    cumulative: 0,
    progress: 0
  }

  netProfitData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.current += Number(item.current) || 0
    total.cumulative += Number(item.cumulative) || 0
  })

  // 计算总执行进度
  total.progress = total.yearlyPlan > 0 ? ((total.cumulative / total.yearlyPlan) * 100).toFixed(2) : '0.00'

  return total
}

// 获取净利润设备数据
const getNetProfitEquipmentData = () => {
  return netProfitMainBusinessContributionData.value.filter(item => item.sector === '设备')
}

// 获取净利润元件数据
const getNetProfitComponentData = () => {
  return netProfitMainBusinessContributionData.value.filter(item => item.sector === '元件')
}

// 获取净利润工程数据
const getNetProfitProjectData = () => {
  return netProfitMainBusinessContributionData.value.filter(item => item.sector === '工程')
}

// 计算净利润贡献合计
const getNetProfitContributionTotal = () => {
  const total = {
    yearlyPlan: 0,
    currentMonth: 0,
    cumulative: 0
  }

  netProfitMainBusinessContributionData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentMonth += Number(item.currentMonth) || 0
    total.cumulative += Number(item.cumulative) || 0
  })

  return total
}

// 获取净利润非主营业务数据
const getNetProfitNonMainBusinessData = () => {
  return netProfitNonMainBusinessData.value
}

// 计算净利润非主营业务合计
const getNetProfitNonMainBusinessTotal = () => {
  const total = {
    yearlyPlan: 0,
    current: 0,
    cumulative: 0,
    progress: 0
  }

  netProfitNonMainBusinessData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.current += Number(item.current) || 0
    total.cumulative += Number(item.cumulative) || 0
  })

  // 计算总执行进度
  total.progress = total.yearlyPlan > 0 ? ((total.cumulative / total.yearlyPlan) * 100).toFixed(2) : '0.00'

  return total
}

// 获取收款设备数据
const getReceiptEquipmentData = () => {
  return receiptData.value.filter(item => item.sector === '设备')
}

// 获取收款元件数据
const getReceiptComponentData = () => {
  return receiptData.value.filter(item => item.sector === '元件')
}

// 获取收款工程数据
const getReceiptProjectData = () => {
  return receiptData.value.filter(item => item.sector === '工程')
}

// 计算收款合计
const getReceiptTotal = () => {
  const total = {
    yearlyPlan: 0,
    currentReceipt: 0,
    cumulativeReceipt: 0,
    progress: 0
  }

  receiptData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentReceipt += Number(item.currentReceipt) || 0
    total.cumulativeReceipt += Number(item.cumulativeReceipt) || 0
  })

  // 计算总执行进度
  total.progress = total.yearlyPlan > 0 ? ((total.cumulativeReceipt / total.yearlyPlan) * 100).toFixed(2) : '0.00'

  return total
}

// 获取应收账款设备数据
const getAccountsReceivableEquipmentData = () => {
  return accountsReceivableData.value.filter(item => item.sector === '设备')
}

// 获取应收账款元件数据
const getAccountsReceivableComponentData = () => {
  return accountsReceivableData.value.filter(item => item.sector === '元件')
}

// 获取应收账款工程数据
const getAccountsReceivableProjectData = () => {
  return accountsReceivableData.value.filter(item => item.sector === '工程')
}

// 计算应收账款合计
const getAccountsReceivableTotal = () => {
  const total = {
    initialBalance: 0,
    newInvoice: 0,
    totalNewInvoice: 0,
    currentReceipt: 0,
    totalReceipt: 0,
    currentBalance: 0
  }

  accountsReceivableData.value.forEach(item => {
    total.initialBalance += Number(item.initialBalance) || 0
    total.newInvoice += Number(item.newInvoice) || 0
    total.totalNewInvoice += Number(item.totalNewInvoice) || 0
    total.currentReceipt += Number(item.currentReceipt) || 0
    total.totalReceipt += Number(item.totalReceipt) || 0
    total.currentBalance += Number(item.currentBalance) || 0
  })

  return total
}

// 获取逾期应收款设备数据
const getOverdueReceivablesEquipmentData = () => {
  return overdueReceivablesData.value.filter(item => item.sector === '设备')
}

// 获取逾期应收款元件数据
const getOverdueReceivablesComponentData = () => {
  return overdueReceivablesData.value.filter(item => item.sector === '元件')
}

// 获取逾期应收款工程数据
const getOverdueReceivablesProjectData = () => {
  return overdueReceivablesData.value.filter(item => item.sector === '工程')
}

// 计算逾期应收款合计
const getOverdueReceivablesTotal = () => {
  const total = {
    initialBalance: 0,
    newAddition: 0,
    totalNewAddition: 0,
    monthlyReceipt: 0,
    totalReceipt: 0,
    progress: 0
  }

  overdueReceivablesData.value.forEach(item => {
    total.initialBalance += Number(item.initialBalance) || 0
    total.newAddition += Number(item.newAddition) || 0
    total.totalNewAddition += Number(item.totalNewAddition) || 0
    total.monthlyReceipt += Number(item.monthlyReceipt) || 0
    total.totalReceipt += Number(item.totalReceipt) || 0
  })

  // 计算总收款进度
  const totalOverdue = total.initialBalance + total.totalNewAddition
  total.progress = totalOverdue > 0 ? ((total.totalReceipt / totalOverdue) * 100).toFixed(2) : '0.00'

  return total
}

// 获取坏账准备设备数据
const getBadDebtProvisionEquipmentData = () => {
  return badDebtProvisionData.value.filter(item => item.sector === '设备')
}

// 获取坏账准备元件数据
const getBadDebtProvisionComponentData = () => {
  return badDebtProvisionData.value.filter(item => item.sector === '元件')
}

// 获取坏账准备工程数据
const getBadDebtProvisionProjectData = () => {
  return badDebtProvisionData.value.filter(item => item.sector === '工程')
}

// 计算坏账准备合计
const getBadDebtProvisionTotal = () => {
  const total = {
    initialBalance: 0,
    newAddition: 0,
    currentReversal: 0,
    accumulatedReversal: 0,
    finalBalance: 0
  }

  badDebtProvisionData.value.forEach(item => {
    total.initialBalance += Number(item.initialBalance) || 0
    total.newAddition += Number(item.newAddition) || 0
    total.currentReversal += Number(item.currentReversal) || 0
    total.accumulatedReversal += Number(item.accumulatedReversal) || 0
    total.finalBalance += Number(item.finalBalance) || 0
  })

  return total
}

// 获取产值结构设备数据
const getProductionValueEquipmentData = () => {
  return productionValueData.value.filter(item => item.segment === '设备')
}

// 获取产值结构元件数据
const getProductionValueComponentData = () => {
  return productionValueData.value.filter(item => item.segment === '元件')
}

// 获取产值结构工程数据
const getProductionValueProjectData = () => {
  return productionValueData.value.filter(item => item.segment === '工程')
}

// 计算产值结构合计
const getProductionValueTotal = () => {
  const total = {
    designCapacity: 0,
    yearlyPlan: 0,
    currentPeriod: 0,
    currentAccumulated: 0,
    executionProgress: 0,
    utilizationRate: 0
  }

  productionValueData.value.forEach(item => {
    total.designCapacity += Number(item.designCapacity) || 0
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentPeriod += Number(item.currentPeriod) || 0
    total.currentAccumulated += Number(item.currentAccumulated) || 0
  })

  // 计算平均执行进度和利用率
  if (total.yearlyPlan > 0) {
    total.executionProgress = parseFloat(((total.currentAccumulated / total.yearlyPlan) * 100).toFixed(2))
  }

  if (total.designCapacity > 0) {
    total.utilizationRate = parseFloat(((total.currentAccumulated / total.designCapacity) * 100).toFixed(2))
  }

  return total
}

// 获取生产执行分析设备数据
const getProductionExecutionEquipmentData = () => {
  return productionExecutionData.value.filter(item => item.segment === '设备')
}

// 获取生产执行分析工程数据
const getProductionExecutionProjectData = () => {
  return productionExecutionData.value.filter(item => item.segment === '工程')
}

// 计算生产执行分析设备自制率
const getProductionExecutionEquipmentSelfRate = () => {
  const equipmentData = getProductionExecutionEquipmentData()
  const totalYearlyPlan = equipmentData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalSelfProduction = equipmentData.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
  return totalYearlyPlan > 0 ? (totalSelfProduction / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionEquipmentSemiRate = () => {
  const equipmentData = getProductionExecutionEquipmentData()
  const totalYearlyPlan = equipmentData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalSemiProduction = equipmentData.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
  return totalYearlyPlan > 0 ? (totalSemiProduction / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionEquipmentOutsourcingRate = () => {
  const equipmentData = getProductionExecutionEquipmentData()
  const totalYearlyPlan = equipmentData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalOutsourcing = equipmentData.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)
  return totalYearlyPlan > 0 ? (totalOutsourcing / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

// 计算生产执行分析元件自制率
const getProductionExecutionComponentSelfRate = () => {
  const total = productionExecutionComponentData.value.yearlyPlan
  return total > 0 ? (productionExecutionComponentData.value.selfProduction / total * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionComponentSemiRate = () => {
  const total = productionExecutionComponentData.value.yearlyPlan
  return total > 0 ? (productionExecutionComponentData.value.semiProduction / total * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionComponentOutsourcingRate = () => {
  const total = productionExecutionComponentData.value.yearlyPlan
  return total > 0 ? (productionExecutionComponentData.value.outsourcing / total * 100).toFixed(1) + '%' : '0.0%'
}

// 计算生产执行分析工程自行施工率
const getProductionExecutionProjectSelfRate = () => {
  const projectData = getProductionExecutionProjectData()
  const totalYearlyPlan = projectData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalSelfProduction = projectData.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
  return totalYearlyPlan > 0 ? (totalSelfProduction / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionProjectSemiRate = () => {
  const projectData = getProductionExecutionProjectData()
  const totalYearlyPlan = projectData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalSemiProduction = projectData.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
  return totalYearlyPlan > 0 ? (totalSemiProduction / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

const getProductionExecutionProjectOutsourcingRate = () => {
  const projectData = getProductionExecutionProjectData()
  const totalYearlyPlan = projectData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const totalOutsourcing = projectData.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)
  return totalYearlyPlan > 0 ? (totalOutsourcing / totalYearlyPlan * 100).toFixed(1) + '%' : '0.0%'
}

// 计算生产执行分析合计
const getProductionExecutionTotal = () => {
  const equipmentData = getProductionExecutionEquipmentData()
  const projectData = getProductionExecutionProjectData()

  const equipmentYearlyPlan = equipmentData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const equipmentSelfProduction = equipmentData.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
  const equipmentSemiProduction = equipmentData.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
  const equipmentOutsourcing = equipmentData.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)

  const projectYearlyPlan = projectData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
  const projectSelfProduction = projectData.reduce((sum, item) => sum + Number(item.selfProduction || 0), 0)
  const projectSemiProduction = projectData.reduce((sum, item) => sum + Number(item.semiProduction || 0), 0)
  const projectOutsourcing = projectData.reduce((sum, item) => sum + Number(item.outsourcing || 0), 0)

  return {
    yearlyPlan: equipmentYearlyPlan + productionExecutionComponentData.value.yearlyPlan + projectYearlyPlan,
    selfProduction: equipmentSelfProduction + productionExecutionComponentData.value.selfProduction + projectSelfProduction,
    semiProduction: equipmentSemiProduction + productionExecutionComponentData.value.semiProduction + projectSemiProduction,
    outsourcing: equipmentOutsourcing + productionExecutionComponentData.value.outsourcing + projectOutsourcing
  }
}

// 获取边际贡献率设备数据
const getMarginContributionEquipmentData = () => {
  return marginContributionData.value.filter(item => item.sector === '设备')
}

// 获取边际贡献率元件数据
const getMarginContributionComponentData = () => {
  return marginContributionData.value.filter(item => item.sector === '元件')
}

// 获取边际贡献率工程数据
const getMarginContributionProjectData = () => {
  return marginContributionData.value.filter(item => item.sector === '工程')
}

// 获取边际贡献率偏差颜色
const getMarginContributionDeviationColor = (deviation) => {
  const num = parseFloat(deviation)
  if (num < -5) return 'text-red-600 font-bold'
  if (num < 0) return 'text-red-500'
  if (num > 5) return 'text-green-600 font-bold'
  if (num > 0) return 'text-green-500'
  return 'text-gray-700'
}

// 计算边际贡献率合计
const getMarginContributionTotal = () => {
  const total = {
    yearlyPlan: 0,
    currentActual: 0,
    deviation: '0.00'
  }

  let totalCount = 0
  marginContributionData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentActual += Number(item.currentActual) || 0
    totalCount++
  })

  // 计算平均值
  if (totalCount > 0) {
    total.yearlyPlan = (total.yearlyPlan / totalCount).toFixed(2)
    total.currentActual = (total.currentActual / totalCount).toFixed(2)
    total.deviation = (total.currentActual - total.yearlyPlan).toFixed(2)
  }

  return total
}

// 获取毛利率设备数据
const getProfitMarginEquipmentData = () => {
  return profitMarginData.value.filter(item => item.sector === '设备')
}

// 获取毛利率元件数据
const getProfitMarginComponentData = () => {
  return profitMarginData.value.filter(item => item.sector === '元件')
}

// 获取毛利率工程数据
const getProfitMarginProjectData = () => {
  return profitMarginData.value.filter(item => item.sector === '工程')
}

// 获取毛利率偏差颜色
const getProfitMarginDeviationColor = (deviation) => {
  const num = parseFloat(deviation)
  if (num < -5) return 'text-red-600 font-bold'
  if (num < 0) return 'text-red-500'
  if (num > 5) return 'text-green-600 font-bold'
  if (num > 0) return 'text-green-500'
  return 'text-gray-700'
}

// 计算毛利率合计
const getProfitMarginTotal = () => {
  const total = {
    yearlyPlan: 0,
    currentActual: 0,
    deviation: '0.00'
  }

  let totalCount = 0
  profitMarginData.value.forEach(item => {
    total.yearlyPlan += Number(item.yearlyPlan) || 0
    total.currentActual += Number(item.currentActual) || 0
    totalCount++
  })

  // 计算平均值
  if (totalCount > 0) {
    total.yearlyPlan = (total.yearlyPlan / totalCount).toFixed(2)
    total.currentActual = (total.currentActual / totalCount).toFixed(2)
    total.deviation = (total.currentActual - total.yearlyPlan).toFixed(2)
  }

  return total
}

// 加载报表数据
const loadReportData = async () => {
  isLoading.value = true
  try {
    // 获取所有报表数据
    const reportData = await getAllReportData(selectedPeriod.value)

    // 更新各个数据引用
    newOrderData.value = reportData.newOrderData || []
    businessIncomeData.value = reportData.businessIncomeData || []
    inventoryData.value = reportData.inventoryData || []
    mainBusinessCostData.value = reportData.mainBusinessCostData || []
    costCenterData.value = reportData.costCenterData || []
    marginContributionData.value = reportData.marginContributionData || []
    profitMarginData.value = reportData.profitMarginData || []
    netProfitData.value = reportData.netProfitData || []
    receiptData.value = reportData.receiptData || []
    accountsReceivableData.value = reportData.accountsReceivableData || []
    overdueReceivablesData.value = reportData.overdueReceivablesData || []
    badDebtProvisionData.value = reportData.badDebtProvisionData || []

    // 处理产值结构数据
    productionValueData.value = reportData.productionValueData || []

    // 处理生产执行分析数据
    if (reportData.productionExecutionData) {
      const execData = reportData.productionExecutionData
      productionExecutionData.value = [...(execData.equipment || []), ...(execData.project || [])]
      productionExecutionComponentData.value = execData.component || {
        yearlyPlan: 0,
        selfProduction: 0,
        semiProduction: 0,
        outsourcing: 0
      }
    }

    majorInvestmentData.value = reportData.majorInvestmentData || []

    // 计算关键指标
    keyIndicators.value = calculateKeyIndicators(reportData)

  } catch (error) {
    console.error('加载报表数据失败:', error)
    // 如果API调用失败，使用模拟数据
    await loadMockData()
  } finally {
    isLoading.value = false
  }
}



// 加载模拟数据（备用）
const loadMockData = async () => {
  try {
    // 新签订单数据 - 按照原始表格的完整结构
    newOrderData.value = [
      // 设备类别
      { id: 'equipment-上海项目', sector: '设备', customer: '上海项目', yearlyPlan: 30000.00, monthlyRevenue: 1459.37, cumulativeRevenue: 1459.37, progress: '4.86' },
      { id: 'equipment-国网项目', sector: '设备', customer: '国网项目', yearlyPlan: 8000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'equipment-江苏项目', sector: '设备', customer: '江苏项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', yearlyPlan: 4000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'equipment-西门子项目', sector: '设备', customer: '西门子项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'equipment-同业项目', sector: '设备', customer: '同业项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'equipment-用户项目', sector: '设备', customer: '用户项目', yearlyPlan: 5000.00, monthlyRevenue: 1067.86, cumulativeRevenue: 1067.86, progress: '21.36' },
      { id: 'equipment-其它项目', sector: '设备', customer: '其它项目', yearlyPlan: 0.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      // 元件类别
      { id: 'components-用户项目', sector: '元件', customer: '用户项目', yearlyPlan: 4000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      // 工程类别
      { id: 'engineering-一包项目', sector: '工程', customer: '一包项目', yearlyPlan: 3900.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'engineering-二包项目', sector: '工程', customer: '二包项目', yearlyPlan: 2200.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'engineering-域内合作项目', sector: '工程', customer: '域内合作项目', yearlyPlan: 5000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'engineering-域外合作项目', sector: '工程', customer: '域外合作项目', yearlyPlan: 1000.00, monthlyRevenue: 0, cumulativeRevenue: 0, progress: '0.00' },
      { id: 'engineering-其它项目', sector: '工程', customer: '其它项目', yearlyPlan: 1900.00, monthlyRevenue: 3031.54, cumulativeRevenue: 3031.54, progress: '159.55' }
    ]

    // 营业收入数据
    businessIncomeData.value = [
      { id: 1, category: '主营业务', yearlyPlan: 55000, currentMonthIncome: 1949.57, accumulatedIncome: 1949.57, progress: 3.28 },
      { id: 2, category: '非主营业务', yearlyPlan: 600, currentMonthIncome: 49.61, accumulatedIncome: 49.61, progress: 8.27 }
    ]

    // 存量数据 - 使用与原始表格完全一致的静态年初金额
    inventoryData.value = [
      // 设备板块（年初金额写死，当期金额为0）
      { id: 'equipment-上海', sector: '设备', customer: '上海', initialAmount: 39151.53, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-国网', sector: '设备', customer: '国网', initialAmount: 7841.48, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', initialAmount: 6793.01, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', initialAmount: 0.00, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', initialAmount: 28.46, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-同业', sector: '设备', customer: '同业', initialAmount: 821.55, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-用户', sector: '设备', customer: '用户', initialAmount: 577.37, currentAmount: 0, fluctuation: '0.00' },
      { id: 'equipment-其它', sector: '设备', customer: '其它', initialAmount: 220.08, currentAmount: 0, fluctuation: '0.00' },
      // 元件板块（年初金额写死，当期金额为0）
      { id: 'component-用户', sector: '元件', customer: '用户', initialAmount: 26.60, currentAmount: 0, fluctuation: '0.00' },
      // 工程板块（年初金额写死，当期金额为0）
      { id: 'project-一包', sector: '工程', customer: '一包', initialAmount: 12720.17, currentAmount: 0, fluctuation: '0.00' },
      { id: 'project-二包', sector: '工程', customer: '二包', initialAmount: 960.55, currentAmount: 0, fluctuation: '0.00' },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', initialAmount: 1818.79, currentAmount: 0, fluctuation: '0.00' },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', initialAmount: 8063.91, currentAmount: 0, fluctuation: '0.00' },
      { id: 'project-其它', sector: '工程', customer: '其它', initialAmount: 1973.08, currentAmount: 0, fluctuation: '0.00' }
    ]

    // 主营业务成本数据 - 使用与原始表格完全一致的静态年度计划
    mainBusinessCostData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', yearlyPlan: 15000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-国网', sector: '设备', customer: '国网', yearlyPlan: 8000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', yearlyPlan: 5000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', yearlyPlan: 2000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', yearlyPlan: 1000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-同业', sector: '设备', customer: '同业', yearlyPlan: 3000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-用户', sector: '设备', customer: '用户', yearlyPlan: 2500.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'equipment-其它', sector: '设备', customer: '其它', yearlyPlan: 500.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', yearlyPlan: 1200.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      // 工程板块
      { id: 'project-一包', sector: '工程', customer: '一包', yearlyPlan: 12000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'project-二包', sector: '工程', customer: '二包', yearlyPlan: 3000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', yearlyPlan: 8000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', yearlyPlan: 4000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
      { id: 'project-其它', sector: '工程', customer: '其它', yearlyPlan: 2000.00, executionRate: '0.00', currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 }
    ]

    // 成本中心数据 - 使用与原始表格完全一致的结构
    costCenterData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', cumulativeIncome: 2363.98, currentMonthIncome: 717.46, percentage: '30.35' },
      { id: 'equipment-国网', sector: '设备', customer: '国网', cumulativeIncome: 884.59, currentMonthIncome: 122.03, percentage: '13.80' },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', cumulativeIncome: 119.81, currentMonthIncome: 16.53, percentage: '13.80' },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
      { id: 'equipment-同业', sector: '设备', customer: '同业', cumulativeIncome: 67.98, currentMonthIncome: 0.99, percentage: '1.46' },
      { id: 'equipment-用户', sector: '设备', customer: '用户', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
      { id: 'equipment-其他', sector: '设备', customer: '其他', cumulativeIncome: 26.41, currentMonthIncome: 138.55, percentage: '524.61' },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', cumulativeIncome: 3.09, currentMonthIncome: 2.43, percentage: '78.64' },
      // 工程板块
      { id: 'engineering-一包', sector: '工程', customer: '一包', cumulativeIncome: -0.01, currentMonthIncome: 0.15, percentage: '-1645.00' },
      { id: 'engineering-二包', sector: '工程', customer: '二包', cumulativeIncome: 297.01, currentMonthIncome: 19.23, percentage: '6.47' },
      { id: 'engineering-域内合作', sector: '工程', customer: '域内合作', cumulativeIncome: 717.23, currentMonthIncome: 44.14, percentage: '6.15' },
      { id: 'engineering-域外合作', sector: '工程', customer: '域外合作', cumulativeIncome: 522.45, currentMonthIncome: 35.99, percentage: '6.89' },
      { id: 'engineering-其它', sector: '工程', customer: '其它', cumulativeIncome: 145.39, currentMonthIncome: 17.74, percentage: '12.20' },
      // 非主营业务
      { id: 'non-main-business', sector: '非主营业务', customer: '', cumulativeIncome: 123.28, currentMonthIncome: 32.59, percentage: '26.44' }
    ]

    // 边际贡献率数据 - 使用与原始表格完全一致的静态年度计划
    marginContributionData.value = [
      // 设备板块
      { id: 'equipment-shanghai', sector: '设备', customer: '上海', yearlyPlan: 28.00, currentActual: 0.00, deviation: -28.00 },
      { id: 'equipment-national', sector: '设备', customer: '国网', yearlyPlan: 18.50, currentActual: 0.00, deviation: -18.50 },
      { id: 'equipment-jiangsu', sector: '设备', customer: '江苏', yearlyPlan: 12.00, currentActual: 0.00, deviation: -12.00 },
      { id: 'equipment-power', sector: '设备', customer: '输配电内配', yearlyPlan: 15.00, currentActual: 0.00, deviation: -15.00 },
      { id: 'equipment-siemens', sector: '设备', customer: '西门子', yearlyPlan: 22.00, currentActual: 0.00, deviation: -22.00 },
      { id: 'equipment-peers', sector: '设备', customer: '同业', yearlyPlan: 18.00, currentActual: 0.00, deviation: -18.00 },
      { id: 'equipment-users', sector: '设备', customer: '用户', yearlyPlan: 15.80, currentActual: 0.00, deviation: -15.80 },
      { id: 'equipment-others', sector: '设备', customer: '其它', yearlyPlan: 20.00, currentActual: 0.00, deviation: -20.00 },
      // 元件板块
      { id: 'components-users', sector: '元件', customer: '用户', yearlyPlan: 25.00, currentActual: 0.00, deviation: -25.00 },
      // 工程板块
      { id: 'engineering-package1', sector: '工程', customer: '一包', yearlyPlan: 35.00, currentActual: 0.00, deviation: -35.00 },
      { id: 'engineering-package2', sector: '工程', customer: '二包', yearlyPlan: 30.00, currentActual: 0.00, deviation: -30.00 },
      { id: 'engineering-domestic', sector: '工程', customer: '域内合作', yearlyPlan: 28.00, currentActual: 0.00, deviation: -28.00 },
      { id: 'engineering-international', sector: '工程', customer: '域外合作', yearlyPlan: 25.00, currentActual: 0.00, deviation: -25.00 },
      { id: 'engineering-others', sector: '工程', customer: '其它', yearlyPlan: 32.00, currentActual: 0.00, deviation: -32.00 }
    ]

    // 毛利率数据 - 使用与原始表格完全一致的静态年度计划
    profitMarginData.value = [
      // 设备板块
      { id: 'equipment-shanghai', sector: '设备', customer: '上海', yearlyPlan: 21.99, currentActual: 0.00, deviation: -21.99 },
      { id: 'equipment-national', sector: '设备', customer: '国网', yearlyPlan: 13.83, currentActual: 0.00, deviation: -13.83 },
      { id: 'equipment-jiangsu', sector: '设备', customer: '江苏', yearlyPlan: 8.00, currentActual: 0.00, deviation: -8.00 },
      { id: 'equipment-power', sector: '设备', customer: '输配电内配', yearlyPlan: 12.00, currentActual: 0.00, deviation: -12.00 },
      { id: 'equipment-siemens', sector: '设备', customer: '西门子', yearlyPlan: 17.00, currentActual: 0.00, deviation: -17.00 },
      { id: 'equipment-peers', sector: '设备', customer: '同业', yearlyPlan: 22.43, currentActual: 0.00, deviation: -22.43 },
      { id: 'equipment-users', sector: '设备', customer: '用户', yearlyPlan: 12.50, currentActual: 0.00, deviation: -12.50 },
      { id: 'equipment-others', sector: '设备', customer: '其它', yearlyPlan: 15.00, currentActual: 0.00, deviation: -15.00 },
      // 元件板块
      { id: 'components-users', sector: '元件', customer: '用户', yearlyPlan: 20.00, currentActual: 0.00, deviation: -20.00 },
      // 工程板块
      { id: 'engineering-package1', sector: '工程', customer: '一包', yearlyPlan: 26.00, currentActual: 0.00, deviation: -26.00 },
      { id: 'engineering-package2', sector: '工程', customer: '二包', yearlyPlan: 22.00, currentActual: 0.00, deviation: -22.00 },
      { id: 'engineering-domestic', sector: '工程', customer: '域内合作', yearlyPlan: 20.00, currentActual: 0.00, deviation: -20.00 },
      { id: 'engineering-international', sector: '工程', customer: '域外合作', yearlyPlan: 18.00, currentActual: 0.00, deviation: -18.00 },
      { id: 'engineering-others', sector: '工程', customer: '其它', yearlyPlan: 24.00, currentActual: 0.00, deviation: -24.00 }
    ]

    // 净利润数据 - 使用实际显示的数据
    netProfitData.value = [
      { id: 1, category: '主营业务', yearlyPlan: 3871.58, current: 0.00, cumulative: 1479.37, progress: 38.21 },
      { id: 2, category: '非主营业务', yearlyPlan: 128.42, current: 0.00, cumulative: 224.15, progress: 174.58 }
    ]

    // 净利润主营业务贡献数据
    netProfitMainBusinessContributionData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', yearlyPlan: 1500.00, currentMonth: 3.50, cumulative: 3.50, contribution: '50.58%' },
      { id: 'equipment-国网', sector: '设备', customer: '国网', yearlyPlan: 800.00, currentMonth: 2.00, cumulative: 2.00, contribution: '28.90%' },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', yearlyPlan: 500.00, currentMonth: 0.50, cumulative: 0.50, contribution: '7.23%' },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', yearlyPlan: 200.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', yearlyPlan: 300.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'equipment-同业', sector: '设备', customer: '同业', yearlyPlan: 150.00, currentMonth: 0.20, cumulative: 0.20, contribution: '2.89%' },
      { id: 'equipment-用户', sector: '设备', customer: '用户', yearlyPlan: 100.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'equipment-其他', sector: '设备', customer: '其他', yearlyPlan: 80.00, currentMonth: 0.72, cumulative: 0.72, contribution: '10.40%' },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', yearlyPlan: 50.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      // 工程板块
      { id: 'engineering-一包', sector: '工程', customer: '一包', yearlyPlan: 400.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'engineering-二包', sector: '工程', customer: '二包', yearlyPlan: 300.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'engineering-域内合作', sector: '工程', customer: '域内合作', yearlyPlan: 250.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'engineering-域外合作', sector: '工程', customer: '域外合作', yearlyPlan: 200.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' },
      { id: 'engineering-其它', sector: '工程', customer: '其它', yearlyPlan: 100.00, currentMonth: 0.00, cumulative: 0.00, contribution: '0.00%' }
    ]

    // 净利润非主营业务数据
    netProfitNonMainBusinessData.value = [
      { id: 1, name: '投资收益', yearlyPlan: 50.00, current: 0.00, cumulative: 0.00, progress: '0.00%' },
      { id: 2, name: '营业外收入', yearlyPlan: 30.00, current: 0.00, cumulative: 0.00, progress: '0.00%' },
      { id: 3, name: '营业外支出', yearlyPlan: -10.00, current: 0.00, cumulative: 0.00, progress: '0.00%' },
      { id: 4, name: '其他收益', yearlyPlan: 58.42, current: 0.00, cumulative: 0.00, progress: '0.00%' }
    ]

    // 收款数据 - 使用与原始表格完全一致的结构
    receiptData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', yearlyPlan: 25000.00, currentReceipt: 2072.87, cumulativeReceipt: 2072.87, progress: 8.29 },
      { id: 'equipment-国网', sector: '设备', customer: '国网', yearlyPlan: 5000.00, currentReceipt: 2176.22, cumulativeReceipt: 2176.22, progress: 43.52 },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', yearlyPlan: 3500.00, currentReceipt: 326.22, cumulativeReceipt: 326.22, progress: 9.32 },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', yearlyPlan: 2000.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', yearlyPlan: 3500.00, currentReceipt: 10.43, cumulativeReceipt: 10.43, progress: 0.30 },
      { id: 'equipment-同业', sector: '设备', customer: '同业', yearlyPlan: 1000.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'equipment-用户', sector: '设备', customer: '用户', yearlyPlan: 800.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'equipment-其它', sector: '设备', customer: '其它', yearlyPlan: 500.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', yearlyPlan: 300.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      // 工程板块
      { id: 'project-一包', sector: '工程', customer: '一包', yearlyPlan: 2000.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'project-二包', sector: '工程', customer: '二包', yearlyPlan: 1800.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', yearlyPlan: 1200.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', yearlyPlan: 1000.00, currentReceipt: 0.00, cumulativeReceipt: 0.00, progress: 0.00 },
      { id: 'project-其它', sector: '工程', customer: '其它', yearlyPlan: 1500.00, currentReceipt: 3049.68, cumulativeReceipt: 3049.68, progress: 203.31 }
    ]

    // 应收账款数据 - 使用与原始表格完全一致的结构
    accountsReceivableData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', initialBalance: 3558.98, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 2072.87, totalReceipt: 2072.87, currentBalance: 1486.11 },
      { id: 'equipment-国网', sector: '设备', customer: '国网', initialBalance: 5190.93, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 2176.22, totalReceipt: 2176.22, currentBalance: 3014.71 },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', initialBalance: 1154.56, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 326.22, totalReceipt: 326.22, currentBalance: 828.34 },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', initialBalance: 176.86, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 176.86 },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', initialBalance: 0.00, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 10.43, totalReceipt: 10.43, currentBalance: -10.43 },
      { id: 'equipment-同业', sector: '设备', customer: '同业', initialBalance: 2028.53, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 2028.53 },
      { id: 'equipment-用户', sector: '设备', customer: '用户', initialBalance: 1727.31, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 1727.31 },
      { id: 'equipment-其它', sector: '设备', customer: '其它', initialBalance: 303.55, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 303.55 },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', initialBalance: 458.54, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 458.54 },
      // 工程板块
      { id: 'project-一包', sector: '工程', customer: '一包', initialBalance: 385.47, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 385.47 },
      { id: 'project-二包', sector: '工程', customer: '二包', initialBalance: 189.12, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 189.12 },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', initialBalance: 2772.83, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 2772.83 },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', initialBalance: 752.14, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 0.00, totalReceipt: 0.00, currentBalance: 752.14 },
      { id: 'project-其它', sector: '工程', customer: '其它', initialBalance: 488.67, newInvoice: 0.00, totalNewInvoice: 0.00, currentReceipt: 3049.68, totalReceipt: 3049.68, currentBalance: -2561.01 }
    ]

    // 逾期应收款数据 - 使用实际显示的参考数据
    overdueReceivablesData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', initialBalance: 1200.50, newAddition: 50.00, totalNewAddition: 150.00, monthlyReceipt: 80.00, totalReceipt: 200.00, progress: 14.81 },
      { id: 'equipment-国网', sector: '设备', customer: '国网', initialBalance: 850.30, newAddition: 30.00, totalNewAddition: 100.00, monthlyReceipt: 120.00, totalReceipt: 300.00, progress: 31.58 },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', initialBalance: 650.80, newAddition: 20.00, totalNewAddition: 80.00, monthlyReceipt: 60.00, totalReceipt: 150.00, progress: 20.55 },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', initialBalance: 120.00, newAddition: 0.00, totalNewAddition: 0.00, monthlyReceipt: 0.00, totalReceipt: 0.00, progress: 0.00 },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', initialBalance: 0.00, newAddition: 0.00, totalNewAddition: 0.00, monthlyReceipt: 0.00, totalReceipt: 0.00, progress: 0.00 },
      { id: 'equipment-同业', sector: '设备', customer: '同业', initialBalance: 980.20, newAddition: 40.00, totalNewAddition: 120.00, monthlyReceipt: 50.00, totalReceipt: 180.00, progress: 16.36 },
      { id: 'equipment-用户', sector: '设备', customer: '用户', initialBalance: 750.60, newAddition: 25.00, totalNewAddition: 75.00, monthlyReceipt: 30.00, totalReceipt: 100.00, progress: 12.11 },
      { id: 'equipment-其它', sector: '设备', customer: '其它', initialBalance: 200.40, newAddition: 10.00, totalNewAddition: 30.00, monthlyReceipt: 15.00, totalReceipt: 45.00, progress: 19.54 },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', initialBalance: 180.25, newAddition: 8.00, totalNewAddition: 25.00, monthlyReceipt: 12.00, totalReceipt: 35.00, progress: 17.07 },
      // 工程板块
      { id: 'project-一包', sector: '工程', customer: '一包', initialBalance: 320.15, newAddition: 15.00, totalNewAddition: 45.00, monthlyReceipt: 20.00, totalReceipt: 60.00, progress: 16.44 },
      { id: 'project-二包', sector: '工程', customer: '二包', initialBalance: 150.80, newAddition: 8.00, totalNewAddition: 25.00, monthlyReceipt: 10.00, totalReceipt: 30.00, progress: 17.06 },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', initialBalance: 1200.45, newAddition: 60.00, totalNewAddition: 180.00, monthlyReceipt: 100.00, totalReceipt: 250.00, progress: 18.11 },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', initialBalance: 680.30, newAddition: 35.00, totalNewAddition: 105.00, monthlyReceipt: 70.00, totalReceipt: 180.00, progress: 22.92 },
      { id: 'project-其它', sector: '工程', customer: '其它', initialBalance: 280.90, newAddition: 12.00, totalNewAddition: 40.00, monthlyReceipt: 25.00, totalReceipt: 80.00, progress: 24.92 }
    ]

    // 坏账准备数据 - 使用实际显示的参考数据
    badDebtProvisionData.value = [
      // 设备板块
      { id: 'equipment-上海', sector: '设备', customer: '上海', initialBalance: 235.75, newAddition: 10.00, currentReversal: 5.00, accumulatedReversal: 15.00, finalBalance: 230.75 },
      { id: 'equipment-国网', sector: '设备', customer: '国网', initialBalance: 76.77, newAddition: 5.00, currentReversal: 2.00, accumulatedReversal: 8.00, finalBalance: 73.77 },
      { id: 'equipment-江苏', sector: '设备', customer: '江苏', initialBalance: 79.63, newAddition: 3.00, currentReversal: 1.50, accumulatedReversal: 6.00, finalBalance: 76.63 },
      { id: 'equipment-输配电内配', sector: '设备', customer: '输配电内配', initialBalance: 163.42, newAddition: 8.00, currentReversal: 3.00, accumulatedReversal: 12.00, finalBalance: 159.42 },
      { id: 'equipment-西门子', sector: '设备', customer: '西门子', initialBalance: 0.0, newAddition: 0.00, currentReversal: 0.00, accumulatedReversal: 0.00, finalBalance: 0.0 },
      { id: 'equipment-同业', sector: '设备', customer: '同业', initialBalance: 10.33, newAddition: 2.00, currentReversal: 0.50, accumulatedReversal: 2.50, finalBalance: 9.83 },
      { id: 'equipment-用户', sector: '设备', customer: '用户', initialBalance: 1490.63, newAddition: 50.00, currentReversal: 20.00, accumulatedReversal: 80.00, finalBalance: 1460.63 },
      { id: 'equipment-其它', sector: '设备', customer: '其它', initialBalance: 381.37, newAddition: 15.00, currentReversal: 8.00, accumulatedReversal: 25.00, finalBalance: 371.37 },
      // 元件板块
      { id: 'component-用户', sector: '元件', customer: '用户', initialBalance: 14.76, newAddition: 1.00, currentReversal: 0.50, accumulatedReversal: 2.00, finalBalance: 13.76 },
      // 工程板块
      { id: 'project-一包', sector: '工程', customer: '一包', initialBalance: 13.94, newAddition: 2.00, currentReversal: 1.00, accumulatedReversal: 3.00, finalBalance: 12.94 },
      { id: 'project-二包', sector: '工程', customer: '二包', initialBalance: 66.5, newAddition: 5.00, currentReversal: 2.50, accumulatedReversal: 8.00, finalBalance: 63.5 },
      { id: 'project-域内合作', sector: '工程', customer: '域内合作', initialBalance: 71.29, newAddition: 6.00, currentReversal: 3.00, accumulatedReversal: 10.00, finalBalance: 67.29 },
      { id: 'project-域外合作', sector: '工程', customer: '域外合作', initialBalance: 76.52, newAddition: 4.00, currentReversal: 2.00, accumulatedReversal: 7.00, finalBalance: 73.52 },
      { id: 'project-其它', sector: '工程', customer: '其它', initialBalance: 16.89, newAddition: 1.50, currentReversal: 0.80, accumulatedReversal: 2.50, finalBalance: 15.89 }
    ]

    // 重大投资数据
    majorInvestmentData.value = [
      { id: 1, projectName: '生产设备升级改造项目', initialPlan: 1000, currentExecution: 0, progress: 0.00 },
      { id: 2, projectName: '信息化系统建设项目', initialPlan: 500, currentExecution: 0, progress: 0.00 },
      { id: 3, projectName: '研发中心扩建项目', initialPlan: 800, currentExecution: 0, progress: 0.00 }
    ]

    // 产值结构数据 - 使用与 ProductionValue.vue 一致的结构
    productionValueData.value = [
      // 设备板块
      { id: 1, segment: '设备', customerType: '上海', designCapacity: 5000, yearlyPlan: 4500, currentPeriod: 380, currentAccumulated: 1520, executionProgress: 33.78, utilizationRate: 30.40 },
      { id: 2, segment: '设备', customerType: '国网', designCapacity: 3000, yearlyPlan: 2800, currentPeriod: 250, currentAccumulated: 980, executionProgress: 35.00, utilizationRate: 32.67 },
      { id: 3, segment: '设备', customerType: '江苏', designCapacity: 2500, yearlyPlan: 2200, currentPeriod: 180, currentAccumulated: 720, executionProgress: 32.73, utilizationRate: 28.80 },
      { id: 4, segment: '设备', customerType: '输配电内配', designCapacity: 1500, yearlyPlan: 1300, currentPeriod: 110, currentAccumulated: 430, executionProgress: 33.08, utilizationRate: 28.67 },
      { id: 5, segment: '设备', customerType: '西门子', designCapacity: 800, yearlyPlan: 700, currentPeriod: 60, currentAccumulated: 240, executionProgress: 34.29, utilizationRate: 30.00 },
      { id: 6, segment: '设备', customerType: '同业', designCapacity: 1200, yearlyPlan: 1000, currentPeriod: 85, currentAccumulated: 340, executionProgress: 34.00, utilizationRate: 28.33 },
      { id: 7, segment: '设备', customerType: '用户', designCapacity: 2000, yearlyPlan: 1800, currentPeriod: 150, currentAccumulated: 600, executionProgress: 33.33, utilizationRate: 30.00 },
      // 元件板块
      { id: 8, segment: '元件', customerType: '其它', designCapacity: 1000, yearlyPlan: 900, currentPeriod: 75, currentAccumulated: 300, executionProgress: 33.33, utilizationRate: 30.00 },
      { id: 9, segment: '元件', customerType: '用户', designCapacity: 8000, yearlyPlan: 7200, currentPeriod: 600, currentAccumulated: 2400, executionProgress: 33.33, utilizationRate: 30.00 },
      // 工程板块
      { id: 10, segment: '工程', customerType: '一包', designCapacity: 1500, yearlyPlan: 1350, currentPeriod: 115, currentAccumulated: 450, executionProgress: 33.33, utilizationRate: 30.00 },
      { id: 11, segment: '工程', customerType: '二包', designCapacity: 1200, yearlyPlan: 1080, currentPeriod: 90, currentAccumulated: 360, executionProgress: 33.33, utilizationRate: 30.00 },
      { id: 12, segment: '工程', customerType: '域内合作', designCapacity: 2000, yearlyPlan: 1800, currentPeriod: 150, currentAccumulated: 600, executionProgress: 33.33, utilizationRate: 30.00 },
      { id: 13, segment: '工程', customerType: '域外合作', designCapacity: 1800, yearlyPlan: 1620, currentPeriod: 135, currentAccumulated: 540, executionProgress: 33.33, utilizationRate: 30.00 },
      { id: 14, segment: '工程', customerType: '其它', designCapacity: 800, yearlyPlan: 720, currentPeriod: 60, currentAccumulated: 240, executionProgress: 33.33, utilizationRate: 30.00 }
    ]

    console.log('使用模拟数据')
  } catch (error) {
    console.error('加载模拟数据失败:', error)
  }
}

// 生成PDF
const generatePDF = async () => {
  isGenerating.value = true
  try {
    const element = document.getElementById('report-content')
    
    // 使用html2canvas将HTML转换为canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    
    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // 保存PDF
    const fileName = `上海南华兰陵电气有限公司_月度经济运行报表_${selectedPeriod.value}.pdf`
    pdf.save(fileName)
    
  } catch (error) {
    console.error('生成PDF失败:', error)
    alert('生成PDF失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadReportData()

  // 产值结构数据和生产执行分析数据将通过API加载，不需要在这里初始化模拟数据
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}

.table-container {
  page-break-inside: avoid;
}

h3, h4 {
  page-break-after: avoid;
}
</style>
