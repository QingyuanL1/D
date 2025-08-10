<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">审阅</h1>
        <p class="text-gray-600 mt-2">选择需要查看的表单模块</p>
        <div v-if="currentCompany" class="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10V9a1 1 0 011-1h4a1 1 0 011 1v12M9 7h1m-1 4h1"></path>
          </svg>
          当前公司：{{ currentCompany }}
        </div>
      </div>

      <!-- 表单选择器 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 分类选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择分类</label>
            <select 
              v-model="selectedCategory" 
              @change="onCategoryChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择分类</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- 表单选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择表单</label>
            <select 
              v-model="selectedModule" 
              @change="onModuleChange"
              :disabled="!selectedCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">请选择表单</option>
              <option 
                v-for="module in filteredModules" 
                :key="module.id" 
                :value="module"
              >
                {{ module.module_name }}
              </option>
            </select>
          </div>

          <!-- 期间选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择期间</label>
            <input 
              v-model="selectedPeriod" 
              type="month" 
              @change="onPeriodChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- 查看按钮 -->
        <div class="mt-6 flex space-x-4">
          <button 
            @click="navigateToModule"
            :disabled="!selectedModule"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            查看表单
          </button>
          <button 
            @click="loadSubmissionDetails"
            :disabled="!selectedModule || !selectedPeriod"
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            查看提交详情
          </button>
        </div>
      </div>

      <!-- 提交详情显示区域 -->
      <div v-if="submissionDetails" class="bg-white rounded-lg shadow-sm mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ submissionDetails.module_name }} - {{ selectedPeriod }} 提交详情
          </h3>
        </div>
        
        <div class="p-6">
          <!-- 提交状态信息 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">提交状态</h4>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                已提交
              </span>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">最后提交人</h4>
              <p class="text-sm text-gray-900">{{ submissionDetails.last_submitted_by_name }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">提交次数</h4>
              <p class="text-sm text-gray-900">{{ submissionDetails.submission_count }} 次</p>
            </div>
          </div>

          <!-- 备注和建议 -->
          <div v-if="submissionDetails.remarks || submissionDetails.suggestions" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div v-if="submissionDetails.remarks">
              <h4 class="text-sm font-medium text-gray-700 mb-3">备注信息</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ submissionDetails.remarks }}</p>
              </div>
            </div>
            <div v-if="submissionDetails.suggestions">
              <h4 class="text-sm font-medium text-gray-700 mb-3">建议信息</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ submissionDetails.suggestions }}</p>
              </div>
            </div>
          </div>

          <!-- 附件列表 -->
          <div v-if="attachments.length > 0">
            <h4 class="text-sm font-medium text-gray-700 mb-3">附件文件</h4>
            <div class="space-y-3">
              <div v-for="file in attachments" :key="file.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ file.original_name }}</p>
                  <p class="text-xs text-gray-500">
                    大小: {{ formatFileSize(file.file_size) }} | 
                    上传时间: {{ formatDate(file.uploaded_at) }} | 
                    上传人: {{ file.uploaded_by }}
                  </p>
                  <p v-if="file.description" class="text-xs text-gray-600 mt-1">{{ file.description }}</p>
                </div>
                <div class="ml-4">
                  <a 
                    :href="`http://47.111.95.19:3000/files/download/${file.id}`" 
                    target="_blank"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    下载
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 无附件提示 -->
          <div v-else>
            <h4 class="text-sm font-medium text-gray-700 mb-3">附件文件</h4>
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <p class="text-sm text-gray-500">暂无附件</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 可访问表单列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">可访问的表单列表</h3>
        </div>
        
        <div class="p-6">
          <div v-if="loading" class="text-center py-8 text-gray-500">
            <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            加载中...
          </div>
          
          <div v-else-if="categorizedModules.length === 0" class="text-center py-8 text-gray-500">
            暂无可访问的表单
          </div>
          
          <div v-else class="space-y-6">
            <div v-for="category in categorizedModules" :key="category.name" class="border rounded-lg p-4">
              <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-3 h-3 rounded-full mr-2" 
                      :class="{
                        'bg-blue-500': category.name === '财务',
                        'bg-green-500': category.name === '营销', 
                        'bg-yellow-500': category.name === '生产',
                        'bg-purple-500': category.name === '企管',
                        'bg-red-500': category.name === '南华兰陵实业',
                        'bg-orange-500': category.name === '拓源公司'
                      }"></span>
                {{ category.name }} ({{ category.modules.length }} 个模块)
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div 
                  v-for="module in category.modules" 
                  :key="module.id"
                  class="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  @click="navigateToModuleDirectly(module)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900 text-sm">{{ module.module_name }}</h5>
                      <p class="text-xs text-gray-600 mt-1">{{ module.description }}</p>
                    </div>
                    <div class="ml-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="{
                              'bg-green-100 text-green-800': module.permission_type === 'write',
                              'bg-blue-100 text-blue-800': module.permission_type === 'read'
                            }">
                        {{ module.permission_type === 'write' ? '可编辑' : '只读' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface Module {
  id: number
  module_name: string
  module_key: string
  module_category: string
  route_path: string
  description: string
  permission_type: 'read' | 'write'
  display_order?: number
}

interface CategorizedModule {
  name: string
  modules: Module[]
}

const router = useRouter()
const userStore = useUserStore()

const modules = ref<Module[]>([])
const loading = ref(true)
const selectedCategory = ref('')
const selectedModule = ref<Module | null>(null)
const selectedPeriod = ref(new Date().toISOString().slice(0, 7))
const submissionDetails = ref<any>(null)
const attachments = ref<any[]>([])

// 计算当前选择的公司
const currentCompany = computed(() => {
  return localStorage.getItem('selectedCompany') || ''
})

// 计算可用分类
const availableCategories = computed(() => {
  console.log('🔍 [DEBUG] 计算可用分类，总模块数:', modules.value.length)
  console.log('🔍 [DEBUG] 所有模块分类:', modules.value.map(m => m.module_category))
  
  const categories = [...new Set(modules.value.map(m => m.module_category))]
  
  console.log('🔍 [DEBUG] 最终可用分类:', categories)
  return categories.sort()
})

// 计算过滤后的模块
const filteredModules = computed(() => {
  if (!selectedCategory.value) return []
  
  // 如果选择的是"南华兰陵实业"，则包含"南华"和"南华兰陵实业"两个分类
  if (selectedCategory.value === '南华兰陵实业') {
    return modules.value.filter(m => m.module_category === '南华兰陵实业' || m.module_category === '南华')
  }
  
  return modules.value.filter(m => m.module_category === selectedCategory.value)
})

// 计算分类模块
const categorizedModules = computed(() => {
  const categoryMap = new Map<string, Module[]>()
  
  modules.value.forEach(module => {
    const categoryName = module.module_category
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, [])
    }
    categoryMap.get(categoryName)!.push(module)
  })
  
  const result: CategorizedModule[] = []
  categoryMap.forEach((moduleList, categoryName) => {
    result.push({
      name: categoryName,
      modules: moduleList.sort((a, b) => {
        // 首先按display_order排序，如果没有display_order或为0，则按名称排序
        const aOrder = (a as any).display_order || 999
        const bOrder = (b as any).display_order || 999
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        return a.module_name.localeCompare(b.module_name)
      })
    })
  })
  
  return result.sort((a, b) => a.name.localeCompare(b.name))
})

