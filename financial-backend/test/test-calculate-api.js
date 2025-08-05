const http = require('http');

// HTTP请求函数
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: { error: data } });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// 测试主营业务净利润计算接口
async function testCalculateAPI() {
    console.log('=== 主营业务净利润当期金额计算接口测试 ===\n');

    // 测试用例
    const testCases = [
        '2025-01',
        '2025-02',
        '2024-12', // 可能不存在的数据
        'invalid-format' // 无效格式
    ];

    for (const period of testCases) {
        console.log(`测试期间: ${period}`);
        console.log('=' .repeat(50));

        try {
            const response = await makeRequest(`/main-business-net-profit/calculate/${period}`);

            if (response.status === 200 && response.data.success) {
                console.log('✅ 请求成功');
                console.log(`期间: ${response.data.period}`);
                console.log(`计算公式: ${response.data.calculation.formula}`);
                
                // 显示各板块数据统计
                const { equipment, components, engineering } = response.data.data;
                
                console.log('\n📊 数据统计:');
                console.log(`设备板块: ${equipment.length} 个客户`);
                console.log(`元件板块: ${components.length} 个客户`);
                console.log(`工程板块: ${engineering.length} 个客户`);
                
                // 显示有数据的客户
                console.log('\n💰 有当期金额的客户:');
                
                const allCustomers = [
                    ...equipment.map(item => ({ ...item, segment: '设备' })),
                    ...components.map(item => ({ ...item, segment: '元件' })),
                    ...engineering.map(item => ({ ...item, segment: '工程' }))
                ];
                
                const activeCustomers = allCustomers.filter(item => item.currentAmount !== 0);
                
                if (activeCustomers.length > 0) {
                    activeCustomers.forEach(customer => {
                        console.log(`  ${customer.segment} - ${customer.customer}: ${customer.currentAmount.toFixed(2)}`);
                        console.log(`    (累计收入: ${customer.accumulatedIncome}, 材料成本: ${customer.materialCost}, 成本中心: ${customer.centerIncome})`);
                    });
                } else {
                    console.log('  无活跃客户数据');
                }
                
                // 计算总计
                const totalCurrentAmount = allCustomers.reduce((sum, item) => sum + item.currentAmount, 0);
                console.log(`\n💵 总当期金额: ${totalCurrentAmount.toFixed(2)}`);
                
            } else {
                console.log(`❌ HTTP错误 ${response.status}:`, response.data.error || response.data.message || response.data);
            }
            
        } catch (error) {
            console.log('❌ 网络错误:', error.message);
        }
        
        console.log('\n');
    }
}

// 运行测试
if (require.main === module) {
    testCalculateAPI().catch(console.error);
}

module.exports = { testCalculateAPI };
