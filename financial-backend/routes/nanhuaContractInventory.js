const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华在建工程情况（合同存量）数据
router.get('/:period', createBudgetMiddleware('在建工程'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const query = `
            SELECT * FROM nanhua_contract_inventory 
            WHERE period = ?
            ORDER BY id
        `;
        
        const [rows] = await pool.execute(query, [period]);
        
        if (rows.length === 0) {
            // 如果没有数据，返回固定结构
            const fixedData = {
                yunJianProjects: [
                    { projectName: '一包项目', beginningRollingData: 1900.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '二包项目', beginningRollingData: 500.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '域内合作项目', beginningRollingData: 500.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '域外合作项目', beginningRollingData: 180.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '新能源项目', beginningRollingData: 280.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '苏州项目', beginningRollingData: 460.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '自接项目', beginningRollingData: 3180.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                    { projectName: '其他', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 }
                ],
                yunJianHeLiProject: { projectName: '运检合力项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
                engineeringProjects: [
                    { projectName: '建筑工程项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 }
                ]
            };
            
            return res.json({
                success: true,
                data: fixedData,
                message: '使用默认数据'
            });
        }
        
        // 整理数据格式
        const contractData = {
            yunJianProjects: [],
            yunJianHeLiProject: {},
            engineeringProjects: []
        };
        
        rows.forEach(row => {
            const currentAmount = parseFloat(row.current_amount) || 0;
            const beginningRollingData = parseFloat(row.initial_balance) || 0;
            const accumulatedAmount = parseFloat(row.accumulated_amount) || 0;
            const fluctuationRate = parseFloat(row.fluctuation_rate) || 0;
            
            const projectData = {
                projectName: row.customer_name,
                beginningRollingData: beginningRollingData,
                currentAmount: currentAmount,
                accumulatedAmount: accumulatedAmount,
                fluctuationRate: fluctuationRate
            };
            
            // 根据类别分组
            if (row.category === '工程项目') {
                contractData.yunJianProjects.push(projectData);
            } else if (row.category === '运检合力项目') {
                contractData.yunJianHeLiProject = projectData;
            } else if (row.category === '旧工程项目') {
                contractData.engineeringProjects.push(projectData);
            }
        });
        
        res.json({
            success: true,
            data: contractData
        });
        
    } catch (error) {
        console.error('获取南华在建工程情况（合同存量）数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存南华在建工程情况（合同存量）数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({
                success: false,
                message: '期间和数据不能为空'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 删除该期间的旧数据
            await connection.execute('DELETE FROM nanhua_contract_inventory WHERE period = ?', [period]);
            
            // 准备插入数据
            const insertQuery = `
                INSERT INTO nanhua_contract_inventory 
                (period, customer_name, initial_balance, yearly_increase, current_amount, accumulated_amount, monthly_transfer, yearly_transfer, fluctuation_rate, category, monthly_increase)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            // 插入工程项目数据
            if (data.yunJianProjects && Array.isArray(data.yunJianProjects)) {
                for (const project of data.yunJianProjects) {
                    await connection.execute(insertQuery, [
                        period,
                        project.projectName,
                        project.beginningRollingData || 0,  // initial_balance
                        0,                                  // yearly_increase
                        project.currentAmount || 0,
                        project.accumulatedAmount || 0,
                        0,                                  // monthly_transfer
                        0,                                  // yearly_transfer
                        project.fluctuationRate || 0,
                        '工程项目',                          // category
                        project.currentAmount || 0          // monthly_increase
                    ]);
                }
            }
            
            // 插入运检合力项目数据
            if (data.yunJianHeLiProject) {
                const project = data.yunJianHeLiProject;
                await connection.execute(insertQuery, [
                    period,
                    project.projectName,
                    project.beginningRollingData || 0,
                    0,
                    project.currentAmount || 0,
                    project.accumulatedAmount || 0,
                    0,
                    0,
                    project.fluctuationRate || 0,
                    '运检合力项目',
                    project.currentAmount || 0
                ]);
            }
            
            // 插入工程项目数据
            if (data.engineeringProjects && Array.isArray(data.engineeringProjects)) {
                for (const project of data.engineeringProjects) {
                    await connection.execute(insertQuery, [
                        period,
                        project.projectName,
                        project.beginningRollingData || 0,
                        0,
                        project.currentAmount || 0,
                        project.accumulatedAmount || 0,
                        0,
                        0,
                        project.fluctuationRate || 0,
                        '工程项目',
                        project.currentAmount || 0
                    ]);
                }
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                message: '数据保存成功'
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('保存南华在建工程情况（合同存量）数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;