// 获取用户可访问的模块
const fetchUserModules = async () => {
  try {
    const userId = userStore.userInfo?.id || 1
    
    // 从localStorage获取用户选择的公司
    const selectedCompany = localStorage.getItem('selectedCompany') || ''
    console.log('🔍 [DEBUG] 用户ID:', userId, '选择的公司:', selectedCompany)
    
    // 统一使用通用API获取所有模块
    const apiUrl = `http://47.111.95.19:3000/permissions/user/${userId}`
    console.log('🔍 [DEBUG] 使用通用API:', apiUrl)
    const response = await fetch(apiUrl)
    
    console.log('🔍 [DEBUG] API响应状态:', response.status)
    
    if (!response.ok) {
      throw new Error('获取用户权限失败')
    }
    
    const result = await response.json()
    console.log('🔍 [DEBUG] API返回结果:', result)
    
    if (result.success) {
      let allModules = result.data.accessible_modules || []
      
      // 根据选择的公司过滤模块
      if (selectedCompany === '上海南华兰陵电气有限公司') {
        // 南华电气公司：只显示企管、生产、营销、财务
        modules.value = allModules.filter(module => 
          ['企管', '生产', '营销', '财务'].includes(module.module_category)
        )
        console.log('🔍 [DEBUG] 南华电气公司过滤后模块数量:', modules.value.length)
      } else if (selectedCompany === '上海南华兰陵实业有限公司') {
        // 南华实业公司：只显示南华兰陵实业
        modules.value = allModules.filter(module => 
          module.module_category === '南华兰陵实业'
        )
        console.log('🔍 [DEBUG] 南华实业公司过滤后模块数量:', modules.value.length)
      } else if (selectedCompany === '常州拓源电气集团有限公司') {
        // 拓源公司：只显示拓源公司
        modules.value = allModules.filter(module => 
          module.module_category === '拓源公司'
        )
        console.log('🔍 [DEBUG] 拓源公司过滤后模块数量:', modules.value.length)
      } else {
        // 其他情况显示所有模块
        modules.value = allModules
        console.log('🔍 [DEBUG] 显示所有模块数量:', modules.value.length)
      }
      
      console.log('🔍 [DEBUG] 最终模块分类:', [...new Set(modules.value.map(m => m.module_category))])
    }
  } catch (error) {
    console.error('获取用户模块失败:', error)
  } finally {
    loading.value = false
  }
}

