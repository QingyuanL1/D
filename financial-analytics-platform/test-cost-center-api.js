// 测试成本中心API的脚本
const testCostCenterAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://127.0.0.1:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的成本中心数据...`)
    
    const response = await fetch(`${API_BASE_URL}/cost-center-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('响应状态:', response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无成本中心数据，这是正常的')
        return
      }
      throw new Error(`获取成本中心数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('API返回结果:', JSON.stringify(result, null, 2))
    
    if (result.data) {
      console.log('\n=== 数据结构分析 ===')
      console.log('设备数据:', result.data.equipmentData)
      console.log('元件数据:', result.data.componentData)
      console.log('工程数据:', result.data.engineeringData)
      console.log('非主营业务数据:', result.data.nonMainBusiness)
      
      // 测试累计收入计算逻辑
      console.log('\n=== 测试累计收入计算逻辑 ===')
      await testCumulativeIncomeCalculation(period)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 测试累计收入计算逻辑
const testCumulativeIncomeCalculation = async (targetPeriod) => {
  try {
    console.log(`测试累计收入计算，目标期间: ${targetPeriod}`)
    const [year, month] = targetPeriod.split('-')
    const currentMonth = parseInt(month)
    const allData = []
    
    // 获取当年1月到当前月的所有数据
    for (let i = 1; i <= currentMonth; i++) {
      const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
      console.log(`获取期间 ${monthPeriod} 的数据`)
      try {
        const response = await fetch(`${API_BASE_URL}/cost-center-structure/${monthPeriod}`)
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            allData.push({ period: monthPeriod, data: result.data })
            console.log(`成功获取 ${monthPeriod} 的数据`)
          }
        } else {
          console.log(`${monthPeriod} 数据不存在 (${response.status})`)
        }
      } catch (error) {
        console.log(`跳过月份 ${monthPeriod}:`, error.message)
      }
    }
    
    console.log('加载的所有月份数据:', allData.map(d => d.period))
    
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
            console.log(`${monthData.period} ${categoryType} ${customerType}: ${value}`)
          }
        }
      }
      
      return total
    }
    
    // 测试设备数据累计计算
    console.log('\n=== 设备数据累计计算测试 ===')
    const equipmentTemplate = ['上海', '国网', '江苏']
    
    equipmentTemplate.forEach(customerType => {
      const historicalCumulative = calculateCumulativeForCategory('equipmentData', customerType)
      console.log(`${customerType} 历史累计收入: ${historicalCumulative}`)
      
      // 获取当期数据
      let currentMonthIncome = 0
      const currentData = allData.find(d => d.period === targetPeriod)
      if (currentData && currentData.data.equipmentData) {
        const apiItem = currentData.data.equipmentData.find(item => item.customerType === customerType)
        if (apiItem) {
          currentMonthIncome = Number(apiItem.currentMonthIncome) || 0
        }
      }
      
      const totalCumulative = historicalCumulative + currentMonthIncome
      const percentage = totalCumulative > 0 ? ((currentMonthIncome / totalCumulative) * 100).toFixed(2) : '0.00'
      
      console.log(`${customerType} 最终数据:`, {
        cumulativeIncome: totalCumulative,
        currentMonthIncome: currentMonthIncome,
        percentage: percentage
      })
    })
    
  } catch (error) {
    console.error('累计收入计算测试失败:', error)
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch')
  testCostCenterAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testCostCenterAPI()
}
