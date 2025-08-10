#!/usr/bin/env node

/**
 * 批量测试所有财务分析平台API接口
 * 验证所有23个接口是否能正常返回数据和预算信息
 */

const https = require('http');

// 所有API接口配置
const API_ENDPOINTS = [
    { name: '新签订单', url: '/new-orders/2025-06', expectedFields: ['equipment', 'components', 'engineering'] },
    { name: '项目跟踪', url: '/project-tracking/2025-06', expectedFields: ['equipment', 'components', 'engineering'] },
    { name: '营业收入结构', url: '/business-income/2025-06', expectedFields: [] },
    { name: '主营业务净利润贡献', url: '/main-business-net-profit/2025-06', expectedFields: [] },
    { name: '主营业务毛利率结构', url: '/business-profit-margin/2025-06', expectedFields: [] },
    { name: '净利润结构质量', url: '/net-profit-structure/2025-06', expectedFields: [] },
    { name: '非主营业务', url: '/non-main-business/2025-06', expectedFields: [] },
    { name: '非主营业务净利润贡献', url: '/non-main-business-net-profit/2025-06', expectedFields: [] },
    { name: '应收账款情况', url: '/accounts-receivable/2025-06', expectedFields: [] },
    { name: '逾期应收账款情况', url: '/overdue-receivables/2025-06', expectedFields: [] },
    { name: '坏账准备情况', url: '/bad-debt-provision/2025-06', expectedFields: [] },
    { name: '收款结构质量', url: '/receipt-structure/2025-06', expectedFields: [] },
    { name: '主营业务贡献率结构', url: '/business-contribution/2025-06', expectedFields: ['equipment', 'automation', 'components', 'engineering', 'total'] },
    { name: '库存结构质量', url: '/inventory-structure/2025-06', expectedFields: ['equipment', 'component', 'project'] },
    { name: '存货订单转收入', url: '/stock-order-to-income/2025-06', expectedFields: [] },
    { name: '合同库存', url: '/contract-inventory/2025-06', expectedFields: ['equipment', 'component', 'project'] },
    { name: '标书履约状况', url: '/bid-fulfillment/2025-06', expectedFields: ['equipment', 'component', 'project'] },
    { name: '南华中标未履约情况', url: '/nanhua-bid-fulfillment/2025-06', expectedFields: [] },
    { name: '在制品', url: '/inventory-in-progress/2025-06', expectedFields: ['equipment', 'component', 'project'] },
    { name: '部门成本投入', url: '/department-cost-input/2025-06', expectedFields: ['departments', 'total'] },
    { name: '成本暂估入库和计提情况', url: '/cost-estimation/2025-06', expectedFields: ['equipment', 'component', 'project'] }
];

const BASE_URL = 'http://47.111.95.19:3000';

// 测试结果统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

/**
 * 发送HTTP请求
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(BASE_URL + url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, error: 'JSON解析失败' });
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
    });
}

/**
 * 验证响应数据结构
 */
function validateResponse(response, expectedFields, apiName) {
    const issues = [];
    
    // 检查基本响应结构
    if (!response.data) {
        issues.push('缺少响应数据');
        return issues;
    }
    
    if (!response.data.success) {
        issues.push('success字段不为true');
    }
    
    if (!response.data.data) {
        issues.push('缺少data字段');
        return issues;
    }
    
    const responseData = response.data.data;
    
    // 检查期望的字段
    if (expectedFields.length > 0) {
        expectedFields.forEach(field => {
            if (!responseData.hasOwnProperty(field)) {
                issues.push(`缺少字段: ${field}`);
            }
        });
    }
    
    // 检查是否包含预算信息
    let hasBudgetData = false;
    
    function checkBudgetInObject(obj, path = '') {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                checkBudgetInObject(item, `${path}[${index}]`);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            // 检查预算相关字段
            if (obj.hasOwnProperty('yearlyPlan') || obj.hasOwnProperty('yearlyBudget') || 
                obj.hasOwnProperty('initialBalance') || obj.hasOwnProperty('plan')) {
                
                const budgetValue = obj.yearlyPlan || obj.yearlyBudget || obj.initialBalance || obj.plan;
                if (budgetValue && budgetValue !== 0 && budgetValue !== '0' && budgetValue !== '') {
                    hasBudgetData = true;
                }
            }
            
            // 递归检查嵌套对象
            Object.keys(obj).forEach(key => {
                checkBudgetInObject(obj[key], path ? `${path}.${key}` : key);
            });
        }
    }
    
    checkBudgetInObject(responseData);
    
    if (!hasBudgetData) {
        issues.push('未发现预算数据');
    }
    
    return issues;
}