// 分类变化处理
const onCategoryChange = () => {
  selectedModule.value = null
}

// 模块变化处理
const onModuleChange = () => {
  // 清空之前的提交详情
  submissionDetails.value = null
  attachments.value = []
}

// 期间变化处理
const onPeriodChange = () => {
  // 清空之前的提交详情
  submissionDetails.value = null
  attachments.value = []
}

// 加载提交详情
const loadSubmissionDetails = async () => {
  if (!selectedModule.value || !selectedPeriod.value) return
  
  try {
    // 获取提交详情
    const submissionResponse = await fetch(`http://47.111.95.19:3000/forms/submission/${selectedModule.value.id}/${selectedPeriod.value}`)
    
    if (submissionResponse.ok) {
      const submissionResult = await submissionResponse.json()
      if (submissionResult.success) {
        submissionDetails.value = submissionResult.data
      }
    } else {
      // 如果404，说明该期间没有提交记录
      submissionDetails.value = null
      attachments.value = []
      alert(`${selectedModule.value.module_name} 在 ${selectedPeriod.value} 期间暂无提交记录`)
      return
    }
    
    // 获取附件列表
    const attachmentResponse = await fetch(`http://47.111.95.19:3000/files/attachments/${selectedModule.value.id}/${selectedPeriod.value}`)
    
    if (attachmentResponse.ok) {
      const attachmentResult = await attachmentResponse.json()
      if (attachmentResult.success) {
        attachments.value = attachmentResult.data || []
      }
    }
    
  } catch (error) {
    console.error('加载提交详情失败:', error)
    alert('加载提交详情失败，请重试')
  }
}

// 工具函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 导航到选中的模块
const navigateToModule = () => {
  if (selectedModule.value) {
    navigateToModuleDirectly(selectedModule.value)
  }
}

