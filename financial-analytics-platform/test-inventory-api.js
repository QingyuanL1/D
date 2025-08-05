// 测试存量结构API的脚本
const testInventoryAPI = async () => {
  const period = '2025-01'
  const API_BASE_URL = 'http://127.0.0.1:3000'
  
  try {
    console.log(`测试获取 ${period} 期间的存量结构数据...`)
    
    const response = await fetch(`${API_BASE_URL}/inventory-structure/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('响应状态:', response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('该期间暂无存量结构数据，这是正常的')
        return
      }
      throw new Error(`获取存量结构数据失败: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('API返回结果:', JSON.stringify(result, null, 2))
    
    if (result.data) {
      console.log('\n=== 数据结构分析 ===')
      console.log('设备数据:', result.data.equipment)
      console.log('元件数据:', result.data.component)
      console.log('工程数据:', result.data.project)
      
      // 模拟数据转换
      const formattedData = []
      
      // 处理设备数据
      if (result.data.equipment && Array.isArray(result.data.equipment)) {
        result.data.equipment.forEach(item => {
          const fluctuation = item.initialAmount === 0 ? '0.00' : 
            (((item.currentAmount || 0) - item.initialAmount) / item.initialAmount * 100).toFixed(2)
          
          formattedData.push({
            id: `equipment-${item.customerType}`,
            sector: '设备',
            customer: item.customerType,
            initialAmount: item.initialAmount || 0,
            currentAmount: item.currentAmount || 0,
            fluctuation: fluctuation
          })
        })
      }
      
      console.log('\n=== 转换后的数据格式 ===')
      console.log(JSON.stringify(formattedData, null, 2))

      // 测试静态年初金额逻辑
      console.log('\n=== 静态年初金额测试 ===')
      const STATIC_INITIAL_DATA = {
        equipment: [
          { customerType: '上海', initialAmount: 39151.53 },
          { customerType: '国网', initialAmount: 7841.48 },
          { customerType: '江苏', initialAmount: 6793.01 }
        ]
      }

      console.log('静态年初金额数据:', STATIC_INITIAL_DATA.equipment)

      // 模拟合并逻辑
      const mergedData = STATIC_INITIAL_DATA.equipment.map(staticItem => {
        let currentAmount = 0
        if (result.data.equipment) {
          const apiItem = result.data.equipment.find(item => item.customerType === staticItem.customerType)
          if (apiItem) {
            currentAmount = Number(apiItem.currentAmount) || 0
          }
        }

        const fluctuation = staticItem.initialAmount === 0 ? '0.00' :
          (((currentAmount - staticItem.initialAmount) / staticItem.initialAmount) * 100).toFixed(2)

        return {
          customer: staticItem.customerType,
          initialAmount: staticItem.initialAmount, // 使用静态数据
          currentAmount: currentAmount, // 使用API数据
          fluctuation: fluctuation
        }
      })

      console.log('合并后的数据:', mergedData)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch')
  testInventoryAPI()
} else {
  // 浏览器环境
  console.log('在浏览器控制台中运行测试...')
  testInventoryAPI()
}
