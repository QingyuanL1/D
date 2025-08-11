<template>
  <div>
    <!-- 添加公司选择器 -->
    <div class="mb-4 flex justify-end">
      <select 
        v-model="selectedCompanyKey" 
        @change="handleCompanyChange"
        class="p-2 border rounded shadow-sm"
      >
        <option v-for="(company, key) in companies" :key="key" :value="key">
          {{ company }}
        </option>
      </select>
    </div>

    <!-- 根据选择的公司渲染不同的报表组件 -->
    <div v-if="selectedCompanyKey === 'shanghai'">
      <!-- 原始完整报表组件 -->
      <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <!-- 报表头部组件 -->
        <ReportHeader
          :title="`${selectedCompany} - 月度经济运行报表`"
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
        <p class="text-lg">{{ selectedCompany }}</p>
        <p class="text-md text-gray-600">{{ formatPeriod(selectedPeriod) }}</p>
      </div>

      <!-- 一、经济运行关键指标进度情况概述 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">一、经济运行关键指标进度情况概述（单位：万元）</h3>
          <button
            @click="refreshKeyIndicators"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            :disabled="isRefreshingIndicators"
          >
            <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshingIndicators }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isRefreshingIndicators ? '更新中...' : '从API更新' }}
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IndicatorCard
            title="●新签订单："
            :data="keyIndicators.newOrders"
            type="new-orders"
          />
          <IndicatorCard
            title="●主营业务收入："
            :data="keyIndicators.mainRevenue"
            type="main-revenue"
          />
          <IndicatorCard
            title="●净利润指标："
            :data="keyIndicators.netProfit"
            type="net-profit"
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
          <button
            @click="refreshQualityIndicators"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
            :disabled="isRefreshingQuality"
          >
            <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshingQuality }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isRefreshingQuality ? '更新中...' : '从API更新' }}
          </button>
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

        </div>
      </div>

      <!-- 三、经济运行风险提示 -->
      <div class="mb-8">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">三、经济运行风险提示</h3>
        <RiskAlert :risks="riskAlertsArray" />
      </div>

      <!-- 四、经济运行质量结构分解情况 -->
      <div class="mb-8" v-if="selectedCompanyKey === 'shanghai'">
        <h3 class="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">四、经济运行质量结构分解情况</h3>

        <!-- 1、财务报表简报 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">1、财务报表简报：</h4>

          <!-- 1.1 资产负债表 -->
          <div class="mb-4">
            <h5 class="text-md font-medium mb-2">1.1 资产负债表（单位:万元）</h5>
            <div class="bg-gray-50 p-4 rounded">
              <p class="text-gray-600">办公室评估意见：</p>
              <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
                <!-- 资产负债表内容待补充 -->
              </div>
            </div>
          </div>

          <!-- 1.2 现金流量表简表 -->
          <div class="mb-4">
            <h5 class="text-md font-medium mb-2">1.2 现金流量表简表（单位:万元）</h5>
            <div class="overflow-x-auto mb-4">
              <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2">序号</th>
                    <th class="border border-gray-300 px-4 py-2">期初金额</th>
                    <th class="border border-gray-300 px-4 py-2">经营活动产生的现金流量净额</th>
                    <th class="border border-gray-300 px-4 py-2">投资活动产生的现金流量净额</th>
                    <th class="border border-gray-300 px-4 py-2">筹资活动产生的现金流量净额</th>
                    <th class="border border-gray-300 px-4 py-2">期末金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 text-center">1月</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">27,484.25</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-389.61</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-12,005.01</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-0.18</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">15,089.45</td>
                  </tr>
                  <tr v-for="month in ['2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']" :key="month">
                    <td class="border border-gray-300 px-4 py-2 text-center">{{ month }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 1.3 利润表 -->
          <div class="mb-4">
            <h5 class="text-md font-medium mb-2">1.3 利润表（单位:万元）</h5>
            <div class="bg-gray-50 p-4 rounded">
              <p class="text-gray-600">办公室评估意见：</p>
              <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
                <!-- 利润表内容待补充 -->
              </div>
              <p class="text-gray-600 mt-2">结论：</p>
              <div class="mt-2 min-h-[40px] border rounded p-2 bg-white">
                <!-- 结论内容待补充 -->
              </div>
              <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
            </div>
          </div>
        </div>

        <!-- 2、新签订单结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">2、新签订单结构与质量：（按年度计划口径分解） (单位：万元)</h4>
          <SectorTable
            :columns="newOrderColumns"
            :data="newOrderData"
            :show-total="true"
            :total-row="getNewOrderTotal()"
          />
          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
          </div>
        </div>

        <!-- 项目跟踪情况 -->
        <ProjectTracking :data="projectTrackingData" />

        <!-- 招投标情况 -->
        <BiddingStatusReport :period="selectedPeriod" />

        <!-- 营业收入结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">3、营业收入结构与质量： （按年度计划口径分解）(单位：万元)</h4>

          <!-- 营业收入结构总表 -->
          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">序号</th>
                  <th class="border border-gray-300 px-4 py-2">财务科目</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当月收入</th>
                  <th class="border border-gray-300 px-4 py-2">累计收入</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in businessIncomeStructureData" :key="index">
                  <td class="border border-gray-300 px-4 py-2 text-center">
                    {{ item.id }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ item.category }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(item.yearlyPlan) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(item.currentMonthIncome) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(item.accumulatedIncome) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    <span class="text-sm font-medium">{{ calculateBusinessIncomeProgress(item.yearlyPlan, item.accumulatedIncome) }}%</span>
                  </td>
                </tr>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(businessIncomeStructureTotalData.yearlyPlan) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(businessIncomeStructureTotalData.currentMonthIncome) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(businessIncomeStructureTotalData.accumulatedIncome) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ formatNumber(businessIncomeStructureTotalData.progress) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 主营业务收入分解情况表 -->
          <div class="mt-8">
            <h5 class="text-lg font-semibold mb-4">主营业务收入分解情况（单位：万元）</h5>
            <div class="overflow-x-auto mb-6">
              <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2">板块</th>
                    <th class="border border-gray-300 px-4 py-2">客户属性</th>
                    <th class="border border-gray-300 px-4 py-2">年度计划</th>
                    <th class="border border-gray-300 px-4 py-2">当月收入</th>
                    <th class="border border-gray-300 px-4 py-2">累计收入</th>
                    <th class="border border-gray-300 px-4 py-2">执行进度</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 设备类别 -->
                  <template v-for="(item, index) in mainBusinessIncomeStructureData.equipment" :key="`equipment-${index}`">
                    <tr>
                      <td v-if="index === 0" :rowspan="mainBusinessIncomeStructureData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                        设备
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.customer }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(typeof item.yearlyPlan === 'number' ? item.yearlyPlan : parseFloat(item.yearlyPlan) || 0) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ formatNumber(item.currentMonthIncome) }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(item.accumulatedIncome) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.progress }}
                      </td>
                    </tr>
                  </template>

                  <!-- 元件类别 -->
                  <template v-for="(item, index) in mainBusinessIncomeStructureData.components" :key="`components-${index}`">
                    <tr>
                      <td v-if="index === 0" :rowspan="mainBusinessIncomeStructureData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                        元件
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.customer }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(typeof item.yearlyPlan === 'number' ? item.yearlyPlan : parseFloat(item.yearlyPlan) || 0) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ formatNumber(item.currentMonthIncome) }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(item.accumulatedIncome) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.progress }}
                      </td>
                    </tr>
                  </template>

                  <!-- 工程类别 -->
                  <template v-for="(item, index) in mainBusinessIncomeStructureData.engineering" :key="`engineering-${index}`">
                    <tr>
                      <td v-if="index === 0" :rowspan="mainBusinessIncomeStructureData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                        工程
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.customer }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(typeof item.yearlyPlan === 'number' ? item.yearlyPlan : parseFloat(item.yearlyPlan) || 0) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ formatNumber(item.currentMonthIncome) }}
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        <span class="font-medium">{{ formatNumber(item.accumulatedIncome) }}</span>
                      </td>
                      <td class="border border-gray-300 px-4 py-2">
                        {{ item.progress }}
                      </td>
                    </tr>
                  </template>

                  <!-- 合计行 -->
                  <tr class="bg-gray-50 font-bold">
                    <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(mainBusinessIncomeStructureTotalData.yearlyPlan) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(mainBusinessIncomeStructureTotalData.currentMonthIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(mainBusinessIncomeStructureTotalData.accumulatedIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ mainBusinessIncomeStructureTotalData.progress }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 非主营业务情况表 -->
          <div class="mt-8">
            <h5 class="text-lg font-semibold mb-4">非主营业务情况（单位：万元）</h5>
            <div class="overflow-x-auto mb-6">
              <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2 w-24">序号</th>
                    <th class="border border-gray-300 px-4 py-2">财务科目</th>
                    <th class="border border-gray-300 px-4 py-2">年度计划</th>
                    <th class="border border-gray-300 px-4 py-2">当期</th>
                    <th class="border border-gray-300 px-4 py-2">累计</th>
                    <th class="border border-gray-300 px-4 py-2">执行进度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in nonMainBusinessStructureData" :key="index">
                    <td class="border border-gray-300 px-4 py-2 text-center">
                      {{ item.id }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.category }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.yearlyPlan) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentPeriod) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.cumulative) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ calculateNonMainBusinessProgress(item.yearlyPlan, item.cumulative) }}%
                    </td>
                  </tr>

                  <!-- 合计行 -->
                  <tr class="bg-gray-50 font-bold">
                    <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                    <td class="border border-gray-300 px-4 py-2"></td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(nonMainBusinessStructureTotalData.yearlyPlan) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(nonMainBusinessStructureTotalData.currentPeriod) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(nonMainBusinessStructureTotalData.cumulative) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(nonMainBusinessStructureTotalData.progress) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 主营业务——当年订单转收入表格 - 从OrderToIncome复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">主营业务——当年订单转收入（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">当年新签订单累计</th>
                  <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                  <th class="border border-gray-300 px-4 py-2">累计转收入</th>
                  <th class="border border-gray-300 px-4 py-2">当年订单转收入比率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备类别 -->
                <template v-for="(item, index) in orderToIncomeData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="orderToIncomeData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.signedOrder) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.incomeRate }}%
                    </td>
                  </tr>
                </template>

                <!-- 元件类别 -->
                <template v-for="(item, index) in orderToIncomeData.components" :key="`components-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="orderToIncomeData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.signedOrder) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.incomeRate }}%
                    </td>
                  </tr>
                </template>

                <!-- 工程类别 -->
                <template v-for="(item, index) in orderToIncomeData.engineering" :key="`engineering-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="orderToIncomeData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.signedOrder) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.incomeRate }}%
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(orderToIncomeTotalData.signedOrder) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(orderToIncomeTotalData.currentIncome) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(orderToIncomeTotalData.incomeTotal) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(orderToIncomeTotalData.incomeRate) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 主营业务——存量订单转收入表格 - 从StockOrderToIncome复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">主营业务——存量订单转收入（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余额</th>
                  <th class="border border-gray-300 px-4 py-2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2">当月转收入</th>
                  <th class="border border-gray-300 px-4 py-2">累计转收入</th>
                  <th class="border border-gray-300 px-4 py-2">往年订单转收入比率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备类别 -->
                <template v-for="(item, index) in stockOrderToIncomeData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="stockOrderToIncomeData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentMonthIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatStockOrderRate(item.incomeRate) }}
                    </td>
                  </tr>
                </template>

                <!-- 元件类别 -->
                <template v-for="(item, index) in stockOrderToIncomeData.components" :key="`components-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="stockOrderToIncomeData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentMonthIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatStockOrderRate(item.incomeRate) }}
                    </td>
                  </tr>
                </template>

                <!-- 工程类别 -->
                <template v-for="(item, index) in stockOrderToIncomeData.engineering" :key="`engineering-${index}`">
                  <tr>
                    <td v-if="index === 0" :rowspan="stockOrderToIncomeData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ item.customer }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatNumber(item.currentMonthIncome) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      {{ formatStockOrderRate(item.incomeRate) }}
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2"></td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(stockOrderToIncomeTotalData.yearlyPlan / 2) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(stockOrderToIncomeTotalData.yearlyPlan / 4) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(stockOrderToIncomeTotalData.currentMonthIncome) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatNumber(stockOrderToIncomeTotalData.incomeTotal) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatStockOrderRate(stockOrderToIncomeTotalData.incomeRate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 中标未履约情况表格 - 从BidFulfillment复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">中标未履约情况（中标标包履约率详见公司附表）（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">期初余额</th>
                  <th class="border border-gray-300 px-4 py-2">当期余额</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in bidFulfillmentData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="bidFulfillmentData.equipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateBidFluctuation(item.initialAmount, item.currentAmount || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in bidFulfillmentData.component" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="bidFulfillmentData.component.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateBidFluctuation(item.initialAmount, item.currentAmount || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in bidFulfillmentData.project" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="bidFulfillmentData.project.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateBidFluctuation(item.initialAmount, item.currentAmount || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(bidFulfillmentTotalData.initialAmount) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(bidFulfillmentTotalData.currentAmount) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ calculateBidFluctuation(bidFulfillmentTotalData.initialAmount, bidFulfillmentTotalData.currentAmount) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 新签订单已排产未入库项目（在产）表格 - 从InventoryInProgress复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">新签订单已排产未入库项目（在产）（不包含预投）（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余额</th>
                  <th class="border border-gray-300 px-4 py-2">当期余额</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in inventoryInProgressData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryInProgressData.equipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.yearlyBudget || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.monthlyIncome || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateInventoryCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in inventoryInProgressData.component" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryInProgressData.component.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.yearlyBudget || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.monthlyIncome || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateInventoryCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in inventoryInProgressData.project" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryInProgressData.project.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.yearlyBudget || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.monthlyIncome || 0) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateInventoryCompletionRate(item.monthlyIncome || 0, item.yearlyBudget || 0) }}%
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(inventoryInProgressTotalData.yearlyBudget) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(inventoryInProgressTotalData.monthlyIncome) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ calculateInventoryCompletionRate(inventoryInProgressTotalData.monthlyIncome, inventoryInProgressTotalData.yearlyBudget) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 库存情况(合同存量)表格 - 从ContractInventory复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">库存情况(合同存量)（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余量</th>
                  <th class="border border-gray-300 px-4 py-2">当期新增</th>
                  <th class="border border-gray-300 px-4 py-2">当月收入</th>
                  <th class="border border-gray-300 px-4 py-2">当期库存</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in contractInventoryData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="contractInventoryData.equipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.initialAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentIncrease) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(getContractMainBusinessIncome('equipment', item.customerType)) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateContractFluctuation(item.initialAmount, item.cumulativeAmount) }}%
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in contractInventoryData.component" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="contractInventoryData.component.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.initialAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentIncrease) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(getContractMainBusinessIncome('component', item.customerType)) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateContractFluctuation(item.initialAmount, item.cumulativeAmount) }}%
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in contractInventoryData.project" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="contractInventoryData.project.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ formatNumber(item.initialAmount) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentIncrease) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(getContractMainBusinessIncome('project', item.customerType)) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ calculateContractFluctuation(item.initialAmount, item.cumulativeAmount) }}%
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(contractInventoryTotalData.initialAmount) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(contractInventoryTotalData.currentIncrease) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(getContractTotalMainBusinessIncome()) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNumber(contractInventoryTotalData.cumulativeAmount) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ calculateContractFluctuation(contractInventoryTotalData.initialAmount, contractInventoryTotalData.cumulativeAmount) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 成本暂估入库和计提情况表格 - 从CostEstimation复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">成本暂估入库和计提情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初余额</th>
                  <th class="border border-gray-300 px-4 py-2">当期新增</th>
                  <th class="border border-gray-300 px-4 py-2">当期冲销</th>
                  <th class="border border-gray-300 px-4 py-2">本年累计</th>
                  <th class="border border-gray-300 px-4 py-2">计提率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in costEstimationData.equipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="costEstimationData.equipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialBalance) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentPeriod) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentWriteOff) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in costEstimationData.component" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="costEstimationData.component.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialBalance) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentPeriod) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentWriteOff) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in costEstimationData.project" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="costEstimationData.project.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span>{{ formatNumber(item.initialBalance) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentPeriod) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ formatNumber(item.currentWriteOff) }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(costEstimationTotalData.initialBalance) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(costEstimationTotalData.currentPeriod) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(costEstimationTotalData.currentWriteOff) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(costEstimationTotalData.yearTotal) }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(costEstimationTotalData.averageProvisionRate) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 部门成本中心实际发生情况表格 - 从DepartmentCostCenter复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">部门成本中心实际发生情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">部门属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度预算</th>
                  <th class="border border-gray-300 px-4 py-2">当期</th>
                  <th class="border border-gray-300 px-4 py-2">累计</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                  <th class="border border-gray-300 px-4 py-2">预算占产值比</th>
                  <th class="border border-gray-300 px-4 py-2">实际占产值比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in departmentCostCenterData" :key="index">
                  <td class="border border-gray-300 px-4 py-2">{{ item.department }}</td>
                  <td class="border border-gray-300 px-4 py-2">
                    <span class="w-full px-2 py-1">{{ item.yearlyBudget }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ item.currentPeriod }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="font-medium">{{ item.currentTotal }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.executionProgress }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.budgetToOutputRatio }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.actualToOutputRatio }}</span>
                  </td>
                </tr>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostCenterTotalRow.yearlyBudget }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ departmentCostCenterTotalRow.currentPeriod }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostCenterTotalRow.currentTotal }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostCenterTotalRow.executionProgress }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostCenterTotalRow.budgetToOutputRatio }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostCenterTotalRow.actualToOutputRatio }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 部门成本中心计入损益情况表格 - 从DepartmentCostInput复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">部门成本中心计入损益情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">部门属性</th>
                  <th class="border border-gray-300 px-4 py-2">年度预算</th>
                  <th class="border border-gray-300 px-4 py-2">当月执行</th>
                  <th class="border border-gray-300 px-4 py-2">累计执行</th>
                  <th class="border border-gray-300 px-4 py-2">执行进度</th>
                  <th class="border border-gray-300 px-4 py-2">预算占产值比</th>
                  <th class="border border-gray-300 px-4 py-2">实际占产值比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in departmentCostInputData" :key="index">
                  <td class="border border-gray-300 px-4 py-2">{{ item.department }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ formatDepartmentNumber(item.yearlyBudget) }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ item.currentMonthIncome }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.accumulatedIncome }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.executionProgress }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.budgetToOutputRatio }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.actualToOutputRatio }}</span>
                  </td>
                </tr>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ formatDepartmentNumber(departmentCostInputTotalRow.yearlyBudget) }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ departmentCostInputTotalRow.currentMonthIncome }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostInputTotalRow.accumulatedIncome }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostInputTotalRow.executionProgress }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostInputTotalRow.budgetToOutputRatio }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1 font-bold">{{ departmentCostInputTotalRow.actualToOutputRatio }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 存货数据表格 - 从InventoryData复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">存货数据（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初数据</th>
                  <th class="border border-gray-300 px-4 py-2">当期数据</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in inventoryDataEquipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryDataEquipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in inventoryDataComponent" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryDataComponent.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in inventoryDataProject" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryDataProject.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryDataTotal.initial }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryDataTotal.current }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryDataTotal.fluctuation }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 库存情况表格 - 从InventoryStock复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">库存情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2">板块</th>
                  <th class="border border-gray-300 px-4 py-2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2">年初数据</th>
                  <th class="border border-gray-300 px-4 py-2">当期数据</th>
                  <th class="border border-gray-300 px-4 py-2">波动率</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in inventoryStockEquipment" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryStockEquipment.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in inventoryStockComponent" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryStockComponent.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in inventoryStockProject" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="inventoryStockProject.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.initial }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.current }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.fluctuation }}
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryStockTotal.initial }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryStockTotal.current }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ inventoryStockTotal.fluctuation }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        <!-- 存量结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">4、存量结构与质量： （按年度计划口径分解，不含合同负债）(单位：万元)</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-gray-600 mt-2">依据分析附表：</p>
            <div class="mt-2 min-h-[40px] border rounded p-2 bg-white">
              <!-- 依据分析附表内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 主营业务成本结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">5、主营业务成本结构与质量： （按年度计划口径分解）(单位：万元)</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-gray-600 mt-2">依据分析附表：</p>
            <div class="mt-2 min-h-[40px] border rounded p-2 bg-white">
              <!-- 依据分析附表内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 成本中心结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">6、成本中心结构与质量： （按年度计划口径分解）(单位：万元)</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 主营业务边际贡献率结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">7、主营业务边际贡献率结构与质量：（按年度计划口径分解）</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
          </div>
        </div>

        <!-- 主营业务毛利率结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">8、主营业务毛利率结构与质量： （按年度计划口径分解）(单位：万元)</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 净利润结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">9、净利润结构与质量：（按年度计划口径分解）(单位：万元)</h4>
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

        <!-- 主营业务净利润贡献情况表格 - 从NetProfitStructure复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">主营业务净利润贡献情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">板块</th>
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">客户属性</th>
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">年度计划</th>
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">当月值</th>
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">累计值</th>
                  <th class="border border-gray-300 px-4 py-2" rowspan="2">分类贡献占比</th>
                </tr>
              </thead>
              <tbody>
                <!-- 设备板块 -->
                <template v-for="(item, index) in netProfitEquipmentData" :key="`equipment-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="netProfitEquipmentData.length">
                      设备
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ item.plan }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNetProfitNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ item.actual }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.contribution }}
                    </td>
                  </tr>
                </template>

                <!-- 元件板块 -->
                <template v-for="(item, index) in netProfitComponentData" :key="`component-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="netProfitComponentData.length">
                      元件
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ item.plan }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNetProfitNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ item.actual }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.contribution }}
                    </td>
                  </tr>
                </template>

                <!-- 工程板块 -->
                <template v-for="(item, index) in netProfitProjectData" :key="`project-${index}`">
                  <tr>
                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="netProfitProjectData.length">
                      工程
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                      {{ item.plan }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ formatNetProfitNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      <span class="font-medium">{{ item.actual }}</span>
                    </td>
                    <td class="border border-gray-300 px-4 py-2 text-right">
                      {{ item.contribution }}
                    </td>
                  </tr>
                </template>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitMainBusinessTotalData.plan) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitMainBusinessTotalData.currentMonthValue) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitMainBusinessTotalData.actual) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    100.00%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 非主营业务净利润贡献情况表格 - 从NetProfitStructure复制 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">非主营业务净利润贡献情况（单位：万元）</h4>

          <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead class="sticky top-0 bg-white">
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
                <tr v-for="(item, index) in netProfitNonMainItems" :key="index">
                  <td class="border border-gray-300 px-4 py-2 text-center">{{ item.id }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
                  <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                    <span class="w-full px-2 py-1">{{ item.plan }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ item.currentPeriod }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.accumulated }}</span>
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    <span class="w-full px-2 py-1">{{ item.progress }}</span>
                  </td>
                </tr>

                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitNonMainTotalData.plan) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitNonMainTotalData.currentPeriod) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ formatNetProfitNumber(netProfitNonMainTotalData.accumulated) }}
                  </td>
                  <td class="border border-gray-300 px-4 py-2 text-right">
                    {{ netProfitNonMainTotalData.progress }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
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
          <h4 class="text-lg font-semibold mb-3">10、收款结构与质量：（按年度计划口径分解）(单位：万元)</h4>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 年度重大投资情况 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">12、年度重大投资情况：</h4>
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
                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                  <td class="border border-gray-300 px-2 py-1 text-center" colspan="2">合计</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">-</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">-</td>
                  <td class="border border-gray-300 px-2 py-1 text-right">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>

        <!-- 产值结构与质量 -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3">11、产值结构与质量：</h4>
          <h5 class="text-md font-medium mb-2">设备、元件板块简报：</h5>
          <h6 class="text-sm font-medium mb-2">主营业务产值——自制/自行施工情况分析：</h6>
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

          <div class="bg-gray-50 p-4 rounded mt-4">
            <p class="text-gray-600">办公室评估意见：</p>
            <div class="mt-2 min-h-[60px] border rounded p-2 bg-white">
              <!-- 评估意见内容待补充 -->
            </div>
            <p class="text-right text-sm text-gray-500 mt-2">香港大亚管理办公室 2025</p>
          </div>
        </div>
      </div>

      <!-- 办公室评估意见 -->
      <div class="mb-8" v-if="selectedCompanyKey === 'shanghai'">
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
    </div>

    <!-- 简化版报表组件 -->
    <SimpleMonthlyReport 
      v-if="selectedCompanyKey === 'shanghai-industry' || selectedCompanyKey === 'changzhou'" 
      :company-key="selectedCompanyKey"
      :company-name="selectedCompany"
      :selected-period="selectedPeriod"
      @period-change="selectedPeriod = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { getAllReportData, calculateKeyIndicators } from '@/services/reportDataService.js'

// 导入组件
import ReportHeader from '@/components/reports/ReportHeader.vue'
import IndicatorCard from '@/components/reports/IndicatorCard.vue'
import RiskAlert from '@/components/reports/RiskAlert.vue'
import DataTable from '@/components/reports/DataTable.vue'
import SectorTable from '@/components/reports/SectorTable.vue'
import ProjectTracking from '@/components/reports/ProjectTracking.vue'
import BiddingStatusReport from '@/components/reports/BiddingStatusReport.vue'
import SimpleMonthlyReport from './SimpleMonthlyReport.vue'

// 定义支持的公司列表
const companies = {
  'shanghai': '上海南华兰陵电气有限公司',
  'shanghai-industry': '上海南华兰陵实业有限公司',
  'changzhou': '常州拓源电气集团有限公司'
}

// 响应式数据
const selectedPeriod = ref(new Date().toISOString().slice(0, 7))
const selectedCompanyKey = ref('shanghai')
const selectedCompany = computed(() => companies[selectedCompanyKey.value])
const isLoading = ref(false)
const isGenerating = ref(false)
const officeEvaluation = ref('')

// 关键指标数据
const keyIndicators = ref({
  newOrders: { 
    yearlyPlan: 80000, 
    cumulative: 5559, 
    currentPeriod: 0, 
    completionRate: 6.95,
    categories: {
      equipment: { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 },
      components: { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 },
      engineering: { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }
    }
  },
  mainRevenue: { yearlyPlan: 55000, cumulative: 1999.18, completionRate: 3.33 },
  netProfit: { 
    yearlyPlan: 4000, 
    cumulative: 6.92, 
    currentPeriod: 0,
    completionRate: 0.17,
    categories: {
      mainBusiness: { yearlyPlan: 0, cumulative: 0, currentPeriod: 0, completionRate: 0 },
      nonMainBusiness: { yearlyPlan: 0, cumulative: 0, currentPeriod: 0, completionRate: 0 }
    }
  },
  costCenter: { yearlyPlan: 8343.71, cumulative: 499, currentPeriod: 0, ratio: 25.60, executionRate: 5.98, completionRate: 5.98 }
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

// 从Analytics API更新关键指标数据
const updateKeyIndicatorsFromAPI = async () => {
  try {
    const currentYear = selectedPeriod.value.split('-')[0]
    console.log('正在从Analytics API更新关键指标数据，年份:', currentYear, '公司:', selectedCompanyKey.value)

          // 1. 获取新签订单数据 - 使用直接的newOrders API
    try {
      const newOrdersResponse = await fetch(`http://47.111.95.19:3000/new-orders/${selectedPeriod.value}`)
      if (newOrdersResponse.ok) {
        const newOrdersResult = await newOrdersResponse.json()
        if (newOrdersResult.success && newOrdersResult.data) {
          // 计算所有类别的年度计划和累计新签订单总和
          const equipmentTotal = newOrdersResult.data.equipment?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            cumulative: sum.cumulative + (item.cumulativeTotal || 0),
            currentPeriod: sum.currentPeriod + (item.currentPeriod || 0)
          }), { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }) || { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }

          const componentsTotal = newOrdersResult.data.components?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            cumulative: sum.cumulative + (item.cumulativeTotal || 0),
            currentPeriod: sum.currentPeriod + (item.currentPeriod || 0)
          }), { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }) || { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }

          const engineeringTotal = newOrdersResult.data.engineering?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            cumulative: sum.cumulative + (item.cumulativeTotal || 0),
            currentPeriod: sum.currentPeriod + (item.currentPeriod || 0)
          }), { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }) || { yearlyPlan: 0, cumulative: 0, currentPeriod: 0 }

          const totalPlan = equipmentTotal.yearlyPlan + componentsTotal.yearlyPlan + engineeringTotal.yearlyPlan
          const totalCumulative = equipmentTotal.cumulative + componentsTotal.cumulative + engineeringTotal.cumulative
          const totalCurrentPeriod = equipmentTotal.currentPeriod + componentsTotal.currentPeriod + engineeringTotal.currentPeriod

          // 为每个类别添加完成率
          equipmentTotal.completionRate = equipmentTotal.yearlyPlan > 0 ? 
            Math.round((equipmentTotal.cumulative / equipmentTotal.yearlyPlan) * 100 * 100) / 100 : 0
          componentsTotal.completionRate = componentsTotal.yearlyPlan > 0 ? 
            Math.round((componentsTotal.cumulative / componentsTotal.yearlyPlan) * 100 * 100) / 100 : 0
          engineeringTotal.completionRate = engineeringTotal.yearlyPlan > 0 ? 
            Math.round((engineeringTotal.cumulative / engineeringTotal.yearlyPlan) * 100 * 100) / 100 : 0

          keyIndicators.value.newOrders = {
            yearlyPlan: totalPlan,
            cumulative: totalCumulative,
            currentPeriod: totalCurrentPeriod,
            completionRate: totalPlan > 0 ? Math.round((totalCumulative / totalPlan) * 100 * 100) / 100 : 0,
            categories: {
              equipment: equipmentTotal,
              components: componentsTotal,
              engineering: engineeringTotal
            }
          }
          console.log('新签订单数据已更新:', keyIndicators.value.newOrders)
        }
      }
    } catch (error) {
      console.error('获取新签订单数据失败:', error)
      // 如果获取失败，保持默认值或尝试从其他来源获取
      keyIndicators.value.newOrders = {
        yearlyPlan: keyIndicators.value.newOrders.yearlyPlan,
        cumulative: keyIndicators.value.newOrders.cumulative,
        currentPeriod: 0,
        completionRate: keyIndicators.value.newOrders.completionRate,
        categories: {
          equipment: { yearlyPlan: 62000, cumulative: 0, currentPeriod: 0 },
          components: { yearlyPlan: 10100, cumulative: 0, currentPeriod: 0 },
          engineering: { yearlyPlan: 7900, cumulative: 0, currentPeriod: 0 }
        }
      }
    }

    // 2. 获取主营业务收入数据 - 使用直接的mainBusinessIncome API
    try {
      const mainBusinessIncomeResponse = await fetch(`http://47.111.95.19:3000/main-business-income/${selectedPeriod.value}`)
      if (mainBusinessIncomeResponse.ok) {
        const mainBusinessIncomeResult = await mainBusinessIncomeResponse.json()
        if (mainBusinessIncomeResult.success && mainBusinessIncomeResult.data) {
          // 计算所有类别的收入总和
          const equipmentTotal = mainBusinessIncomeResult.data.equipment?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            accumulated: sum.accumulated + (item.accumulatedIncome || 0),
            currentMonth: sum.currentMonth + (item.currentMonthIncome || 0)
          }), { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }) || { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }

          const componentsTotal = mainBusinessIncomeResult.data.components?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            accumulated: sum.accumulated + (item.accumulatedIncome || 0),
            currentMonth: sum.currentMonth + (item.currentMonthIncome || 0)
          }), { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }) || { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }

          const engineeringTotal = mainBusinessIncomeResult.data.engineering?.reduce((sum, item) => ({
            yearlyPlan: sum.yearlyPlan + (item.yearlyPlan || 0),
            accumulated: sum.accumulated + (item.accumulatedIncome || 0),
            currentMonth: sum.currentMonth + (item.currentMonthIncome || 0)
          }), { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }) || { yearlyPlan: 0, accumulated: 0, currentMonth: 0 }

          const totalPlan = 59400 // 固定年度计划59400万元
          const totalAccumulated = equipmentTotal.accumulated + componentsTotal.accumulated + engineeringTotal.accumulated
          const totalCurrentMonth = equipmentTotal.currentMonth + componentsTotal.currentMonth + engineeringTotal.currentMonth

          // 为每个类别添加完成率
          equipmentTotal.completionRate = equipmentTotal.yearlyPlan > 0 ? 
            Math.round((equipmentTotal.accumulated / equipmentTotal.yearlyPlan) * 100 * 100) / 100 : 0
          componentsTotal.completionRate = componentsTotal.yearlyPlan > 0 ? 
            Math.round((componentsTotal.accumulated / componentsTotal.yearlyPlan) * 100 * 100) / 100 : 0
          engineeringTotal.completionRate = engineeringTotal.yearlyPlan > 0 ? 
            Math.round((engineeringTotal.accumulated / engineeringTotal.yearlyPlan) * 100 * 100) / 100 : 0

          keyIndicators.value.mainRevenue = {
            yearlyPlan: totalPlan,
            cumulative: totalAccumulated,
            currentPeriod: totalCurrentMonth,
            completionRate: totalPlan > 0 ? Math.round((totalAccumulated / totalPlan) * 100 * 100) / 100 : 0,
            categories: {
              equipment: equipmentTotal,
              components: componentsTotal,
              engineering: engineeringTotal
            }
          }
          console.log('主营业务收入数据已更新:', keyIndicators.value.mainRevenue)
        }
      }
    } catch (error) {
      console.error('获取主营业务收入数据失败:', error)
      // 如果获取失败，设置默认值
      keyIndicators.value.mainRevenue = {
        yearlyPlan: 59400,
        cumulative: keyIndicators.value.mainRevenue.cumulative,
        currentPeriod: 0,
        completionRate: keyIndicators.value.mainRevenue.completionRate,
        categories: {
          equipment: { yearlyPlan: 38000, accumulated: 0, currentMonth: 0, completionRate: 0 },
          components: { yearlyPlan: 1000, accumulated: 0, currentMonth: 0, completionRate: 0 },
          engineering: { yearlyPlan: 20400, accumulated: 0, currentMonth: 0, completionRate: 0 }
        }
      }
    }

    // 3. 获取净利润数据 - 使用直接的netProfitStructure API
    try {
      const netProfitResponse = await fetch(`http://47.111.95.19:3000/net-profit-structure/${selectedPeriod.value}`)
      if (netProfitResponse.ok) {
        const netProfitResult = await netProfitResponse.json()
        if (netProfitResult.success && netProfitResult.data) {
          // 从API响应中提取数据
          const mainBusinessPlan = parseFloat(netProfitResult.data.mainBusiness?.plan || 0)
          const mainBusinessCumulative = parseFloat(netProfitResult.data.mainBusiness?.cumulative || 0)
          const mainBusinessCurrent = parseFloat(netProfitResult.data.mainBusiness?.current || 0)

          const nonMainBusinessPlan = parseFloat(netProfitResult.data.nonMainBusiness?.plan || 0)
          const nonMainBusinessCumulative = parseFloat(netProfitResult.data.nonMainBusiness?.cumulative || 0)
          const nonMainBusinessCurrent = parseFloat(netProfitResult.data.nonMainBusiness?.current || 0)

          const totalPlan = 4000 // 固定年度计划4000万元
          const totalCumulative = mainBusinessCumulative + nonMainBusinessCumulative
          const totalCurrent = mainBusinessCurrent + nonMainBusinessCurrent

          // 计算完成率
          const mainBusinessCompletionRate = mainBusinessPlan > 0 ? 
            Math.round((mainBusinessCumulative / mainBusinessPlan) * 100 * 100) / 100 : 0
          const nonMainBusinessCompletionRate = nonMainBusinessPlan > 0 ? 
            Math.round((nonMainBusinessCumulative / nonMainBusinessPlan) * 100 * 100) / 100 : 0
          const totalCompletionRate = totalPlan > 0 ? 
            Math.round((totalCumulative / totalPlan) * 100 * 100) / 100 : 0

          keyIndicators.value.netProfit = {
            yearlyPlan: totalPlan,
            cumulative: totalCumulative,
            currentPeriod: totalCurrent,
            completionRate: totalCompletionRate,
            categories: {
              mainBusiness: {
                yearlyPlan: mainBusinessPlan,
                cumulative: mainBusinessCumulative,
                currentPeriod: mainBusinessCurrent,
                completionRate: mainBusinessCompletionRate
              },
              nonMainBusiness: {
                yearlyPlan: nonMainBusinessPlan,
                cumulative: nonMainBusinessCumulative,
                currentPeriod: nonMainBusinessCurrent,
                completionRate: nonMainBusinessCompletionRate
              }
            }
          }
          console.log('净利润数据已更新:', keyIndicators.value.netProfit)
        }
      }
    } catch (error) {
      console.error('获取净利润数据失败:', error)
      // 如果获取失败，设置默认值
      keyIndicators.value.netProfit = {
        yearlyPlan: 4000,
        cumulative: keyIndicators.value.netProfit.cumulative,
        currentPeriod: 0,
        completionRate: keyIndicators.value.netProfit.completionRate,
        categories: {
          mainBusiness: { yearlyPlan: 3200, cumulative: 0, currentPeriod: 0, completionRate: 0 },
          nonMainBusiness: { yearlyPlan: 800, cumulative: 0, currentPeriod: 0, completionRate: 0 }
        }
      }
    }

    // 4. 获取成本中心数据 - 使用直接的costCenterStructure API
    try {
      const costCenterResponse = await fetch(`http://47.111.95.19:3000/cost-center-structure/${selectedPeriod.value}`)
      if (costCenterResponse.ok) {
        const costCenterResult = await costCenterResponse.json()
        if (costCenterResult.success && costCenterResult.data) {
          // 从成本中心数据中提取信息
          let totalPlan = 0
          let totalCumulative = 0
          let totalCurrent = 0

          // 计算总的成本中心数据
          if (costCenterResult.data && typeof costCenterResult.data === 'object') {
            Object.values(costCenterResult.data).forEach(categoryData => {
              if (Array.isArray(categoryData)) {
                categoryData.forEach(item => {
                  if (item && typeof item === 'object') {
                    totalPlan += parseFloat(item.yearlyPlan || item.plan || 0)
                    totalCumulative += parseFloat(item.cumulative || item.accumulatedCost || 0)
                    totalCurrent += parseFloat(item.currentPeriod || item.currentCost || 0)
                  }
                })
              }
            })
          }

          // 计算主营业务比率（需要主营业务收入数据）
          const mainRevenueTotal = keyIndicators.value.mainRevenue.cumulative || 1
          const ratio = mainRevenueTotal > 0 ? Math.round((totalCumulative / mainRevenueTotal) * 100 * 100) / 100 : 0
          const executionRate = totalPlan > 0 ? Math.round((totalCumulative / totalPlan) * 100 * 100) / 100 : 0

          keyIndicators.value.costCenter = {
            yearlyPlan: totalPlan,
            cumulative: totalCumulative,
            currentPeriod: totalCurrent,
            ratio: ratio,
            executionRate: executionRate,
            completionRate: executionRate
          }
          console.log('成本中心数据已更新:', keyIndicators.value.costCenter)
        }
      }
    } catch (error) {
      console.error('获取成本中心数据失败:', error)
      // 如果获取失败，保持默认值
      keyIndicators.value.costCenter = {
        yearlyPlan: keyIndicators.value.costCenter.yearlyPlan,
        cumulative: keyIndicators.value.costCenter.cumulative,
        currentPeriod: 0,
        ratio: keyIndicators.value.costCenter.ratio,
        executionRate: keyIndicators.value.costCenter.executionRate,
        completionRate: keyIndicators.value.costCenter.executionRate
      }
    }

  } catch (error) {
    console.error('更新关键指标数据失败:', error)
  }
}

