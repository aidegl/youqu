# 🔧 问题修复：使用字段 ID 而非字段名称

**问题**: 加载成功但显示无数据  
**原因**: HAP V3 API 返回的数据使用字段 ID 作为 key，而不是字段名称  
**修复**: 将字段名称改为字段 ID  
**日期**: 2026-03-26

---

## 🐛 问题描述

API 调用成功，但返回空数组：
```
[API.getBanners] success: true
[API.getBanners] rows 数量：2
[API.getBanners] ❌ 无数据或失败  ← 矛盾！
```

---

## 🔍 原因分析

### HAP V3 API 返回的数据格式

```json
{
  "rowid": "7dbff7ea-75db-4621-bc97-f97d8e093a8d",
  "69b5dc145c2066509f21fd23": "广告 2",  // ← 使用字段 ID，不是"名称"
  "69b5dc145c2066509f21fd24": [],        // ← 链接类型（字段 ID）
  "69b5dc145c2066509f21fd25": "",        // ← 链接目标（字段 ID）
  "69b5dc145c2066509f21fd27": [          // ← 是否启用（字段 ID）
    {"key":"8e60a304-0bae-4a26-8c4a-2e01946c8960","value":"是"}
  ],
  "69c4eb1c867350d552faf075": [          // ← 图片（字段 ID）
    {"fileName":"xxx.png","downloadUrl":"https://..."}
  ]
}
```

### 错误代码

```javascript
// ❌ 错误：使用字段名称
image: row.image?.[0]?.downloadUrl  // row.image 不存在！
link_type: formatOption(row['链接类型'])  // row['链接类型'] 不存在！
```

### 正确代码

```javascript
// ✅ 正确：使用字段 ID
image: row['69c4eb1c867350d552faf075']?.[0]?.downloadUrl
link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value
```

---

## ✅ 修复内容

### utils/api.js - getBanners() 函数

**修改前**:
```javascript
const result = await getRows(WORKSHEET_ID.banners, {
  filter: { 
    field: '是否启用',  // ❌ 字段名称
    value: ['是'] 
  },
  sorts: [{ field: '排序', isAsc: true }]  // ❌ 字段名称
});

const banners = result.data.rows.map(row => ({
  image: row.image?.[0]?.downloadUrl,  // ❌ 字段别名
  link_type: formatOption(row['链接类型'])  // ❌ 字段名称
}));
```

**修改后**:
```javascript
const result = await getRows(WORKSHEET_ID.banners, {
  filter: { 
    field: '69b5dc145c2066509f21fd27',  // ✅ 字段 ID
    value: ['是'] 
  },
  sorts: [{ field: '69b5dc145c2066509f21fd26', isAsc: true }]  // ✅ 字段 ID
});

const banners = result.data.rows.map(row => ({
  image: row['69c4eb1c867350d552faf075']?.[0]?.downloadUrl,  // ✅ 字段 ID
  link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value  // ✅ 字段 ID
}));
```

---

## 📋 字段 ID 映射表

| 字段名 | 字段 ID | 类型 | 说明 |
|--------|--------|------|------|
| 名称 | `69b5dc145c2066509f21fd23` | Text | 标题字段 |
| 链接类型 | `69b5dc145c2066509f21fd24` | SingleSelect | 无/内容/网页 |
| 链接目标 | `69b5dc145c2066509f21fd25` | Text | 跳转链接 |
| 排序 | `69b5dc145c2066509f21fd26` | Number | 升序 |
| 是否启用 | `69b5dc145c2066509f21fd27` | SingleSelect | 是/否 |
| 图片 | `69c4eb1c867350d552faf075` | Attachment | 轮播图图片 |

---

## 🧪 测试验证

### 在微信开发者工具控制台运行

```javascript
const api = require('./utils/api.js');
api.getBanners().then(res => {
  console.log('=== 测试结果 ===');
  console.log('success:', res.success);
  console.log('data:', res.data);
  
  if (res.success && res.data.length > 0) {
    console.log('✅ 成功！');
    res.data.forEach((banner, i) => {
      console.log(`\n[轮播图 ${i + 1}]`);
      console.log('  ID:', banner.id);
      console.log('  图片:', banner.image.substring(0, 50) + '...');
      console.log('  链接类型:', banner.link_type);
      console.log('  链接目标:', banner.link_target);
    });
  } else {
    console.log('❌ 失败或无数据');
  }
});
```

### 预期输出

```
=== 测试结果 ===
success: true
data: [
  {
    id: "7dbff7ea-75db-4621-bc97-f97d8e093a8d",
    image: "https://p1.mingdaoyun.cn/.../xxx.png",
    link_type: "",
    link_target: ""
  },
  {
    id: "7d66166f-2f99-465c-981c-6178c42e758b",
    image: "https://p1.mingdaoyun.cn/.../yyy.png",
    link_type: "",
    link_target: ""
  }
]
✅ 成功！

[轮播图 1]
  ID: 7dbff7ea-75db-4621-bc97-f97d8e093a8d
  图片：https://p1.mingdaoyun.cn/.../xxx.png
  链接类型：
  链接目标：

[轮播图 2]
  ID: 7d66166f-2f99-465c-981c-6178c42e758b
  图片：https://p1.mingdaoyun.cn/.../yyy.png
  链接类型：
  链接目标：
```

---

## 📝 注意事项

### 1. 筛选条件的字段

HAP V3 API 的筛选条件也使用字段 ID：
```javascript
// ❌ 错误
field: '是否启用'

// ✅ 正确
field: '69b5dc145c2066509f21fd27'
```

### 2. 单选字段（SingleSelect）

单选字段返回的是数组格式：
```javascript
// 数据结构
row['69b5dc145c2066509f21fd24']: [
  {"key":"xxx","value":"是"}
]

// 获取值
const value = row['69b5dc145c2066509f21fd24']?.[0]?.value;
```

### 3. 附件字段（Attachment）

附件字段也是数组格式：
```javascript
// 数据结构
row['69c4eb1c867350d552faf075']: [
  {"fileName":"xxx.png","downloadUrl":"https://..."}
]

// 获取下载 URL
const url = row['69c4eb1c867350d552faf075']?.[0]?.downloadUrl;
```

---

## ✅ 验证清单

- [x] 筛选条件使用字段 ID
- [x] 排序字段使用字段 ID
- [x] 图片字段使用字段 ID
- [x] 链接类型使用字段 ID
- [x] 链接目标使用字段 ID
- [x] 单选字段正确解构数组
- [x] 附件字段正确解构数组

---

**修复完成时间**: 2026-03-26  
**版本**: v1.1
