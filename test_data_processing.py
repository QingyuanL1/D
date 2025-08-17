#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import requests
import mysql.connector

def test_data_processing():
    """测试数据处理逻辑"""
    
    # 1. 直接从数据库获取原始数据
    print("=== 从数据库获取原始数据 ===")
    try:
        conn = mysql.connector.connect(
            host='47.111.95.19',
            user='root',
            password='12345678',
            database='finance'
        )
        cursor = conn.cursor()
        
        # 获取收入数据
        cursor.execute("SELECT data FROM main_business_income WHERE period = '2025-07-01'")
        income_result = cursor.fetchone()
        
        if income_result:
            income_raw_data = json.loads(income_result[0])
            print("数据库中的收入数据类型:", type(income_raw_data))
            print("数据库中的收入数据长度:", len(income_raw_data) if isinstance(income_raw_data, list) else "不是数组")
            
            if isinstance(income_raw_data, list):
                print("数组格式 - 前3项:")
                for i, item in enumerate(income_raw_data[:3]):
                    print(f"  {i+1}. {item.get('segment', 'N/A')}-{item.get('customer', 'N/A')}: {item.get('accumulatedIncome', 0)}")
            else:
                print("对象格式 - 键:", list(income_raw_data.keys()) if isinstance(income_raw_data, dict) else "未知格式")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"数据库查询失败: {e}")
        return
    
    # 2. 通过API获取数据
    print("\n=== 通过API获取数据 ===")
    try:
        api_response = requests.get("http://47.111.95.19:3000/main-business-income/2025-07")
        api_data = api_response.json()['data']
        print("API返回的数据类型:", type(api_data))
        print("API返回的数据键:", list(api_data.keys()) if isinstance(api_data, dict) else "不是对象")
        
        if isinstance(api_data, dict) and 'equipment' in api_data:
            print("设备板块项目数:", len(api_data['equipment']))
            print("工程板块项目数:", len(api_data['engineering']))
            
            # 查找域内合作的数据
            for item in api_data['engineering']:
                if '域内' in item['customer']:
                    print(f"API中域内合作: {item['customer']} -> {item['accumulatedIncome']}")
        
    except Exception as e:
        print(f"API查询失败: {e}")
    
    # 3. 计算差异
    print("\n=== 数据差异分析 ===")
    if income_raw_data and isinstance(income_raw_data, list):
        db_total = sum(float(item.get('accumulatedIncome', 0)) for item in income_raw_data)
        print(f"数据库原始数据总收入: {db_total:.2f}")
        
        # 按板块分组计算
        db_by_segment = {}
        for item in income_raw_data:
            segment = item.get('segment', '未知')
            customer = item.get('customer', '未知')
            income = float(item.get('accumulatedIncome', 0))
            
            if segment not in db_by_segment:
                db_by_segment[segment] = {}
            db_by_segment[segment][customer] = income
        
        print("数据库按板块分组:")
        for segment, customers in db_by_segment.items():
            segment_total = sum(customers.values())
            print(f"  {segment}: {segment_total:.2f}")
            for customer, income in customers.items():
                if income > 100:  # 只显示大额的
                    print(f"    {customer}: {income:.2f}")
    
    if api_data and isinstance(api_data, dict):
        api_total = 0
        for segment in ['equipment', 'components', 'engineering']:
            if segment in api_data:
                segment_income = sum(float(item.get('accumulatedIncome', 0)) for item in api_data[segment])
                api_total += segment_income
        
        print(f"API计算的总收入: {api_total:.2f}")
        print(f"差异: {abs(db_total - api_total):.2f}")

if __name__ == "__main__":
    test_data_processing() 