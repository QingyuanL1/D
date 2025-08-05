/**
 * 报表数据服务
 * 用于从各个表格组件获取数据并整合成月度报表
 */

const API_BASE_URL = 'http://127.0.0.1:3000'

/**
 * 获取新签订单数据
 */
export const getNewOrderData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/new-orders/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无新签订单数据')
        return []
      }
      throw new Error(`获取新签订单数据失败: ${response.status}`)
    }

    const result = await response.json()
    if (result.data) {
      // 转换数据格式以匹配报表显示需求
      const formattedData = []

      // 处理设备数据
      if (result.data.equipment && Array.isArray(result.data.equipment)) {
        result.data.equipment.forEach(item => {
          formattedData.push({
            id: `equipment-${item.customer}`,
            sector: '设备',
            customer: item.customer,
            yearlyPlan: item.yearlyPlan || 0,
            monthlyRevenue: item.currentPeriod || 0,
            cumulativeRevenue: item.cumulativeTotal || 0,
            progress: item.yearlyPlan > 0 ? ((item.cumulativeTotal || 0) / item.yearlyPlan * 100).toFixed(2) : '0.00'
          })
        })
      }

      // 处理元件数据
      if (result.data.components && Array.isArray(result.data.components)) {
        result.data.components.forEach(item => {
          formattedData.push({
            id: `components-${item.customer}`,
            sector: '元件',
            customer: item.customer,
            yearlyPlan: item.yearlyPlan || 0,
            monthlyRevenue: item.currentPeriod || 0,
            cumulativeRevenue: item.cumulativeTotal || 0,
            progress: item.yearlyPlan > 0 ? ((item.cumulativeTotal || 0) / item.yearlyPlan * 100).toFixed(2) : '0.00'
          })
        })
      }

      // 处理工程数据
      if (result.data.engineering && Array.isArray(result.data.engineering)) {
        result.data.engineering.forEach(item => {
          formattedData.push({
            id: `engineering-${item.customer}`,
            sector: '工程',
            customer: item.customer,
            yearlyPlan: item.yearlyPlan || 0,
            monthlyRevenue: item.currentPeriod || 0,
            cumulativeRevenue: item.cumulativeTotal || 0,
            progress: item.yearlyPlan > 0 ? ((item.cumulativeTotal || 0) / item.yearlyPlan * 100).toFixed(2) : '0.00'
          })
        })
      }

      return formattedData
    }

    return []
  } catch (error) {
    console.error('获取新签订单数据失败:', error)
    return []
  }
}

/**
 * 获取营业收入数据
 */
