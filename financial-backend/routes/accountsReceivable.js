const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取应收账款情况数据
router.get('/:period', createBudgetMiddleware('accounts_receivable_situation'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 获取应收账款数据
        const [rows] = await pool.execute(
            'SELECT * FROM accounts_receivable WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        let accountsReceivableData = null;
        if (rows.length > 0) {
            accountsReceivableData = rows[0].data;
        }
        
        // 获取坏账准备数据
        let badDebtProvisionData = [];
        try {
            const [badDebtRows] = await pool.execute(
                'SELECT * FROM bad_debt_provision WHERE period = ? ORDER BY created_at DESC LIMIT 1',
                [period]
            );
            
            if (badDebtRows.length > 0) {
                badDebtProvisionData = badDebtRows[0].data || [];
            }
        } catch (badDebtError) {
            console.warn('获取坏账准备数据失败，使用空数组:', badDebtError.message);
        }
        
        // 如果没有当月应收账款数据，计算累计值并生成数据
        if (!accountsReceivableData) {
            console.log(`没有${period}的应收账款数据，计算累计值...`);
            
            // 生成所有客户的基础数据结构
            const baseData = [
                // 设备板块
                { segment: '设备', customerType: '上海' },
                { segment: '设备', customerType: '国网' },
                { segment: '设备', customerType: '江苏' },
                { segment: '设备', customerType: '输配电内配' },
                { segment: '设备', customerType: '西门子' },
                { segment: '设备', customerType: '同业' },
                { segment: '设备', customerType: '用户' },
                { segment: '设备', customerType: '其它' },
                // 元件板块
                { segment: '元件', customerType: '用户' },
                // 工程板块
                { segment: '工程', customerType: '一包' },
                { segment: '工程', customerType: '二包' },
                { segment: '工程', customerType: '域内合作' },
                { segment: '工程', customerType: '域外合作' },
                { segment: '工程', customerType: '其它' }
            ];
            
            // 计算累计值
            accountsReceivableData = await calculateCumulativeData(baseData, period);
        }
        
        // 实时计算调整后的当期应收余额（减去坏账准备本月新增）
        const adjustAccountsReceivableData = (data, badDebtData) => {
            if (!Array.isArray(data)) return data;
            
            return data.map(item => {
                // 查找对应的坏账准备本月新增
                const badDebtItem = badDebtData.find(bd => 
                    bd.segment === item.segment && bd.customerType === item.customerType
                );
                // 使用newAddition字段作为本月新增
                const badDebtNewAddition = badDebtItem ? (parseFloat(badDebtItem.newAddition) || 0) : 0;
                
                // 重新计算当期应收余额，使用保存的累计值
                const initialBalance = parseFloat(item.initialBalance?.toString().replace(/,/g, '')) || 0;
                const totalNewInvoice = parseFloat(item.totalNewInvoice?.toString().replace(/,/g, '')) || 0;
                const totalReceipt = parseFloat(item.totalReceipt?.toString().replace(/,/g, '')) || 0;
                
                // 当期应收余额 = 年初余额 + 累计新增开票 - 累计收款 - 坏账准备本月新增
                const adjustedCurrentBalance = initialBalance + totalNewInvoice - totalReceipt - badDebtNewAddition;
                
                return {
                    ...item,
                    currentBalance: adjustedCurrentBalance.toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
                    badDebtProvisionDeduction: badDebtNewAddition, // 显示坏账准备扣减金额
                    originalCurrentBalance: item.currentBalance || adjustedCurrentBalance.toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) // 保留原始余额用于对比
                };
            });
        };
        
        const adjustedData = adjustAccountsReceivableData(accountsReceivableData, badDebtProvisionData);
        
        res.json({
            success: true,
            data: adjustedData,
            period: period,
            updated_at: rows.length > 0 ? rows[0].updated_at : new Date().toISOString(),
            badDebtProvisionData: badDebtProvisionData,
            isCalculated: rows.length === 0 // 标识数据是否为计算得出
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 计算累计值的辅助函数
async function calculateCumulativeData(baseData, targetPeriod) {
    const [year, month] = targetPeriod.split('-');
    const targetMonth = parseInt(month);
    
    // 预算数据映射
    const budgetDataMap = {
        '设备': {
            '上海': 3558.98,
            '国网': 5190.93,
            '江苏': 1154.56,
            '输配电内配': 176.86,
            '西门子': 0,
            '同业': 2028.53,
            '用户': 1727.31,
            '其它': 303.55
        },
        '元件': {
            '用户': 458.54
        },
        '工程': {
            '一包': 385.47,
            '二包': 189.12,
            '域内合作': 2772.83,
            '域外合作': 752.14,
            '其它': 488.67
        }
    };
    
    const result = [];
    
    for (const baseItem of baseData) {
        // 获取年初余额
        const initialBalance = budgetDataMap[baseItem.segment]?.[baseItem.customerType] || 0;
        
        // 计算累计新增开票和累计收款
        let totalNewInvoice = 0;
        let totalReceipt = 0;
        
        // 查询从1月到目标月份的所有数据
        for (let i = 1; i <= targetMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
            
            try {
                const [monthRows] = await pool.execute(
                    'SELECT * FROM accounts_receivable WHERE period = ? ORDER BY created_at DESC LIMIT 1',
                    [monthPeriod]
                );
                
                if (monthRows.length > 0 && monthRows[0].data) {
                    const monthData = monthRows[0].data;
                    const monthItem = monthData.find(item => 
                        item.segment === baseItem.segment && 
                        item.customerType === baseItem.customerType
                    );
                    
                    if (monthItem) {
                        const newInvoice = parseFloat(monthItem.newInvoice?.toString().replace(/,/g, '')) || 0;
                        const currentReceipt = parseFloat(monthItem.currentReceipt?.toString().replace(/,/g, '')) || 0;
                        
                        totalNewInvoice += newInvoice;
                        totalReceipt += currentReceipt;
                    }
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error.message);
            }
        }
        
        // 计算当期应收余额
        const currentBalance = initialBalance + totalNewInvoice - totalReceipt;
        
        result.push({
            segment: baseItem.segment,
            customerType: baseItem.customerType,
            initialBalance: initialBalance.toString(),
            newInvoice: '0', // 当月新增开票为0（因为没有当月数据）
            totalNewInvoice: totalNewInvoice.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
            currentReceipt: '0', // 当月收款为0（因为没有当月数据）
            totalReceipt: totalReceipt.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
            currentBalance: currentBalance.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
            yearlyPlan: initialBalance
        });
    }
    
    return result;
}

// 保存应收账款情况数据
router.post('/', async (req, res) => {
    const { period, data } = req.body;
    
    // 验证必填字段
    if (!period || !data) {
        return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 检查是否已存在该期间的数据
        const [existingRows] = await pool.execute(
            'SELECT id FROM accounts_receivable WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE accounts_receivable SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO accounts_receivable (period, data) VALUES (?, ?)',
                [period, JSON.stringify(data)]
            );
        }
        
        res.json({
            success: true,
            message: '数据保存成功',
            period
        });
        
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 删除指定期间的数据
router.delete('/:period', async (req, res) => {
    const { period } = req.params;
    
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [result] = await pool.execute(
            'DELETE FROM accounts_receivable WHERE period = ?',
            [period]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '未找到指定期间的数据' });
        }
        
        res.json({
            success: true,
            message: '数据删除成功'
        });
        
    } catch (error) {
        console.error('删除数据失败:', error);
        res.status(500).json({ error: '删除数据失败' });
    }
});

// 获取所有期间列表
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT period, created_at, updated_at FROM accounts_receivable ORDER BY period DESC'
        );
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('获取期间列表失败:', error);
        res.status(500).json({ error: '获取期间列表失败' });
    }
});

module.exports = router;