// 测试新签订单API的脚本
const testNewOrderAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://127.0.0.1:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的新签订单数据...`)
    
    const response = await fetch(`${API_BASE_URL}/new-orders/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('响应状态:', response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无新签订单数据，这是正常的')
        return
      }
      throw new Error(`获取新签订单数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('API返回结果:', JSON.stringify(result, null, 2))
    
    if (result.data) {
      console.log('\n=== 数据结构分析 ===')
      console.log('设备数据:', result.data.equipment)
      console.log('元件数据:', result.data.components)
      console.log('工程数据:', result.data.engineering)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch')
  testNewOrderAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testNewOrderAPI()
}