export const getBusinessIncomeData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/business-income/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`获取营业收入数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('获取营业收入数据失败:', error)
    return []
  }
}

// 静态年初金额数据（与原始表格完全一致）
const INVENTORY_INITIAL_DATA = {
  equipment: [
    { customerType: '上海', initialAmount: 39151.53 },
    { customerType: '国网', initialAmount: 7841.48 },
    { customerType: '江苏', initialAmount: 6793.01 },
    { customerType: '输配电内配', initialAmount: 0.00 },
    { customerType: '西门子', initialAmount: 28.46 },
    { customerType: '同业', initialAmount: 821.55 },
    { customerType: '用户', initialAmount: 577.37 },
    { customerType: '其它', initialAmount: 220.08 }
  ],
  component: [
    { customerType: '用户', initialAmount: 26.60 }
  ],
  project: [
    { customerType: '一包', initialAmount: 12720.17 },
    { customerType: '二包', initialAmount: 960.55 },
    { customerType: '域内合作', initialAmount: 1818.79 },
    { customerType: '域外合作', initialAmount: 8063.91 },
    { customerType: '其它', initialAmount: 1973.08 }
  ]
}

/**
 * 获取存量数据
 */
export const getInventoryData = async (period) => {
  try {
    // 先获取API数据（当期金额）
    const response = await fetch(`${API_BASE_URL}/inventory-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let apiData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        apiData = result.data
      }
    } else if (response.status !== 404) {
      console.warn(`获取存量数据API调用失败: ${response.status}`)
    }

    // 合并静态年初金额和API当期金额
    const formattedData = []

    // 处理设备数据
    INVENTORY_INITIAL_DATA.equipment.forEach(staticItem => {
      let currentAmount = 0
      if (apiData && apiData.equipment && Array.isArray(apiData.equipment)) {
        const apiItem = apiData.equipment.find(item => item.customerType === staticItem.customerType)
        if (apiItem) {
          currentAmount = Number(apiItem.currentAmount) || 0
        }
      }

      formattedData.push({
        id: `equipment-${staticItem.customerType}`,
        sector: '设备',
        customer: staticItem.customerType,
        initialAmount: staticItem.initialAmount,
        currentAmount: currentAmount,
        fluctuation: calculateFluctuation(staticItem.initialAmount, currentAmount)
      })
    })

    // 处理元件数据
    INVENTORY_INITIAL_DATA.component.forEach(staticItem => {
      let currentAmount = 0
      if (apiData && apiData.component && Array.isArray(apiData.component)) {
        const apiItem = apiData.component.find(item => item.customerType === staticItem.customerType)
        if (apiItem) {
          currentAmount = Number(apiItem.currentAmount) || 0
        }
      }

      formattedData.push({
        id: `component-${staticItem.customerType}`,
        sector: '元件',
        customer: staticItem.customerType,
        initialAmount: staticItem.initialAmount,
        currentAmount: currentAmount,
        fluctuation: calculateFluctuation(staticItem.initialAmount, currentAmount)
      })
    })

    // 处理工程数据
    INVENTORY_INITIAL_DATA.project.forEach(staticItem => {
      let currentAmount = 0
      if (apiData && apiData.project && Array.isArray(apiData.project)) {
        const apiItem = apiData.project.find(item => item.customerType === staticItem.customerType)
        if (apiItem) {
          currentAmount = Number(apiItem.currentAmount) || 0
        }
      }

      formattedData.push({
        id: `project-${staticItem.customerType}`,
        sector: '工程',
        customer: staticItem.customerType,
        initialAmount: staticItem.initialAmount,
        currentAmount: currentAmount,
        fluctuation: calculateFluctuation(staticItem.initialAmount, currentAmount)
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取存量数据失败:', error)
    // 返回纯静态数据作为备用
    return getInventoryStaticData()
  }
}

/**
 * 获取纯静态存量数据（备用）
 */
const getInventoryStaticData = () => {
  const formattedData = []

  // 设备数据
  INVENTORY_INITIAL_DATA.equipment.forEach(item => {
    formattedData.push({
      id: `equipment-${item.customerType}`,
      sector: '设备',
      customer: item.customerType,
      initialAmount: item.initialAmount,
      currentAmount: 0,
      fluctuation: calculateFluctuation(item.initialAmount, 0)
    })
  })

  // 元件数据
  INVENTORY_INITIAL_DATA.component.forEach(item => {
    formattedData.push({
      id: `component-${item.customerType}`,
      sector: '元件',
      customer: item.customerType,
      initialAmount: item.initialAmount,
      currentAmount: 0,
      fluctuation: calculateFluctuation(item.initialAmount, 0)
    })
  })

  // 工程数据
  INVENTORY_INITIAL_DATA.project.forEach(item => {
    formattedData.push({
      id: `project-${item.customerType}`,
      sector: '工程',
      customer: item.customerType,
      initialAmount: item.initialAmount,
      currentAmount: 0,
      fluctuation: calculateFluctuation(item.initialAmount, 0)
    })
  })

  return formattedData
}

/**
 * 计算波动率
 */
const calculateFluctuation = (initial, current) => {
  if (initial === 0) return current === 0 ? '0.00' : '0.00'
  const fluctuation = ((current - initial) / initial) * 100
  return fluctuation.toFixed(2)
}

// 静态年度计划数据（与原始表格完全一致）
const MAIN_BUSINESS_COST_YEARLY_PLANS = {
  equipment: {
    '上海': 15000.00,
    '国网': 8000.00,
    '江苏': 5000.00,
    '输配电内配': 2000.00,
    '西门子': 1000.00,
    '同业': 3000.00,
    '用户': 2500.00,
    '其它': 500.00
  },
  component: {
    '用户': 1200.00
  },
  project: {
    '一包': 12000.00,
    '二包': 3000.00,
    '域内合作': 8000.00,
    '域外合作': 4000.00,
    '其它': 2000.00
  }
}

/**
 * 计算累计费用（与原始表格逻辑完全一致）
 */
const calculateCumulativeCosts = async (targetPeriod) => {
  try {
    console.log(`开始计算累计费用，目标期间: ${targetPeriod}`)
    const year = targetPeriod.substring(0, 4)
    const targetMonth = parseInt(targetPeriod.substring(5, 7))

    // 获取当年1月到目标月份的所有数据
    const promises = []
    for (let month = 1; month <= targetMonth; month++) {
      const monthStr = month.toString().padStart(2, '0')
      const periodStr = `${year}-${monthStr}`
      console.log(`获取期间 ${periodStr} 的数据`)
      promises.push(
        fetch(`${API_BASE_URL}/main-business-cost/${periodStr}`)
          .then(response => response.ok ? response.json() : { success: false })
          .catch(() => ({ success: false }))
      )
    }

    const results = await Promise.all(promises)
    console.log(`获取到 ${results.length} 个月份的数据`)

    // 计算累计数据
    const cumulativeData = {
      equipment: {},
      component: {},
      project: {}
    }

    results.forEach((result, index) => {
      if (result.success && result.data) {
        console.log(`处理第 ${index + 1} 个月的数据`)
        // 累计设备数据
        result.data.equipment?.forEach(item => {
          const key = item.customerType
          if (!cumulativeData.equipment[key]) {
            cumulativeData.equipment[key] = { materialCost: 0, laborCost: 0 }
          }
          cumulativeData.equipment[key].materialCost += Number(item.currentMaterialCost) || 0
          cumulativeData.equipment[key].laborCost += Number(item.currentLaborCost) || 0
        })

        // 累计元件数据
        result.data.component?.forEach(item => {
          const key = item.customerType
          if (!cumulativeData.component[key]) {
            cumulativeData.component[key] = { materialCost: 0, laborCost: 0 }
          }
          cumulativeData.component[key].materialCost += Number(item.currentMaterialCost) || 0
          cumulativeData.component[key].laborCost += Number(item.currentLaborCost) || 0
        })

        // 累计工程数据
        result.data.project?.forEach(item => {
          const key = item.customerType
          if (!cumulativeData.project[key]) {
            cumulativeData.project[key] = { materialCost: 0, laborCost: 0 }
          }
          cumulativeData.project[key].materialCost += Number(item.currentMaterialCost) || 0
          cumulativeData.project[key].laborCost += Number(item.currentLaborCost) || 0
        })
      } else {
        console.log(`第 ${index + 1} 个月的数据无效或不存在`)
      }
    })

    console.log('累计数据计算完成:', cumulativeData)
    return cumulativeData
  } catch (error) {
    console.error('计算累计费用失败:', error)
    return { equipment: {}, component: {}, project: {} }
  }
}

/**
 * 获取主营业务成本数据
 */
export const getMainBusinessCostData = async (period) => {
  try {
    // 先获取当期API数据
    const response = await fetch(`${API_BASE_URL}/main-business-cost/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        currentPeriodData = result.data
      }
    } else if (response.status !== 404) {
      console.warn(`获取主营业务成本数据API调用失败: ${response.status}`)
    }

    // 计算累计费用（与原始表格逻辑完全一致）
    const cumulativeData = await calculateCumulativeCosts(period)

    // 合并静态年度计划、当期数据和累计数据
    const formattedData = []

    // 处理设备数据
    Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.equipment).forEach(([customerType, yearlyPlan]) => {
      let currentMaterialCost = 0
      let currentLaborCost = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.equipment && Array.isArray(currentPeriodData.equipment)) {
        const apiItem = currentPeriodData.equipment.find(item => item.customerType === customerType)
        if (apiItem) {
          currentMaterialCost = Number(apiItem.currentMaterialCost) || 0
          currentLaborCost = Number(apiItem.currentLaborCost) || 0
        }
      }

      // 获取累计数据
      const cumulative = cumulativeData.equipment[customerType] || { materialCost: 0, laborCost: 0 }
      const cumulativeMaterialCost = cumulative.materialCost
      const cumulativeLaborCost = cumulative.laborCost

      const totalCumulativeCost = cumulativeMaterialCost + cumulativeLaborCost
      const executionRate = yearlyPlan > 0 ? ((totalCumulativeCost / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `equipment-${customerType}`,
        sector: '设备',
        customer: customerType,
        yearlyPlan: yearlyPlan,
        executionRate: executionRate,
        currentMaterialCost: currentMaterialCost,
        cumulativeMaterialCost: cumulativeMaterialCost,
        currentLaborCost: currentLaborCost,
        cumulativeLaborCost: cumulativeLaborCost
      })
    })

    // 处理元件数据
    Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.component).forEach(([customerType, yearlyPlan]) => {
      let currentMaterialCost = 0
      let currentLaborCost = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.component && Array.isArray(currentPeriodData.component)) {
        const apiItem = currentPeriodData.component.find(item => item.customerType === customerType)
        if (apiItem) {
          currentMaterialCost = Number(apiItem.currentMaterialCost) || 0
          currentLaborCost = Number(apiItem.currentLaborCost) || 0
        }
      }

      // 获取累计数据
      const cumulative = cumulativeData.component[customerType] || { materialCost: 0, laborCost: 0 }
      const cumulativeMaterialCost = cumulative.materialCost
      const cumulativeLaborCost = cumulative.laborCost

      const totalCumulativeCost = cumulativeMaterialCost + cumulativeLaborCost
      const executionRate = yearlyPlan > 0 ? ((totalCumulativeCost / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `component-${customerType}`,
        sector: '元件',
        customer: customerType,
        yearlyPlan: yearlyPlan,
        executionRate: executionRate,
        currentMaterialCost: currentMaterialCost,
        cumulativeMaterialCost: cumulativeMaterialCost,
        currentLaborCost: currentLaborCost,
        cumulativeLaborCost: cumulativeLaborCost
      })
    })

    // 处理工程数据
    Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.project).forEach(([customerType, yearlyPlan]) => {
      let currentMaterialCost = 0
      let currentLaborCost = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.project && Array.isArray(currentPeriodData.project)) {
        const apiItem = currentPeriodData.project.find(item => item.customerType === customerType)
        if (apiItem) {
          currentMaterialCost = Number(apiItem.currentMaterialCost) || 0
          currentLaborCost = Number(apiItem.currentLaborCost) || 0
        }
      }

      // 获取累计数据
      const cumulative = cumulativeData.project[customerType] || { materialCost: 0, laborCost: 0 }
      const cumulativeMaterialCost = cumulative.materialCost
      const cumulativeLaborCost = cumulative.laborCost

      const totalCumulativeCost = cumulativeMaterialCost + cumulativeLaborCost
      const executionRate = yearlyPlan > 0 ? ((totalCumulativeCost / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `project-${customerType}`,
        sector: '工程',
        customer: customerType,
        yearlyPlan: yearlyPlan,
        executionRate: executionRate,
        currentMaterialCost: currentMaterialCost,
        cumulativeMaterialCost: cumulativeMaterialCost,
        currentLaborCost: currentLaborCost,
        cumulativeLaborCost: cumulativeLaborCost
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取主营业务成本数据失败:', error)
    // 返回纯静态数据作为备用
    return getMainBusinessCostStaticData()
  }
}

/**
 * 获取纯静态主营业务成本数据（备用）
 */
const getMainBusinessCostStaticData = () => {
  const formattedData = []

  // 设备数据
  Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.equipment).forEach(([customerType, yearlyPlan]) => {
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      executionRate: '0.00',
      currentMaterialCost: 0,
      cumulativeMaterialCost: 0,
      currentLaborCost: 0,
      cumulativeLaborCost: 0
    })
  })

  // 元件数据
  Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.component).forEach(([customerType, yearlyPlan]) => {
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      executionRate: '0.00',
      currentMaterialCost: 0,
      cumulativeMaterialCost: 0,
      currentLaborCost: 0,
      cumulativeLaborCost: 0
    })
  })

  // 工程数据
  Object.entries(MAIN_BUSINESS_COST_YEARLY_PLANS.project).forEach(([customerType, yearlyPlan]) => {
    formattedData.push({
      id: `project-${customerType}`,
      sector: '工程',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      executionRate: '0.00',
      currentMaterialCost: 0,
      cumulativeMaterialCost: 0,
      currentLaborCost: 0,
      cumulativeLaborCost: 0
    })
  })

  return formattedData
}

/**
 * 计算成本中心累计收入（与原始表格逻辑完全一致）
 */
const calculateCostCenterCumulativeIncome = async (targetPeriod) => {
  try {
    console.log(`开始计算成本中心累计收入，目标期间: ${targetPeriod}`)
    const [year, month] = targetPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`${API_BASE_URL}/cost-center-structure/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            allData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error)
      }
    }

    console.log('加载的所有月份数据:', allData)

    // 计算累计收入的辅助函数
    const calculateCumulativeForCategory = (categoryType, customerType) => {
      let total = 0

      // 累加历史月份数据
      for (const monthData of allData) {
        if (monthData.period === targetPeriod) continue

        const categoryData = monthData.data[categoryType]
        if (categoryData) {
          const item = categoryData.find(d => d.customerType === customerType)
          if (item && item.currentMonthIncome) {
            const value = parseFloat(item.currentMonthIncome.toString()) || 0
            total += value
          }
        }
      }

      return total
    }

    // 计算非主营业务累计收入
    const calculateNonMainBusinessCumulative = () => {
      let total = 0

      for (const monthData of allData) {
        if (monthData.period === targetPeriod) continue

        if (monthData.data.nonMainBusiness && monthData.data.nonMainBusiness.currentMonthIncome) {
          const value = parseFloat(monthData.data.nonMainBusiness.currentMonthIncome.toString()) || 0
          total += value
        }
      }

      return total
    }

    return {
      allData,
      calculateCumulativeForCategory,
      calculateNonMainBusinessCumulative
    }
  } catch (error) {
    console.error('计算成本中心累计收入失败:', error)
    return {
      allData: [],
      calculateCumulativeForCategory: () => 0,
      calculateNonMainBusinessCumulative: () => 0
    }
  }
}

/**
 * 获取成本中心数据
 */
