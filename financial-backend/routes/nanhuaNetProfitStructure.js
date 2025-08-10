const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华净利润结构数据
router.get('/:period', createBudgetMiddleware('净利润结构'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 获取当前期间的数据
        const [currentRows] = await pool.execute(
            'SELECT * FROM nanhua_net_profit_structure WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        // 获取主营业务年度计划 - 从主营业务净利润贡献中汇总
        let mainBusinessPlan = '0';
        try {
            const mainBusinessResponse = await pool.execute(
                'SELECT SUM(yearly_plan) as total_plan FROM nanhua_main_business_net_profit WHERE period = ?',
                [period]
            );
            if (mainBusinessResponse[0].length > 0 && mainBusinessResponse[0][0].total_plan) {
                mainBusinessPlan = mainBusinessResponse[0][0].total_plan.toString();
            }
        } catch (error) {
            console.log('获取主营业务年度计划失败:', error);
        }

        // 获取非主营业务年度计划 - 从非主营业务净利润贡献中汇总
        let nonMainBusinessPlan = '0';
        try {
            const nonMainBusinessResponse = await pool.execute(
                'SELECT SUM(annual_plan) as total_plan FROM nanhua_non_main_business_net_profit WHERE period = ?',
                [period]
            );
            if (nonMainBusinessResponse[0].length > 0 && nonMainBusinessResponse[0][0].total_plan) {
                nonMainBusinessPlan = nonMainBusinessResponse[0][0].total_plan.toString();
            }
        } catch (error) {
            console.log('获取非主营业务年度计划失败:', error);
        }
        
        // 计算累计值：获取从年初到当前期间的所有数据
        const year = period.split('-')[0];
        const [cumulativeRows] = await pool.execute(
            'SELECT period, data FROM nanhua_net_profit_structure WHERE period >= ? AND period <= ? ORDER BY period',
            [`${year}-01`, period]
        );
        
        let mainBusinessCumulative = 0;
        let nonMainBusinessCumulative = 0;
        
        cumulativeRows.forEach(row => {
            try {
                const periodData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                if (periodData && periodData.mainBusiness && periodData.nonMainBusiness) {
                    mainBusinessCumulative += parseFloat(periodData.mainBusiness?.current || periodData.mainBusiness?.actual || 0);
                    nonMainBusinessCumulative += parseFloat(periodData.nonMainBusiness?.current || periodData.nonMainBusiness?.actual || 0);
                }
            } catch (e) {
                console.error('累计计算时JSON解析失败:', e);
            }
        });
        
        // 构建响应数据
        let responseData;
        if (currentRows.length === 0) {
            // 没有当前期间数据，返回默认结构，计算执行进度
            const mainBusinessProgress = parseFloat(mainBusinessPlan) > 0 ? 
                (mainBusinessCumulative / parseFloat(mainBusinessPlan) * 100).toFixed(2) + '%' : '0.00%';
            const nonMainBusinessProgress = parseFloat(nonMainBusinessPlan) > 0 ? 
                (nonMainBusinessCumulative / parseFloat(nonMainBusinessPlan) * 100).toFixed(2) + '%' : '0.00%';
            const totalPlan = parseFloat(mainBusinessPlan) + parseFloat(nonMainBusinessPlan);
            const totalCumulative = mainBusinessCumulative + nonMainBusinessCumulative;
            const totalProgress = totalPlan > 0 ? 
                (totalCumulative / totalPlan * 100).toFixed(2) + '%' : '0.00%';
            
            responseData = {
                mainBusiness: { 
                    plan: mainBusinessPlan, 
                    current: '0', 
                    cumulative: mainBusinessCumulative.toFixed(2),
                    progress: mainBusinessProgress 
                },
                nonMainBusiness: { 
                    plan: nonMainBusinessPlan, 
                    current: '0', 
                    cumulative: nonMainBusinessCumulative.toFixed(2),
                    progress: nonMainBusinessProgress 
                },
                total: { 
                    plan: totalPlan.toFixed(2), 
                    current: '0', 
                    cumulative: totalCumulative.toFixed(2),
                    progress: totalProgress 
                }
            };
        } else {
            // 有当前期间数据，合并当前期间和累计数据
            let currentData = currentRows[0].data;
            if (typeof currentData === 'string') {
                try {
                    currentData = JSON.parse(currentData);
                } catch (e) {
                    console.error('JSON解析失败:', e);
                    currentData = {};
                }
            }
            
            // 确保数据结构完整
            if (!currentData.mainBusiness) currentData.mainBusiness = {};
            if (!currentData.nonMainBusiness) currentData.nonMainBusiness = {};
            if (!currentData.total) currentData.total = {};
            
            // 计算执行进度
            const mainBusinessProgress = parseFloat(mainBusinessPlan) > 0 ? 
                (mainBusinessCumulative / parseFloat(mainBusinessPlan) * 100).toFixed(2) + '%' : '0.00%';
            const nonMainBusinessProgress = parseFloat(nonMainBusinessPlan) > 0 ? 
                (nonMainBusinessCumulative / parseFloat(nonMainBusinessPlan) * 100).toFixed(2) + '%' : '0.00%';
            const totalPlan = parseFloat(mainBusinessPlan) + parseFloat(nonMainBusinessPlan);
            const totalCumulative = mainBusinessCumulative + nonMainBusinessCumulative;
            const totalProgress = totalPlan > 0 ? 
                (totalCumulative / totalPlan * 100).toFixed(2) + '%' : '0.00%';
            
            responseData = {
                mainBusiness: {
                    plan: mainBusinessPlan,
                    current: currentData.mainBusiness?.current || currentData.mainBusiness?.actual || '0',
                    cumulative: mainBusinessCumulative.toFixed(2),
                    progress: mainBusinessProgress
                },
                nonMainBusiness: {
                    plan: nonMainBusinessPlan,
                    current: currentData.nonMainBusiness?.current || currentData.nonMainBusiness?.actual || '0',
                    cumulative: nonMainBusinessCumulative.toFixed(2),
                    progress: nonMainBusinessProgress
                },
                total: {
                    plan: totalPlan.toFixed(2),
                    current: currentData.total?.current || currentData.total?.actual || '0',
                    cumulative: totalCumulative.toFixed(2),
                    progress: totalProgress
                }
            };
        }
        
        res.json({
            success: true,
            data: responseData,
            period: period,
            updated_at: currentRows.length > 0 ? currentRows[0].updated_at : null
        });
        
    } catch (error) {
        console.error('获取南华净利润结构数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 计算南华净利润结构数据
router.get('/calculate/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 这里可以添加具体的计算逻辑
        // 目前返回空数据，等待后续完善
        res.json({
            success: true,
            data: {
                customers: []
            },
            message: '计算功能待实现'
        });
        
    } catch (error) {
        console.error('计算南华净利润结构数据失败:', error);
        res.status(500).json({
            success: false,
            message: '计算数据失败',
            error: error.message
        });
    }
});

// 保存南华净利润结构数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        // 验证必填字段
        if (!period || !data) {
            return res.status(400).json({ 
                success: false, 
                message: '期间和数据不能为空' 
            });
        }
        
        // 验证period格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ 
                success: false, 
                message: '无效的期间格式，应为YYYY-MM' 
            });
        }
        
        // 检查是否已存在该期间的数据
        const [existingRows] = await pool.execute(
            'SELECT id FROM nanhua_net_profit_structure WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE nanhua_net_profit_structure SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO nanhua_net_profit_structure (period, data) VALUES (?, ?)',
                [period, JSON.stringify(data)]
            );
        }
        
        res.json({
            success: true,
            message: '数据保存成功',
            period
        });
        
    } catch (error) {
        console.error('保存南华净利润结构数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router; 