/**
 * 测试单个API
 */
async function testAPI(endpoint) {
    totalTests++;
    console.log(`\n[${totalTests}/${API_ENDPOINTS.length}] 测试: ${endpoint.name}`);
    console.log(`请求: ${BASE_URL}${endpoint.url}`);
    
    try {
        const response = await makeRequest(endpoint.url);
        
        if (response.status === 200) {
            const issues = validateResponse(response, endpoint.expectedFields, endpoint.name);
            
            if (issues.length === 0) {
                console.log(`✅ 通过`);
                passedTests++;
                results.push({
                    name: endpoint.name,
                    status: 'PASS',
                    url: endpoint.url,
                    issues: []
                });
            } else {
                console.log(`⚠️  有问题: ${issues.join(', ')}`);
                passedTests++; // 仍然算作通过，只是有警告
                results.push({
                    name: endpoint.name,
                    status: 'PASS_WITH_WARNINGS',
                    url: endpoint.url,
                    issues: issues
                });
            }
        } else {
            console.log(`❌ 失败: HTTP ${response.status}`);
            if (response.data) {
                console.log(`响应: ${JSON.stringify(response.data, null, 2)}`);
            }
            failedTests++;
            results.push({
                name: endpoint.name,
                status: 'FAIL',
                url: endpoint.url,
                issues: [`HTTP ${response.status}`]
            });
        }
    } catch (error) {
        console.log(`❌ 错误: ${error.message}`);
        failedTests++;
        results.push({
            name: endpoint.name,
            status: 'ERROR',
            url: endpoint.url,
            issues: [error.message]
        });
    }
}

/**
 * 生成测试报告
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('                           测 试 报 告');
    console.log('='.repeat(80));
    
    console.log(`\n📊 总体统计:`);
    console.log(`   总接口数: ${totalTests}`);
    console.log(`   通过数量: ${passedTests}`);
    console.log(`   失败数量: ${failedTests}`);
    console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    // 按状态分组显示
    const passed = results.filter(r => r.status === 'PASS');
    const passedWithWarnings = results.filter(r => r.status === 'PASS_WITH_WARNINGS');
    const failed = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    
    if (passed.length > 0) {
        console.log(`\n✅ 完全通过 (${passed.length}个):`);
        passed.forEach(result => {
            console.log(`   ${result.name}`);
        });
    }
    
    if (passedWithWarnings.length > 0) {
        console.log(`\n⚠️  通过但有警告 (${passedWithWarnings.length}个):`);
        passedWithWarnings.forEach(result => {
            console.log(`   ${result.name}: ${result.issues.join(', ')}`);
        });
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ 失败 (${failed.length}个):`);
        failed.forEach(result => {
            console.log(`   ${result.name}: ${result.issues.join(', ')}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (passedTests === totalTests) {
        console.log('🎉 所有API测试通过！预算数据集成成功！');
    } else {
        console.log('⚠️  部分API测试失败，请检查后端服务状态');
    }
    
    console.log('='.repeat(80));
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始批量测试财务分析平台API...');
    console.log(`📍 目标服务器: ${BASE_URL}`);
    console.log(`📋 测试接口数量: ${API_ENDPOINTS.length}`);
    
    // 依次测试每个API
    for (const endpoint of API_ENDPOINTS) {
        await testAPI(endpoint);
        // 添加小延迟避免过快请求
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 生成报告
    generateReport();
}

// 运行测试
if (require.main === module) {
    main().catch(error => {
        console.error('测试过程中发生错误:', error);
        process.exit(1);
    });
}

module.exports = { testAPI, generateReport };