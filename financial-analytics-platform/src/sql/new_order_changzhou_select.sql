SELECT 
    category,
    area,
    year_plan AS yearPlan,
    month_plan AS monthPlan,
    month_actual AS monthActual,
    period_complete AS periodComplete,
    year_complete_rate AS yearCompleteRate,
    CASE 
        WHEN pre_bidding IS NULL THEN '--'
        ELSE CAST(pre_bidding AS CHAR)
    END AS preBidding
FROM new_order_changzhou
WHERE period = ?
ORDER BY 
    FIELD(category, '电力公司', '用户', '贸易', '合计', '代理'),
    CASE 
        WHEN category = '电力公司' THEN 
            FIELD(area, '常州', '苏州', '扬州', '南通', '连云港', '无锡', '上海电力公司')
        WHEN category = '代理' THEN
            FIELD(area, '代理转接', '泽源', '南华电气', '南华实业', '合计')
        ELSE area
    END; 