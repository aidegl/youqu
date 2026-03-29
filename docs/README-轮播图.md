# 🎠 轮播图功能 - 快速开始

## 5 分钟上手指南

### 第 1 步：在 HAP 添加轮播图数据（2 分钟）

1. 打开明道云 HAP 应用
2. 进入「轮播图」工作表
3. 点击「新建记录」
4. 填写：
   - **名称**: 欢迎轮播图
   - **图片**: 上传一张图片（建议 750x360px）
   - **链接类型**: 无
   - **排序**: 1
   - **是否启用**: 是
5. 点击「保存」

### 第 2 步：在微信开发者工具测试（2 分钟）

1. 打开微信开发者工具
2. 打开项目 `D:\Item\youqu`
3. 点击「编译」
4. 查看模拟器首页的轮播图

### 第 3 步：验证功能（1 分钟）

**测试 API:**
```javascript
// 在控制台运行
const api = require('./utils/api.js');
api.getBanners().then(res => {
  console.log('轮播图:', res);
  if (res.success) {
    console.log('✅ 成功！数量:', res.data.length);
  } else {
    console.log('❌ 失败');
  }
});
```

**测试点击:**
- 点击轮播图 → 显示 "轮播图" 提示

---

## 📋 文件结构

```
D:\Item\youqu\
├── utils/
│   └── api.js              ← getBanners() 函数
├── pages/
│   └── index/
│       ├── index.js        ← onBannerTap() 事件
│       ├── index.wxml      ← 轮播图模板
│       └── index.wxss      ← 轮播图样式
└── docs/
    ├── 轮播图实现指南.md    ← 详细文档
    ├── 测试清单.md          ← 测试用例
    └── README-轮播图.md     ← 本文档
```

---

## 🔧 配置说明

### HAP 工作表 ID
```
轮播图：69b5dc147e3c8fc03e16dcab
```

### 字段 ID 映射
```javascript
{
  image: '69c4eb1c867350d552faf075',      // 图片
  link_type: '69b5dc145c2066509f21fd24',  // 链接类型
  link_target: '69b5dc145c2066509f21fd25',// 链接目标
  is_active: '69b5dc145c2066509f21fd27',  // 是否启用
  sort_order: '69b5dc145c2066509f21fd26'  // 排序
}
```

### API 配置
```javascript
// utils/api.js
const HAP_CONFIG = {
  appkey: 'cd90921a105a7132',
  sign: 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw=='
};
```

---

## 🎯 链接类型说明

| 类型 | 说明 | link_target 格式 | 点击效果 |
|------|------|-----------------|----------|
| 无 | 无跳转 | 留空 | 显示提示 |
| 内容 | 跳转帖子 | 帖子 rowid | 跳转到详情页 |
| 网页 | 外部链接 | 完整 URL | 打开 webview（需实现） |

---

## ❓ 常见问题

### Q: 轮播图不显示？
**A:** 
1. 检查 HAP 中是否有启用的记录
2. 运行 `api.getBanners()` 查看 API 返回
3. 检查控制台报错

### Q: 图片加载失败？
**A:**
1. 检查图片 URL 是否可访问
2. 确认图片格式为 JPG/PNG
3. 建议图片大小 < 500KB

### Q: 点击没反应？
**A:**
1. 检查 `data-item` 绑定
2. 查看控制台是否有事件触发日志
3. 确认 `onBannerTap` 函数存在

---

## 📚 相关文档

- **详细实现**: `轮播图实现指南.md`
- **测试用例**: `测试清单.md`
- **完成总结**: `轮播图功能完成总结.md`

---

**最后更新**: 2026-03-26  
**版本**: v1.0