// 从Analytics API更新质量指标数据
const updateQualityIndicatorsFromAPI = async () => {
  try {
    const [currentYear, currentMonth] = selectedPeriod.value.split('-')
    console.log('正在从Analytics API更新当月质量指标数据，年份:', currentYear, '月份:', currentMonth, '公司:', selectedCompanyKey.value)

    // 使用新的月度质量指标API
    try {
      const monthlyIndicatorsResponse = await fetch(`http://47.111.95.19:3000/analytics/monthly-quality-indicators/${currentYear}/${currentMonth}`)
      if (monthlyIndicatorsResponse.ok) {
        const monthlyResult = await monthlyIndicatorsResponse.json()
        console.log('月度质量指标API响应:', monthlyResult)
        
        if (monthlyResult.success && monthlyResult.data) {
          // 更新所有质量指标数据
          qualityIndicators.value = {
            marginContribution: monthlyResult.data.marginContribution,
            grossMargin: monthlyResult.data.grossMargin,
            netMargin: monthlyResult.data.netMargin,
            roe: monthlyResult.data.roe,
            assetLiabilityRatio: monthlyResult.data.assetLiabilityRatio
          }
          console.log('月度质量指标数据已更新:', qualityIndicators.value)
        } else {
          console.log('月度质量指标API返回失败，使用默认数据')
          setDefaultQualityIndicators()
        }
      } else {
        console.log('月度质量指标API请求失败，状态:', monthlyIndicatorsResponse.status)
        setDefaultQualityIndicators()
      }
    } catch (error) {
      console.error('获取月度质量指标数据失败:', error)
      setDefaultQualityIndicators()
    }

    console.log('月度质量指标数据更新完成:', qualityIndicators.value)

  } catch (error) {
    console.error('更新月度质量指标数据失败:', error)
    setDefaultQualityIndicators()
  }
}

