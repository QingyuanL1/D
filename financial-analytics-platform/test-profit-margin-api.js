// 测试毛利率API的脚本
const testProfitMarginAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://47.111.95.19:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的毛利率数据...`)
    
    // 1. 测试自动计算API
    console.log('\n=== 测试自动计算API ===')
    try {
      const calculateResponse = await fetch(`${API_BASE_URL}/business-profit-margin/calculate/${period}`)
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
      const response = await fetch(`${API_BASE_URL}/business-profit-margin/${period}`)
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
      const formResponse = await fetch(`${API_BASE_URL}/forms/submission/business-profit-margin/${period}`)
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
    
    console.log('静态年度计划数据:', STATIC_YEARLY_PLANS)
    
    // 5. 测试百分比解析逻辑
    console.log('\n=== 测试百分比解析逻辑 ===')
    const parsePercentage = (percentStr) => {
      if (!percentStr) return 0
      // 移除%符号并转换为数字
      const numStr = percentStr.toString().replace('%', '')
      const num = parseFloat(numStr)
      return isNaN(num) ? 0 : num
    }
    
    const testPercentages = ['21.99%', '13.83%', '0%', '', null, undefined, '25.5']
    testPercentages.forEach(test => {
      const result = parsePercentage(test)
      console.log(`parsePercentage('${test}') = ${result}`)
    })
    
    // 6. 模拟数据转换逻辑
    console.log('\n=== 模拟数据转换逻辑 ===')
    const mockApiData = {
      equipment: {
        shanghai: {plan: "21.99%", actual: "25.5%", difference: "3.51%"},
        national: {plan: "13.83%", actual: "16.2%", difference: "2.37%"}
      },
      components: {
        users: {plan: "20.00%", actual: "22.3%", difference: "2.3%"}
      },
      engineering: {
        package1: {plan: "26.00%", actual: "28.5%", difference: "2.5%"}
      }
    }
    
    console.log('模拟真实API数据解析:')
    
    // 解析设备数据
    const equipmentMapping = {
      shanghai: '上海',
      national: '国网'
    }
    
    Object.entries(equipmentMapping).forEach(([key, customerName]) => {
      if (mockApiData.equipment && mockApiData.equipment[key]) {
        const apiItem = mockApiData.equipment[key]
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
  testProfitMarginAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testProfitMarginAPI()
}