export const getCostCenterData = async (period) => {
  try {
    // 先获取当期API数据
    const response = await fetch(`${API_BASE_URL}/cost-center-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.data) {
        currentPeriodData = result.data
      }
    } else if (response.status !== 404) {
      console.warn(`获取成本中心数据API调用失败: ${response.status}`)
    }

    // 计算累计收入（与原始表格逻辑完全一致）
    const { calculateCumulativeForCategory, calculateNonMainBusinessCumulative } = await calculateCostCenterCumulativeIncome(period)

    // 初始化数据模板
    const equipmentTemplate = [
      { customerType: '上海' },
      { customerType: '国网' },
      { customerType: '江苏' },
      { customerType: '输配电内配' },
      { customerType: '西门子' },
      { customerType: '同业' },
      { customerType: '用户' },
      { customerType: '其他' }
    ]

    const componentTemplate = [
      { customerType: '用户' }
    ]

    const engineeringTemplate = [
      { customerType: '一包' },
      { customerType: '二包' },
      { customerType: '域内合作' },
      { customerType: '域外合作' },
      { customerType: '其它' }
    ]

    const formattedData = []

    // 处理设备数据
    equipmentTemplate.forEach(template => {
      let currentMonthIncome = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.equipmentData && Array.isArray(currentPeriodData.equipmentData)) {
        const apiItem = currentPeriodData.equipmentData.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentMonthIncome = Number(apiItem.currentMonthIncome) || 0
        }
      }

      // 计算累计收入（历史数据 + 当期数据）
      const historicalCumulative = calculateCumulativeForCategory('equipmentData', template.customerType)
      const cumulativeIncome = historicalCumulative + currentMonthIncome

      // 计算百分比
      const percentage = cumulativeIncome > 0 ? ((currentMonthIncome / cumulativeIncome) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `equipment-${template.customerType}`,
        sector: '设备',
        customer: template.customerType,
        cumulativeIncome: cumulativeIncome,
        currentMonthIncome: currentMonthIncome,
        percentage: percentage
      })
    })

    // 处理元件数据
    componentTemplate.forEach(template => {
      let currentMonthIncome = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.componentData && Array.isArray(currentPeriodData.componentData)) {
        const apiItem = currentPeriodData.componentData.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentMonthIncome = Number(apiItem.currentMonthIncome) || 0
        }
      }

      // 计算累计收入（历史数据 + 当期数据）
      const historicalCumulative = calculateCumulativeForCategory('componentData', template.customerType)
      const cumulativeIncome = historicalCumulative + currentMonthIncome

      // 计算百分比
      const percentage = cumulativeIncome > 0 ? ((currentMonthIncome / cumulativeIncome) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `component-${template.customerType}`,
        sector: '元件',
        customer: template.customerType,
        cumulativeIncome: cumulativeIncome,
        currentMonthIncome: currentMonthIncome,
        percentage: percentage
      })
    })

    // 处理工程数据
    engineeringTemplate.forEach(template => {
      let currentMonthIncome = 0

      // 获取当期数据
      if (currentPeriodData && currentPeriodData.engineeringData && Array.isArray(currentPeriodData.engineeringData)) {
        const apiItem = currentPeriodData.engineeringData.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentMonthIncome = Number(apiItem.currentMonthIncome) || 0
        }
      }

      // 计算累计收入（历史数据 + 当期数据）
      const historicalCumulative = calculateCumulativeForCategory('engineeringData', template.customerType)
      const cumulativeIncome = historicalCumulative + currentMonthIncome

      // 计算百分比
      const percentage = cumulativeIncome > 0 ? ((currentMonthIncome / cumulativeIncome) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `engineering-${template.customerType}`,
        sector: '工程',
        customer: template.customerType,
        cumulativeIncome: cumulativeIncome,
        currentMonthIncome: currentMonthIncome,
        percentage: percentage
      })
    })

    // 处理非主营业务数据
    let nonMainBusinessCurrentMonth = 0
    if (currentPeriodData && currentPeriodData.nonMainBusiness) {
      nonMainBusinessCurrentMonth = Number(currentPeriodData.nonMainBusiness.currentMonthIncome) || 0
    }

    const nonMainBusinessHistorical = calculateNonMainBusinessCumulative()
    const nonMainBusinessCumulative = nonMainBusinessHistorical + nonMainBusinessCurrentMonth
    const nonMainBusinessPercentage = nonMainBusinessCumulative > 0 ? ((nonMainBusinessCurrentMonth / nonMainBusinessCumulative) * 100).toFixed(2) : '0.00'

    formattedData.push({
      id: 'non-main-business',
      sector: '非主营业务',
      customer: '',
      cumulativeIncome: nonMainBusinessCumulative,
      currentMonthIncome: nonMainBusinessCurrentMonth,
      percentage: nonMainBusinessPercentage
    })

    return formattedData

  } catch (error) {
    console.error('获取成本中心数据失败:', error)
    // 返回纯静态数据作为备用
    return getCostCenterStaticData()
  }
}

/**
 * 获取纯静态成本中心数据（备用）
 */
const getCostCenterStaticData = () => {
  const equipmentTemplate = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其他']
  const componentTemplate = ['用户']
  const engineeringTemplate = ['一包', '二包', '域内合作', '域外合作', '其它']

  const formattedData = []

  // 设备数据
  equipmentTemplate.forEach(customerType => {
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      cumulativeIncome: 0,
      currentMonthIncome: 0,
      percentage: '0.00'
    })
  })

  // 元件数据
  componentTemplate.forEach(customerType => {
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      cumulativeIncome: 0,
      currentMonthIncome: 0,
      percentage: '0.00'
    })
  })

  // 工程数据
  engineeringTemplate.forEach(customerType => {
    formattedData.push({
      id: `engineering-${customerType}`,
      sector: '工程',
      customer: customerType,
      cumulativeIncome: 0,
      currentMonthIncome: 0,
      percentage: '0.00'
    })
  })

  // 非主营业务数据
  formattedData.push({
    id: 'non-main-business',
    sector: '非主营业务',
    customer: '',
    cumulativeIncome: 0,
    currentMonthIncome: 0,
    percentage: '0.00'
  })

  return formattedData
}

// 静态年度计划数据（与原始表格完全一致）
const MARGIN_CONTRIBUTION_YEARLY_PLANS = {
  equipment: {
    shanghai: 28.00,
    national: 18.50,
    jiangsu: 12.00,
    power: 15.00,
    siemens: 22.00,
    peers: 18.00,
    users: 15.80,
    others: 20.00
  },
  components: {
    users: 25.00
  },
  engineering: {
    package1: 35.00,
    package2: 30.00,
    domestic: 28.00,
    international: 25.00,
    others: 32.00
  }
}

/**
 * 获取边际贡献率数据
 */
export const getMarginContributionData = async (period) => {
  try {
    // 先尝试自动计算边际贡献率
    let calculatedData = null
    try {
      console.log('尝试自动计算边际贡献率...')
      const calculateResponse = await fetch(`${API_BASE_URL}/business-contribution/calculate/${period}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (calculateResponse.ok) {
        const calculateResult = await calculateResponse.json()
        if (calculateResult.success) {
          calculatedData = calculateResult.data
          console.log('自动计算成功:', calculatedData)
        }
      }
    } catch (calcError) {
      console.log('自动计算失败，将使用现有数据:', calcError.message)
    }

    // 如果自动计算成功，使用计算结果；否则加载现有数据
    let finalData = calculatedData

    if (!finalData) {
      // 加载专用表数据（包含预算数据中间件处理）
      const response = await fetch(`${API_BASE_URL}/business-contribution/${period}`)
      let businessData = null
      if (response.ok) {
        const result = await response.json()
        businessData = result.data
        console.log('专用表数据（含预算）:', businessData)
      } else if (response.status !== 404) {
        console.warn('加载专用表数据失败')
      }

      // 再加载form_submissions表数据作为备份
      const formResponse = await fetch(`${API_BASE_URL}/forms/submission/business-contribution/${period}`)
      let formData = null
      if (formResponse.ok) {
        const formResult = await formResponse.json()
        formData = formResult.data?.formData
        console.log('系统表数据:', formData)
      }

      // 合并数据：专用表（含预算）优先，系统表补充
      finalData = businessData || formData
    }

    if (finalData) {
      console.log('最终使用的数据:', finalData)
      return convertMarginContributionData(finalData)
    } else {
      // 返回纯静态数据作为备用
      return getMarginContributionStaticData()
    }

  } catch (error) {
    console.error('获取边际贡献率数据失败:', error)
    // 返回纯静态数据作为备用
    return getMarginContributionStaticData()
  }
}

/**
 * 解析百分比字符串为数字
 */
const parsePercentage = (percentStr) => {
  if (!percentStr) return 0
  // 移除%符号并转换为数字
  const numStr = percentStr.toString().replace('%', '')
  const num = parseFloat(numStr)
  return isNaN(num) ? 0 : num
}

/**
 * 转换边际贡献率数据格式
 */
