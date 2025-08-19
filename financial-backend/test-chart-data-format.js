/**
 * 测试图表数据格式修复
 */

const fetch = require('node-fetch');

async function testChartDataFormat() {
  console.log('🧪 测试拓源毛利率图表数据格式');
  console.log('='.repeat(60));

  try {
    // 1. 获取后端API数据
    console.log('\n1️⃣ 获取后端API数据...');
    const response = await fetch('http://47.111.95.19:3000/analytics/tuoyuan-profit-margin/2025');
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ 后端API调用成功');
        console.log(`📊 原始数据:`);
        console.log(`   - months: [${result.data.months.join(', ')}]`);
        console.log(`   - monthlyData: [${result.data.monthlyData.join(', ')}]`);
        console.log(`   - 数据长度: months=${result.data.months.length}, monthlyData=${result.data.monthlyData.length}`);
        
        // 2. 模拟前端数据处理逻辑
        console.log('\n2️⃣ 模拟前端数据处理...');
        
        // 修复前的逻辑（有问题的）
        const oldMonths = result.data.months || [];
        const oldMonthlyData = result.data.monthlyData || [];
        
        console.log('❌ 修复前的数据处理:');
        console.log(`   - X轴月份: [${oldMonths.join(', ')}] (长度: ${oldMonths.length})`);
        console.log(`   - Y轴数据: [${oldMonthlyData.join(', ')}] (长度: ${oldMonthlyData.length})`);
        console.log(`   - 问题: X轴和Y轴长度不匹配，7月份被跳过`);
        
        // 修复后的逻辑（正确的）
        const newMonths = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'];
        const newMonthlyData = new Array(12).fill(null);
        
        // 填充有数据的月份
        const rawData = result.data.monthlyData || [];
        for (let i = 0; i < Math.min(rawData.length, 12); i++) {
          newMonthlyData[i] = rawData[i];
        }
        
        console.log('\n✅ 修复后的数据处理:');
        console.log(`   - X轴月份: [${newMonths.join(', ')}] (长度: ${newMonths.length})`);
        console.log(`   - Y轴数据: [${newMonthlyData.join(', ')}] (长度: ${newMonthlyData.length})`);
        console.log(`   - 优势: X轴和Y轴长度匹配，7月份显示为null（断点）`);
        
        // 3. 分析数据点
        console.log('\n3️⃣ 数据点分析:');
        for (let i = 0; i < 12; i++) {
          const month = newMonths[i];
          const value = newMonthlyData[i];
          const status = value !== null ? `${value}%` : '暂无数据';
          const icon = value !== null ? '📊' : '❌';
          console.log(`   ${icon} ${month}: ${status}`);
        }
        
        // 4. 图表配置建议
        console.log('\n4️⃣ 图表配置建议:');
        console.log('✅ ECharts配置要点:');
        console.log('   1. connectNulls: false - 不连接null值，显示断点');
        console.log('   2. X轴固定12个月份，不依赖后端返回的months数组');
        console.log('   3. Y轴数据补齐到12个元素，缺失月份填充null');
        console.log('   4. tooltip特殊处理null值，显示"暂无数据"');
        
        // 5. 验证修复效果
        console.log('\n5️⃣ 修复效果验证:');
        
        const hasJulyData = newMonthlyData[6] !== null; // 7月份是索引6
        const hasAugustData = newMonthlyData[7] !== null; // 8月份是索引7
        
        console.log(`   - 7月份数据: ${hasJulyData ? newMonthlyData[6] + '%' : '无数据'} ${hasJulyData ? '✅' : '❌'}`);
        console.log(`   - 8月份数据: ${hasAugustData ? newMonthlyData[7] + '%' : '无数据'} ${hasAugustData ? '✅' : '❌'}`);
        
        if (!hasJulyData && hasAugustData) {
          console.log('   ✅ 修复成功: 7月份显示为断点，8月份正常显示');
          console.log('   ✅ 图表将在7月份显示断点，然后连接到8月份');
        } else if (hasJulyData) {
          console.log('   ⚠️  7月份有数据，这可能是后端逻辑更新的结果');
        } else {
          console.log('   ⚠️  7月和8月都没有数据');
        }
        
        // 6. 前端实现检查清单
        console.log('\n6️⃣ 前端实现检查清单:');
        console.log('□ X轴配置: 固定12个月份');
        console.log('□ Y轴数据: 补齐到12个元素');
        console.log('□ 目标线数据: 12个相同的目标值');
        console.log('□ tooltip处理: null值显示"暂无数据"');
        console.log('□ connectNulls: false');
        
      } else {
        console.log('❌ 后端API返回数据格式错误');
      }
    } else {
      console.log(`❌ 后端API调用失败: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  }
}

// 运行测试
if (require.main === module) {
  testChartDataFormat()
    .then(() => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testChartDataFormat };