// 设置默认质量指标数据
const setDefaultQualityIndicators = () => {
  qualityIndicators.value = {
    marginContribution: { yearlyPlan: 21.98, current: 20.15 + Math.random() * 2 },
    grossMargin: { yearlyPlan: 24.00, current: 21.50 + Math.random() * 3 },
    netMargin: { yearlyPlan: 6.85, current: 5.10 + Math.random() * 2 },
    roe: { yearlyPlan: 21.18, current: 18.50 + Math.random() * 5 },
    assetLiabilityRatio: { yearlyPlan: 74.00, current: 72.00 + Math.random() * 8 }
  }
  
  // 计算波动数据
  qualityIndicators.value.receivables.current = 
    qualityIndicators.value.receivables.initial * (1 + (Math.random() * 0.5 + 0.1))
  qualityIndicators.value.receivables.fluctuation = 
    ((qualityIndicators.value.receivables.current - qualityIndicators.value.receivables.initial) / 
     qualityIndicators.value.receivables.initial * 100)

  qualityIndicators.value.inventory.current = 
    qualityIndicators.value.inventory.initial * (1 + (Math.random() * 0.1 - 0.05))
  qualityIndicators.value.inventory.fluctuation = 
    ((qualityIndicators.value.inventory.current - qualityIndicators.value.inventory.initial) / 
     qualityIndicators.value.inventory.initial * 100)
     
  // 格式化数值
  Object.keys(qualityIndicators.value).forEach(key => {
    const indicator = qualityIndicators.value[key]
    Object.keys(indicator).forEach(prop => {
      if (typeof indicator[prop] === 'number') {
        indicator[prop] = Number(indicator[prop].toFixed(2))
      }
    })
  })
}

// 手动刷新关键指标
const refreshKeyIndicators = async () => {
  isRefreshingIndicators.value = true
  try {
    await updateKeyIndicatorsFromAPI()
    console.log('关键指标数据刷新完成')
  } catch (error) {
    console.error('刷新关键指标失败:', error)
  } finally {
    isRefreshingIndicators.value = false
  }
}

// 手动刷新质量指标
const refreshQualityIndicators = async () => {
  isRefreshingQuality.value = true
  try {
    await updateQualityIndicatorsFromAPI()
    console.log('质量指标数据刷新完成')
  } catch (error) {
    console.error('刷新质量指标失败:', error)
  } finally {
    isRefreshingQuality.value = false
  }
}

// 刷新状态
const isRefreshingIndicators = ref(false)
const isRefreshingQuality = ref(false)

