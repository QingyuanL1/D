// 测试边际贡献率API的脚本
const testMarginContributionAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://127.0.0.1:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的边际贡献率数据...`)
    
    // 1. 测试自动计算API
    console.log('\n=== 测试自动计算API ===')
    try {
      const calculateResponse = await fetch(`${API_BASE_URL}/business-contribution/calculate/${period}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('自动计算响应状态:', calculateResponse.status)
      
      if (calculateResponse.ok) {
        const calculateResult = await calculateResponse.json()
        console.log('自动计算结果:', JSON.stringify(calculateResult, null, 2))
      } else {
        console.log('自动计算失败')
      }
    } catch (calcError) {
      console.log('自动计算异常:', calcError.message)
    }

    // 2. 测试专用表数据API
    console.log('\n=== 测试专用表数据API ===')
    try {
      const response = await fetch(`${API_BASE_URL}/business-contribution/${period}`)
      console.log('专用表响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('专用表数据:', JSON.stringify(result, null, 2))
      } else {
        console.log('专用表数据不存在')
      }
    } catch (error) {
      console.log('专用表数据异常:', error.message)
    }

    // 3. 测试系统表数据API
    console.log('\n=== 测试系统表数据API ===')
    try {
      const formResponse = await fetch(`${API_BASE_URL}/forms/submission/business-contribution/${period}`)
      console.log('系统表响应状态:', formResponse.status)
      
      if (formResponse.ok) {
        const formResult = await formResponse.json()
        console.log('系统表数据:', JSON.stringify(formResult, null, 2))
      } else {
        console.log('系统表数据不存在')
      }
    } catch (error) {
      console.log('系统表数据异常:', error.message)
    }

    // 4. 测试静态年度计划数据
    console.log('\n=== 静态年度计划数据 ===')
    const STATIC_YEARLY_PLANS = {
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
    
    console.log('静态年度计划数据:', STATIC_YEARLY_PLANS)
    
    // 5. 模拟数据转换逻辑
    console.log('\n=== 模拟数据转换逻辑 ===')
    const mockApiData = {
      equipment: {
        shanghai: { actual: 30.5 },
        national: { actual: 20.2 },
        jiangsu: { actual: 10.8 }
      },
      components: {
        users: { actual: 27.3 }
      },
      engineering: {
        package1: { actual: 38.2 },
        package2: { actual: 32.1 }
      }
    }
    
    const formattedData = []
    
    // 处理设备数据
    const equipmentMapping = {
      shanghai: '上海',
      national: '国网',
      jiangsu: '江苏'
    }
    
    Object.entries(equipmentMapping).forEach(([key, customerName]) => {
      const yearlyPlan = STATIC_YEARLY_PLANS.equipment[key] || 0
      const currentActual = mockApiData.equipment?.[key]?.actual || 0
      const deviation = (currentActual - yearlyPlan).toFixed(2)
      
      formattedData.push({
        sector: '设备',
        customer: customerName,
        yearlyPlan: yearlyPlan,
        currentActual: currentActual,
        deviation: deviation
      })
    })
    
    console.log('转换后的数据格式:', formattedData)

    // 6. 测试百分比解析逻辑
    console.log('\n=== 测试百分比解析逻辑 ===')
    const parsePercentage = (percentStr) => {
      if (!percentStr) return 0
      // 移除%符号并转换为数字
      const numStr = percentStr.toString().replace('%', '')
      const num = parseFloat(numStr)
      return isNaN(num) ? 0 : num
    }

    const testPercentages = ['28.22%', '0%', '15.5%', '', null, undefined, '25']
    testPercentages.forEach(test => {
      const result = parsePercentage(test)
      console.log(`parsePercentage('${test}') = ${result}`)
    })

    // 7. 测试实际API数据解析
    console.log('\n=== 测试实际API数据解析 ===')
    const realApiData = {
      equipment: {
        shanghai: {plan: "28.22%", actual: "0%", difference: "0%"},
        national: {plan: "18.50%", actual: "5.2%", difference: "-13.3%"}
      },
      components: {
        users: {plan: "25.00%", actual: "0%", difference: "0%"}
      },
      engineering: {
        package1: {plan: "26.00%", actual: "0%", difference: "0%"}
      }
    }

    console.log('模拟真实API数据解析:')

    // 解析设备数据
    const equipmentMapping = {
      shanghai: '上海',
      national: '国网'
    }

    Object.entries(equipmentMapping).forEach(([key, customerName]) => {
      if (realApiData.equipment && realApiData.equipment[key]) {
        const apiItem = realApiData.equipment[key]
        const yearlyPlan = parsePercentage(apiItem.plan)
        const currentActual = parsePercentage(apiItem.actual)
        const deviation = Number((currentActual - yearlyPlan).toFixed(2))

        console.log(`${customerName}: plan=${yearlyPlan}%, actual=${currentActual}%, deviation=${deviation}%`)
      }
    })
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch')
  testMarginContributionAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testMarginContributionAPI()
}
