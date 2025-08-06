const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 获取指定期间的上海南华兰陵实业有限公司现金流量表数据
 */
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 验证期间格式 (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
        }

        console.log(`获取上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        const query = 'SELECT * FROM shanghai_nanhua_lanling_cash_flow WHERE period = ?';
        const [rows] = await pool.query(query, [period]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            data: rows[0].data,
            message: '数据获取成功'
        });

    } catch (error) {
        console.error('获取上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 保存上海南华兰陵实业有限公司现金流量表数据
 */
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;

        // 验证必要字段
        if (!period || !data) {
            return res.status(400).json({
                success: false,
                error: '期间和数据不能为空'
            });
        }

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
        }

        console.log(`保存上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        // 将数据转换为JSON字符串（如果还不是的话）
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

        // 使用 INSERT ... ON DUPLICATE KEY UPDATE 来实现插入或更新
        const query = `
            INSERT INTO shanghai_nanhua_lanling_cash_flow (period, data) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE 
                data = VALUES(data),
                updated_at = CURRENT_TIMESTAMP
        `;

        const [result] = await pool.query(query, [period, jsonData]);

        res.json({
            success: true,
            message: result.insertId ? '数据保存成功' : '数据更新成功',
            data: {
                period: period,
                affected_rows: result.affectedRows
            }
        });

    } catch (error) {
        console.error('保存上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 获取所有期间的数据列表
 */
router.get('/', async (req, res) => {
    try {
        console.log('获取上海南华兰陵实业有限公司现金流量表所有期间数据');

        const query = `
            SELECT period, created_at, updated_at 
            FROM shanghai_nanhua_lanling_cash_flow 
            ORDER BY period DESC
        `;
        
        const [rows] = await pool.query(query);

        res.json({
            success: true,
            data: rows,
            message: '数据获取成功'
        });

    } catch (error) {
        console.error('获取上海南华兰陵实业有限公司现金流量表期间列表失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 删除指定期间的数据
 */
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
        }

        console.log(`删除上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        const query = 'DELETE FROM shanghai_nanhua_lanling_cash_flow WHERE period = ?';
        const [result] = await pool.query(query, [period]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            message: '数据删除成功'
        });

    } catch (error) {
        console.error('删除上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

module.exports = router; 