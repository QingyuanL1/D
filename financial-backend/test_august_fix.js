const fetch = require('node-fetch');

async function testAugustFix() {
    try {
        console.log('=== 测试8月非主营业务数据修复 ===');
        
        const response = await fetch('http://127.0.0.1:3000/non-main-business/2025-08');
        
        console.log('响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('请求成功!');
            console.log('返回数据结构:', {
                success: result.success,
                dataLength: result.data ? result.data.length : 0,
                period: result.period
            });
            
            console.log('\n8月数据详情:');
            if (result.data && Array.isArray(result.data)) {
                result.data.forEach(item => {
                    console.log(`${item.category}(${item.id}): 年度计划=${item.yearlyPlan}, 当期=${item.currentPeriod}, 累计=${item.cumulative}`);
                });
                
                // 计算总累计
                const totalCumulative = result.data.reduce((sum, item) => sum + (item.cumulative || 0), 0);
                console.log(`\n总累计: ${totalCumulative.toFixed(2)}`);
            }
        } else {
            const errorText = await response.text();
            console.log('请求失败:', errorText);
        }
        
    } catch (error) {
        console.error('测试过程出错:', error);
    }
}

testAugustFix(); 