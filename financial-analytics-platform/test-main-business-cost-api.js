// 测试主营业务成本API的脚本
const testMainBusinessCostAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://127.0.0.1:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的主营业务成本数据...`)
    
    const response = await fetch(`${API_BASE_URL}/main-business-cost/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('响应状态:', response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无主营业务成本数据，这是正常的')
        return
      }
      throw new Error(`获取主营业务成本数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('API返回结果:', JSON.stringify(result, null, 2))
    
    if (result.data) {
      console.log('\n=== 数据结构分析 ===')
      console.log('设备数据:', result.data.equipment)
      console.log('元件数据:', result.data.component)
      console.log('工程数据:', result.data.project)
      
      // 测试静态年度计划逻辑
      console.log('\n=== 静态年度计划测试 ===')
      const STATIC_YEARLY_PLANS = {
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
      
      console.log('静态年度计划数据:', STATIC_YEARLY_PLANS)
      
      // 模拟数据合并逻辑
      const formattedData = []
      
      // 处理设备数据
      Object.entries(STATIC_YEARLY_PLANS.equipment).forEach(([customerType, yearlyPlan]) => {
        let currentMaterialCost = 0
        let cumulativeMaterialCost = 0
        let currentLaborCost = 0
        let cumulativeLaborCost = 0
        
        if (result.data.equipment) {
          const apiItem = result.data.equipment.find(item => item.customerType === customerType)
          if (apiItem) {
            currentMaterialCost = Number(apiItem.currentMaterialCost) || 0
            cumulativeMaterialCost = Number(apiItem.cumulativeMaterialCost) || 0
            currentLaborCost = Number(apiItem.currentLaborCost) || 0
            cumulativeLaborCost = Number(apiItem.cumulativeLaborCost) || 0
          }
        }
        
        const totalCumulativeCost = cumulativeMaterialCost + cumulativeLaborCost
        const executionRate = yearlyPlan > 0 ? ((totalCumulativeCost / yearlyPlan) * 100).toFixed(2) : '0.00'
        
        formattedData.push({
          sector: '设备',
          customer: customerType,
          yearlyPlan: yearlyPlan, // 使用静态数据
          executionRate: executionRate,
          currentMaterialCost: currentMaterialCost, // 使用API数据
          cumulativeMaterialCost: cumulativeMaterialCost, // 使用API数据
          currentLaborCost: currentLaborCost, // 使用API数据
          cumulativeLaborCost: cumulativeLaborCost // 使用API数据
        })
      })
      
      console.log('\n=== 合并后的数据格式 ===')
      console.log(JSON.stringify(formattedData.slice(0, 3), null, 2)) // 只显示前3条

      // 测试累计计算逻辑
      console.log('\n=== 测试累计计算逻辑 ===')
      await testCumulativeCalculation(period)
    }

  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 测试累计计算逻辑
const testCumulativeCalculation = async (targetPeriod) => {
  try {
    console.log(`测试累计计算，目标期间: ${targetPeriod}`)
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
      } else {
        console.log(`第 ${index + 1} 个月的数据无效或不存在`)
      }
    })

    console.log('累计数据计算完成:', cumulativeData)

    // 测试最终数据格式
    const STATIC_YEARLY_PLANS = {
      equipment: {
        '上海': 15000.00,
        '国网': 8000.00,
        '江苏': 5000.00
      }
    }

    const finalData = []
    Object.entries(STATIC_YEARLY_PLANS.equipment).forEach(([customerType, yearlyPlan]) => {
      const cumulative = cumulativeData.equipment[customerType] || { materialCost: 0, laborCost: 0 }
      const totalCumulativeCost = cumulative.materialCost + cumulative.laborCost
      const executionRate = yearlyPlan > 0 ? ((totalCumulativeCost / yearlyPlan) * 100).toFixed(2) : '0.00'

      finalData.push({
        customer: customerType,
        yearlyPlan: yearlyPlan, // 静态数据
        executionRate: executionRate, // 计算得出
        cumulativeMaterialCost: cumulative.materialCost, // 累计计算
        cumulativeLaborCost: cumulative.laborCost // 累计计算
      })
    })

    console.log('最终数据格式:', finalData)

  } catch (error) {
    console.error('累计计算测试失败:', error)
  }
}
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch')
  testMainBusinessCostAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testMainBusinessCostAPI()
}
