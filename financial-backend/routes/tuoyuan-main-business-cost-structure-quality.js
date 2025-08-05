const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取拓源主营业务成本结构与质量数据
router.get('/:period', createBudgetMiddleware('tuoyuan_main_business_cost_structure_quality'), async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer_type, yearly_plan, plan_execution_rate, current_material_cost,
                   cumulative_material_cost, current_labor_cost, cumulative_labor_cost
            FROM tuoyuan_main_business_cost_structure_quality
            WHERE period = ?
            ORDER BY
                CASE category
                    WHEN '设备' THEN 1
                END,
                id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        // 按类别分组数据
        const data = {
            equipment: rows.filter(row => row.category === '设备').map(row => ({
                customerType: row.customer_type,
                yearlyPlan: row.yearly_plan,
                planExecutionRate: row.plan_execution_rate,
                currentMaterialCost: parseFloat(row.current_material_cost),
                cumulativeMaterialCost: parseFloat(row.cumulative_material_cost),
                currentLaborCost: parseFloat(row.current_labor_cost),
                cumulativeLaborCost: parseFloat(row.cumulative_labor_cost)
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取拓源主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存拓源主营业务成本结构与质量数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM tuoyuan_main_business_cost_structure_quality WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || 0,
                    item.planExecutionRate || 0,
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO tuoyuan_main_business_cost_structure_quality (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '拓源主营业务成本结构与质量数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存拓源主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新拓源主营业务成本结构与质量数据
router.put('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM tuoyuan_main_business_cost_structure_quality WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || 0,
                    item.planExecutionRate || 0,
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO tuoyuan_main_business_cost_structure_quality (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '拓源主营业务成本结构与质量数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新拓源主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除拓源主营业务成本结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM tuoyuan_main_business_cost_structure_quality WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '拓源主营业务成本结构与质量数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除拓源主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;