// 风险提示数据
const riskAlerts = ref({
  financial: '',
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

// 新签订单数据
const newOrderData = ref([])

// 营业收入数据
const businessIncomeData = ref([])

// 存量数据
const inventoryData = ref([
  { sector: '设备', customer: '政府类', initialAmount: 1000, currentAmount: 1050, fluctuation: 5.0 },
  { sector: '元件', customer: '民营', initialAmount: 800, currentAmount: 820, fluctuation: 2.5 },
  { sector: '工程', customer: '央企', initialAmount: 1200, currentAmount: 1180, fluctuation: -1.67 }
])

// 主营业务成本数据
const mainBusinessCostData = ref([
  // 设备板块
  { sector: '设备', customer: '上海', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '国网', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '江苏', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '输配电内配', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '西门子', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '同业', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '用户', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '设备', customer: '其它', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  // 元件板块
  { sector: '元件', customer: '用户', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  // 工程板块
  { sector: '工程', customer: '一包', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '工程', customer: '二包', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '工程', customer: '域内合作', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '工程', customer: '域外合作', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
  { sector: '工程', customer: '其它', yearlyPlan: 0, executionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 }
])

// 成本中心数据
const costCenterData = ref([
  // 设备板块
  { sector: '设备', customer: '上海', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '国网', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '江苏', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '输配电内配', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '西门子', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '同业', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '用户', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '设备', customer: '其它', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  // 元件板块
  { sector: '元件', customer: '用户', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  // 工程板块
  { sector: '工程', customer: '一包', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '工程', customer: '二包', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '工程', customer: '域内合作', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '工程', customer: '域外合作', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 },
  { sector: '工程', customer: '其它', cumulativeIncome: 0, currentMonthIncome: 0, percentage: 0 }
])

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

// 项目跟踪数据
const projectTrackingData = ref({
  equipment: [],
  component: [],
  engineering: []
})

// 营业收入结构数据 - 从BusinessIncomeStructure复制
const businessIncomeStructureData = ref([
  { id: 1, category: '主营业务', yearlyPlan: 59400, currentMonthIncome: 0, accumulatedIncome: 0 },
  { id: 2, category: '非主营业务', yearlyPlan: 600, currentMonthIncome: 0, accumulatedIncome: 0 }
])

// 存储所有历史月份数据，用于计算累计收入
const allMonthsBusinessIncomeData = ref([])

// 订单转收入数据 - 从OrderToIncome复制
const orderToIncomeData = ref({
  equipment: [
    { customer: '上海', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '国网', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '江苏', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '输配电内配', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '西门子', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '同业', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '用户', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '其它', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
  ],
  components: [
    { customer: '用户', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
  ],
  engineering: [
    { customer: '一包', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '二包', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '域内合作', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '域外合作', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
    { customer: '其它', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
  ]
})

// 存储订单转收入所有历史月份数据
const allMonthsOrderToIncomeData = ref([])

// 存量订单转收入数据 - 从StockOrderToIncome复制
const stockOrderToIncomeData = ref({
  equipment: [
    { customer: '上海', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '国网', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '江苏', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '输配电内配', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '西门子', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '同业', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
  ],
  components: [
    { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
  ],
  engineering: [
    { customer: '一包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '二包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '域内合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '域外合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
    { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
  ]
})

// 存储存量订单转收入所有历史月份数据
const allMonthsStockOrderToIncomeData = ref([])

// 中标未履约情况数据 - 从BidFulfillment复制
// 静态期初余额数据（根据截图中的数据）
const staticInitialAmounts = {
  equipment: {
    '上海': 31055.26,
    '国网': 2798.76,
    '江苏': 5085.93,
    '输配电内配': 0.00,
    '西门子': 0.00,
    '同业': 0.00,
    '用户': 0.00,
    '其它': 0.00
  },
  component: {
    '用户': 0.00
  },
  project: {
    '一包': 8281.13,
    '二包': 444.83,
    '域内合作': 702.04,
    '域外合作': 0.00,
    '其它': 21.93
  }
}

const bidFulfillmentData = ref({
  equipment: [
    { customerType: '上海', initialAmount: staticInitialAmounts.equipment['上海'], currentAmount: 0 },
    { customerType: '国网', initialAmount: staticInitialAmounts.equipment['国网'], currentAmount: 0 },
    { customerType: '江苏', initialAmount: staticInitialAmounts.equipment['江苏'], currentAmount: 0 },
    { customerType: '输配电内配', initialAmount: staticInitialAmounts.equipment['输配电内配'], currentAmount: 0 },
    { customerType: '西门子', initialAmount: staticInitialAmounts.equipment['西门子'], currentAmount: 0 },
    { customerType: '同业', initialAmount: staticInitialAmounts.equipment['同业'], currentAmount: 0 },
    { customerType: '用户', initialAmount: staticInitialAmounts.equipment['用户'], currentAmount: 0 },
    { customerType: '其它', initialAmount: staticInitialAmounts.equipment['其它'], currentAmount: 0 }
  ],
  component: [
    { customerType: '用户', initialAmount: staticInitialAmounts.component['用户'], currentAmount: 0 }
  ],
  project: [
    { customerType: '一包', initialAmount: staticInitialAmounts.project['一包'], currentAmount: 0 },
    { customerType: '二包', initialAmount: staticInitialAmounts.project['二包'], currentAmount: 0 },
    { customerType: '域内合作', initialAmount: staticInitialAmounts.project['域内合作'], currentAmount: 0 },
    { customerType: '域外合作', initialAmount: staticInitialAmounts.project['域外合作'], currentAmount: 0 },
    { customerType: '其它', initialAmount: staticInitialAmounts.project['其它'], currentAmount: 0 }
  ]
})

// 新签订单已排产未入库项目（在产）数据 - 从InventoryInProgress复制
const inventoryInProgressData = ref({
  equipment: [
    { customerType: '上海', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '国网', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '江苏', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '输配电内配', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '西门子', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '同业', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
  ],
  component: [
    { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 }
  ],
  project: [
    { customerType: '一包', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '二包', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '域内合作', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '域外合作', yearlyBudget: 0, monthlyIncome: 0 },
    { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
  ]
})

// 库存情况(合同存量)数据 - 从ContractInventory复制
// 静态年初余量数据
const contractStaticInitialAmounts = {
  equipment: {
    '上海': 1200.50,
    '国网': 2300.75,
    '江苏': 800.25,
    '输配电内配': 150.00,
    '西门子': 0.00,
    '同业': 950.60,
    '用户': 750.40,
    '其它': 200.30
  },
  component: {
    '用户': 500.80
  },
  project: {
    '一包': 300.20,
    '二包': 150.10,
    '域内合作': 1100.90,
    '域外合作': 650.75,
    '其它': 400.50
  }
}

const contractInventoryData = ref({
  equipment: [
    { customerType: '上海', initialAmount: contractStaticInitialAmounts.equipment['上海'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '国网', initialAmount: contractStaticInitialAmounts.equipment['国网'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '江苏', initialAmount: contractStaticInitialAmounts.equipment['江苏'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '输配电内配', initialAmount: contractStaticInitialAmounts.equipment['输配电内配'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '西门子', initialAmount: contractStaticInitialAmounts.equipment['西门子'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '同业', initialAmount: contractStaticInitialAmounts.equipment['同业'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '用户', initialAmount: contractStaticInitialAmounts.equipment['用户'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '其它', initialAmount: contractStaticInitialAmounts.equipment['其它'], currentIncrease: 0, cumulativeAmount: 0 }
  ],
  component: [
    { customerType: '用户', initialAmount: contractStaticInitialAmounts.component['用户'], currentIncrease: 0, cumulativeAmount: 0 }
  ],
  project: [
    { customerType: '一包', initialAmount: contractStaticInitialAmounts.project['一包'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '二包', initialAmount: contractStaticInitialAmounts.project['二包'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '域内合作', initialAmount: contractStaticInitialAmounts.project['域内合作'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '域外合作', initialAmount: contractStaticInitialAmounts.project['域外合作'], currentIncrease: 0, cumulativeAmount: 0 },
    { customerType: '其它', initialAmount: contractStaticInitialAmounts.project['其它'], currentIncrease: 0, cumulativeAmount: 0 }
  ]
})

// 存储合同存量所有历史月份数据
const allMonthsContractInventoryData = ref([])

// 存储合同存量主营业务收入数据
const contractMainBusinessIncomeData = ref(null)

// 成本暂估入库和计提情况数据 - 从CostEstimation复制
const costEstimationData = ref({
  equipment: [
    { customerType: '上海', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '国网', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '江苏', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '输配电内配', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '西门子', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '同业', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
  ],
  component: [
    { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
  ],
  project: [
    { customerType: '一包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '二包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '域内合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '域外合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
    { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
  ]
})

// 存储成本暂估所有历史月份数据
const allMonthsCostEstimationData = ref([])

// 存储成本暂估主营业务收入数据，用于计算计提率
const costEstimationMainBusinessIncomeData = ref(null)

// 部门成本中心实际发生情况数据 - 从DepartmentCostCenter复制
const getInitialDepartmentCostCenterData = () => [
  { department: '总经理室', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '企管部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '财务部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '销售部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '市场部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '营运部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '研技部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: 'C-GIS 事业部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
  { department: '工程事业部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' }
]

const getInitialDepartmentCostCenterTotalRow = () => ({
  department: '合计',
  yearlyBudget: '0',
  currentPeriod: '0',
  currentTotal: '0',
  executionProgress: '0%',
  budgetToOutputRatio: '0%',
  actualToOutputRatio: '0%'
})

const departmentCostCenterData = ref(getInitialDepartmentCostCenterData())
const departmentCostCenterTotalRow = ref(getInitialDepartmentCostCenterTotalRow())

// 存储部门成本中心所有历史月份数据
const allMonthsDepartmentCostCenterData = ref([])

// 部门成本中心计入损益情况数据 - 从DepartmentCostInput复制
const getInitialDepartmentCostInputData = () => {
  const departments = [
    { department: '总经理室', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '企管部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '财务部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '销售部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '市场部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '营运部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '研技部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: 'C-GIS 事业部', yearlyBudget: '1894.69', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
    { department: '工程事业部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' }
  ]

  const total = {
    department: '合计',
    yearlyBudget: '',
    currentMonthIncome: '',
    accumulatedIncome: '',
    executionProgress: '',
    budgetToOutputRatio: '',
    actualToOutputRatio: ''
  }

  return { departments, total }
}

const initialDepartmentCostInputData = getInitialDepartmentCostInputData()
const departmentCostInputData = ref(initialDepartmentCostInputData.departments)
const departmentCostInputTotalRow = ref(initialDepartmentCostInputData.total)

// 存储部门成本中心计入损益所有历史月份数据
const allMonthsDepartmentCostInputData = ref([])

// 存货数据 - 从InventoryData复制
const inventoryDataEquipment = ref([
  { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryDataComponent = ref([
  { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryDataProject = ref([
  { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryDataTotal = ref({ initial: '', current: '', fluctuation: '' })

// 库存情况数据 - 从InventoryStock复制
const inventoryStockEquipment = ref([
  { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryStockComponent = ref([
  { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryStockProject = ref([
  { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
  { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
])

const inventoryStockTotal = ref({ initial: '', current: '', fluctuation: '' })

// 主营业务净利润贡献情况数据 - 从NetProfitStructure复制
const getInitialNetProfitEquipmentData = () => [
  { customerType: '上海', plan: '2145.03', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '国网', plan: '621.55', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '江苏', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '输配电内配', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '西门子', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '同业', plan: '553.08', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '用户', plan: '323.8', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '其它', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialNetProfitComponentData = () => [
  { customerType: '用户', plan: '-26.21', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialNetProfitProjectData = () => [
  { customerType: '一包', plan: '328.91', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '二包', plan: '14.4', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '域内合作', plan: '-35.24', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '域外合作', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
  { customerType: '其它', plan: '69.6', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

// 非主营业务净利润数据初始化
const getInitialNetProfitNonMainItems = () => [
  { id: 1, name: '固废收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
  { id: 2, name: '房屋租金', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
  { id: 3, name: '利息收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
  { id: 4, name: '投资收益', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
  { id: 5, name: '补贴收入', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' },
  { id: 6, name: '其他', plan: '0', currentPeriod: '0', accumulated: '0', progress: '0.00%' }
]

// 主营业务净利润数据
const netProfitEquipmentData = ref(getInitialNetProfitEquipmentData())
const netProfitComponentData = ref(getInitialNetProfitComponentData())
const netProfitProjectData = ref(getInitialNetProfitProjectData())

// 非主营业务净利润数据
const netProfitNonMainItems = ref(getInitialNetProfitNonMainItems())
const netProfitAllMonthsData = ref([]) // 存储所有月份的数据

// 主营业务收入结构数据
const mainBusinessIncomeStructureData = ref({
  equipment: [
    { customer: '上海', yearlyPlan: 22000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '国网', yearlyPlan: 5000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '江苏', yearlyPlan: 3000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '输配电内配', yearlyPlan: 2000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '西门子', yearlyPlan: 1000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '同业', yearlyPlan: 3000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '用户', yearlyPlan: 2000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '其它', yearlyPlan: 0, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
  ],
  components: [
    { customer: '用户', yearlyPlan: 1000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
  ],
  engineering: [
    { customer: '一包', yearlyPlan: 3800, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '二包', yearlyPlan: 700, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '域内合作', yearlyPlan: 10000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '域外合作', yearlyPlan: 0, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
    { customer: '其它', yearlyPlan: 1500, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
  ]
})

// 非主营业务结构数据
const nonMainBusinessStructureData = ref([
  { id: 1, category: '固定收入', yearlyPlan: 100, currentPeriod: 0, cumulative: 0 },
  { id: 2, category: '房屋租金', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
  { id: 3, category: '利息收入', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
  { id: 4, category: '投资收益', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
  { id: 5, category: '补贴收入', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 },
  { id: 6, category: '其他', yearlyPlan: 0, currentPeriod: 0, cumulative: 0 }
])



// 表格列配置
const newOrderColumns = [
  { key: 'sector', title: '板块属性' },
  { key: 'customer', title: '客户属性' },
  { key: 'yearlyPlan', title: '年度计划', type: 'number', align: 'right', cellClass: 'bg-gray-50' },
  { key: 'monthlyRevenue', title: '当月新增', type: 'number', align: 'right' },
  { key: 'cumulativeRevenue', title: '累计新签订单', type: 'number', align: 'right', cellClass: 'bg-gray-50' },
  { key: 'progress', title: '执行进度', type: 'percentage', align: 'right' }
]

const businessIncomeColumns = [
  { key: 'id', title: '序号', align: 'center' },
  { key: 'category', title: '财务科目' },
  { key: 'yearlyPlan', title: '年度计划', type: 'number', align: 'right' },
  { key: 'currentMonthIncome', title: '当月收入', type: 'number', align: 'right' },
  { key: 'accumulatedIncome', title: '累计收入', type: 'number', align: 'right' },
  { key: 'progress', title: '执行进度', type: 'percentage', align: 'right' }
]

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

// 营业收入结构相关计算函数
const calculateBusinessIncomeProgress = (yearlyPlan, accumulatedIncome) => {
  if (!yearlyPlan || yearlyPlan === 0) return '0.00'
  const progress = (accumulatedIncome / yearlyPlan) * 100
  return progress.toFixed(2)
}

const calculateNonMainBusinessProgress = (yearlyPlan, cumulative) => {
  if (!yearlyPlan || yearlyPlan === 0) return '0.00'
  const progress = (cumulative / yearlyPlan) * 100
  return progress.toFixed(2)
}

// 营业收入结构总计数据
const businessIncomeStructureTotalData = computed(() => {
  const total = {
    yearlyPlan: 0,
    currentMonthIncome: 0,
    accumulatedIncome: 0,
    progress: 0
  }

  businessIncomeStructureData.value.forEach(item => {
    total.yearlyPlan += item.yearlyPlan || 0
    total.currentMonthIncome += item.currentMonthIncome || 0
    total.accumulatedIncome += item.accumulatedIncome || 0
  })

  // 计算总进度
  total.progress = total.yearlyPlan > 0 ? (total.accumulatedIncome / total.yearlyPlan * 100) : 0
  total.progress = parseFloat(total.progress.toFixed(2))

  return total
})

// 主营业务收入结构合计数据
const mainBusinessIncomeStructureTotalData = computed(() => {
  let totalYearlyPlan = 0
  let totalCurrentMonth = 0
  let totalAccumulated = 0

  // 计算设备板块合计
  if (Array.isArray(mainBusinessIncomeStructureData.value.equipment)) {
    mainBusinessIncomeStructureData.value.equipment.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      totalYearlyPlan += yearlyPlan
      totalCurrentMonth += item.currentMonthIncome || 0
      totalAccumulated += item.accumulatedIncome || 0
    })
  }

  // 计算元件板块合计
  if (Array.isArray(mainBusinessIncomeStructureData.value.components)) {
    mainBusinessIncomeStructureData.value.components.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      totalYearlyPlan += yearlyPlan
      totalCurrentMonth += item.currentMonthIncome || 0
      totalAccumulated += item.accumulatedIncome || 0
    })
  }

  // 计算工程板块合计
  if (Array.isArray(mainBusinessIncomeStructureData.value.engineering)) {
    mainBusinessIncomeStructureData.value.engineering.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      totalYearlyPlan += yearlyPlan
      totalCurrentMonth += item.currentMonthIncome || 0
      totalAccumulated += item.accumulatedIncome || 0
    })
  }

  const progress = totalYearlyPlan > 0 ? ((totalAccumulated / totalYearlyPlan) * 100).toFixed(2) + '%' : '0.00%'

  return {
    yearlyPlan: totalYearlyPlan,
    currentMonthIncome: totalCurrentMonth,
    accumulatedIncome: totalAccumulated,
    progress: progress
  }
})

// 非主营业务结构合计数据
const nonMainBusinessStructureTotalData = computed(() => {
  let totalYearlyPlan = 0
  let totalCurrentPeriod = 0
  let totalCumulative = 0

  nonMainBusinessStructureData.value.forEach(item => {
    totalYearlyPlan += item.yearlyPlan || 0
    totalCurrentPeriod += item.currentPeriod || 0
    totalCumulative += item.cumulative || 0
  })

  const progress = totalYearlyPlan > 0 ? ((totalCumulative / totalYearlyPlan) * 100).toFixed(2) : '0.00'

  return {
    yearlyPlan: totalYearlyPlan,
    currentPeriod: totalCurrentPeriod,
    cumulative: totalCumulative,
    progress: progress
  }
})

// 订单转收入合计数据
const orderToIncomeTotalData = computed(() => {
  const total = {
    signedOrder: 0,
    currentIncome: 0,
    incomeTotal: 0,
    incomeRate: 0
  }

  // 计算所有项的总和
  const allItems = [
    ...orderToIncomeData.value.equipment,
    ...orderToIncomeData.value.components,
    ...orderToIncomeData.value.engineering
  ]

  allItems.forEach(item => {
    total.signedOrder += item.signedOrder || 0
    total.currentIncome += item.currentIncome || 0
    total.incomeTotal += item.incomeTotal || 0
  })

  // 计算总转收入比率
  total.incomeRate = total.signedOrder > 0 ? parseFloat(((total.incomeTotal / total.signedOrder) * 100).toFixed(2)) : 0

  return total
})

// 存量订单转收入合计数据
const stockOrderToIncomeTotalData = computed(() => {
  const total = {
    yearlyPlan: 0,
    stockOrder: 0,
    currentMonthIncome: 0,
    incomeTotal: 0,
    incomeRate: 0
  }

  // 计算所有项的总和
  const allItems = [
    ...stockOrderToIncomeData.value.equipment,
    ...stockOrderToIncomeData.value.components,
    ...stockOrderToIncomeData.value.engineering
  ]

  allItems.forEach(item => {
    total.yearlyPlan += item.yearlyPlan || 0
    total.stockOrder += item.stockOrder || 0
    total.currentMonthIncome += item.currentMonthIncome || 0
    total.incomeTotal += item.incomeTotal || 0
  })

  // 计算总转收入比率
  total.incomeRate = total.stockOrder > 0 ? parseFloat(((total.incomeTotal / total.stockOrder) * 100).toFixed(2)) : 0

  return total
})

// 比率格式化函数
const formatStockOrderRate = (rate) => {
  if (isNaN(rate) || rate === null || rate === undefined) {
    return '0.00%'
  }
  return rate.toFixed(2) + '%'
}

// 中标未履约情况合计数据
const bidFulfillmentTotalData = computed(() => {
  const total = {
    initialAmount: 0,
    currentAmount: 0
  }

  const allData = [...bidFulfillmentData.value.equipment, ...bidFulfillmentData.value.component, ...bidFulfillmentData.value.project]

  allData.forEach(item => {
    total.initialAmount += Number(item.initialAmount) || 0
    total.currentAmount += Number(item.currentAmount) || 0
  })

  return total
})

// 计算波动率
const calculateBidFluctuation = (initial, current) => {
  if (initial === 0) return current === 0 ? '0.00' : '0.00'
  const fluctuation = ((current - initial) / initial) * 100
  return fluctuation.toFixed(2)
}

// 在产项目合计数据
const inventoryInProgressTotalData = computed(() => {
  const total = {
    yearlyBudget: 0,
    monthlyIncome: 0
  }

  // 汇总设备板块数据
  inventoryInProgressData.value.equipment.forEach(item => {
    total.yearlyBudget += Number(item.yearlyBudget) || 0
    total.monthlyIncome += Number(item.monthlyIncome) || 0
  })

  // 汇总元件板块数据
  inventoryInProgressData.value.component.forEach(item => {
    total.yearlyBudget += Number(item.yearlyBudget) || 0
    total.monthlyIncome += Number(item.monthlyIncome) || 0
  })

  // 汇总工程板块数据
  inventoryInProgressData.value.project.forEach(item => {
    total.yearlyBudget += Number(item.yearlyBudget) || 0
    total.monthlyIncome += Number(item.monthlyIncome) || 0
  })

  return total
})

// 计算在产项目完成率
const calculateInventoryCompletionRate = (cumulative, budget) => {
  if (budget === 0) return '0.00'
  const rate = ((cumulative / budget) * 100) - 100
  return rate.toFixed(2)
}

// 合同存量合计数据
const contractInventoryTotalData = computed(() => {
  const total = {
    initialAmount: 0,
    currentIncrease: 0,
    cumulativeAmount: 0
  }

  // 汇总设备板块数据
  contractInventoryData.value.equipment.forEach(item => {
    total.initialAmount += Number(item.initialAmount) || 0
    total.currentIncrease += Number(item.currentIncrease) || 0
    total.cumulativeAmount += Number(item.cumulativeAmount) || 0
  })

  // 汇总元件板块数据
  contractInventoryData.value.component.forEach(item => {
    total.initialAmount += Number(item.initialAmount) || 0
    total.currentIncrease += Number(item.currentIncrease) || 0
    total.cumulativeAmount += Number(item.cumulativeAmount) || 0
  })

  // 汇总工程板块数据
  contractInventoryData.value.project.forEach(item => {
    total.initialAmount += Number(item.initialAmount) || 0
    total.currentIncrease += Number(item.currentIncrease) || 0
    total.cumulativeAmount += Number(item.cumulativeAmount) || 0
  })

  return total
})

// 获取合同存量主营业务收入值
const getContractMainBusinessIncome = (category, customerType) => {
  if (!contractMainBusinessIncomeData.value) return 0

  let categoryData = []
  if (category === 'equipment') {
    categoryData = contractMainBusinessIncomeData.value.equipment || []
  } else if (category === 'component') {
    categoryData = contractMainBusinessIncomeData.value.components || []
  } else if (category === 'project') {
    categoryData = contractMainBusinessIncomeData.value.engineering || []
  }

  const item = categoryData.find((item) => item.customer === customerType)
  return item ? (item.currentMonthIncome || 0) : 0
}

// 获取合同存量主营业务收入总计
const getContractTotalMainBusinessIncome = () => {
  if (!contractMainBusinessIncomeData.value) return 0

  let total = 0
  const allCategories = [
    ...(contractMainBusinessIncomeData.value.equipment || []),
    ...(contractMainBusinessIncomeData.value.components || []),
    ...(contractMainBusinessIncomeData.value.engineering || [])
  ]

  allCategories.forEach((item) => {
    total += item.currentMonthIncome || 0
  })

  return total
}

// 计算合同存量波动率
const calculateContractFluctuation = (initial, cumulative) => {
  if (initial === 0) {
    return cumulative === 0 ? '0.00' : 'N/A'
  }
  const fluctuation = ((cumulative - initial) / initial) * 100
  return fluctuation.toFixed(2)
}

// 成本暂估合计数据
const costEstimationTotalData = computed(() => {
  const allItems = [...costEstimationData.value.equipment, ...costEstimationData.value.component, ...costEstimationData.value.project]

  const total = {
    initialBalance: 0,
    currentPeriod: 0,
    currentWriteOff: 0,
    yearTotal: 0,
    averageProvisionRate: 0
  }

  let totalProvisionRate = 0
  let validRateCount = 0

  allItems.forEach(item => {
    total.initialBalance += item.initialBalance || 0
    total.currentPeriod += item.currentPeriod || 0
    total.currentWriteOff += item.currentWriteOff || 0
    total.yearTotal += item.yearTotal || 0

    if (item.provisionRate > 0) {
      totalProvisionRate += item.provisionRate
      validRateCount++
    }
  })

  // 计算平均计提率
  total.averageProvisionRate = validRateCount > 0 ? totalProvisionRate / validRateCount : 0

  return total
})

// 格式化部门数字显示
const formatDepartmentNumber = (value) => {
  if (!value || value === '') return ''
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化净利润数字显示
const formatNetProfitNumber = (num) => {
  if (isNaN(num)) return '0.00'
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算主营业务净利润合计数据
const netProfitMainBusinessTotalData = computed(() => {
  let totalPlan = 0
  let totalCurrentMonth = 0
  let totalActual = 0

  // 计算设备板块合计
  netProfitEquipmentData.value.forEach(item => {
    totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
    totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
    totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
  })

  // 计算元件板块合计
  netProfitComponentData.value.forEach(item => {
    totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
    totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
    totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
  })

  // 计算工程板块合计
  netProfitProjectData.value.forEach(item => {
    totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
    totalCurrentMonth += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
    totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
  })

  return {
    plan: totalPlan,
    currentMonthValue: totalCurrentMonth,
    actual: totalActual,
    contribution: '100.00%'
  }
})

// 计算非主营业务净利润合计数据
const netProfitNonMainTotalData = computed(() => {
  let totalPlan = 0
  let totalCurrent = 0
  let totalAccumulated = 0

  netProfitNonMainItems.value.forEach(item => {
    totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
    totalCurrent += parseFloat(item.currentPeriod.replace(/,/g, '')) || 0
    totalAccumulated += parseFloat(item.accumulated.replace(/,/g, '')) || 0
  })

  const progress = totalPlan !== 0 ? ((totalAccumulated / totalPlan) * 100).toFixed(2) + '%' : '0.00%'

  return {
    plan: totalPlan,
    currentPeriod: totalCurrent,
    accumulated: totalAccumulated,
    progress: progress
  }
})

// 格式化期间
const formatPeriod = (period) => {
  if (!period) return ''
  const [year, month] = period.split('-')
  return `${year} 年 ${month.padStart(2, '0')} 月`
}

// 处理公司变更事件
const handleCompanyChange = () => {
  console.log(`切换到公司: ${selectedCompany.value}`)
  loadReportData() // 重新加载数据
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

    // 处理项目跟踪数据
    projectTrackingData.value = reportData.projectTrackingData || {
      equipment: [],
      component: [],
      engineering: []
    }

    // 加载营业收入结构数据
    await loadBusinessIncomeStructureData()

    // 从Analytics API更新第1、2点的指标数据
    await updateKeyIndicatorsFromAPI()
    await updateQualityIndicatorsFromAPI()

    // 计算关键指标（保留原有逻辑作为备用）
    // keyIndicators.value = calculateKeyIndicators(reportData)

  } catch (error) {
    console.error('加载报表数据失败:', error)
    // 如果API调用失败，使用模拟数据
    await loadMockData()
  } finally {
    isLoading.value = false
  }
}

// 加载营业收入结构数据
const loadBusinessIncomeStructureData = async () => {
  try {
    console.log(`正在加载营业收入结构数据，期间: ${selectedPeriod.value}，公司: ${selectedCompanyKey.value}`)

    // 1. 加载营业收入结构总表数据
    const response = await fetch(`http://47.111.95.19:3000/business-income/${selectedPeriod.value}?company=${selectedCompanyKey.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && Array.isArray(result.data)) {
        businessIncomeStructureData.value = result.data.map((item) => ({
          id: item.id,
          category: item.category,
          yearlyPlan: item.id === 1 ? 59400 : 600, // 写死年度计划
          currentMonthIncome: item.currentMonthIncome || 0,
          accumulatedIncome: item.accumulatedIncome || 0
        }))
      }
    }

    // 2. 加载主营业务收入分解数据
    await loadMainBusinessIncomeStructureData()

    // 3. 加载非主营业务数据
    await loadNonMainBusinessStructureData()

    // 4. 加载订单转收入数据
    await loadOrderToIncomeData()

    // 5. 加载存量订单转收入数据
    await loadStockOrderToIncomeData()

    // 6. 加载中标未履约情况数据
    await loadBidFulfillmentData()

    // 7. 加载在产项目数据
    await loadInventoryInProgressData()

    // 8. 加载合同存量数据
    await loadContractInventoryData()

    // 9. 加载成本暂估数据
    await loadCostEstimationData()

    // 10. 加载部门成本中心数据
    await loadDepartmentCostCenterData()

    // 11. 加载部门成本中心计入损益数据
    await loadDepartmentCostInputData()

    // 12. 加载存货数据
    await loadInventoryData()

    // 13. 加载库存情况数据
    await loadInventoryStockData()

    // 14. 加载主营业务净利润数据
    await loadNetProfitMainBusinessData(selectedPeriod.value)

    // 15. 加载非主营业务净利润数据
    await loadNetProfitNonMainBusinessData(selectedPeriod.value)

  } catch (error) {
    console.error('加载营业收入结构数据失败:', error)
  }
}

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsBusinessIncomeData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/main-business-income/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsBusinessIncomeData.value = allData
    console.log('加载的所有月份数据:', allData)
  } catch (error) {
    console.error('加载所有月份数据失败:', error)
  }
}

// 计算累计收入
const calculateAccumulatedIncomeForMainBusiness = (category, customer) => {
  let total = 0

  // 累加历史月份数据
  for (const monthData of allMonthsBusinessIncomeData.value) {
    const categoryData = monthData.data[category]
    if (categoryData) {
      const item = categoryData.find(d => d.customer === customer)
      if (item && item.currentMonthIncome) {
        total += item.currentMonthIncome
      }
    }
  }

  // 加上当前月份的输入值
  const currentCategoryData = mainBusinessIncomeStructureData.value[category]
  const currentItem = currentCategoryData.find(d => d.customer === customer)
  if (currentItem && currentItem.currentMonthIncome) {
    total += currentItem.currentMonthIncome
  }

  return total
}

// 更新累计收入数据
const updateAccumulatedIncomeForMainBusiness = () => {
  // 安全检查数据结构
  if (!mainBusinessIncomeStructureData.value || typeof mainBusinessIncomeStructureData.value !== 'object') {
    console.error('mainBusinessIncomeStructureData无效，跳过累计收入更新')
    return
  }

  // 更新设备板块累计收入
  if (Array.isArray(mainBusinessIncomeStructureData.value.equipment)) {
    mainBusinessIncomeStructureData.value.equipment.forEach(item => {
      item.accumulatedIncome = calculateAccumulatedIncomeForMainBusiness('equipment', item.customer)
    })
  }

  // 更新元件板块累计收入
  if (Array.isArray(mainBusinessIncomeStructureData.value.components)) {
    mainBusinessIncomeStructureData.value.components.forEach(item => {
      item.accumulatedIncome = calculateAccumulatedIncomeForMainBusiness('components', item.customer)
    })
  }

  // 更新工程板块累计收入
  if (Array.isArray(mainBusinessIncomeStructureData.value.engineering)) {
    mainBusinessIncomeStructureData.value.engineering.forEach(item => {
      item.accumulatedIncome = calculateAccumulatedIncomeForMainBusiness('engineering', item.customer)
    })
  }
}

// 加载主营业务收入分解数据
const loadMainBusinessIncomeStructureData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/main-business-income/${selectedPeriod.value}?company=${selectedCompanyKey.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        const businessData = result.data

        if (businessData.equipment && businessData.components && businessData.engineering) {
          // 合并数据，保持年度计划
          mainBusinessIncomeStructureData.value = {
            equipment: mainBusinessIncomeStructureData.value.equipment.map((item, index) => {
              const apiItem = businessData.equipment[index]
              return {
                ...item,
                currentMonthIncome: apiItem?.currentMonthIncome || 0,
                accumulatedIncome: apiItem?.accumulatedIncome || 0,
                progress: apiItem?.progress || '/'
              }
            }),
            components: mainBusinessIncomeStructureData.value.components.map((item, index) => {
              const apiItem = businessData.components[index]
              return {
                ...item,
                currentMonthIncome: apiItem?.currentMonthIncome || 0,
                accumulatedIncome: apiItem?.accumulatedIncome || 0,
                progress: apiItem?.progress || '/'
              }
            }),
            engineering: mainBusinessIncomeStructureData.value.engineering.map((item, index) => {
              const apiItem = businessData.engineering[index]
              return {
                ...item,
                currentMonthIncome: apiItem?.currentMonthIncome || 0,
                accumulatedIncome: apiItem?.accumulatedIncome || 0,
                progress: apiItem?.progress || '/'
              }
            })
          }
        }
      }
    }

    // 加载所有月份数据并更新累计收入
    await loadAllMonthsBusinessIncomeData(selectedPeriod.value)
    updateAccumulatedIncomeForMainBusiness()
  } catch (error) {
    console.error('加载主营业务收入分解数据失败:', error)
    // 即使出错也要尝试加载历史数据
    try {
      await loadAllMonthsBusinessIncomeData(selectedPeriod.value)
      updateAccumulatedIncomeForMainBusiness()
    } catch (historyError) {
      console.error('加载历史数据失败:', historyError)
    }
  }
}

// 加载非主营业务数据
const loadNonMainBusinessStructureData = async () => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/non-main-business/${selectedPeriod.value}?company=${selectedCompanyKey.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && Array.isArray(result.data)) {
        const loadedData = result.data

        nonMainBusinessStructureData.value = nonMainBusinessStructureData.value.map(templateItem => {
          const loadedItem = loadedData.find((item) => item.id === templateItem.id)

          if (loadedItem) {
            return {
              ...templateItem,
              yearlyPlan: loadedItem.yearlyPlan || templateItem.yearlyPlan,
              currentPeriod: loadedItem.currentPeriod || 0,
              cumulative: loadedItem.cumulative || 0
            }
          }
          return templateItem
        })
      }
    }
  } catch (error) {
    console.error('加载非主营业务数据失败:', error)
  }
}

// 加载新签订单数据获取当年新签订单累计
const loadNewOrdersCumulativeDataForOrderToIncome = async (currentPeriod) => {
  try {
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))
    console.log(`加载新签订单累计数据，年份: ${currentYear}, 公司: ${selectedCompanyKey.value}`)

    // 客户名称映射（从newOrder.vue到OrderToIncome.vue）
    const customerMapping = {
      '上海项目': '上海',
      '国网项目': '国网',
      '江苏项目': '江苏',
      '输配电内配': '输配电内配',
      '西门子项目': '西门子',
      '同业项目': '同业',
      '用户项目': '用户',
      '其它项目': '其它',
      '一包项目': '一包',
      '二包项目': '二包',
      '域内合作项目': '域内合作',
      '域外合作项目': '域外合作'
    }

    // 从年初到当前月份累计获取新签订单数据
    for (let month = 1; month <= currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/new-orders/${monthPeriod}?company=${selectedCompanyKey.value}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const newOrderData = result.data

            // 更新设备类别的新签订单累计
            if (newOrderData.equipment) {
              newOrderData.equipment.forEach((item) => {
                const mappedCustomer = customerMapping[item.customer]
                if (mappedCustomer) {
                  const orderItem = orderToIncomeData.value.equipment.find(o => o.customer === mappedCustomer)
                  if (orderItem) {
                    orderItem.signedOrder = item.cumulativeTotal || 0
                  }
                }
              })
            }

            // 更新元件类别的新签订单累计
            if (newOrderData.components) {
              newOrderData.components.forEach((item) => {
                const mappedCustomer = customerMapping[item.customer]
                if (mappedCustomer) {
                  const orderItem = orderToIncomeData.value.components.find(o => o.customer === mappedCustomer)
                  if (orderItem) {
                    orderItem.signedOrder = item.cumulativeTotal || 0
                  }
                }
              })
            }

            // 更新工程类别的新签订单累计
            if (newOrderData.engineering) {
              newOrderData.engineering.forEach((item) => {
                const mappedCustomer = customerMapping[item.customer]
                if (mappedCustomer) {
                  const orderItem = orderToIncomeData.value.engineering.find(o => o.customer === mappedCustomer)
                  if (orderItem) {
                    orderItem.signedOrder = item.cumulativeTotal || 0
                  }
                }
              })
            }
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    console.log('已更新新签订单累计数据:', orderToIncomeData.value)
  } catch (error) {
    console.error('加载新签订单累计数据失败:', error)
  }
}

// 加载订单转收入所有月份数据（从年初到当前月份）
const loadAllMonthsOrderToIncomeData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))
    console.log(`加载订单转收入所有月份数据，年份: ${currentYear}, 公司: ${selectedCompanyKey.value}`)

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/order-to-income/${monthPeriod}?company=${selectedCompanyKey.value}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsOrderToIncomeData.value = allData
    console.log('加载的订单转收入所有月份数据:', allData)
  } catch (error) {
    console.error('加载订单转收入所有月份数据失败:', error)
  }
}

// 计算订单转收入累计转收入
const calculateOrderToIncomeTotal = (category, customer) => {
  let total = 0

  // 累加历史月份数据
  for (const monthData of allMonthsOrderToIncomeData.value) {
    const categoryData = monthData.data[category]
    if (categoryData) {
      const item = categoryData.find(d => d.customer === customer)
      if (item && item.currentIncome) {
        total += item.currentIncome
      }
    }
  }

  // 加上当前月份的输入值
  const currentCategoryData = orderToIncomeData.value[category]
  const currentItem = currentCategoryData.find(d => d.customer === customer)
  if (currentItem && currentItem.currentIncome) {
    total += currentItem.currentIncome
  }

  return total
}

// 更新订单转收入累计转收入数据
const updateOrderToIncomeTotal = () => {
  // 更新设备板块累计转收入
  orderToIncomeData.value.equipment.forEach(item => {
    item.incomeTotal = calculateOrderToIncomeTotal('equipment', item.customer)
  })

  // 更新元件板块累计转收入
  orderToIncomeData.value.components.forEach(item => {
    item.incomeTotal = calculateOrderToIncomeTotal('components', item.customer)
  })

  // 更新工程板块累计转收入
  orderToIncomeData.value.engineering.forEach(item => {
    item.incomeTotal = calculateOrderToIncomeTotal('engineering', item.customer)
  })
}

// 自动计算订单转收入比率
const calculateOrderToIncomeRate = (item) => {
  // 先更新累计转收入
  updateOrderToIncomeTotal()

  if (item.signedOrder > 0) {
    item.incomeRate = parseFloat(((item.incomeTotal / item.signedOrder) * 100).toFixed(2))
  } else {
    item.incomeRate = 0
  }
}

// 加载订单转收入数据
const loadOrderToIncomeData = async () => {
  try {
    console.log(`正在加载订单转收入数据，期间: ${selectedPeriod.value}，公司: ${selectedCompanyKey.value}`)

    const response = await fetch(`http://47.111.95.19:3000/order-to-income/${selectedPeriod.value}?company=${selectedCompanyKey.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        const businessData = result.data

        // 合并数据，保持默认结构
        if (businessData.equipment) {
          orderToIncomeData.value.equipment.forEach((item, index) => {
            if (businessData.equipment[index]) {
              Object.assign(item, businessData.equipment[index])
            }
          })
        }

        if (businessData.components) {
          orderToIncomeData.value.components.forEach((item, index) => {
            if (businessData.components[index]) {
              Object.assign(item, businessData.components[index])
            }
          })
        }

        if (businessData.engineering) {
          orderToIncomeData.value.engineering.forEach((item, index) => {
            if (businessData.engineering[index]) {
              Object.assign(item, businessData.engineering[index])
            }
          })
        }
      }
    }

    // 加载新签订单累计数据
    await loadNewOrdersCumulativeDataForOrderToIncome(selectedPeriod.value)

    // 加载所有月份数据并更新累计转收入
    await loadAllMonthsOrderToIncomeData(selectedPeriod.value)
    updateOrderToIncomeTotal()
  } catch (error) {
    console.error('加载订单转收入数据失败:', error)
    // 即使出错也要尝试加载历史数据
    try {
      await loadNewOrdersCumulativeDataForOrderToIncome(selectedPeriod.value)
      await loadAllMonthsOrderToIncomeData(selectedPeriod.value)
      updateOrderToIncomeTotal()
    } catch (historyError) {
      console.error('加载订单转收入历史数据失败:', historyError)
    }
  }
}

// 加载存量订单转收入所有月份数据（从年初到当前月份）
const loadAllMonthsStockOrderToIncomeData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/stock-order-to-income/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsStockOrderToIncomeData.value = allData
    console.log('加载的存量订单转收入所有月份数据:', allData)
  } catch (error) {
    console.error('加载存量订单转收入所有月份数据失败:', error)
  }
}

// 计算存量订单转收入累计转收入
const calculateStockOrderIncomeTotal = (category, customer) => {
  let total = 0

  // 累加历史月份数据
  for (const monthData of allMonthsStockOrderToIncomeData.value) {
    const categoryData = monthData.data[category]
    if (categoryData) {
      const item = categoryData.find(d => d.customer === customer)
      if (item && item.currentMonthIncome) {
        total += item.currentMonthIncome
      }
    }
  }

  // 加上当前月份的输入值
  const currentCategoryData = stockOrderToIncomeData.value[category]
  const currentItem = currentCategoryData.find(d => d.customer === customer)
  if (currentItem && currentItem.currentMonthIncome) {
    total += currentItem.currentMonthIncome
  }

  return total
}

// 更新存量订单转收入累计转收入数据
const updateStockOrderIncomeTotal = () => {
  // 更新设备板块累计转收入
  stockOrderToIncomeData.value.equipment.forEach(item => {
    item.incomeTotal = calculateStockOrderIncomeTotal('equipment', item.customer)
  })

  // 更新元件板块累计转收入
  stockOrderToIncomeData.value.components.forEach(item => {
    item.incomeTotal = calculateStockOrderIncomeTotal('components', item.customer)
  })

  // 更新工程板块累计转收入
  stockOrderToIncomeData.value.engineering.forEach(item => {
    item.incomeTotal = calculateStockOrderIncomeTotal('engineering', item.customer)
  })
}

// 自动计算存量订单转收入比率
const calculateStockOrderIncomeRate = (item) => {
  // 先更新累计转收入
  updateStockOrderIncomeTotal()

  if (item.stockOrder > 0) {
    item.incomeRate = parseFloat(((item.incomeTotal / item.stockOrder) * 100).toFixed(2))
  } else {
    item.incomeRate = 0
  }
}

// 加载存量订单转收入数据
const loadStockOrderToIncomeData = async () => {
  try {
    console.log(`正在加载存量订单转收入数据，期间: ${selectedPeriod.value}`)

    const response = await fetch(`http://47.111.95.19:3000/stock-order-to-income/${selectedPeriod.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        // 直接使用API返回的数据
        stockOrderToIncomeData.value = result.data
        console.log('存量订单转收入API数据:', stockOrderToIncomeData.value)
      }
    } else if (response.status === 404) {
      console.log('该期间暂无存量订单转收入数据，保持年度计划但清空当月转收入')
      // 保持现有的年度计划值，但将当月转收入重置为0
      stockOrderToIncomeData.value.equipment.forEach(item => {
        item.stockOrder = 0
        item.currentMonthIncome = 0
        item.incomeRate = 0
      })
      stockOrderToIncomeData.value.components.forEach(item => {
        item.stockOrder = 0
        item.currentMonthIncome = 0
        item.incomeRate = 0
      })
      stockOrderToIncomeData.value.engineering.forEach(item => {
        item.stockOrder = 0
        item.currentMonthIncome = 0
        item.incomeRate = 0
      })
    }

    // 加载所有月份数据并更新累计转收入
    await loadAllMonthsStockOrderToIncomeData(selectedPeriod.value)
    updateStockOrderIncomeTotal()

    // 重新计算所有比率
    stockOrderToIncomeData.value.equipment.forEach(item => calculateStockOrderIncomeRate(item))
    stockOrderToIncomeData.value.components.forEach(item => calculateStockOrderIncomeRate(item))
    stockOrderToIncomeData.value.engineering.forEach(item => calculateStockOrderIncomeRate(item))
  } catch (error) {
    console.error('加载存量订单转收入数据失败:', error)
    // 即使出错也要尝试加载历史数据
    try {
      await loadAllMonthsStockOrderToIncomeData(selectedPeriod.value)
      updateStockOrderIncomeTotal()
    } catch (historyError) {
      console.error('加载存量订单转收入历史数据失败:', historyError)
    }
  }
}

// 数据合并函数 - 中标未履约情况
const mergeBidFulfillmentData = (initialData, loadedData) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return initialData
  }

  // 合并设备数据
  if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
    initialData.equipment = initialData.equipment.map((templateItem) => {
      const loadedItem = loadedData.equipment.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 期初余额始终使用静态数据，不从后端获取
          initialAmount: templateItem.initialAmount,
          currentAmount: Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  // 合并元件数据
  if (loadedData.component && Array.isArray(loadedData.component)) {
    initialData.component = initialData.component.map((templateItem) => {
      const loadedItem = loadedData.component.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 期初余额始终使用静态数据，不从后端获取
          initialAmount: templateItem.initialAmount,
          currentAmount: Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  // 合并工程数据
  if (loadedData.project && Array.isArray(loadedData.project)) {
    initialData.project = initialData.project.map((templateItem) => {
      const loadedItem = loadedData.project.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 期初余额始终使用静态数据，不从后端获取
          initialAmount: templateItem.initialAmount,
          currentAmount: Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  return initialData
}

// 获取中标未履约情况初始数据模板
const getBidFulfillmentInitialData = () => {
  return {
    equipment: [
      { customerType: '上海', initialAmount: staticInitialAmounts.equipment['上海'], currentAmount: 0 },
      { customerType: '国网', initialAmount: staticInitialAmounts.equipment['国网'], currentAmount: 0 },
      { customerType: '江苏', initialAmount: staticInitialAmounts.equipment['江苏'], currentAmount: 0 },
      { customerType: '输配电内配', initialAmount: staticInitialAmounts.equipment['输配电内配'], currentAmount: 0 },
      { customerType: '西门子', initialAmount: staticInitialAmounts.equipment['西门子'], currentAmount: 0 },
      { customerType: '同业', initialAmount: staticInitialAmounts.equipment['同业'], currentAmount: 0 },
      { customerType: '用户', initialAmount: staticInitialAmounts.equipment['用户'], currentAmount: 0 },
      { customerType: '其它', initialAmount: staticInitialAmounts.equipment['其它'], currentAmount: 0 }
    ],
    component: [
      { customerType: '用户', initialAmount: staticInitialAmounts.component['用户'], currentAmount: 0 }
    ],
    project: [
      { customerType: '一包', initialAmount: staticInitialAmounts.project['一包'], currentAmount: 0 },
      { customerType: '二包', initialAmount: staticInitialAmounts.project['二包'], currentAmount: 0 },
      { customerType: '域内合作', initialAmount: staticInitialAmounts.project['域内合作'], currentAmount: 0 },
      { customerType: '域外合作', initialAmount: staticInitialAmounts.project['域外合作'], currentAmount: 0 },
      { customerType: '其它', initialAmount: staticInitialAmounts.project['其它'], currentAmount: 0 }
    ]
  }
}

// 加载中标未履约情况数据
const loadBidFulfillmentData = async () => {
  try {
    console.log(`正在加载中标未履约情况数据，期间: ${selectedPeriod.value}`)

    const response = await fetch(`http://47.111.95.19:3000/bid-fulfillment/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，使用预算数据初始化')
        // 404时使用空数据，让预算中间件处理预算数据的加载
        const initialData = getBidFulfillmentInitialData()
        bidFulfillmentData.value = initialData
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('中标未履约情况API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      const initialData = getBidFulfillmentInitialData()
      const mergedData = mergeBidFulfillmentData(initialData, result.data)

      bidFulfillmentData.value = mergedData

      console.log('合并后的中标未履约情况数据:', bidFulfillmentData.value)
    }

  } catch (error) {
    console.error('加载中标未履约情况数据失败:', error)
    // 出错时使用初始数据
    bidFulfillmentData.value = getBidFulfillmentInitialData()
  }
}

// 数据合并函数 - 在产项目
const mergeInventoryInProgressData = (initialData, loadedData) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return initialData
  }

  // 合并设备数据
  if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
    initialData.equipment = initialData.equipment.map((templateItem) => {
      const loadedItem = loadedData.equipment.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
          monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  // 合并元件数据
  if (loadedData.component && Array.isArray(loadedData.component)) {
    initialData.component = initialData.component.map((templateItem) => {
      const loadedItem = loadedData.component.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
          monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  // 合并工程数据
  if (loadedData.project && Array.isArray(loadedData.project)) {
    initialData.project = initialData.project.map((templateItem) => {
      const loadedItem = loadedData.project.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          yearlyBudget: Number(loadedItem.yearlyPlan) || Number(loadedItem.yearlyBudget) || 0,
          monthlyIncome: Number(loadedItem.monthlyIncome) || Number(loadedItem.currentAmount) || 0
        }
      }
      return templateItem
    })
  }

  return initialData
}

// 获取在产项目初始数据模板
const getInventoryInProgressInitialData = () => {
  return {
    equipment: [
      { customerType: '上海', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '国网', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '江苏', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '输配电内配', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '西门子', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '同业', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
    ],
    component: [
      { customerType: '用户', yearlyBudget: 0, monthlyIncome: 0 }
    ],
    project: [
      { customerType: '一包', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '二包', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '域内合作', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '域外合作', yearlyBudget: 0, monthlyIncome: 0 },
      { customerType: '其它', yearlyBudget: 0, monthlyIncome: 0 }
    ]
  }
}

// 加载在产项目数据
const loadInventoryInProgressData = async () => {
  try {
    console.log(`正在加载在产项目数据，期间: ${selectedPeriod.value}`)

    const response = await fetch(`http://47.111.95.19:3000/inventory-in-progress/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，保持年度预算但清空当月收入')
        // 保持现有的年度预算值，但将当月收入重置为0
        const initialData = getInventoryInProgressInitialData()
        inventoryInProgressData.value = initialData
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('在产项目API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      const initialData = getInventoryInProgressInitialData()
      const mergedData = mergeInventoryInProgressData(initialData, result.data)

      inventoryInProgressData.value = mergedData

      console.log('合并后的在产项目数据:', inventoryInProgressData.value)
    }
  } catch (error) {
    console.error('加载在产项目数据失败:', error)
    // 出错时使用初始数据
    inventoryInProgressData.value = getInventoryInProgressInitialData()
  }
}

// 加载合同存量主营业务收入数据
const loadContractMainBusinessIncomeData = async (targetPeriod) => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/main-business-income/${targetPeriod}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        contractMainBusinessIncomeData.value = result.data
        console.log('合同存量主营业务收入数据:', contractMainBusinessIncomeData.value)
      }
    }
  } catch (error) {
    console.error('加载合同存量主营业务收入数据失败:', error)
  }
}

// 加载合同存量所有月份数据（从年初到当前月份）
const loadAllMonthsContractInventoryData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/contract-inventory/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsContractInventoryData.value = allData
    console.log('加载的合同存量所有月份数据:', allData)
  } catch (error) {
    console.error('加载合同存量所有月份数据失败:', error)
  }
}

// 计算合同存量累计库存：年初余量 + 当期新增（每个月）- 当月收入（每月）（含税）
const calculateContractCumulativeAmount = (category, customerType) => {
  // 获取年初余量
  let initialAmount = 0
  if (category === 'equipment' && contractStaticInitialAmounts.equipment[customerType] !== undefined) {
    initialAmount = contractStaticInitialAmounts.equipment[customerType]
  } else if (category === 'component' && contractStaticInitialAmounts.component[customerType] !== undefined) {
    initialAmount = contractStaticInitialAmounts.component[customerType]
  } else if (category === 'project' && contractStaticInitialAmounts.project[customerType] !== undefined) {
    initialAmount = contractStaticInitialAmounts.project[customerType]
  }

  let totalIncrease = 0

  // 累加历史月份数据
  for (const monthData of allMonthsContractInventoryData.value) {
    if (monthData.data[category]) {
      const item = monthData.data[category].find((d) => d.customerType === customerType)
      if (item) {
        totalIncrease += parseFloat(item.currentIncrease?.toString()) || 0
      }
    }
  }

  // 加上当前月份的输入值
  let currentData = []
  if (category === 'equipment') {
    currentData = contractInventoryData.value.equipment
  } else if (category === 'component') {
    currentData = contractInventoryData.value.component
  } else if (category === 'project') {
    currentData = contractInventoryData.value.project
  }

  const currentItem = currentData.find(d => d.customerType === customerType)
  if (currentItem) {
    totalIncrease += parseFloat(currentItem.currentIncrease?.toString()) || 0
  }

  // 获取当月收入（含税）
  const currentMonthIncome = getContractMainBusinessIncome(category, customerType)
  let currentMonthIncomeWithTax = 0

  if (currentMonthIncome > 0) {
    // 根据板块确定税率
    let taxRate = 0
    if (category === 'equipment' || category === 'component') {
      taxRate = 0.13 // 设备和元件板块为13%
    } else if (category === 'project') {
      taxRate = 0.09 // 工程板块为9%
    }

    // 当月收入（含税）= 当月收入 / (1 - 税率)
    currentMonthIncomeWithTax = currentMonthIncome / (1 - taxRate)
  }

  // 累计库存 = 年初余量 + 总新增 - 当月收入（含税）
  return initialAmount + totalIncrease - currentMonthIncomeWithTax
}

// 更新合同存量累计库存数据
const updateContractCumulativeAmounts = () => {
  // 更新设备类别累计库存
  contractInventoryData.value.equipment.forEach(item => {
    const cumulative = calculateContractCumulativeAmount('equipment', item.customerType)
    item.cumulativeAmount = cumulative
  })

  // 更新元件类别累计库存
  contractInventoryData.value.component.forEach(item => {
    const cumulative = calculateContractCumulativeAmount('component', item.customerType)
    item.cumulativeAmount = cumulative
  })

  // 更新工程类别累计库存
  contractInventoryData.value.project.forEach(item => {
    const cumulative = calculateContractCumulativeAmount('project', item.customerType)
    item.cumulativeAmount = cumulative
  })
}

// 数据合并函数 - 合同存量
const mergeContractInventoryData = (initialData, loadedData) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return initialData
  }

  // 合并设备数据
  if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
    initialData.equipment = initialData.equipment.map((templateItem) => {
      const loadedItem = loadedData.equipment.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 年初余量始终使用静态数据
          initialAmount: templateItem.initialAmount,
          currentIncrease: Number(loadedItem.currentIncrease) || 0,
          cumulativeAmount: 0 // 累计库存需要重新计算
        }
      }
      return templateItem
    })
  }

  // 合并元件数据
  if (loadedData.component && Array.isArray(loadedData.component)) {
    initialData.component = initialData.component.map((templateItem) => {
      const loadedItem = loadedData.component.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 年初余量始终使用静态数据
          initialAmount: templateItem.initialAmount,
          currentIncrease: Number(loadedItem.currentIncrease) || 0,
          cumulativeAmount: 0 // 累计库存需要重新计算
        }
      }
      return templateItem
    })
  }

  // 合并工程数据
  if (loadedData.project && Array.isArray(loadedData.project)) {
    initialData.project = initialData.project.map((templateItem) => {
      const loadedItem = loadedData.project.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 年初余量始终使用静态数据
          initialAmount: templateItem.initialAmount,
          currentIncrease: Number(loadedItem.currentIncrease) || 0,
          cumulativeAmount: 0 // 累计库存需要重新计算
        }
      }
      return templateItem
    })
  }

  return initialData
}

// 获取合同存量初始数据模板
const getContractInventoryInitialData = () => {
  return {
    equipment: [
      { customerType: '上海', initialAmount: contractStaticInitialAmounts.equipment['上海'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '国网', initialAmount: contractStaticInitialAmounts.equipment['国网'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '江苏', initialAmount: contractStaticInitialAmounts.equipment['江苏'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '输配电内配', initialAmount: contractStaticInitialAmounts.equipment['输配电内配'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '西门子', initialAmount: contractStaticInitialAmounts.equipment['西门子'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '同业', initialAmount: contractStaticInitialAmounts.equipment['同业'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '用户', initialAmount: contractStaticInitialAmounts.equipment['用户'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '其它', initialAmount: contractStaticInitialAmounts.equipment['其它'], currentIncrease: 0, cumulativeAmount: 0 }
    ],
    component: [
      { customerType: '用户', initialAmount: contractStaticInitialAmounts.component['用户'], currentIncrease: 0, cumulativeAmount: 0 }
    ],
    project: [
      { customerType: '一包', initialAmount: contractStaticInitialAmounts.project['一包'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '二包', initialAmount: contractStaticInitialAmounts.project['二包'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '域内合作', initialAmount: contractStaticInitialAmounts.project['域内合作'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '域外合作', initialAmount: contractStaticInitialAmounts.project['域外合作'], currentIncrease: 0, cumulativeAmount: 0 },
      { customerType: '其它', initialAmount: contractStaticInitialAmounts.project['其它'], currentIncrease: 0, cumulativeAmount: 0 }
    ]
  }
}

// 加载合同存量数据
const loadContractInventoryData = async () => {
  try {
    console.log(`正在加载合同存量数据，期间: ${selectedPeriod.value}`)
    const response = await fetch(`http://47.111.95.19:3000/contract-inventory/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      console.log('未找到数据，重置为初始模板')
      const initialData = getContractInventoryInitialData()
      contractInventoryData.value = initialData

      // 加载历史数据并更新累计库存
      await loadAllMonthsContractInventoryData(selectedPeriod.value)
      updateContractCumulativeAmounts()
      return
    }
    const result = await response.json()
    console.log('合同存量API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      const initialData = getContractInventoryInitialData()
      const mergedData = mergeContractInventoryData(initialData, result.data)

      contractInventoryData.value = mergedData

      console.log('合并后的合同存量数据:', contractInventoryData.value)
    }

    // 加载所有月份数据并更新累计库存
    await loadAllMonthsContractInventoryData(selectedPeriod.value)
    updateContractCumulativeAmounts()

    // 加载主营业务收入数据
    await loadContractMainBusinessIncomeData(selectedPeriod.value)
  } catch (error) {
    console.error('加载合同存量数据失败:', error)
    const initialData = getContractInventoryInitialData()
    contractInventoryData.value = initialData
  }
}

// 加载成本暂估主营业务收入数据
const loadCostEstimationMainBusinessIncomeData = async (currentPeriod) => {
  try {
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 累计收入数据 - 从年初到当前月份
    const cumulativeIncomeData = {
      equipment: {},
      component: {},
      project: {}
    }

    // 从1月到当前月份累计收入
    for (let month = 1; month <= currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/main-business-income/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const data = result.data

            // 累计设备收入
            if (data.equipment) {
              data.equipment.forEach((item) => {
                const customerType = item.customer
                if (!cumulativeIncomeData.equipment[customerType]) {
                  cumulativeIncomeData.equipment[customerType] = 0
                }
                cumulativeIncomeData.equipment[customerType] += Number(item.currentMonthIncome) || 0
              })
            }

            // 累计元件收入
            if (data.components) {
              data.components.forEach((item) => {
                const customerType = item.customer
                if (!cumulativeIncomeData.component[customerType]) {
                  cumulativeIncomeData.component[customerType] = 0
                }
                cumulativeIncomeData.component[customerType] += Number(item.currentMonthIncome) || 0
              })
            }

            // 累计工程收入
            if (data.engineering) {
              data.engineering.forEach((item) => {
                const customerType = item.customer
                if (!cumulativeIncomeData.project[customerType]) {
                  cumulativeIncomeData.project[customerType] = 0
                }
                cumulativeIncomeData.project[customerType] += Number(item.currentMonthIncome) || 0
              })
            }
          }
        }
      } catch (error) {
        console.log(`跳过成本暂估主营业务收入月份 ${monthPeriod}:`, error)
      }
    }

    costEstimationMainBusinessIncomeData.value = cumulativeIncomeData
    console.log('成本暂估主营业务收入累计数据:', cumulativeIncomeData)
  } catch (error) {
    console.error('加载成本暂估主营业务收入数据失败:', error)
  }
}

// 加载成本暂估所有月份数据（从年初到当前月份）
const loadAllMonthsCostEstimationData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/cost-estimation/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过成本暂估月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsCostEstimationData.value = allData
    console.log('加载的成本暂估所有月份数据:', allData)
  } catch (error) {
    console.error('加载成本暂估所有月份数据失败:', error)
  }
}

// 计算成本暂估年初至今的累计新增和累计冲销
const calculateCostEstimationCumulativeAmounts = (category, customerType) => {
  let totalAddition = 0
  let totalWriteOff = 0

  console.log(`🔍 计算成本暂估累计数据: ${category}-${customerType}`)

  // 累加历史月份数据
  for (const monthData of allMonthsCostEstimationData.value) {
    if (monthData.data[category]) {
      const item = monthData.data[category].find((d) => d.customerType === customerType)
      if (item) {
        const additionValue = parseFloat(item.currentPeriod?.toString()) || 0
        const writeOffValue = parseFloat(item.currentWriteOff?.toString()) || 0
        totalAddition += additionValue
        totalWriteOff += writeOffValue
        console.log(`📅 ${monthData.period}: ${customerType} 新增=${additionValue}, 冲销=${writeOffValue}`)
      }
    }
  }

  // 加上当前月份的输入值
  let currentData = []
  if (category === 'equipment') {
    currentData = costEstimationData.value.equipment
  } else if (category === 'component') {
    currentData = costEstimationData.value.component
  } else if (category === 'project') {
    currentData = costEstimationData.value.project
  }

  const currentItem = currentData.find(d => d.customerType === customerType)
  if (currentItem) {
    const currentAddition = parseFloat(currentItem.currentPeriod?.toString()) || 0
    const currentWriteOff = parseFloat(currentItem.currentWriteOff?.toString()) || 0
    totalAddition += currentAddition
    totalWriteOff += currentWriteOff
    console.log(`📝 当前月份: ${customerType} 新增=${currentAddition}, 冲销=${currentWriteOff}`)
  }

  console.log(`✅ ${category}-${customerType} 累计计算完成: 新增=${totalAddition}, 冲销=${totalWriteOff}`)
  return { totalAddition, totalWriteOff }
}

// 更新成本暂估本年累计数据
const updateCostEstimationYearTotals = () => {
  // 更新设备类别
  costEstimationData.value.equipment.forEach(item => {
    const { totalAddition, totalWriteOff } = calculateCostEstimationCumulativeAmounts('equipment', item.customerType)
    calculateCostEstimationYearTotal(item, totalAddition, totalWriteOff)
  })

  // 更新元件类别
  costEstimationData.value.component.forEach(item => {
    const { totalAddition, totalWriteOff } = calculateCostEstimationCumulativeAmounts('component', item.customerType)
    calculateCostEstimationYearTotal(item, totalAddition, totalWriteOff)
  })

  // 更新工程类别
  costEstimationData.value.project.forEach(item => {
    const { totalAddition, totalWriteOff } = calculateCostEstimationCumulativeAmounts('project', item.customerType)
    calculateCostEstimationYearTotal(item, totalAddition, totalWriteOff)
  })
}

// 自动计算成本暂估本年累计 = 年初余额 + 当期新增(累计) - 当期冲销(累计)
const calculateCostEstimationYearTotal = (item, totalAddition, totalWriteOff) => {
  item.yearTotal = (item.initialBalance || 0) + totalAddition - totalWriteOff

  // 自动计算计提率 = 本年累计 / 主营业务收入对应口径累计收入
  if (costEstimationMainBusinessIncomeData.value) {
    const category = getCostEstimationItemCategory(item.customerType)
    const cumulativeIncome = getCostEstimationCumulativeIncomeForCustomer(category, item.customerType)

    if (cumulativeIncome > 0 && item.yearTotal > 0) {
      item.provisionRate = (item.yearTotal / cumulativeIncome) * 100
    } else {
      item.provisionRate = 0
    }
  }
}

// 根据客户类型确定属于哪个类别
const getCostEstimationItemCategory = (customerType) => {
  const equipmentCustomers = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
  const componentCustomers = ['用户']
  const projectCustomers = ['一包', '二包', '域内合作', '域外合作', '其它']

  if (equipmentCustomers.includes(customerType)) return 'equipment'
  if (componentCustomers.includes(customerType)) return 'component'
  if (projectCustomers.includes(customerType)) return 'project'
  return 'equipment' // 默认
}

// 获取对应客户类型的累计收入
const getCostEstimationCumulativeIncomeForCustomer = (category, customerType) => {
  if (!costEstimationMainBusinessIncomeData.value || !costEstimationMainBusinessIncomeData.value[category]) {
    return 0
  }
  return costEstimationMainBusinessIncomeData.value[category][customerType] || 0
}

// 数据合并函数 - 成本暂估
const mergeCostEstimationData = (initialData, loadedData) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return initialData
  }

  // 合并设备数据
  if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
    initialData.equipment = initialData.equipment.map((templateItem) => {
      const loadedItem = loadedData.equipment.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 优先使用API返回的预算数据（initialBalance包含预算数据）
          initialBalance: Number(loadedItem.initialBalance) || 0,
          currentPeriod: Number(loadedItem.currentPeriod) || 0,
          currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
          yearTotal: 0, // 本年累计需要重新计算
          provisionRate: Number(loadedItem.provisionRate) || 0
        }
      }
      return templateItem
    })
  }

  // 合并元件数据
  if (loadedData.component && Array.isArray(loadedData.component)) {
    initialData.component = initialData.component.map((templateItem) => {
      const loadedItem = loadedData.component.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 优先使用API返回的预算数据（initialBalance包含预算数据）
          initialBalance: Number(loadedItem.initialBalance) || 0,
          currentPeriod: Number(loadedItem.currentPeriod) || 0,
          currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
          yearTotal: 0, // 本年累计需要重新计算
          provisionRate: Number(loadedItem.provisionRate) || 0
        }
      }
      return templateItem
    })
  }

  // 合并工程数据
  if (loadedData.project && Array.isArray(loadedData.project)) {
    initialData.project = initialData.project.map((templateItem) => {
      const loadedItem = loadedData.project.find((item) => item.customerType === templateItem.customerType)
      if (loadedItem) {
        return {
          ...templateItem,
          // 优先使用API返回的预算数据（initialBalance包含预算数据）
          initialBalance: Number(loadedItem.initialBalance) || 0,
          currentPeriod: Number(loadedItem.currentPeriod) || 0,
          currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
          yearTotal: 0, // 本年累计需要重新计算
          provisionRate: Number(loadedItem.provisionRate) || 0
        }
      }
      return templateItem
    })
  }

  return initialData
}

// 获取成本暂估初始数据模板
const getCostEstimationInitialData = () => {
  return {
    equipment: [
      { customerType: '上海', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '国网', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '江苏', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '输配电内配', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '西门子', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '同业', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
    ],
    component: [
      { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
    ],
    project: [
      { customerType: '一包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '二包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '域内合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '域外合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
      { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
    ]
  }
}

// 加载成本暂估数据
const loadCostEstimationData = async () => {
  try {
    console.log(`正在加载成本暂估数据，期间: ${selectedPeriod.value}`)
    const response = await fetch(`http://47.111.95.19:3000/cost-estimation/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      console.log('未找到数据，重置为初始模板')
      const initialData = getCostEstimationInitialData()
      costEstimationData.value = initialData

      // 加载历史数据并更新本年累计
      await loadAllMonthsCostEstimationData(selectedPeriod.value)
      await loadCostEstimationMainBusinessIncomeData(selectedPeriod.value)
      updateCostEstimationYearTotals()
      return
    }
    const result = await response.json()
    console.log('成本暂估API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      const initialData = getCostEstimationInitialData()
      const mergedData = mergeCostEstimationData(initialData, result.data)

      costEstimationData.value = mergedData

      console.log('合并后的成本暂估数据:', costEstimationData.value)
    }

    // 加载所有月份数据并更新本年累计
    await loadAllMonthsCostEstimationData(selectedPeriod.value)
    await loadCostEstimationMainBusinessIncomeData(selectedPeriod.value)
    updateCostEstimationYearTotals()
  } catch (error) {
    console.error('加载成本暂估数据失败:', error)
    const initialData = getCostEstimationInitialData()
    costEstimationData.value = initialData
  }
}

// 加载部门成本中心所有月份数据（从年初到当前月份）
const loadAllMonthsDepartmentCostCenterData = async (currentPeriod) => {
  try {
    const allData = []
    const currentYear = currentPeriod.substring(0, 4)
    const currentMonth = parseInt(currentPeriod.substring(5, 7))

    // 从1月到当前月份（不包括当前月份）
    for (let month = 1; month < currentMonth; month++) {
      const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/department-cost-center/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过部门成本中心月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsDepartmentCostCenterData.value = allData
    console.log('加载的部门成本中心所有月份数据:', allData)
  } catch (error) {
    console.error('加载部门成本中心所有月份数据失败:', error)
  }
}

// 计算部门成本中心累计值
const calculateDepartmentCostCenterCurrentTotal = (department) => {
  let total = 0

  if (department === '合计') {
    // 合计行：计算所有部门的累计总和
    // 累加历史月份数据
    for (const monthData of allMonthsDepartmentCostCenterData.value) {
      if (monthData.data.departments) {
        for (const deptItem of monthData.data.departments) {
          if (deptItem.currentPeriod) {
            total += parseFloat(deptItem.currentPeriod) || 0
          }
        }
      }
    }

    // 加上当前月份的输入值
    for (const currentDeptItem of departmentCostCenterData.value) {
      if (currentDeptItem.currentPeriod) {
        total += parseFloat(currentDeptItem.currentPeriod) || 0
      }
    }
  } else {
    // 单个部门：计算该部门的累计值
    // 累加历史月份数据
    for (const monthData of allMonthsDepartmentCostCenterData.value) {
      const deptItem = monthData.data.departments.find(d => d.department === department)
      if (deptItem && deptItem.currentPeriod) {
        total += parseFloat(deptItem.currentPeriod) || 0
      }
    }

    // 加上当前月份的输入值
    const currentDeptItem = departmentCostCenterData.value.find(d => d.department === department)
    if (currentDeptItem && currentDeptItem.currentPeriod) {
      total += parseFloat(currentDeptItem.currentPeriod) || 0
    }
  }

  return total.toString()
}

// 计算部门成本中心执行进度
const calculateDepartmentCostCenterExecutionProgress = (currentTotal, yearlyBudget) => {
  const current = parseFloat(currentTotal) || 0
  const budget = parseFloat(yearlyBudget) || 0
  if (budget === 0) return '0%'
  return ((current / budget) * 100).toFixed(2) + '%'
}

// 更新部门成本中心累计数据和其他计算字段
const updateDepartmentCostCenterCurrentTotal = () => {
  // 更新各部门累计和计算字段
  departmentCostCenterData.value.forEach(item => {
    item.currentTotal = calculateDepartmentCostCenterCurrentTotal(item.department)
    item.executionProgress = calculateDepartmentCostCenterExecutionProgress(item.currentTotal, item.yearlyBudget)
    // 预算占产值比和实际占产值比需要产值数据，暂时设为空
    item.budgetToOutputRatio = '0%'
    item.actualToOutputRatio = '0%'
  })

  // 更新合计行累计和计算字段
  departmentCostCenterTotalRow.value.currentTotal = calculateDepartmentCostCenterCurrentTotal('合计')

  // 计算合计行年度预算（所有部门年度预算之和）
  const totalYearlyBudget = departmentCostCenterData.value.reduce((sum, item) => {
    return sum + (parseFloat(item.yearlyBudget) || 0)
  }, 0)
  departmentCostCenterTotalRow.value.yearlyBudget = totalYearlyBudget.toString()

  departmentCostCenterTotalRow.value.executionProgress = calculateDepartmentCostCenterExecutionProgress(departmentCostCenterTotalRow.value.currentTotal, departmentCostCenterTotalRow.value.yearlyBudget)
  departmentCostCenterTotalRow.value.budgetToOutputRatio = '0%'
  departmentCostCenterTotalRow.value.actualToOutputRatio = '0%'
}

// 合并部门成本中心数据：将从数据库加载的数据与初始模板合并
const mergeDepartmentCostCenterData = (templateData, loadedData) => {
  if (!Array.isArray(loadedData) || loadedData.length === 0) {
    return templateData
  }

  return templateData.map(templateItem => {
    const loadedItem = loadedData.find((item) => item.department === templateItem.department)
    if (loadedItem) {
      return {
        department: templateItem.department,
        yearlyBudget: loadedItem.yearlyBudget || '0',
        currentPeriod: loadedItem.currentPeriod || '0',
        currentTotal: loadedItem.currentTotal || '0',
        executionProgress: loadedItem.executionProgress || '0%',
        budgetToOutputRatio: loadedItem.budgetToOutputRatio || '0%',
        actualToOutputRatio: loadedItem.actualToOutputRatio || '0%'
      }
    }
    // 没有加载数据时，返回模板数据（保持年度预算为0，其他字段也为0）
    return {
      department: templateItem.department,
      yearlyBudget: '0',
      currentPeriod: '0',
      currentTotal: '0',
      executionProgress: '0%',
      budgetToOutputRatio: '0%',
      actualToOutputRatio: '0%'
    }
  })
}

// 加载部门成本中心数据
const loadDepartmentCostCenterData = async () => {
  try {
    console.log(`正在加载部门成本中心数据，期间: ${selectedPeriod.value}`)

    const response = await fetch(`http://47.111.95.19:3000/department-cost-center/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，重置为初始模板')
        // 重置为初始模板数据
        departmentCostCenterData.value = getInitialDepartmentCostCenterData()
        departmentCostCenterTotalRow.value = getInitialDepartmentCostCenterTotalRow()

        // 加载历史数据并更新累计
        await loadAllMonthsDepartmentCostCenterData(selectedPeriod.value)
        updateDepartmentCostCenterCurrentTotal()
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('部门成本中心API返回数据:', result)

    if (result.success && result.data) {
      console.log('成功获取数据，开始合并...')
      if (result.data.departments) {
        departmentCostCenterData.value = mergeDepartmentCostCenterData(getInitialDepartmentCostCenterData(), result.data.departments)
      }
      if (result.data.total) {
        departmentCostCenterTotalRow.value = { ...getInitialDepartmentCostCenterTotalRow(), ...result.data.total }
      }
      console.log('合并后的部门成本中心数据:', { departmentData: departmentCostCenterData.value, totalRow: departmentCostCenterTotalRow.value })
    }

    // 加载所有月份数据并更新累计
    await loadAllMonthsDepartmentCostCenterData(selectedPeriod.value)
    updateDepartmentCostCenterCurrentTotal()
  } catch (error) {
    console.error('加载部门成本中心数据失败:', error)

    // 即使出错也要尝试加载历史数据
    try {
      await loadAllMonthsDepartmentCostCenterData(selectedPeriod.value)
      updateDepartmentCostCenterCurrentTotal()
    } catch (historyError) {
      console.error('加载部门成本中心历史数据失败:', historyError)
    }
  }
}

// 加载部门成本中心计入损益所有月份数据
const loadAllMonthsDepartmentCostInputData = async (currentPeriod) => {
  try {
    const [year, month] = currentPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/department-cost-input/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过部门成本计入损益月份 ${monthPeriod}:`, error)
      }
    }

    allMonthsDepartmentCostInputData.value = allData
    console.log('加载的部门成本计入损益所有月份数据:', allData)
  } catch (error) {
    console.error('加载部门成本计入损益所有月份数据失败:', error)
  }
}

// 计算部门成本计入损益累计收入（包含当前月份的输入值）
const calculateDepartmentCostInputAccumulated = (department, fieldName = 'currentMonthIncome') => {
  let total = 0
  const currentPeriod = selectedPeriod.value

  // 累加历史月份数据
  for (const monthData of allMonthsDepartmentCostInputData.value) {
    // 跳过当前月份，因为要用当前输入的值
    if (monthData.period === currentPeriod) continue

    const deptData = monthData.data.departments?.find((d) => d.department === department)
    if (deptData && deptData[fieldName]) {
      const value = parseFloat(deptData[fieldName].toString().replace(/,/g, '')) || 0
      total += value
    }
  }

  // 加上当前月份的输入值
  const currentDept = departmentCostInputData.value.find(d => d.department === department)
  if (currentDept && currentDept[fieldName]) {
    const currentValue = parseFloat(currentDept[fieldName].toString().replace(/,/g, '')) || 0
    total += currentValue
  }

  return total.toLocaleString()
}

// 计算部门成本计入损益合计行累计收入（包含当前月份的输入值）
const calculateDepartmentCostInputTotalAccumulated = (fieldName = 'currentMonthIncome') => {
  let total = 0
  const currentPeriod = selectedPeriod.value

  // 累加历史月份数据
  for (const monthData of allMonthsDepartmentCostInputData.value) {
    // 跳过当前月份，因为要用当前输入的值
    if (monthData.period === currentPeriod) continue

    if (monthData.data.total && monthData.data.total[fieldName]) {
      const value = parseFloat(monthData.data.total[fieldName].toString().replace(/,/g, '')) || 0
      total += value
    }
  }

  // 加上当前月份的输入值
  if (departmentCostInputTotalRow.value[fieldName]) {
    const currentValue = parseFloat(departmentCostInputTotalRow.value[fieldName].toString().replace(/,/g, '')) || 0
    total += currentValue
  }

  return total.toLocaleString()
}

// 计算部门成本计入损益执行进度（累计收入 / 年度预算 * 100%）
const calculateDepartmentCostInputExecutionProgress = (accumulatedIncome, yearlyBudget) => {
  const accumulated = parseFloat(accumulatedIncome.replace(/,/g, '')) || 0
  const budget = parseFloat(yearlyBudget.replace(/,/g, '')) || 0
  if (budget === 0) return '0%'
  return ((accumulated / budget) * 100).toFixed(1) + '%'
}

// 更新部门成本计入损益所有计算字段
const updateDepartmentCostInputCalculatedFields = () => {
  // 更新各部门计算字段
  departmentCostInputData.value.forEach(item => {
    item.accumulatedIncome = calculateDepartmentCostInputAccumulated(item.department)
    item.executionProgress = calculateDepartmentCostInputExecutionProgress(item.accumulatedIncome, item.yearlyBudget)
    // 预算占产值比和实际占产值比需要产值数据，暂时设为空
    item.budgetToOutputRatio = ''
    item.actualToOutputRatio = ''
  })

  // 更新合计行计算字段
  departmentCostInputTotalRow.value.accumulatedIncome = calculateDepartmentCostInputTotalAccumulated()
  departmentCostInputTotalRow.value.executionProgress = calculateDepartmentCostInputExecutionProgress(departmentCostInputTotalRow.value.accumulatedIncome, departmentCostInputTotalRow.value.yearlyBudget)
  departmentCostInputTotalRow.value.budgetToOutputRatio = ''
  departmentCostInputTotalRow.value.actualToOutputRatio = ''
}

// 数据合并函数 - 部门成本计入损益
const mergeDepartmentCostInputData = (initialData, loadedData) => {
  if (!loadedData) return initialData

  console.log('部门成本计入损益数据合并开始:', { initialData, loadedData })

  const mergedDepartments = initialData.departments.map((dept) => {
    const loaded = loadedData.departments?.find((d) => d.department === dept.department)
    if (loaded) {
      console.log(`合并部门数据: ${dept.department}`, loaded)
      // 优先使用API返回的预算数据
      return {
        ...dept,
        ...loaded,
        // 确保yearlyBudget使用API返回的预算数据
        yearlyBudget: loaded.yearlyBudget || dept.yearlyBudget
      }
    }
    return dept
  })

  const mergedTotal = loadedData.total ? {
    ...initialData.total,
    ...loadedData.total,
    // 确保合计行的yearlyBudget使用API返回的预算数据
    yearlyBudget: loadedData.total.yearlyBudget || initialData.total.yearlyBudget
  } : initialData.total

  console.log('部门成本计入损益数据合并完成:', { departments: mergedDepartments, total: mergedTotal })

  return {
    departments: mergedDepartments,
    total: mergedTotal
  }
}

// 加载部门成本中心计入损益数据
const loadDepartmentCostInputData = async () => {
  console.log(`正在加载部门成本中心计入损益数据，期间: ${selectedPeriod.value}`)
  try {
    const response = await fetch(`http://47.111.95.19:3000/department-cost-input/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error('加载数据失败')
      }
      console.log('未找到数据，使用空白模板')
      // 即使没有当前期间数据，也要加载所有月份数据计算所有字段
      await loadAllMonthsDepartmentCostInputData(selectedPeriod.value)
      updateDepartmentCostInputCalculatedFields()
      return
    }
    const result = await response.json()
    console.log('加载到的部门成本计入损益数据:', result)

    if (result.data) {
      // 使用数据合并逻辑
      const mergedData = mergeDepartmentCostInputData(getInitialDepartmentCostInputData(), result.data)
      departmentCostInputData.value = mergedData.departments
      departmentCostInputTotalRow.value = mergedData.total
      console.log('部门成本计入损益数据合并完成:', { departments: departmentCostInputData.value, total: departmentCostInputTotalRow.value })
    }

    // 加载所有月份数据并计算所有字段
    await loadAllMonthsDepartmentCostInputData(selectedPeriod.value)
    updateDepartmentCostInputCalculatedFields()
  } catch (error) {
    console.error('加载部门成本计入损益数据失败:', error)
  }
}

// 转换存货数据格式 - 从原始格式转换为表格格式
const convertInventoryDataFormat = (rawData) => {
  if (!rawData) return null

  const equipment = [
    { customerType: '上海', initial: rawData.equipment?.shanghai?.initial || '缺少数据', current: rawData.equipment?.shanghai?.current || '缺少数据', fluctuation: rawData.equipment?.shanghai?.fluctuation || '' },
    { customerType: '国网', initial: rawData.equipment?.national?.initial || '缺少数据', current: rawData.equipment?.national?.current || '缺少数据', fluctuation: rawData.equipment?.national?.fluctuation || '' },
    { customerType: '江苏', initial: rawData.equipment?.jiangsu?.initial || '缺少数据', current: rawData.equipment?.jiangsu?.current || '缺少数据', fluctuation: rawData.equipment?.jiangsu?.fluctuation || '' },
    { customerType: '输配电内配', initial: rawData.equipment?.power?.initial || '缺少数据', current: rawData.equipment?.power?.current || '缺少数据', fluctuation: rawData.equipment?.power?.fluctuation || '' },
    { customerType: '西门子', initial: rawData.equipment?.siemens?.initial || '缺少数据', current: rawData.equipment?.siemens?.current || '缺少数据', fluctuation: rawData.equipment?.siemens?.fluctuation || '' },
    { customerType: '同业', initial: rawData.equipment?.peers?.initial || '缺少数据', current: rawData.equipment?.peers?.current || '缺少数据', fluctuation: rawData.equipment?.peers?.fluctuation || '' },
    { customerType: '用户', initial: rawData.equipment?.users?.initial || '缺少数据', current: rawData.equipment?.users?.current || '缺少数据', fluctuation: rawData.equipment?.users?.fluctuation || '' },
    { customerType: '其它', initial: rawData.equipment?.others?.initial || '缺少数据', current: rawData.equipment?.others?.current || '缺少数据', fluctuation: rawData.equipment?.others?.fluctuation || '' }
  ]

  const component = [
    { customerType: '用户', initial: rawData.components?.users?.initial || '缺少数据', current: rawData.components?.users?.current || '缺少数据', fluctuation: rawData.components?.users?.fluctuation || '' }
  ]

  const project = [
    { customerType: '一包', initial: rawData.engineering?.package1?.initial || '缺少数据', current: rawData.engineering?.package1?.current || '缺少数据', fluctuation: rawData.engineering?.package1?.fluctuation || '' },
    { customerType: '二包', initial: rawData.engineering?.package2?.initial || '缺少数据', current: rawData.engineering?.package2?.current || '缺少数据', fluctuation: rawData.engineering?.package2?.fluctuation || '' },
    { customerType: '域内合作', initial: rawData.engineering?.domestic?.initial || '缺少数据', current: rawData.engineering?.domestic?.current || '缺少数据', fluctuation: rawData.engineering?.domestic?.fluctuation || '' },
    { customerType: '域外合作', initial: rawData.engineering?.international?.initial || '缺少数据', current: rawData.engineering?.international?.current || '缺少数据', fluctuation: rawData.engineering?.international?.fluctuation || '' },
    { customerType: '其它', initial: rawData.engineering?.others?.initial || '缺少数据', current: rawData.engineering?.others?.current || '缺少数据', fluctuation: rawData.engineering?.others?.fluctuation || '' }
  ]

  const total = {
    initial: rawData.total?.initial || '',
    current: rawData.total?.current || '',
    fluctuation: rawData.total?.fluctuation || ''
  }

  return { equipment, component, project, total }
}

// 加载存货数据
const loadInventoryData = async () => {
  try {
    console.log(`正在加载存货数据，期间: ${selectedPeriod.value}`)
    const response = await fetch(`http://47.111.95.19:3000/inventory-data/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无存货数据，使用默认数据')
        // 重置为默认数据
        inventoryDataEquipment.value = [
          { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryDataComponent.value = [
          { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryDataProject.value = [
          { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryDataTotal.value = { initial: '', current: '', fluctuation: '' }
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('存货数据API返回数据:', result)

    if (result.data) {
      const convertedData = convertInventoryDataFormat(result.data)
      if (convertedData) {
        inventoryDataEquipment.value = convertedData.equipment
        inventoryDataComponent.value = convertedData.component
        inventoryDataProject.value = convertedData.project
        inventoryDataTotal.value = convertedData.total
        console.log('存货数据加载完成:', { equipment: inventoryDataEquipment.value, component: inventoryDataComponent.value, project: inventoryDataProject.value, total: inventoryDataTotal.value })
      }
    }
  } catch (error) {
    console.error('加载存货数据失败:', error)
    // 出错时使用默认数据
    inventoryDataEquipment.value = [
      { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryDataComponent.value = [
      { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryDataProject.value = [
      { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryDataTotal.value = { initial: '', current: '', fluctuation: '' }
  }
}

// 加载库存情况数据
const loadInventoryStockData = async () => {
  try {
    console.log(`正在加载库存情况数据，期间: ${selectedPeriod.value}`)
    const response = await fetch(`http://47.111.95.19:3000/inventory-stock/${selectedPeriod.value}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无库存情况数据，使用默认数据')
        // 重置为默认数据
        inventoryStockEquipment.value = [
          { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryStockComponent.value = [
          { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryStockProject.value = [
          { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
          { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
        ]
        inventoryStockTotal.value = { initial: '', current: '', fluctuation: '' }
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('库存情况API返回数据:', result)

    if (result.data) {
      const convertedData = convertInventoryDataFormat(result.data)
      if (convertedData) {
        inventoryStockEquipment.value = convertedData.equipment
        inventoryStockComponent.value = convertedData.component
        inventoryStockProject.value = convertedData.project
        inventoryStockTotal.value = convertedData.total
        console.log('库存情况数据加载完成:', { equipment: inventoryStockEquipment.value, component: inventoryStockComponent.value, project: inventoryStockProject.value, total: inventoryStockTotal.value })
      }
    }
  } catch (error) {
    console.error('加载库存情况数据失败:', error)
    // 出错时使用默认数据
    inventoryStockEquipment.value = [
      { customerType: '上海', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '国网', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '江苏', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '输配电内配', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '西门子', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '同业', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryStockComponent.value = [
      { customerType: '用户', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryStockProject.value = [
      { customerType: '一包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '二包', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '域内合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '域外合作', initial: '缺少数据', current: '缺少数据', fluctuation: '' },
      { customerType: '其它', initial: '缺少数据', current: '缺少数据', fluctuation: '' }
    ]
    inventoryStockTotal.value = { initial: '', current: '', fluctuation: '' }
  }
}

// 获取净利润月度数据
const fetchNetProfitMonthlyData = async (monthPeriod) => {
  try {
    const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/monthly-data/${monthPeriod}`)

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.data
      }
    }

    console.error(`获取${monthPeriod}净利润月度数据失败:`, response.status)
    return null
  } catch (error) {
    console.error(`获取${monthPeriod}净利润月度数据失败:`, error)
    return null
  }
}

// 更新净利润数据项
const updateNetProfitDataItem = (item, apiItem) => {
  if (apiItem) {
    // 不更新年度计划，保持初始模板数据
    item.currentMonthValue = formatNetProfitNumber(apiItem.currentMonthValue || 0)
    item.actual = formatNetProfitNumber(apiItem.cumulativeValue || 0)
    item.contribution = apiItem.contribution || '0.00%'
  }
}

// 加载主营业务净利润数据
const loadNetProfitMainBusinessData = async (targetPeriod) => {
  try {
    console.log(`正在加载主营净利润贡献数据，期间: ${targetPeriod}`)

    const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/${targetPeriod}`)
    let loadedData = []

    if (response.ok) {
      const result = await response.json()
      console.log('净利润API返回数据:', result)

      if (result.success && result.data && Array.isArray(result.data)) {
        loadedData = result.data
        console.log('成功获取数据，开始合并...')
      }
    } else if (response.status === 404) {
      console.log('该期间暂无数据，使用初始模板')
      // 使用初始模板数据
      netProfitEquipmentData.value = getInitialNetProfitEquipmentData()
      netProfitComponentData.value = getInitialNetProfitComponentData()
      netProfitProjectData.value = getInitialNetProfitProjectData()
    } else {
      console.log('加载数据失败，使用预算数据填充')
    }

    // 合并数据：将从数据库加载的数据与初始模板合并
    const mergeNetProfitDataArray = (templateArray, loadedArray, segment) => {
      return templateArray.map(templateItem => {
        const loadedItem = loadedArray.find(item =>
          item.segment === segment && item.customerType === templateItem.customerType
        )

        if (loadedItem) {
          return {
            ...templateItem,
            // 保持模板中的年度计划，不使用数据库中的plan
            currentMonthValue: loadedItem.currentMonthValue || templateItem.currentMonthValue,
            actual: loadedItem.actual || templateItem.actual,
            contribution: loadedItem.contribution || templateItem.contribution
          }
        }
        return templateItem
      })
    }

    // 分别合并三个板块的数据
    netProfitEquipmentData.value = mergeNetProfitDataArray(netProfitEquipmentData.value, loadedData, '设备')
    netProfitComponentData.value = mergeNetProfitDataArray(netProfitComponentData.value, loadedData, '元件')
    netProfitProjectData.value = mergeNetProfitDataArray(netProfitProjectData.value, loadedData, '工程')

    // 计算所有项目的累计值
    await calculateNetProfitAllCumulativeValues()

  } catch (error) {
    console.error('加载主营业务净利润数据失败:', error)
  }
}

// 计算所有净利润项目的累计值
const calculateNetProfitAllCumulativeValues = async () => {
  try {
    console.log('开始获取净利润月度数据，期间:', selectedPeriod.value)

    const monthlyData = await fetchNetProfitMonthlyData(selectedPeriod.value)

    if (!monthlyData) {
      console.error('获取净利润月度数据失败')
      return
    }

    // 更新设备板块数据
    netProfitEquipmentData.value.forEach(item => {
      const apiItem = monthlyData.equipment?.find((d) => d.customer === item.customerType)
      updateNetProfitDataItem(item, apiItem)
    })

    // 更新元件板块数据
    netProfitComponentData.value.forEach(item => {
      const apiItem = monthlyData.components?.find((d) => d.customer === item.customerType)
      updateNetProfitDataItem(item, apiItem)
    })

    // 更新工程板块数据
    netProfitProjectData.value.forEach(item => {
      const apiItem = monthlyData.engineering?.find((d) => d.customer === item.customerType)
      updateNetProfitDataItem(item, apiItem)
    })

    console.log('净利润累计值计算完成')
  } catch (error) {
    console.error('计算净利润累计值失败:', error)
  }
}

// 获取净利润所有月份数据用于累计计算
const loadNetProfitAllMonthsData = async (currentPeriod) => {
  try {
    const [year, month] = currentPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`http://47.111.95.19:3000/non-main-business-net-profit/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data && Array.isArray(result.data)) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过净利润月份 ${monthPeriod}:`, error)
      }
    }

    netProfitAllMonthsData.value = allData
    console.log('加载的净利润所有月份数据:', allData)
  } catch (error) {
    console.error('加载净利润所有月份数据失败:', error)
  }
}

// 计算净利润单个项目的累计值
const calculateNetProfitAccumulated = (itemId, itemName) => {
  let total = 0
  const currentPeriod = selectedPeriod.value

  // 累加历史月份数据
  for (const monthData of netProfitAllMonthsData.value) {
    if (monthData.period === currentPeriod) continue

    const item = monthData.data.find((d) => d.id === itemId || d.name === itemName)
    if (item && item.currentPeriod) {
      const value = parseFloat(item.currentPeriod.toString().replace(/,/g, '')) || 0
      total += value
    }
  }

  // 加上当前月份的输入值
  const currentItem = netProfitNonMainItems.value.find(d => d.id === itemId)
  if (currentItem && currentItem.currentPeriod) {
    const currentValue = parseFloat(currentItem.currentPeriod.toString().replace(/,/g, '')) || 0
    total += currentValue
  }

  return total.toFixed(2)
}

// 更新净利润累计值
const updateNetProfitAccumulated = () => {
  netProfitNonMainItems.value.forEach(item => {
    item.accumulated = calculateNetProfitAccumulated(item.id, item.name)
  })
}

// 加载非主营业务净利润数据
const loadNetProfitNonMainBusinessData = async (targetPeriod) => {
  try {
    console.log(`正在加载非主营业务净利润数据，期间: ${targetPeriod}`)

    const response = await fetch(`http://47.111.95.19:3000/non-main-business-net-profit/${targetPeriod}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无数据，保持年度计划但清空当期值')
        // 保持现有的年度计划值，但将当期值重置为0
        netProfitNonMainItems.value = netProfitNonMainItems.value.map(item => ({
          ...item,
          currentPeriod: '0',
          accumulated: '0',
          progress: '0.00%'
        }))
        // 加载所有月份数据并计算累计值
        await loadNetProfitAllMonthsData(targetPeriod)
        updateNetProfitAccumulated()
        return
      }
      throw new Error('加载数据失败')
    }

    const result = await response.json()
    console.log('非主营业务净利润API返回数据:', result)

    if (result.success && result.data && Array.isArray(result.data)) {
      const loadedData = result.data
      console.log('成功获取数据，开始合并...')

      // 合并数据：将从数据库加载的数据与初始模板合并
      const mergeNetProfitData = (templateArray, loadedArray) => {
        return templateArray.map(templateItem => {
          const loadedItem = loadedArray.find(item => item.id === templateItem.id || item.name === templateItem.name)

          if (loadedItem) {
            return {
              ...templateItem,
              plan: loadedItem.plan || templateItem.plan,
              currentPeriod: loadedItem.currentPeriod || templateItem.currentPeriod,
              accumulated: loadedItem.accumulated || templateItem.accumulated,
              progress: loadedItem.progress || templateItem.progress
            }
          }
          return templateItem
        })
      }

      netProfitNonMainItems.value = mergeNetProfitData(netProfitNonMainItems.value, loadedData)
      console.log('合并后的净利润数据:', netProfitNonMainItems.value)
    }

    // 加载所有月份数据并计算累计值
    await loadNetProfitAllMonthsData(targetPeriod)
    updateNetProfitAccumulated()

  } catch (error) {
    console.error('加载非主营业务净利润数据失败:', error)
    // 出错时也要确保预算数据显示
    const initialItems = getInitialNetProfitNonMainItems()
    netProfitNonMainItems.value = [...initialItems]
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

    // 项目跟踪数据
    projectTrackingData.value = {
      equipment: [
        { customerType: '上海', yearlyPlan: 500000.00, currentPeriod: 1459.37, currentTotal: 1459.37 },
        { customerType: '国网', yearlyPlan: 1050000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '江苏', yearlyPlan: 300000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '输配电内配', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '西门子', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '同业', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '用户', yearlyPlan: 20000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '其它', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 }
      ],
      component: [
        { customerType: '用户', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 }
      ],
      engineering: [
        { customerType: '一包', yearlyPlan: 150000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '二包', yearlyPlan: 600.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '域内合作', yearlyPlan: 95000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '域外合作', yearlyPlan: 5000.00, currentPeriod: 0, currentTotal: 0 },
        { customerType: '其它', yearlyPlan: 2000.00, currentPeriod: 3031.54, currentTotal: 3031.54 }
      ]
    }



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
  console.log('开始生成PDF...')
  
  try {
    const element = document.getElementById('report-content')
    if (!element) {
      throw new Error('找不到报表内容元素')
    }
    
    console.log('开始转换HTML为Canvas...')
    // 使用更小的scale来减少内存使用
    const canvas = await html2canvas(element, {
      scale: 1, // 降低scale减少内存使用
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // 关闭日志减少内存
      width: element.scrollWidth,
      height: element.scrollHeight
    })
    
    console.log('Canvas生成成功，尺寸:', canvas.width, 'x', canvas.height)
    
    // 创建PDF
    console.log('开始创建PDF...')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })
    
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // 如果图片太高，我们需要分页处理
    const maxImageHeight = pageHeight * 10 // 最大允许10页的高度
    
    if (imgHeight > maxImageHeight) {
      console.log('内容过长，采用分页策略...')
      
      // 计算需要多少个分片
      const totalHeight = canvas.height
      const pieceHeight = Math.ceil(totalHeight / Math.ceil(imgHeight / maxImageHeight))
      const pieces = Math.ceil(totalHeight / pieceHeight)
      
      for (let i = 0; i < pieces; i++) {
        if (i > 0) pdf.addPage()
        
        // 创建当前分片的canvas
        const pieceCanvas = document.createElement('canvas')
        const pieceCtx = pieceCanvas.getContext('2d')
        pieceCanvas.width = canvas.width
        pieceCanvas.height = Math.min(pieceHeight, totalHeight - i * pieceHeight)
        
        // 从原canvas复制对应部分
        pieceCtx.drawImage(
          canvas,
          0, i * pieceHeight, canvas.width, pieceCanvas.height,
          0, 0, canvas.width, pieceCanvas.height
        )
        
        // 转换为图片并添加到PDF
        const pieceImgData = pieceCanvas.toDataURL('image/jpeg', 0.8) // 使用JPEG并压缩
        const pieceImgHeight = (pieceCanvas.height * imgWidth) / pieceCanvas.width
        
        pdf.addImage(pieceImgData, 'JPEG', 0, 0, imgWidth, Math.min(pieceImgHeight, pageHeight))
        
        console.log(`添加第 ${i + 1}/${pieces} 页`)
      }
    } else {
      // 内容不太长，使用原来的方法但压缩图片
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // 使用JPEG格式并压缩
      
      let heightLeft = imgHeight
      let position = 0
      
      // 添加第一页
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // 如果内容超过一页，添加更多页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }
    
    // 保存PDF，使用动态公司名称
    const fileName = `${selectedCompany.value}_月度经济运行报表_${selectedPeriod.value}.pdf`
    console.log('保存PDF文件:', fileName)
    pdf.save(fileName)
    
    console.log('PDF生成成功!')
    alert('PDF生成成功!')
    
  } catch (error) {
    console.error('生成PDF失败:', error)
    if (error.message.includes('Invalid string length') || error.message.includes('Maximum call stack')) {
      alert('报表内容过长，PDF生成失败。请尝试减少报表内容或联系技术支持。')
    } else {
      alert(`生成PDF失败: ${error.message}`)
    }
  } finally {
    isGenerating.value = false
  }
}

// 监听主营业务收入数据变化，自动计算累计收入和进度
watch(mainBusinessIncomeStructureData, () => {
  // 更新累计收入
  updateAccumulatedIncomeForMainBusiness()

  // 安全检查数据结构
  if (!mainBusinessIncomeStructureData.value || typeof mainBusinessIncomeStructureData.value !== 'object') {
    console.error('mainBusinessIncomeStructureData无效，跳过进度更新')
    return
  }

  // 更新设备进度
  if (Array.isArray(mainBusinessIncomeStructureData.value.equipment)) {
    mainBusinessIncomeStructureData.value.equipment.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      if (yearlyPlan > 0) {
        item.progress = ((item.accumulatedIncome / yearlyPlan) * 100).toFixed(2) + '%'
      } else {
        item.progress = '/'
      }
    })
  }

  // 更新元件进度
  if (Array.isArray(mainBusinessIncomeStructureData.value.components)) {
    mainBusinessIncomeStructureData.value.components.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      if (yearlyPlan > 0) {
        item.progress = ((item.accumulatedIncome / yearlyPlan) * 100).toFixed(2) + '%'
      } else {
        item.progress = '/'
      }
    })
  }

  // 更新工程进度
  if (Array.isArray(mainBusinessIncomeStructureData.value.engineering)) {
    mainBusinessIncomeStructureData.value.engineering.forEach(item => {
      const yearlyPlan = typeof item.yearlyPlan === 'number' ? item.yearlyPlan : 0
      if (yearlyPlan > 0) {
        item.progress = ((item.accumulatedIncome / yearlyPlan) * 100).toFixed(2) + '%'
      } else {
        item.progress = '/'
      }
    })
  }
}, { deep: true })

// 监听订单转收入数据变化，自动计算累计转收入和比率
watch(orderToIncomeData, () => {
  // 更新累计转收入
  updateOrderToIncomeTotal()

  // 更新设备转收入比率
  orderToIncomeData.value.equipment.forEach(item => {
    calculateOrderToIncomeRate(item)
  })

  // 更新元件转收入比率
  orderToIncomeData.value.components.forEach(item => {
    calculateOrderToIncomeRate(item)
  })

  // 更新工程转收入比率
  orderToIncomeData.value.engineering.forEach(item => {
    calculateOrderToIncomeRate(item)
  })
}, { deep: true })

// 监听存量订单转收入数据变化，自动计算累计转收入和比率
watch(stockOrderToIncomeData, () => {
  // 更新累计转收入
  updateStockOrderIncomeTotal()

  // 更新设备转收入比率
  stockOrderToIncomeData.value.equipment.forEach(item => {
    calculateStockOrderIncomeRate(item)
  })

  // 更新元件转收入比率
  stockOrderToIncomeData.value.components.forEach(item => {
    calculateStockOrderIncomeRate(item)
  })

  // 更新工程转收入比率
  stockOrderToIncomeData.value.engineering.forEach(item => {
    calculateStockOrderIncomeRate(item)
  })
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadReportData()
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