// 直接导航到模块
const navigateToModuleDirectly = (module: Module) => {
  // 路径修正映射 - 将错误的路径映射到正确的路径
  const pathCorrections: { [key: string]: string } = {
    '/example/CostCenterStructure': '/cost-center-structure',
    '/example/BalanceSheet': '/example',
    '/example/CashFlowStatement': '/cashflow',
    '/example/IncomeStatement': '/incomestatement',
    '/example/ProductionValue': '/production-value',
    '/example/ProjectTracking': '/projecttracking'
  }
  
  // 根据模块key映射到对应的路由路径
  const routeMapping: { [key: string]: string } = {
    // 基础财务报表 - 主要版本
    'balance_sheet': '/example',
    'cash_flow': '/cashflow', 
    'income_statement': '/incomestatement',
    'cost_center_structure': '/cost-center-structure-quality',
    'production_value': '/production-value',
    'project_tracking': '/projecttracking',
    
    // 财务分区 - newTable
    'business_income_structure': '/business-income-structure',
    'main_business_income': '/main-business-income', 
    'order_to_income': '/order-to-income',
    'stock_order_to_income': '/stock-order-to-income',
    'non_main_business': '/non-main-business',
    'business_contribution': '/business-contribution',
    'business_profit_margin': '/business-profit-margin',
    'net_profit_structure': '/net-profit-structure',
    'main_business_net_profit': '/main-business-net-profit',
    'non_main_business_net_profit': '/non-main-business-net-profit',
    'receipt_structure': '/receipt-structure',
    'accounts_receivable': '/accounts-receivable',
    'overdue_receivables': '/overdue-receivables',
    'bad_debt_provision': '/bad-debt-provision',
    
    // 营销分区 - newTable
    'new_orders': '/new-order',
    'bidding_status': '/bidding-status',
    'bid_fulfillment': '/bid-fulfillment',
    'inventory_structure': '/inventory-structure',
    'inventory_in_progress': '/inventory-in-progress',
    'contract_inventory': '/contract-inventory',
    'main_business_cost': '/main-business-cost',
    'cost_estimation': '/cost-estimation',
    'inventory_stock': '/inventory-stock',
    
    // 生产分区 - newTable
    'production_plan_execution': '/production-plan-execution',
    'production_execution_analysis': '/production-execution-analysis',
    
    // 企管分区 - newTable
    'department_cost_center': '/department-cost-center',
    'department_cost_input': '/department-cost-input',
    'major_investment_analysis': '/major-investment-analysis',
    'budget_execution': '/budget-execution',
    
    // 南华公司专用模块
    'nanhua_new_orders': '/nanhua/new-order-structure',
    'nanhua_project_tracking': '/nanhua/project-tracking',
    'nanhua_bidding_status': '/nanhua/bidding-status',
    'nanhua_business_income': '/nanhua/business-income',
    'nanhua_order_to_income': '/nanhua/order-to-income',
    'nanhua_stock_order_to_income': '/nanhua/stock-order-to-income',
    'nanhua_main_business_cost': '/nanhua/main-business-cost',
    'nanhua_cost_provision': '/nanhua/cost-provision',
    'nanhua_cost_center_structure': '/nanhua/cost-center-structure',
    'nanhua_department_cost_center_actual': '/nanhua/department-cost-center-actual',
    'nanhua_department_cost_input': '/nanhua/department-cost-input',
    'nanhua_contract_inventory': '/nanhua/contract-inventory',
    'nanhua_non_main_business': '/nanhua/non-main-business',
    'nanhua_inventory_structure': '/nanhua/inventory-structure',
    'nanhua_bid_fulfillment': '/nanhua/bid-fulfillment',
    'nanhua_business_contribution_with_self_built': '/nanhua/business-contribution-with-self-built',
    'nanhua_business_profit_margin_with_self_built': '/nanhua/business-profit-margin-with-self-built',
    'nanhua_main_business_net_profit_contribution': '/nanhua/main-business-net-profit-contribution',
    'nanhua_non_main_business_net_profit_contribution': '/nanhua/non-main-business-net-profit-contribution',
    'nanhua_main_business_net_profit': '/nanhua/main-business-net-profit-contribution',
    'nanhua_non_main_business_net_profit': '/nanhua/non-main-business-net-profit-contribution',
    'nanhua_receipt_structure': '/nanhua/receipt-structure',
    'nanhua_contract_inventory_evaluation': '/nanhua/contract-inventory-evaluation',
    'department_cost_center_actual': '/nanhua/department-cost-center-actual',
    'nanhua_analysis_appendix': '/nanhua/analysis-appendix',
    'nanhua_overdue_receivables': '/nanhua/overdue-receivables',
    'nanhua_bad_debt_provision': '/nanhua/bad-debt-provision',
    'nanhua_self_construction_analysis': '/nanhua/self-construction-analysis',
    'nanhua_construction_plan_execution': '/nanhua/construction-plan-execution',
    'nanhua_construction_execution_status': '/nanhua/construction-execution-status',
    'nanhua_major_investment': '/nanhua/major-investment',

    // 拓源公司专用模块
    'tuoyuan_new_order_structure': '/tuoyuan/new-order-structure',
    'tuoyuan_project_tracking': '/tuoyuan/project-tracking',
    'tuoyuan_bidding_status': '/tuoyuan/bidding-status',
    'main_business_income_breakdown': '/tuoyuan/main-business-income-breakdown',
    'tuoyuan_order_to_income': '/tuoyuan/order-to-income',
    'tuoyuan_stock_order_to_income': '/tuoyuan/stock-order-to-income',
    'tuoyuan_non_main_business': '/tuoyuan/non-main-business',
    'tuoyuan_inventory_structure': '/tuoyuan/inventory-structure',
    'tuoyuan_bid_fulfillment': '/tuoyuan/bid-fulfillment',
    'tuoyuan_inventory_in_progress': '/tuoyuan/inventory-in-progress',
    'tuoyuan_inventory_status': '/tuoyuan/inventory-status',
    'tuoyuan_main_business_cost_structure_quality': '/tuoyuan/main-business-cost-structure-quality',
    'tuoyuan_cost_estimation': '/tuoyuan/cost-estimation',
    'tuoyuan_cost_center_profit_loss': '/tuoyuan/cost-center-profit-loss',
    'tuoyuan_main_business_contribution_rate': '/tuoyuan/main-business-contribution-rate',
    'tuoyuan_main_business_profit_margin': '/tuoyuan/main-business-profit-margin',
    'tuoyuan_main_business_net_profit_contribution': '/tuoyuan/main-business-net-profit-contribution',
    'payment_structure_quality': '/tuoyuan/payment-structure-quality',
    'tuoyuan_accounts_receivable': '/tuoyuan/accounts-receivable',
    'tuoyuan_overdue_receivables': '/tuoyuan/overdue-receivables',
    'tuoyuan_bad_debt_provision': '/tuoyuan/bad-debt-provision',
    'tuoyuan_construction_plan_execution': '/tuoyuan/construction-plan-execution',
    'tuoyuan_major_investment': '/tuoyuan/major-investment',
    'tuoyuan_production_value_self_construction': '/tuoyuan/production-value-self-construction',
    'tuoyuan_construction_execution_status': '/tuoyuan/construction-execution-status'
  }
  
  // 首先尝试使用映射的路由
  const mappedRoute = routeMapping[module.module_key]
  if (mappedRoute) {
    router.push(mappedRoute)
    return
  }
  
  // 如果有配置的路由路径，检查是否需要修正
  if (module.route_path && module.route_path !== '/') {
    const correctedPath = pathCorrections[module.route_path] || module.route_path
    router.push(correctedPath)
  } else {
    // 最后尝试根据module_key生成路由
    const kebabCaseKey = module.module_key.replace(/_/g, '-')
    router.push(`/${kebabCaseKey}`)
  }
}

onMounted(() => {
  fetchUserModules()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>