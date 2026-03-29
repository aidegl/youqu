#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载 HAP 轮播图图标到项目 images 文件夹
"""

import requests
import json
import os
from pathlib import Path

# HAP 配置
HAP_APPKEY = 'cd90921a105a7132'
HAP_SIGN = 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw=='
WORKSHEET_ID = '69b5dc147e3c8fc03e16dcab'

# 下载目录
DOWNLOAD_DIR = Path(__file__).parent / 'images'
DOWNLOAD_DIR.mkdir(exist_ok=True)

def get_headers():
    """生成 HAP API 请求头"""
    return {
        'Content-Type': 'application/json',
        'HAP-Appkey': HAP_APPKEY,
        'HAP-Sign': HAP_SIGN
    }

def get_banners():
    """获取轮播图数据"""
    url = f'https://api.mingdao.com/v3/app/worksheets/{WORKSHEET_ID}/rows/list'
    data = {
        'pageIndex': 1,
        'pageSize': 10
    }
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            return result.get('data', {}).get('rows', [])
    
    return []

def download_image(url, save_path):
    """下载图片"""
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f'  ❌ 下载失败：{response.status_code}')
            return False
    except Exception as e:
        print(f'  ❌ 下载异常：{e}')
        return False

def main():
    print('=' * 60)
    print('HAP 轮播图图标下载工具')
    print('=' * 60)
    print(f'\n下载目录：{DOWNLOAD_DIR.absolute()}\n')
    
    # 获取轮播图数据
    print('正在获取轮播图数据...')
    banners = get_banners()
    
    if not banners:
        print('[FAIL] 未获取到轮播图数据')
        return
    
    print(f'[OK] 获取到 {len(banners)} 条轮播图\n')
    
    # 下载图标
    success_count = 0
    fail_count = 0
    
    for i, banner in enumerate(banners, 1):
        name = banner.get('name', f'广告{i}')
        row_id = banner.get('rowid', '')
        
        # 获取图片字段（使用别名 image）
        image_field = banner.get('image', [])
        
        if not image_field or not isinstance(image_field, list) or len(image_field) == 0:
            print(f'[{i}/{len(banners)}] [WARN] {name} - 无图片')
            fail_count += 1
            continue
        
        # 获取第一个图片的下载 URL
        image_info = image_field[0]
        download_url = image_info.get('downloadUrl', '')
        file_name = image_info.get('fileName', f'icon_{i}.png')
        
        if not download_url:
            print(f'[{i}/{len(banners)}] [WARN] {name} - 无下载 URL')
            fail_count += 1
            continue
        
        # 生成本地文件名
        # 格式：tabbar-{name}.png
        safe_name = "".join(c for c in name if c.isalnum() or c in ('-', '_')).strip()
        if not safe_name:
            safe_name = f'icon_{i}'
        
        local_filename = f'tabbar-{safe_name}.png'
        save_path = DOWNLOAD_DIR / local_filename
        
        # 检查是否已存在
        if save_path.exists():
            print(f'[{i}/{len(banners)}] [SKIP] {name} - 已存在')
            success_count += 1
            continue
        
        # 下载
        print(f'[{i}/{len(banners)}] [DOWN] {name}')
        print(f'    原图：{download_url[:60]}...')
        print(f'    保存：{local_filename}')
        
        if download_image(download_url, save_path):
            print(f'    [OK] 下载成功\n')
            success_count += 1
        else:
            print(f'    [FAIL] 下载失败\n')
            fail_count += 1
    
    # 完成报告
    print('=' * 60)
    print('[OK] 下载完成！')
    print(f'   成功：{success_count} 个')
    print(f'   失败：{fail_count} 个')
    print(f'   目录：{DOWNLOAD_DIR.absolute()}')
    print('=' * 60)
    
    # 显示文件列表
    print('\n已下载的图标:')
    for img_file in DOWNLOAD_DIR.glob('tabbar-*.png'):
        print(f'  - {img_file.name}')

if __name__ == '__main__':
    main()
