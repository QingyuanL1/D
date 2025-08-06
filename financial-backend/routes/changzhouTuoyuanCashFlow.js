const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * 常州拓源现金流量表路由
 * 提供现金流量表数据的增删改查功能
 */

// 获取指定期间的现金流量表数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取常州拓源现金流量表数据，期间: ${period}`);

        const query = `
            SELECT * FROM changzhou_tuoyuan_cash_flow 
            WHERE period = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        const [rows] = await pool.execute(query, [period]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            data: rows[0].data,
            period: rows[0].period,
            last_updated: rows[0].updated_at
        });

    } catch (error) {
        console.error('获取常州拓源现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '获取数据失败',
            details: error.message
        });
    }
});

// 保存或更新现金流量表数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;

        if (!period || !data) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：period 和 data'
            });
        }

        console.log(`保存常州拓源现金流量表数据，期间: ${period}`);

        // 检查是否已存在该期间的数据
        const checkQuery = `
            SELECT id FROM changzhou_tuoyuan_cash_flow 
            WHERE period = ?
        `;
        const [existingRows] = await pool.execute(checkQuery, [period]);

        let query;
        let params;

        if (existingRows.length > 0) {
            // 更新现有数据
            query = `
                UPDATE changzhou_tuoyuan_cash_flow 
                SET data = ?, updated_at = CURRENT_TIMESTAMP
                WHERE period = ?
            `;
            params = [typeof data === 'string' ? data : JSON.stringify(data), period];
            console.log('更新现有数据');
        } else {
            // 插入新数据
            query = `
                INSERT INTO changzhou_tuoyuan_cash_flow (period, data, created_at, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            params = [period, typeof data === 'string' ? data : JSON.stringify(data)];
            console.log('插入新数据');
        }

        await pool.execute(query, params);

        res.json({
            success: true,
            message: '现金流量表数据保存成功',
            period: period
        });

    } catch (error) {
        console.error('保存常州拓源现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '保存数据失败',
            details: error.message
        });
    }
});

// 获取所有期间的现金流量表数据列表
router.get('/', async (req, res) => {
    try {
        console.log('获取常州拓源现金流量表数据列表');

        const query = `
            SELECT period, created_at, updated_at
            FROM changzhou_tuoyuan_cash_flow 
            ORDER BY period DESC
        `;

        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            data: rows,
            total: rows.length
        });

    } catch (error) {
        console.error('获取常州拓源现金流量表数据列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取数据列表失败',
            details: error.message
        });
    }
});

// 删除指定期间的现金流量表数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`删除常州拓源现金流量表数据，期间: ${period}`);

        const query = `
            DELETE FROM changzhou_tuoyuan_cash_flow 
            WHERE period = ?
        `;

        const [result] = await pool.execute(query, [period]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            message: '现金流量表数据删除成功',
            period: period
        });

    } catch (error) {
        console.error('删除常州拓源现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '删除数据失败',
            details: error.message
        });
    }
});

// 批量导入现金流量表数据
router.post('/batch-import', async (req, res) => {
    try {
        const { data: batchData } = req.body;

        if (!Array.isArray(batchData) || batchData.length === 0) {
            return res.status(400).json({
                success: false,
                error: '批量数据格式错误或为空'
            });
        }

        console.log(`批量导入常州拓源现金流量表数据，数量: ${batchData.length}`);

        const insertQuery = `
            INSERT INTO changzhou_tuoyuan_cash_flow (period, data, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
            data = VALUES(data),
            updated_at = CURRENT_TIMESTAMP
        `;

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const item of batchData) {
            try {
                if (!item.period || !item.data) {
                    throw new Error('缺少必要字段：period 或 data');
                }

                await pool.execute(insertQuery, [
                    item.period,
                    typeof item.data === 'string' ? item.data : JSON.stringify(item.data)
                ]);
                successCount++;
            } catch (error) {
                errorCount++;
                errors.push({
                    period: item.period,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: '批量导入完成',
            summary: {
                total: batchData.length,
                success: successCount,
                failed: errorCount
            },
            errors: errors
        });

    } catch (error) {
        console.error('批量导入常州拓源现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '批量导入失败',
            details: error.message
        });
    }
});

// 获取现金流量表数据统计信息
router.get('/stats/summary', async (req, res) => {
    try {
        console.log('获取常州拓源现金流量表统计信息');

        const queries = {
            totalRecords: 'SELECT COUNT(*) as count FROM changzhou_tuoyuan_cash_flow',
            latestPeriod: 'SELECT period FROM changzhou_tuoyuan_cash_flow ORDER BY period DESC LIMIT 1',
            oldestPeriod: 'SELECT period FROM changzhou_tuoyuan_cash_flow ORDER BY period ASC LIMIT 1',
            lastUpdated: 'SELECT MAX(updated_at) as last_updated FROM changzhou_tuoyuan_cash_flow'
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            const [rows] = await pool.execute(query);
            results[key] = rows[0];
        }

        res.json({
            success: true,
            data: {
                totalRecords: results.totalRecords.count,
                latestPeriod: results.latestPeriod?.period || null,
                oldestPeriod: results.oldestPeriod?.period || null,
                lastUpdated: results.lastUpdated.last_updated
            }
        });

    } catch (error) {
        console.error('获取常州拓源现金流量表统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: '获取统计信息失败',
            details: error.message
        });
    }
});

// 导出现金流量表数据
router.get('/export/:format', async (req, res) => {
    try {
        const { format } = req.params;
        const { period } = req.query;

        if (!['json', 'csv'].includes(format)) {
            return res.status(400).json({
                success: false,
                error: '不支持的导出格式，仅支持 json 和 csv'
            });
        }

        console.log(`导出常州拓源现金流量表数据，格式: ${format}, 期间: ${period || '全部'}`);

        let query = 'SELECT * FROM changzhou_tuoyuan_cash_flow';
        let params = [];

        if (period) {
            query += ' WHERE period = ?';
            params.push(period);
        }

        query += ' ORDER BY period DESC';

        const [rows] = await pool.execute(query, params);

        if (format === 'json') {
            res.json({
                success: true,
                data: rows,
                exportTime: new Date().toISOString(),
                totalRecords: rows.length
            });
        } else if (format === 'csv') {
            // 简单的CSV导出
            const csvHeaders = 'Period,Data,Created At,Updated At\n';
            const csvRows = rows.map(row => 
                `"${row.period}","${row.data.replace(/"/g, '""')}","${row.created_at}","${row.updated_at}"`
            ).join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=changzhou_tuoyuan_cash_flow_${period || 'all'}.csv`);
            res.send(csvHeaders + csvRows);
        }

    } catch (error) {
        console.error('导出常州拓源现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '导出数据失败',
            details: error.message
        });
    }
});

module.exports = router; 