const convertMarginContributionData = (apiData) => {
  console.log('开始转换边际贡献率数据:', apiData)
  const formattedData = []

  // 处理设备数据
  const equipmentMapping = {
    shanghai: '上海',
    national: '国网',
    jiangsu: '江苏',
    power: '输配电内配',
    siemens: '西门子',
    peers: '同业',
    users: '用户',
    others: '其它'
  }

  Object.entries(equipmentMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.equipment[key] || 0
    let currentActual = 0

    if (apiData.equipment && apiData.equipment[key]) {
      const apiItem = apiData.equipment[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`设备-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `equipment-${key}`,
      sector: '设备',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  // 处理元件数据
  const componentMapping = {
    users: '用户'
  }

  Object.entries(componentMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.components[key] || 0
    let currentActual = 0

    if (apiData.components && apiData.components[key]) {
      const apiItem = apiData.components[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`元件-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `components-${key}`,
      sector: '元件',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  // 处理工程数据
  const engineeringMapping = {
    package1: '一包',
    package2: '二包',
    domestic: '域内合作',
    international: '域外合作',
    others: '其它'
  }

  Object.entries(engineeringMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.engineering[key] || 0
    let currentActual = 0

    if (apiData.engineering && apiData.engineering[key]) {
      const apiItem = apiData.engineering[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`工程-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `engineering-${key}`,
      sector: '工程',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  console.log('转换完成的数据:', formattedData)
  return formattedData
}

/**
 * 获取纯静态边际贡献率数据（备用）
 */
const getMarginContributionStaticData = () => {
  const formattedData = []

  // 设备数据
  const equipmentMapping = {
    shanghai: '上海',
    national: '国网',
    jiangsu: '江苏',
    power: '输配电内配',
    siemens: '西门子',
    peers: '同业',
    users: '用户',
    others: '其它'
  }

  Object.entries(equipmentMapping).forEach(([key, customerName]) => {
    const yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.equipment[key] || 0

    formattedData.push({
      id: `equipment-${key}`,
      sector: '设备',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  // 元件数据
  const componentMapping = {
    users: '用户'
  }

  Object.entries(componentMapping).forEach(([key, customerName]) => {
    const yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.components[key] || 0

    formattedData.push({
      id: `components-${key}`,
      sector: '元件',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  // 工程数据
  const engineeringMapping = {
    package1: '一包',
    package2: '二包',
    domestic: '域内合作',
    international: '域外合作',
    others: '其它'
  }

  Object.entries(engineeringMapping).forEach(([key, customerName]) => {
    const yearlyPlan = MARGIN_CONTRIBUTION_YEARLY_PLANS.engineering[key] || 0

    formattedData.push({
      id: `engineering-${key}`,
      sector: '工程',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  return formattedData
}

// 静态年度计划数据（与原始表格完全一致）
const PROFIT_MARGIN_YEARLY_PLANS = {
  equipment: {
    shanghai: '21.99%',
    national: '13.83%',
    jiangsu: '8.00%',
    power: '12.00%',
    siemens: '17.00%',
    peers: '22.43%',
    users: '12.50%',
    others: '15.00%'
  },
  components: {
    users: '20.00%'
  },
  engineering: {
    package1: '26.00%',
    package2: '22.00%',
    domestic: '20.00%',
    international: '18.00%',
    others: '24.00%'
  }
}

/**
 * 获取毛利率数据
 */
export const getProfitMarginData = async (period) => {
  try {
    // 先尝试自动计算毛利率
    let calculatedData = null
    try {
      console.log('尝试自动计算毛利率...')
      const calculateResponse = await fetch(`${API_BASE_URL}/business-profit-margin/calculate/${period}`)

      if (calculateResponse.ok) {
        const calculateResult = await calculateResponse.json()
        if (calculateResult.success && calculateResult.data) {
          calculatedData = calculateResult.data
          console.log('自动计算成功:', calculatedData)
        }
      }
    } catch (calcError) {
      console.log('自动计算失败，将使用现有数据:', calcError.message)
    }

    // 如果自动计算成功，使用计算结果；否则加载现有数据
    let finalData = calculatedData

    if (!finalData) {
      // 加载专用表数据
      const response = await fetch(`${API_BASE_URL}/business-profit-margin/${period}`)
      let businessData = null
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          businessData = result.data
          console.log('专用表数据:', businessData)
        }
      } else if (response.status !== 404) {
        console.warn('加载专用表数据失败')
      }

      // 再加载form_submissions表数据作为备份
      const formResponse = await fetch(`${API_BASE_URL}/forms/submission/business-profit-margin/${period}`)
      let formData = null
      if (formResponse.ok) {
        const formResult = await formResponse.json()
        if (formResult.data?.formData) {
          formData = formResult.data.formData
          console.log('系统表数据:', formData)
        }
      }

      // 合并数据：专用表优先，系统表补充
      finalData = businessData || formData
    }

    if (finalData) {
      console.log('最终使用的毛利率数据:', finalData)
      return convertProfitMarginData(finalData)
    } else {
      // 返回纯静态数据作为备用
      return getProfitMarginStaticData()
    }

  } catch (error) {
    console.error('获取毛利率数据失败:', error)
    // 返回纯静态数据作为备用
    return getProfitMarginStaticData()
  }
}

/**
 * 转换毛利率数据格式
 */
const convertProfitMarginData = (apiData) => {
  console.log('开始转换毛利率数据:', apiData)
  const formattedData = []

  // 处理设备数据
  const equipmentMapping = {
    shanghai: '上海',
    national: '国网',
    jiangsu: '江苏',
    power: '输配电内配',
    siemens: '西门子',
    peers: '同业',
    users: '用户',
    others: '其它'
  }

  Object.entries(equipmentMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.equipment[key]) || 0
    let currentActual = 0

    if (apiData.equipment && apiData.equipment[key]) {
      const apiItem = apiData.equipment[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`设备-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `equipment-${key}`,
      sector: '设备',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  // 处理元件数据
  const componentMapping = {
    users: '用户'
  }

  Object.entries(componentMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.components[key]) || 0
    let currentActual = 0

    if (apiData.components && apiData.components[key]) {
      const apiItem = apiData.components[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`元件-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `components-${key}`,
      sector: '元件',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  // 处理工程数据
  const engineeringMapping = {
    package1: '一包',
    package2: '二包',
    domestic: '域内合作',
    international: '域外合作',
    others: '其它'
  }

  Object.entries(engineeringMapping).forEach(([key, customerName]) => {
    // 优先使用API返回的plan值，如果没有则使用静态值
    let yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.engineering[key]) || 0
    let currentActual = 0

    if (apiData.engineering && apiData.engineering[key]) {
      const apiItem = apiData.engineering[key]
      // 如果API有plan值，使用API的plan值
      if (apiItem.plan) {
        yearlyPlan = parsePercentage(apiItem.plan)
      }
      // 解析actual值
      if (apiItem.actual) {
        currentActual = parsePercentage(apiItem.actual)
      }
    }

    const deviation = Number((currentActual - yearlyPlan).toFixed(2))

    console.log(`工程-${customerName}: plan=${yearlyPlan}, actual=${currentActual}, deviation=${deviation}`)

    formattedData.push({
      id: `engineering-${key}`,
      sector: '工程',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: currentActual,
      deviation: deviation
    })
  })

  console.log('转换完成的毛利率数据:', formattedData)
  return formattedData
}

/**
 * 获取纯静态毛利率数据（备用）
 */
const getProfitMarginStaticData = () => {
  const formattedData = []

  // 设备数据
  const equipmentMapping = {
    shanghai: '上海',
    national: '国网',
    jiangsu: '江苏',
    power: '输配电内配',
    siemens: '西门子',
    peers: '同业',
    users: '用户',
    others: '其它'
  }

  Object.entries(equipmentMapping).forEach(([key, customerName]) => {
    const yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.equipment[key]) || 0

    formattedData.push({
      id: `equipment-${key}`,
      sector: '设备',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  // 元件数据
  const componentMapping = {
    users: '用户'
  }

  Object.entries(componentMapping).forEach(([key, customerName]) => {
    const yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.components[key]) || 0

    formattedData.push({
      id: `components-${key}`,
      sector: '元件',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  // 工程数据
  const engineeringMapping = {
    package1: '一包',
    package2: '二包',
    domestic: '域内合作',
    international: '域外合作',
    others: '其它'
  }

  Object.entries(engineeringMapping).forEach(([key, customerName]) => {
    const yearlyPlan = parsePercentage(PROFIT_MARGIN_YEARLY_PLANS.engineering[key]) || 0

    formattedData.push({
      id: `engineering-${key}`,
      sector: '工程',
      customer: customerName,
      yearlyPlan: yearlyPlan,
      currentActual: 0,
      deviation: Number((-yearlyPlan).toFixed(2))
    })
  })

  return formattedData
}

// 静态年度计划数据（与原始表格完全一致）
const NET_PROFIT_YEARLY_PLANS = {
  mainBusiness: 3871.58,
  nonMainBusiness: 128.42,
  total: 4000.00
}

/**
 * 获取净利润数据
 */
export const getNetProfitData = async (period) => {
  try {
    // 先尝试获取净利润结构数据
    let netProfitStructureData = null
    try {
      const structureResponse = await fetch(`${API_BASE_URL}/net-profit-structure/${period}`)
      if (structureResponse.ok) {
        const structureResult = await structureResponse.json()
        if (structureResult.success && structureResult.data) {
          netProfitStructureData = structureResult.data
          console.log('净利润结构数据:', netProfitStructureData)
        }
      }
    } catch (error) {
      console.log('获取净利润结构数据失败:', error.message)
    }

    // 再尝试获取主营业务净利润贡献数据
    let mainBusinessContributionData = null
    try {
      const contributionResponse = await fetch(`${API_BASE_URL}/main-business-net-profit/${period}`)
      if (contributionResponse.ok) {
        const contributionResult = await contributionResponse.json()
        if (contributionResult.success && contributionResult.data) {
          mainBusinessContributionData = contributionResult.data
          console.log('主营业务净利润贡献数据:', mainBusinessContributionData)
        }
      }
    } catch (error) {
      console.log('获取主营业务净利润贡献数据失败:', error.message)
    }

    // 最后尝试获取非主营业务净利润数据
    let nonMainBusinessData = null
    try {
      const nonMainResponse = await fetch(`${API_BASE_URL}/non-main-business-net-profit/${period}`)
      if (nonMainResponse.ok) {
        const nonMainResult = await nonMainResponse.json()
        if (nonMainResult.success && nonMainResult.data) {
          nonMainBusinessData = nonMainResult.data
          console.log('非主营业务净利润数据:', nonMainBusinessData)
        }
      }
    } catch (error) {
      console.log('获取非主营业务净利润数据失败:', error.message)
    }

    // 转换数据格式
    return convertNetProfitData({
      structure: netProfitStructureData,
      mainBusinessContribution: mainBusinessContributionData,
      nonMainBusiness: nonMainBusinessData
    })

  } catch (error) {
    console.error('获取净利润数据失败:', error)
    // 返回纯静态数据作为备用
    return getNetProfitStaticData()
  }
}

/**
 * 转换净利润数据格式
 */
const convertNetProfitData = (apiData) => {
  console.log('开始转换净利润数据:', apiData)

  // 主表数据
  const mainTableData = []

  // 主营业务数据
  let mainBusinessCurrent = 0
  let mainBusinessCumulative = 0
  let mainBusinessProgress = 0

  if (apiData.structure && apiData.structure.mainBusiness) {
    const mb = apiData.structure.mainBusiness
    mainBusinessCurrent = parseFloat(mb.current) || 0
    mainBusinessCumulative = parseFloat(mb.cumulative) || 0
    mainBusinessProgress = parseFloat(mb.progress) || 0
  }

  mainTableData.push({
    id: 1,
    category: '主营业务',
    yearlyPlan: NET_PROFIT_YEARLY_PLANS.mainBusiness,
    current: mainBusinessCurrent,
    cumulative: mainBusinessCumulative,
    progress: mainBusinessProgress
  })

  // 非主营业务数据
  let nonMainBusinessCurrent = 0
  let nonMainBusinessCumulative = 0
  let nonMainBusinessProgress = 0

  if (apiData.structure && apiData.structure.nonMainBusiness) {
    const nmb = apiData.structure.nonMainBusiness
    nonMainBusinessCurrent = parseFloat(nmb.current) || 0
    nonMainBusinessCumulative = parseFloat(nmb.cumulative) || 0
    nonMainBusinessProgress = parseFloat(nmb.progress) || 0
  }

  mainTableData.push({
    id: 2,
    category: '非主营业务',
    yearlyPlan: NET_PROFIT_YEARLY_PLANS.nonMainBusiness,
    current: nonMainBusinessCurrent,
    cumulative: nonMainBusinessCumulative,
    progress: nonMainBusinessProgress
  })

  console.log('转换完成的净利润主表数据:', mainTableData)
  return mainTableData
}

/**
 * 获取纯静态净利润数据（备用）
 */
const getNetProfitStaticData = () => {
  return [
    {
      id: 1,
      category: '主营业务',
      yearlyPlan: NET_PROFIT_YEARLY_PLANS.mainBusiness,
      current: 0,
      cumulative: 0,
      progress: 0
    },
    {
      id: 2,
      category: '非主营业务',
      yearlyPlan: NET_PROFIT_YEARLY_PLANS.nonMainBusiness,
      current: 0,
      cumulative: 0,
      progress: 0
    }
  ]
}

// 静态年度计划数据（与原始表格完全一致）
const RECEIPT_YEARLY_PLANS = {
  equipment: {
    '上海': 25000.00,
    '国网': 5000.00,
    '江苏': 3500.00,
    '输配电内配': 2000.00,
    '西门子': 3500.00,
    '同业': 1000.00,
    '用户': 800.00,
    '其它': 500.00
  },
  component: {
    '用户': 300.00
  },
  project: {
    '一包': 2000.00,
    '二包': 1800.00,
    '域内合作': 1200.00,
    '域外合作': 1000.00,
    '其它': 1500.00
  }
}

/**
 * 计算收款累计数据（与原始表格逻辑完全一致）
 */
const calculateReceiptCumulativeData = async (targetPeriod) => {
  try {
    console.log(`开始计算收款累计数据，目标期间: ${targetPeriod}`)
    const [year, month] = targetPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`${API_BASE_URL}/receipt-structure/${monthPeriod}`)
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

    console.log('加载的所有收款月份数据:', allData)

    // 计算累计收款的辅助函数
    const calculateAccumulatedReceipt = (category, customerType) => {
      let total = 0

      // 累加历史月份数据
      for (const monthData of allData) {
        let categoryData = []

        if (category === 'equipment') {
          categoryData = monthData.data.filter(item => item.segment === '设备')
        } else if (category === 'component') {
          categoryData = monthData.data.filter(item => item.segment === '元件')
        } else if (category === 'project') {
          categoryData = monthData.data.filter(item => item.segment === '工程')
        }

        const item = categoryData.find(d => d.customerType === customerType)
        if (item && item.currentReceipt) {
          total += parseFloat(item.currentReceipt.toString().replace(/,/g, '')) || 0
        }
      }

      return total
    }

    return {
      allData,
      calculateAccumulatedReceipt
    }
  } catch (error) {
    console.error('计算收款累计数据失败:', error)
    return {
      allData: [],
      calculateAccumulatedReceipt: () => 0
    }
  }
}

/**
 * 获取收款数据
 */
export const getReceiptData = async (period) => {
  try {
    // 先获取当期收款结构数据
    const response = await fetch(`${API_BASE_URL}/receipt-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        currentPeriodData = result.data
        console.log('收款结构数据:', currentPeriodData)
      }
    } else if (response.status !== 404) {
      console.warn(`获取收款结构数据API调用失败: ${response.status}`)
    }

    // 计算累计收款（与原始表格逻辑完全一致）
    const { calculateAccumulatedReceipt } = await calculateReceiptCumulativeData(period)

    // 初始化数据模板
    const equipmentTemplate = [
      { customerType: '上海' },
      { customerType: '国网' },
      { customerType: '江苏' },
      { customerType: '输配电内配' },
      { customerType: '西门子' },
      { customerType: '同业' },
      { customerType: '用户' },
      { customerType: '其它' }
    ]

    const componentTemplate = [
      { customerType: '用户' }
    ]

    const projectTemplate = [
      { customerType: '一包' },
      { customerType: '二包' },
      { customerType: '域内合作' },
      { customerType: '域外合作' },
      { customerType: '其它' }
    ]

    const formattedData = []

    // 处理设备数据
    equipmentTemplate.forEach(template => {
      // 使用静态年度计划
      const yearlyPlan = RECEIPT_YEARLY_PLANS.equipment[template.customerType] || 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const equipmentItems = currentPeriodData.filter(item => item.segment === '设备')
        const apiItem = equipmentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计收款
      const cumulativeReceipt = calculateAccumulatedReceipt('equipment', template.customerType)

      // 计算执行进度
      const progress = yearlyPlan > 0 ? ((cumulativeReceipt / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `equipment-${template.customerType}`,
        sector: '设备',
        customer: template.customerType,
        yearlyPlan: yearlyPlan,
        currentReceipt: currentReceipt,
        cumulativeReceipt: cumulativeReceipt,
        progress: progress
      })
    })

    // 处理元件数据
    componentTemplate.forEach(template => {
      // 使用静态年度计划
      const yearlyPlan = RECEIPT_YEARLY_PLANS.component[template.customerType] || 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const componentItems = currentPeriodData.filter(item => item.segment === '元件')
        const apiItem = componentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计收款
      const cumulativeReceipt = calculateAccumulatedReceipt('component', template.customerType)

      // 计算执行进度
      const progress = yearlyPlan > 0 ? ((cumulativeReceipt / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `component-${template.customerType}`,
        sector: '元件',
        customer: template.customerType,
        yearlyPlan: yearlyPlan,
        currentReceipt: currentReceipt,
        cumulativeReceipt: cumulativeReceipt,
        progress: progress
      })
    })

    // 处理工程数据
    projectTemplate.forEach(template => {
      // 使用静态年度计划
      const yearlyPlan = RECEIPT_YEARLY_PLANS.project[template.customerType] || 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const projectItems = currentPeriodData.filter(item => item.segment === '工程')
        const apiItem = projectItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计收款
      const cumulativeReceipt = calculateAccumulatedReceipt('project', template.customerType)

      // 计算执行进度
      const progress = yearlyPlan > 0 ? ((cumulativeReceipt / yearlyPlan) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `project-${template.customerType}`,
        sector: '工程',
        customer: template.customerType,
        yearlyPlan: yearlyPlan,
        currentReceipt: currentReceipt,
        cumulativeReceipt: cumulativeReceipt,
        progress: progress
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取收款数据失败:', error)
    // 返回纯静态数据作为备用
    return getReceiptStaticData()
  }
}

/**
 * 获取纯静态收款数据（备用）
 */
const getReceiptStaticData = () => {
  const equipmentTemplate = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
  const componentTemplate = ['用户']
  const projectTemplate = ['一包', '二包', '域内合作', '域外合作', '其它']

  const formattedData = []

  // 设备数据
  equipmentTemplate.forEach(customerType => {
    const yearlyPlan = RECEIPT_YEARLY_PLANS.equipment[customerType] || 0
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      currentReceipt: 0,
      cumulativeReceipt: 0,
      progress: '0.00'
    })
  })

  // 元件数据
  componentTemplate.forEach(customerType => {
    const yearlyPlan = RECEIPT_YEARLY_PLANS.component[customerType] || 0
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      currentReceipt: 0,
      cumulativeReceipt: 0,
      progress: '0.00'
    })
  })

  // 工程数据
  projectTemplate.forEach(customerType => {
    const yearlyPlan = RECEIPT_YEARLY_PLANS.project[customerType] || 0
    formattedData.push({
      id: `project-${customerType}`,
      sector: '工程',
      customer: customerType,
      yearlyPlan: yearlyPlan,
      currentReceipt: 0,
      cumulativeReceipt: 0,
      progress: '0.00'
    })
  })

  return formattedData
}

// 静态年初应收余额数据（与原始表格完全一致）
const ACCOUNTS_RECEIVABLE_INITIAL_BALANCE = {
  equipment: {
    '上海': 3558.98,
    '国网': 5190.93,
    '江苏': 1154.56,
    '输配电内配': 176.86,
    '西门子': 0.00,
    '同业': 2028.53,
    '用户': 1727.31,
    '其它': 303.55
  },
  component: {
    '用户': 458.54
  },
  project: {
    '一包': 385.47,
    '二包': 189.12,
    '域内合作': 2772.83,
    '域外合作': 752.14,
    '其它': 488.67
  }
}

/**
 * 计算应收账款累计数据（与原始表格逻辑完全一致）
 */
const calculateAccountsReceivableCumulativeData = async (targetPeriod) => {
  try {
    console.log(`开始计算应收账款累计数据，目标期间: ${targetPeriod}`)
    const [year, month] = targetPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []

    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      try {
        const response = await fetch(`${API_BASE_URL}/accounts-receivable/${monthPeriod}`)
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

    console.log('加载的所有应收账款月份数据:', allData)

    // 计算累计数据的辅助函数
    const calculateAccumulatedValue = (category, customerType, field) => {
      let total = 0

      // 累加历史月份数据
      for (const monthData of allData) {
        let categoryData = []

        if (category === 'equipment') {
          categoryData = monthData.data.filter(item => item.segment === '设备')
        } else if (category === 'component') {
          categoryData = monthData.data.filter(item => item.segment === '元件')
        } else if (category === 'project') {
          categoryData = monthData.data.filter(item => item.segment === '工程')
        }

        const item = categoryData.find(d => d.customerType === customerType)
        if (item && item[field]) {
          total += parseFloat(item[field].toString().replace(/,/g, '')) || 0
        }
      }

      return total
    }

    return {
      allData,
      calculateAccumulatedValue
    }
  } catch (error) {
    console.error('计算应收账款累计数据失败:', error)
    return {
      allData: [],
      calculateAccumulatedValue: () => 0
    }
  }
}

/**
 * 获取应收账款数据
 */
export const getAccountsReceivableData = async (period) => {
  try {
    // 先获取当期应收账款数据
    const response = await fetch(`${API_BASE_URL}/accounts-receivable/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        currentPeriodData = result.data
        console.log('应收账款数据:', currentPeriodData)
      }
    } else if (response.status !== 404) {
      console.warn(`获取应收账款数据API调用失败: ${response.status}`)
    }

    // 计算累计数据（与原始表格逻辑完全一致）
    const { calculateAccumulatedValue } = await calculateAccountsReceivableCumulativeData(period)

    // 初始化数据模板
    const equipmentTemplate = [
      { customerType: '上海' },
      { customerType: '国网' },
      { customerType: '江苏' },
      { customerType: '输配电内配' },
      { customerType: '西门子' },
      { customerType: '同业' },
      { customerType: '用户' },
      { customerType: '其它' }
    ]

    const componentTemplate = [
      { customerType: '用户' }
    ]

    const projectTemplate = [
      { customerType: '一包' },
      { customerType: '二包' },
      { customerType: '域内合作' },
      { customerType: '域外合作' },
      { customerType: '其它' }
    ]

    const formattedData = []

    // 处理设备数据
    equipmentTemplate.forEach(template => {
      // 使用静态年初应收余额
      const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.equipment[template.customerType] || 0
      let newInvoice = 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const equipmentItems = currentPeriodData.filter(item => item.segment === '设备')
        const apiItem = equipmentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newInvoice = parseFloat(apiItem.newInvoice?.toString().replace(/,/g, '')) || 0
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计数据
      const totalNewInvoice = calculateAccumulatedValue('equipment', template.customerType, 'newInvoice')
      const totalReceipt = calculateAccumulatedValue('equipment', template.customerType, 'currentReceipt')

      // 计算当期应收余额：年初余额 + 累计新增开票 - 累计收款
      const currentBalance = initialBalance + totalNewInvoice - totalReceipt

      formattedData.push({
        id: `equipment-${template.customerType}`,
        sector: '设备',
        customer: template.customerType,
        initialBalance: initialBalance,
        newInvoice: newInvoice,
        totalNewInvoice: totalNewInvoice,
        currentReceipt: currentReceipt,
        totalReceipt: totalReceipt,
        currentBalance: currentBalance
      })
    })

    // 处理元件数据
    componentTemplate.forEach(template => {
      // 使用静态年初应收余额
      const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.component[template.customerType] || 0
      let newInvoice = 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const componentItems = currentPeriodData.filter(item => item.segment === '元件')
        const apiItem = componentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newInvoice = parseFloat(apiItem.newInvoice?.toString().replace(/,/g, '')) || 0
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计数据
      const totalNewInvoice = calculateAccumulatedValue('component', template.customerType, 'newInvoice')
      const totalReceipt = calculateAccumulatedValue('component', template.customerType, 'currentReceipt')

      // 计算当期应收余额：年初余额 + 累计新增开票 - 累计收款
      const currentBalance = initialBalance + totalNewInvoice - totalReceipt

      formattedData.push({
        id: `component-${template.customerType}`,
        sector: '元件',
        customer: template.customerType,
        initialBalance: initialBalance,
        newInvoice: newInvoice,
        totalNewInvoice: totalNewInvoice,
        currentReceipt: currentReceipt,
        totalReceipt: totalReceipt,
        currentBalance: currentBalance
      })
    })

    // 处理工程数据
    projectTemplate.forEach(template => {
      // 使用静态年初应收余额
      const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.project[template.customerType] || 0
      let newInvoice = 0
      let currentReceipt = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const projectItems = currentPeriodData.filter(item => item.segment === '工程')
        const apiItem = projectItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newInvoice = parseFloat(apiItem.newInvoice?.toString().replace(/,/g, '')) || 0
          currentReceipt = parseFloat(apiItem.currentReceipt?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计数据
      const totalNewInvoice = calculateAccumulatedValue('project', template.customerType, 'newInvoice')
      const totalReceipt = calculateAccumulatedValue('project', template.customerType, 'currentReceipt')

      // 计算当期应收余额：年初余额 + 累计新增开票 - 累计收款
      const currentBalance = initialBalance + totalNewInvoice - totalReceipt

      formattedData.push({
        id: `project-${template.customerType}`,
        sector: '工程',
        customer: template.customerType,
        initialBalance: initialBalance,
        newInvoice: newInvoice,
        totalNewInvoice: totalNewInvoice,
        currentReceipt: currentReceipt,
        totalReceipt: totalReceipt,
        currentBalance: currentBalance
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取应收账款数据失败:', error)
    // 返回纯静态数据作为备用
    return getAccountsReceivableStaticData()
  }
}

/**
 * 获取纯静态应收账款数据（备用）
 */
const getAccountsReceivableStaticData = () => {
  const equipmentTemplate = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
  const componentTemplate = ['用户']
  const projectTemplate = ['一包', '二包', '域内合作', '域外合作', '其它']

  const formattedData = []

  // 设备数据
  equipmentTemplate.forEach(customerType => {
    const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.equipment[customerType] || 0
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      initialBalance: initialBalance,
      newInvoice: 0,
      totalNewInvoice: 0,
      currentReceipt: 0,
      totalReceipt: 0,
      currentBalance: initialBalance
    })
  })

  // 元件数据
  componentTemplate.forEach(customerType => {
    const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.component[customerType] || 0
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      initialBalance: initialBalance,
      newInvoice: 0,
      totalNewInvoice: 0,
      currentReceipt: 0,
      totalReceipt: 0,
      currentBalance: initialBalance
    })
  })

  // 工程数据
  projectTemplate.forEach(customerType => {
    const initialBalance = ACCOUNTS_RECEIVABLE_INITIAL_BALANCE.project[customerType] || 0
    formattedData.push({
      id: `project-${customerType}`,
      sector: '工程',
      customer: customerType,
      initialBalance: initialBalance,
      newInvoice: 0,
      totalNewInvoice: 0,
      currentReceipt: 0,
      totalReceipt: 0,
      currentBalance: initialBalance
    })
  })

  return formattedData
}

/**
 * 计算坏账准备历史数据（与BadDebtProvision.vue逻辑一致）
 */
const calculateBadDebtProvisionHistoricalData = async (currentPeriod) => {
  try {
    const [year, month] = currentPeriod.split('-')
    const targetMonth = parseInt(month)
    const allMonthsData = []

    // 获取当年1月到目标月份的所有数据
    for (let i = 1; i <= targetMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`

      try {
        const response = await fetch(`${API_BASE_URL}/bad-debt-provision/${monthPeriod}`)

        if (response.ok) {
          const result = await response.json()

          if (result.data && Array.isArray(result.data)) {
            allMonthsData.push({ period: monthPeriod, data: result.data })
          }
        }
      } catch (e) {
        console.error(`加载期间 ${monthPeriod} 的坏账准备数据失败:`, e)
      }
    }

    console.log('坏账准备历史数据加载完成:', allMonthsData)
    return allMonthsData
  } catch (error) {
    console.error('计算坏账准备历史数据失败:', error)
    return []
  }
}

/**
 * 计算累计转回（与BadDebtProvision.vue逻辑一致）
 */
const calculateAccumulatedReversal = (allMonthsData, segment, customerType, currentPeriod) => {
  let total = 0

  // 累加历史月份数据
  for (const monthData of allMonthsData) {
    if (monthData.period === currentPeriod) continue

    const item = monthData.data.find(
      (d) => d.segment === segment && d.customerType === customerType
    )
    if (item && item.currentReversal) {
      const value = parseFloat(item.currentReversal.toString()) || 0
      total += value
    }
  }

  return total
}

/**
 * 获取坏账准备数据
 */
export const getBadDebtProvisionData = async (period) => {
  try {
    // 先计算历史数据（与BadDebtProvision.vue逻辑一致）
    const allMonthsData = await calculateBadDebtProvisionHistoricalData(period)

    // 再获取当期坏账准备数据
    const response = await fetch(`${API_BASE_URL}/bad-debt-provision/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        currentPeriodData = result.data
        console.log('坏账准备当期数据:', currentPeriodData)
      }
    } else if (response.status !== 404) {
      console.warn(`获取坏账准备数据API调用失败: ${response.status}`)
    }

    // 初始化数据模板
    const equipmentTemplate = [
      { customerType: '上海' },
      { customerType: '国网' },
      { customerType: '江苏' },
      { customerType: '输配电内配' },
      { customerType: '西门子' },
      { customerType: '同业' },
      { customerType: '用户' },
      { customerType: '其它' }
    ]

    const componentTemplate = [
      { customerType: '用户' }
    ]

    const projectTemplate = [
      { customerType: '一包' },
      { customerType: '二包' },
      { customerType: '域内合作' },
      { customerType: '域外合作' },
      { customerType: '其它' }
    ]

    const formattedData = []

    // 处理设备数据
    equipmentTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.equipment[template.customerType] || 0
      let newAddition = 0
      let currentReversal = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const equipmentItems = currentPeriodData.filter(item => item.segment === '设备')
        const apiItem = equipmentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString()) || 0
          currentReversal = parseFloat(apiItem.currentReversal?.toString()) || 0
        }
      }

      // 计算累计转回：历史转回 + 当月转回（与BadDebtProvision.vue逻辑一致）
      const historicalReversal = calculateAccumulatedReversal(allMonthsData, '设备', template.customerType, period)
      const accumulatedReversal = historicalReversal + currentReversal

      // 计算坏账准备余额：年初余额 + 本年新增 - 累计转回
      const finalBalance = initialBalance + newAddition - accumulatedReversal

      formattedData.push({
        id: `equipment-${template.customerType}`,
        sector: '设备',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        currentReversal: currentReversal,
        accumulatedReversal: accumulatedReversal,
        finalBalance: finalBalance
      })
    })

    // 处理元件数据
    componentTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.component[template.customerType] || 0
      let newAddition = 0
      let currentReversal = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const componentItems = currentPeriodData.filter(item => item.segment === '元件')
        const apiItem = componentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString()) || 0
          currentReversal = parseFloat(apiItem.currentReversal?.toString()) || 0
        }
      }

      // 计算累计转回：历史转回 + 当月转回（与BadDebtProvision.vue逻辑一致）
      const historicalReversal = calculateAccumulatedReversal(allMonthsData, '元件', template.customerType, period)
      const accumulatedReversal = historicalReversal + currentReversal

      // 计算坏账准备余额：年初余额 + 本年新增 - 累计转回
      const finalBalance = initialBalance + newAddition - accumulatedReversal

      formattedData.push({
        id: `component-${template.customerType}`,
        sector: '元件',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        currentReversal: currentReversal,
        accumulatedReversal: accumulatedReversal,
        finalBalance: finalBalance
      })
    })

    // 处理工程数据
    projectTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.project[template.customerType] || 0
      let newAddition = 0
      let currentReversal = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const projectItems = currentPeriodData.filter(item => item.segment === '工程')
        const apiItem = projectItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString()) || 0
          currentReversal = parseFloat(apiItem.currentReversal?.toString()) || 0
        }
      }

      // 计算累计转回：历史转回 + 当月转回（与BadDebtProvision.vue逻辑一致）
      const historicalReversal = calculateAccumulatedReversal(allMonthsData, '工程', template.customerType, period)
      const accumulatedReversal = historicalReversal + currentReversal

      // 计算坏账准备余额：年初余额 + 本年新增 - 累计转回
      const finalBalance = initialBalance + newAddition - accumulatedReversal

      formattedData.push({
        id: `project-${template.customerType}`,
        sector: '工程',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        currentReversal: currentReversal,
        accumulatedReversal: accumulatedReversal,
        finalBalance: finalBalance
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取坏账准备数据失败:', error)
    // 返回纯静态数据作为备用
    return getBadDebtProvisionStaticData()
  }
}

/**
 * 获取纯静态坏账准备数据（备用）
 */
const getBadDebtProvisionStaticData = () => {
  const equipmentTemplate = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
  const componentTemplate = ['用户']
  const projectTemplate = ['一包', '二包', '域内合作', '域外合作', '其它']

  const formattedData = []

  // 设备数据
  equipmentTemplate.forEach(customerType => {
    const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.equipment[customerType] || 0
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      currentReversal: 0,
      accumulatedReversal: 0,
      finalBalance: initialBalance
    })
  })

  // 元件数据
  componentTemplate.forEach(customerType => {
    const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.component[customerType] || 0
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      currentReversal: 0,
      accumulatedReversal: 0,
      finalBalance: initialBalance
    })
  })

  // 工程数据
  projectTemplate.forEach(customerType => {
    const initialBalance = BAD_DEBT_PROVISION_INITIAL_BALANCE.project[customerType] || 0
    formattedData.push({
      id: `project-${customerType}`,
      sector: '工程',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      currentReversal: 0,
      accumulatedReversal: 0,
      finalBalance: initialBalance
    })
  })

  return formattedData
}



/**
 * 获取产值结构数据
 */
export const getProductionValueData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/production-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        console.log('产值结构数据:', result.data)

        // 转换数据格式以适应月度报表显示
        const formattedData = []

        if (Array.isArray(result.data)) {
          result.data.forEach(item => {
            formattedData.push({
              id: item.id || Math.random(),
              segment: item.segment,
              customerType: item.customerType,
              designCapacity: parseFloat(item.designCapacity || 0),
              yearlyPlan: parseFloat(item.yearlyPlan || 0),
              currentPeriod: parseFloat(item.currentPeriod || 0),
              currentAccumulated: parseFloat(item.currentAccumulated || 0),
              executionProgress: parseFloat(item.executionProgress || 0),
              utilizationRate: parseFloat(item.utilizationRate || 0)
            })
          })
        }

        return formattedData
      }
    } else if (response.status !== 404) {
      console.warn(`获取产值结构数据API调用失败: ${response.status}`)
    }

    // 返回空数据结构
    return getProductionValueStaticData()

  } catch (error) {
    console.error('获取产值结构数据失败:', error)
    return getProductionValueStaticData()
  }
}

/**
 * 获取产值结构静态数据（备用）
 */
const getProductionValueStaticData = () => {
  return [
    // 设备板块
    { id: 1, segment: '设备', customerType: '上海', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 2, segment: '设备', customerType: '国网', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 3, segment: '设备', customerType: '江苏', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 4, segment: '设备', customerType: '输配电内配', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 5, segment: '设备', customerType: '西门子', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 6, segment: '设备', customerType: '同业', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 7, segment: '设备', customerType: '用户', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    // 元件板块
    { id: 8, segment: '元件', customerType: '其它', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 9, segment: '元件', customerType: '用户', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    // 工程板块
    { id: 10, segment: '工程', customerType: '一包', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 11, segment: '工程', customerType: '二包', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 12, segment: '工程', customerType: '域内合作', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 13, segment: '工程', customerType: '域外合作', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 14, segment: '工程', customerType: '其它', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 }
  ]
}

/**
 * 获取生产执行分析数据
 */
export const getProductionExecutionData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/production-execution/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        console.log('生产执行分析数据:', result.data)

        // 转换数据格式以适应月度报表显示
        const formattedData = {
          equipment: [],
          component: {
            yearlyPlan: 0,
            selfProduction: 0,
            semiProduction: 0,
            outsourcing: 0
          },
          project: []
        }

        // 处理设备数据
        if (result.data.equipment && Array.isArray(result.data.equipment)) {
          formattedData.equipment = result.data.equipment.map(item => ({
            id: item.id || Math.random(),
            segment: '设备',
            customerType: item.customerType,
            yearlyPlan: parseFloat(item.yearlyPlan || 0),
            selfProduction: parseFloat(item.selfProduction || 0),
            semiProduction: parseFloat(item.semiProduction || 0),
            outsourcing: parseFloat(item.outsourcing || 0)
          }))
        }

        // 处理元件数据
        if (result.data.component) {
          formattedData.component = {
            yearlyPlan: parseFloat(result.data.component.yearlyPlan || 0),
            selfProduction: parseFloat(result.data.component.selfProduction || 0),
            semiProduction: parseFloat(result.data.component.semiProduction || 0),
            outsourcing: parseFloat(result.data.component.outsourcing || 0)
          }
        }

        // 处理工程数据
        if (result.data.project && Array.isArray(result.data.project)) {
          formattedData.project = result.data.project.map(item => ({
            id: item.id || Math.random(),
            segment: '工程',
            customerType: item.customerType,
            yearlyPlan: parseFloat(item.yearlyPlan || 0),
            selfProduction: parseFloat(item.selfProduction || 0),
            semiProduction: parseFloat(item.semiProduction || 0),
            outsourcing: parseFloat(item.outsourcing || 0)
          }))
        }

        return formattedData
      }
    } else if (response.status !== 404) {
      console.warn(`获取生产执行分析数据API调用失败: ${response.status}`)
    }

    // 返回空数据结构
    return getProductionExecutionStaticData()

  } catch (error) {
    console.error('获取生产执行分析数据失败:', error)
    return getProductionExecutionStaticData()
  }
}

/**
 * 获取生产执行分析静态数据（备用）
 */
const getProductionExecutionStaticData = () => {
  return {
    equipment: [
      { id: 1, segment: '设备', customerType: '上海', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 2, segment: '设备', customerType: '国网', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 3, segment: '设备', customerType: '江苏', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 4, segment: '设备', customerType: '输配电内配', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 5, segment: '设备', customerType: '西门子', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 6, segment: '设备', customerType: '同业', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 7, segment: '设备', customerType: '用户', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 8, segment: '设备', customerType: '其它', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 }
    ],
    component: {
      yearlyPlan: 0,
      selfProduction: 0,
      semiProduction: 0,
      outsourcing: 0
    },
    project: [
      { id: 10, segment: '工程', customerType: '一包', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 11, segment: '工程', customerType: '二包', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 12, segment: '工程', customerType: '域内合作', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 13, segment: '工程', customerType: '域外合作', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 },
      { id: 14, segment: '工程', customerType: '其它', yearlyPlan: 0, selfProduction: 0, semiProduction: 0, outsourcing: 0 }
    ]
  }
}

/**
 * 获取重大投资数据
 */
export const getMajorInvestmentData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/major-investment/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`获取重大投资数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('获取重大投资数据失败:', error)
    return []
  }
}

/**
 * 获取项目跟踪数据
 */
export const getProjectTrackingData = async (period) => {
  try {
    const response = await fetch(`${API_BASE_URL}/project-tracking/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return getDefaultProjectTrackingData()
      }
      throw new Error(`获取项目跟踪数据失败: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      // 后端已经按类别分组好了数据，直接使用
      const formattedData = {
        equipment: result.data.equipment || [],
        component: result.data.component || [],
        engineering: result.data.engineering || []
      }

      // 如果所有类别都没有数据，返回默认数据
      if (formattedData.equipment.length === 0 &&
          formattedData.component.length === 0 &&
          formattedData.engineering.length === 0) {
        return getDefaultProjectTrackingData()
      }

      return formattedData
    }

    return getDefaultProjectTrackingData()
  } catch (error) {
    console.error('获取项目跟踪数据失败:', error)
    return getDefaultProjectTrackingData()
  }
}

/**
 * 获取默认项目跟踪数据
 */
const getDefaultProjectTrackingData = () => {
  return {
    equipment: [
      { customerType: '上海', yearlyPlan: 500000.00, currentPeriod: 0, currentTotal: 0 },
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
      { customerType: '其它', yearlyPlan: 2000.00, currentPeriod: 0, currentTotal: 0 }
    ]
  }
}

/**
 * 获取所有报表数据
 */
export const getAllReportData = async (period) => {
  try {
    const [
      newOrderData,
      businessIncomeData,
      inventoryData,
      mainBusinessCostData,
      costCenterData,
      marginContributionData,
      profitMarginData,
      netProfitData,
      receiptData,
      accountsReceivableData,
      overdueReceivablesData,
      badDebtProvisionData,
      productionValueData,
      productionExecutionData,
      majorInvestmentData,
      projectTrackingData
    ] = await Promise.all([
      getNewOrderData(period),
      getBusinessIncomeData(period),
      getInventoryData(period),
      getMainBusinessCostData(period),
      getCostCenterData(period),
      getMarginContributionData(period),
      getProfitMarginData(period),
      getNetProfitData(period),
      getReceiptData(period),
      getAccountsReceivableData(period),
      getOverdueReceivablesData(period),
      getBadDebtProvisionData(period),
      getProductionValueData(period),
      getProductionExecutionData(period),
      getMajorInvestmentData(period),
      getProjectTrackingData(period)
    ])

    return {
      newOrderData,
      businessIncomeData,
      inventoryData,
      mainBusinessCostData,
      costCenterData,
      marginContributionData,
      profitMarginData,
      netProfitData,
      receiptData,
      accountsReceivableData,
      overdueReceivablesData,
      badDebtProvisionData,
      productionValueData,
      productionExecutionData,
      majorInvestmentData,
      projectTrackingData
    }
  } catch (error) {
    console.error('获取报表数据失败:', error)
    throw error
  }
}

/**
 * 计算关键指标
 */
export const calculateKeyIndicators = (reportData) => {
  const { newOrderData, businessIncomeData, netProfitData } = reportData
  
  // 计算新签订单总计
  const newOrdersTotal = newOrderData.reduce((sum, item) => sum + (item.cumulativeRevenue || 0), 0)
  
  // 计算主营业务收入总计
  const mainRevenueTotal = businessIncomeData
    .filter(item => item.category === '主营业务')
    .reduce((sum, item) => sum + (item.accumulatedIncome || 0), 0)
  
  // 计算净利润总计
  const netProfitTotal = netProfitData.reduce((sum, item) => sum + (item.cumulative || 0), 0)
  
  return {
    newOrders: {
      yearlyPlan: 80000,
      cumulative: newOrdersTotal,
      completionRate: ((newOrdersTotal / 80000) * 100).toFixed(2)
    },
    mainRevenue: {
      yearlyPlan: 55000,
      cumulative: mainRevenueTotal,
      completionRate: ((mainRevenueTotal / 55000) * 100).toFixed(2)
    },
    netProfit: {
      yearlyPlan: 4000,
      cumulative: netProfitTotal,
      completionRate: ((netProfitTotal / 4000) * 100).toFixed(2)
    },
    costCenter: {
      yearlyPlan: 8343.71,
      cumulative: 499,
      ratio: 25.60,
      executionRate: 5.98
    }
  }
}

// 静态逾期应收款年初余额数据（与原始表格完全一致）
const OVERDUE_RECEIVABLES_INITIAL_BALANCE = {
  equipment: {
    '上海': 1200.50,
    '国网': 850.30,
    '江苏': 650.80,
    '输配电内配': 120.00,
    '西门子': 0.00,
    '同业': 980.20,
    '用户': 750.60,
    '其它': 200.40
  },
  component: {
    '用户': 180.25
  },
  project: {
    '一包': 320.15,
    '二包': 150.80,
    '域内合作': 1200.45,
    '域外合作': 680.30,
    '其它': 280.90
  }
}

// 坏账准备静态年初余额数据（与BadDebtProvision.vue一致）
const BAD_DEBT_PROVISION_INITIAL_BALANCE = {
  equipment: {
    '上海': 235.75,
    '国网': 76.77,
    '江苏': 79.63,
    '输配电内配': 163.42,
    '西门子': 0.0,
    '同业': 10.33,
    '用户': 1490.63,
    '其它': 381.37
  },
  component: {
    '用户': 14.76
  },
  project: {
    '一包': 13.94,
    '二包': 66.5,
    '域内合作': 71.29,
    '域外合作': 76.52,
    '其它': 16.89
  }
}

/**
 * 计算逾期应收款历史数据（与OverdueReceivables.vue逻辑一致）
 */
const calculateOverdueReceivablesHistoricalData = async (currentPeriod) => {
  try {
    const [year, month] = currentPeriod.split('-')
    const targetMonth = parseInt(month)
    const historicalData = {
      '设备': {},
      '元件': {},
      '工程': {}
    }

    // 获取当年1月到目标月份前一个月的所有数据
    for (let m = 1; m < targetMonth; m++) {
      const monthStr = m.toString().padStart(2, '0')
      const periodStr = `${year}-${monthStr}`

      try {
        const response = await fetch(`${API_BASE_URL}/overdue-receivables/${periodStr}`)

        if (response.ok) {
          const result = await response.json()

          if (result.success && result.data && Array.isArray(result.data)) {
            // 处理每个历史记录
            result.data.forEach((record) => {
              const segment = record.segment
              const customerType = record.customerType
              const monthlyReceipt = parseFloat(record.monthlyReceipt || '0')

              if (!historicalData[segment]) {
                historicalData[segment] = {}
              }

              if (!historicalData[segment][customerType]) {
                historicalData[segment][customerType] = 0
              }

              // 累加历史月收款
              historicalData[segment][customerType] += monthlyReceipt
            })
          }
        }
      } catch (e) {
        console.error(`加载期间 ${periodStr} 的逾期应收款数据失败:`, e)
      }
    }

    console.log('逾期应收款历史数据加载完成:', historicalData)
    return historicalData
  } catch (error) {
    console.error('计算逾期应收款历史数据失败:', error)
    return { '设备': {}, '元件': {}, '工程': {} }
  }
}

/**
 * 获取逾期应收款数据
 */
export const getOverdueReceivablesData = async (period) => {
  try {
    // 先计算历史数据（与OverdueReceivables.vue逻辑一致）
    const historicalData = await calculateOverdueReceivablesHistoricalData(period)

    // 再获取当期逾期应收款数据
    const response = await fetch(`${API_BASE_URL}/overdue-receivables/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let currentPeriodData = null
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        currentPeriodData = result.data
        console.log('逾期应收款当期数据:', currentPeriodData)
      }
    } else if (response.status !== 404) {
      console.warn(`获取逾期应收款数据API调用失败: ${response.status}`)
    }

    // 初始化数据模板
    const equipmentTemplate = [
      { customerType: '上海' },
      { customerType: '国网' },
      { customerType: '江苏' },
      { customerType: '输配电内配' },
      { customerType: '西门子' },
      { customerType: '同业' },
      { customerType: '用户' },
      { customerType: '其它' }
    ]

    const componentTemplate = [
      { customerType: '用户' }
    ]

    const projectTemplate = [
      { customerType: '一包' },
      { customerType: '二包' },
      { customerType: '域内合作' },
      { customerType: '域外合作' },
      { customerType: '其它' }
    ]

    const formattedData = []

    // 处理设备数据
    equipmentTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.equipment[template.customerType] || 0
      let newAddition = 0
      let monthlyReceipt = 0
      let totalNewAddition = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const equipmentItems = currentPeriodData.filter(item => item.segment === '设备')
        const apiItem = equipmentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString().replace(/,/g, '')) || 0
          monthlyReceipt = parseFloat(apiItem.monthlyReceipt?.toString().replace(/,/g, '')) || 0
          totalNewAddition = parseFloat(apiItem.totalNewAddition?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计已收款：历史收款 + 当月收款（与OverdueReceivables.vue逻辑一致）
      const historicalReceipts = historicalData['设备'][template.customerType] || 0
      const totalReceipt = historicalReceipts + monthlyReceipt

      // 计算收款进度：累计收款 / (年初余额 + 本年新增) × 100%
      const totalOverdue = initialBalance + newAddition
      const progress = totalOverdue > 0 ? ((totalReceipt / totalOverdue) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `equipment-${template.customerType}`,
        sector: '设备',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        totalNewAddition: totalNewAddition,
        monthlyReceipt: monthlyReceipt,
        totalReceipt: totalReceipt,
        progress: progress
      })
    })

    // 处理元件数据
    componentTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.component[template.customerType] || 0
      let newAddition = 0
      let monthlyReceipt = 0
      let totalNewAddition = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const componentItems = currentPeriodData.filter(item => item.segment === '元件')
        const apiItem = componentItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString().replace(/,/g, '')) || 0
          monthlyReceipt = parseFloat(apiItem.monthlyReceipt?.toString().replace(/,/g, '')) || 0
          totalNewAddition = parseFloat(apiItem.totalNewAddition?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计已收款：历史收款 + 当月收款（与OverdueReceivables.vue逻辑一致）
      const historicalReceipts = historicalData['元件'][template.customerType] || 0
      const totalReceipt = historicalReceipts + monthlyReceipt

      // 计算收款进度：累计收款 / (年初余额 + 本年新增) × 100%
      const totalOverdue = initialBalance + newAddition
      const progress = totalOverdue > 0 ? ((totalReceipt / totalOverdue) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `component-${template.customerType}`,
        sector: '元件',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        totalNewAddition: totalNewAddition,
        monthlyReceipt: monthlyReceipt,
        totalReceipt: totalReceipt,
        progress: progress
      })
    })

    // 处理工程数据
    projectTemplate.forEach(template => {
      // 使用静态年初余额
      const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.project[template.customerType] || 0
      let newAddition = 0
      let monthlyReceipt = 0
      let totalNewAddition = 0

      // 获取当期数据
      if (currentPeriodData && Array.isArray(currentPeriodData)) {
        const projectItems = currentPeriodData.filter(item => item.segment === '工程')
        const apiItem = projectItems.find(item => item.customerType === template.customerType)
        if (apiItem) {
          newAddition = parseFloat(apiItem.newAddition?.toString().replace(/,/g, '')) || 0
          monthlyReceipt = parseFloat(apiItem.monthlyReceipt?.toString().replace(/,/g, '')) || 0
          totalNewAddition = parseFloat(apiItem.totalNewAddition?.toString().replace(/,/g, '')) || 0
        }
      }

      // 计算累计已收款：历史收款 + 当月收款（与OverdueReceivables.vue逻辑一致）
      const historicalReceipts = historicalData['工程'][template.customerType] || 0
      const totalReceipt = historicalReceipts + monthlyReceipt

      // 计算收款进度：累计收款 / (年初余额 + 本年新增) × 100%
      const totalOverdue = initialBalance + newAddition
      const progress = totalOverdue > 0 ? ((totalReceipt / totalOverdue) * 100).toFixed(2) : '0.00'

      formattedData.push({
        id: `project-${template.customerType}`,
        sector: '工程',
        customer: template.customerType,
        initialBalance: initialBalance,
        newAddition: newAddition,
        totalNewAddition: totalNewAddition,
        monthlyReceipt: monthlyReceipt,
        totalReceipt: totalReceipt,
        progress: progress
      })
    })

    return formattedData

  } catch (error) {
    console.error('获取逾期应收款数据失败:', error)
    // 返回纯静态数据作为备用
    return getOverdueReceivablesStaticData()
  }
}

/**
 * 获取纯静态逾期应收款数据（备用）
 */
const getOverdueReceivablesStaticData = () => {
  const equipmentTemplate = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
  const componentTemplate = ['用户']
  const projectTemplate = ['一包', '二包', '域内合作', '域外合作', '其它']

  const formattedData = []

  // 设备数据
  equipmentTemplate.forEach(customerType => {
    const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.equipment[customerType] || 0
    formattedData.push({
      id: `equipment-${customerType}`,
      sector: '设备',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      totalNewAddition: 0,
      monthlyReceipt: 0,
      totalReceipt: 0,
      progress: '0.00'
    })
  })

  // 元件数据
  componentTemplate.forEach(customerType => {
    const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.component[customerType] || 0
    formattedData.push({
      id: `component-${customerType}`,
      sector: '元件',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      totalNewAddition: 0,
      monthlyReceipt: 0,
      totalReceipt: 0,
      progress: '0.00'
    })
  })

  // 工程数据
  projectTemplate.forEach(customerType => {
    const initialBalance = OVERDUE_RECEIVABLES_INITIAL_BALANCE.project[customerType] || 0
    formattedData.push({
      id: `project-${customerType}`,
      sector: '工程',
      customer: customerType,
      initialBalance: initialBalance,
      newAddition: 0,
      totalNewAddition: 0,
      monthlyReceipt: 0,
      totalReceipt: 0,
      progress: '0.00'
    })
  })

  return formattedData
}
