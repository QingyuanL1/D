const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取主营业务成本结构与质量数据
router.get('/:period', createBudgetMiddleware('main_business_cost_structure'), async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer_type, yearly_plan, plan_execution_rate, current_material_cost,
                   cumulative_material_cost, current_labor_cost, cumulative_labor_cost
            FROM main_business_cost
            WHERE period = ?
            ORDER BY
                CASE category
                    WHEN '设备' THEN 1
                    WHEN '元件' THEN 2
                    WHEN '工程' THEN 3
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
            })),
            component: rows.filter(row => row.category === '元件').map(row => ({
                customerType: row.customer_type,
                yearlyPlan: row.yearly_plan,
                planExecutionRate: row.plan_execution_rate,
                currentMaterialCost: parseFloat(row.current_material_cost),
                cumulativeMaterialCost: parseFloat(row.cumulative_material_cost),
                currentLaborCost: parseFloat(row.current_labor_cost),
                cumulativeLaborCost: parseFloat(row.cumulative_labor_cost)
            })),
            project: rows.filter(row => row.category === '工程').map(row => ({
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
        console.error('获取主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存主营业务成本结构与质量数据
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
        await pool.execute('DELETE FROM main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
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
                INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新主营业务成本结构与质量数据
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
        await pool.execute('DELETE FROM main_business_cost WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }

        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
                    item.currentMaterialCost || 0,
                    item.cumulativeMaterialCost || 0,
                    item.currentLaborCost || 0,
                    item.cumulativeLaborCost || 0
                ]);
            });
        }

        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.yearlyPlan || '',
                    item.planExecutionRate || '',
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
                INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除主营业务成本结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM main_business_cost WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '主营业务成本结构与质量数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除主营业务成本结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 重新计算累计成本（从年初到目标月份的所有当月成本求和）
router.post('/recalculate-cumulative/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const [year, month] = period.split('-');
        
        console.log(`开始重新计算${period}期间的累计成本`);
        
        // 获取该期间所有已有的成本数据作为基础结构
        const [existingRows] = await pool.execute(`
            SELECT DISTINCT category, customer_type 
            FROM main_business_cost 
            WHERE period LIKE '${year}-%'
            ORDER BY category, customer_type
        `);
        
        const cumulativeResults = {};
        
        // 为每个类别和客户类型计算累计成本
        for (const row of existingRows) {
            const key = `${row.category}-${row.customer_type}`;
            cumulativeResults[key] = {
                category: row.category,
                customer_type: row.customer_type,
                cumulative_material_cost: 0,
                cumulative_labor_cost: 0
            };
            
            // 从年初到目标月份，累加所有当月成本
            for (let m = 1; m <= parseInt(month); m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                
                const [monthRows] = await pool.execute(`
                    SELECT current_material_cost, current_labor_cost
                    FROM main_business_cost 
                    WHERE period = ? AND category = ? AND customer_type = ?
                `, [monthPeriod, row.category, row.customer_type]);
                
                if (monthRows.length > 0) {
                    const monthData = monthRows[0];
                    const currentMaterialCost = parseFloat(monthData.current_material_cost) || 0;
                    const currentLaborCost = parseFloat(monthData.current_labor_cost) || 0;
                    
                    cumulativeResults[key].cumulative_material_cost += currentMaterialCost;
                    cumulativeResults[key].cumulative_labor_cost += currentLaborCost;
                    
                    if (currentMaterialCost > 0 || currentLaborCost > 0) {
                        console.log(`${key} ${monthPeriod}: 材料+${currentMaterialCost}, 人工+${currentLaborCost}, 累计材料=${cumulativeResults[key].cumulative_material_cost}, 累计人工=${cumulativeResults[key].cumulative_labor_cost}`);
                    }
                }
            }
        }
        
        // 更新目标期间的累计值
        for (const key in cumulativeResults) {
            const result = cumulativeResults[key];
            await pool.execute(`
                UPDATE main_business_cost 
                SET cumulative_material_cost = ?, cumulative_labor_cost = ?
                WHERE period = ? AND category = ? AND customer_type = ?
            `, [
                result.cumulative_material_cost,
                result.cumulative_labor_cost,
                period,
                result.category,
                result.customer_type
            ]);
        }
        
        console.log('累计成本重新计算完成');
        
        res.json({
            success: true,
            message: '累计成本重新计算完成',
            period: period,
            results: cumulativeResults
        });
        
    } catch (error) {
        console.error('重新计算累计成本失败:', error);
        res.status(500).json({
            success: false,
            message: '重新计算累计成本失败',
            error: error.message
        });
    }
});

module.exports = router;