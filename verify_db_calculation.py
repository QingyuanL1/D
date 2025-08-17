#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import requests
import mysql.connector

def verify_db_calculation():
    """使用数据库原始数据验证边际贡献率计算"""
    
    print("=== 使用数据库原始数据计算边际贡献率 ===")
    
    try:
        # 连接数据库
        conn = mysql.connector.connect(
            host='47.111.95.19',
            user='root',
            password='12345678',
            database='finance'
        )
        cursor = conn.cursor()
        
        # 获取收入原始数据
        cursor.execute("SELECT data FROM main_business_income WHERE period = '2025-07-01'")
        income_result = cursor.fetchone()
        income_raw_data = json.loads(income_result[0])
        
        # 获取成本数据
        cursor.execute("""
            SELECT category, customer_type, cumulative_material_cost 
            FROM main_business_cost 
            WHERE period = '2025-07'
        """)
        cost_results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # 构建成本映射
        cost_map = {}
        for category, customer_type, material_cost in cost_results:
            # 映射中文到英文
            segment_map = {'设备': 'equipment', '元件': 'components', '工程': 'engineering'}
            segment = segment_map.get(category, category)
            
            # 客户映射
            customer_map = {
                '上海': 'shanghai', '国网': 'national', '江苏': 'jiangsu',
                '输配电内配': 'power', '西门子': 'siemens', '同业': 'peers',
                '用户': 'users', '其它': 'others', '一包': 'package1', '二包': 'package2',
                '域内合作': 'domestic', '域外合作': 'international'
            }
            customer_key = customer_map.get(customer_type.strip(), 'others')
            
            key = f"{segment}-{customer_key}"
            cost_map[key] = float(material_cost or 0)
        
        print("成本映射表:")
        for key, cost in cost_map.items():
            if cost > 0:
                print(f"  {key}: {cost:.2f}")
        
        # 计算各板块边际贡献率
        total_income = 0
        total_cost = 0
        
        print("\n详细计算:")
        
        segment_totals = {'设备': {'income': 0, 'cost': 0}, '元件': {'income': 0, 'cost': 0}, '工程': {'income': 0, 'cost': 0}}
        
        for item in income_raw_data:
            segment_cn = item.get('segment', '')
            customer_cn = item.get('customer', '').strip()
            income = float(item.get('accumulatedIncome', 0))
            
            # 映射到英文
            segment_map = {'设备': 'equipment', '元件': 'components', '工程': 'engineering'}
            segment_en = segment_map.get(segment_cn, segment_cn)
            
            customer_map = {
                '上海': 'shanghai', '国网': 'national', '江苏': 'jiangsu',
                '输配电内配': 'power', '西门子': 'siemens', '同业': 'peers',
                '用户': 'users', '其它': 'others', '一包': 'package1', '二包': 'package2',
                '域内合作': 'domestic', '域外合作': 'international'
            }
            customer_en = customer_map.get(customer_cn, 'others')
            
            # 查找对应成本
            key = f"{segment_en}-{customer_en}"
            cost = cost_map.get(key, 0)
            
            # 计算边际贡献率
            if income > 0:
                contribution_rate = ((income - cost) / income) * 100
            else:
                contribution_rate = 0
            
            total_income += income
            total_cost += cost
            
            segment_totals[segment_cn]['income'] += income
            segment_totals[segment_cn]['cost'] += cost
            
            if income > 10 or cost > 10:  # 只显示有意义的数据
                print(f"{segment_cn}-{customer_cn}: 收入={income:.2f}, 成本={cost:.2f}, 贡献率={contribution_rate:.2f}%")
        
        # 计算各板块汇总
        print("\n板块汇总:")
        for segment_cn, totals in segment_totals.items():
            income = totals['income']
            cost = totals['cost']
            if income > 0:
                rate = ((income - cost) / income) * 100
                print(f"{segment_cn}: 收入={income:.2f}, 成本={cost:.2f}, 贡献率={rate:.2f}%")
        
        # 总体边际贡献率
        total_rate = ((total_income - total_cost) / total_income) * 100 if total_income > 0 else 0
        
        print(f"\n=== 最终结果 ===")
        print(f"总收入: {total_income:.2f}")
        print(f"总成本: {total_cost:.2f}")
        print(f"总体边际贡献率: {total_rate:.2f}%")
        
        # 与后端结果对比
        print(f"\n=== 与后端对比 ===")
        response = requests.post("http://47.111.95.19:3000/business-contribution/calculate/2025-07")
        backend_result = response.json()
        backend_rate = float(backend_result['data']['total']['actual'].replace('%', ''))
        print(f"后端计算结果: {backend_rate:.2f}%")
        print(f"差异: {abs(total_rate - backend_rate):.2f}%")
        
    except Exception as e:
        print(f"计算失败: {e}")

if __name__ == "__main__":
    verify_db_calculation() 