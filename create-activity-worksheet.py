#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建活动工作表并添加示例数据
"""

import requests
import json
import time
import hashlib
import base64

# HAP 配置
HAP_APPKEY = 'cd90921a105a7132'
HAP_SIGN = 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw=='
BASE_URL = 'https://api.mingdao.com'

def get_headers():
    """生成 HAP API 请求头"""
    return {
        'Content-Type': 'application/json',
        'HAP-Appkey': HAP_APPKEY,
        'HAP-Sign': HAP_SIGN
    }

def create_worksheet():
    """创建活动工作表"""
    print('正在创建活动工作表...')
    
    url = f'{BASE_URL}/v3/app/worksheets'
    
    # 工作表配置
    data = {
        'name': '活动',
        'alias': 'activities',
        'type': 'worksheet',
        'controls': [
            {'name': '活动名称', 'type': 1, 'isTitle': True},  # Text
            {'name': '活动描述', 'type': 2},  # LongText
            {'name': '活动图片', 'type': 17},  # Attachment
            {'name': '开始时间', 'type': 5},  # DateTime
            {'name': '结束时间', 'type': 5},  # DateTime
            {'name': '活动地点', 'type': 1},  # Text
            {'name': '活动状态', 'type': 3, 'options': ['进行中', '已结束', '未开始']},  # SingleSelect
            {'name': '参与人数', 'type': 2},  # Number
            {'name': '创建时间', 'type': 5}  # DateTime
        ]
    }
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            worksheet_id = result.get('data', {}).get('worksheetId', '')
            print(f'✅ 活动工作表创建成功！ID: {worksheet_id}')
            return worksheet_id
        else:
            print(f'❌ 创建失败：{result.get("error_msg")}')
    else:
        print(f'❌ 请求失败：{response.status_code}')
        print(response.text)
    
    return None

def main():
    print('=' * 60)
    print('创建活动工作表')
    print('=' * 60)
    print()
    
    worksheet_id = create_worksheet()
    
    if worksheet_id:
        print()
        print('=' * 60)
        print('✅ 完成！')
        print(f'工作表 ID: {worksheet_id}')
        print('别名：activities')
        print('=' * 60)
        print()
        print('下一步:')
        print('1. 在 HAP 中查看新创建的活动工作表')
        print('2. 手动添加活动数据')
        print('3. 或者运行脚本添加示例数据')
    else:
        print()
        print('=' * 60)
        print('❌ 创建失败')
        print('可能原因:')
        print('1. 没有创建工作表的权限')
        print('2. Appkey 或 Sign 配置错误')
        print('3. 网络问题')
        print('=' * 60)

if __name__ == '__main__':
    main()
