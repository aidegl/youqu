# 📋 HAP 轮播图数据获取 - 完整日志

**项目**: youqu 微信小程序  
**日期**: 2026-03-26  
**状态**: ✅ 已完成

---

## 📊 时间线

| 时间 | 事件 | 状态 |
|------|------|------|
| 18:15 | 开始实现轮播图功能 | 🟡 |
| 18:20 | 发现加载成功但返回 0 条数据 | 🔴 |
| 18:21 | 修复：使用字段 ID 而非字段名称 | 🟡 |
| 18:24 | 仍然返回 0 条数据 | 🔴 |
| 18:25 | 修复：单选字段使用 option key | 🟡 |
| 18:28 | 数据返回 2 条，但图片路径错误 | 🔴 |
| 18:48 | 分析原始数据结构 | 🟡 |
| 18:50 | 修复：使用 image 别名获取图片 | ✅ |
| 19:09 | 整理完整日志 | ✅ |

---

## 🐛 问题记录

### 问题 1: 字段引用错误

**时间**: 18:20  
**现象**: API 调用成功但返回 0 条数据

**原因**:
```javascript
// ❌ 错误：使用字段名称
field: '是否启用'
image: row.image  // 但代码中用的是字段 ID
```

**HAP 实际返回**:
```json
{
  "69b5dc145c2066509f21fd27": [...],  // 使用字段 ID
  "69c4eb1c867350d552faf075": [...]   // 使用字段 ID
}
```

**修复**:
```javascript
// ✅ 正确：使用字段 ID
field: '69b5dc145c2066509f21fd27'
```

---

### 问题 2: 单选字段筛选值错误

**时间**: 18:24  
**现象**: 筛选后仍然返回 0 条数据

**原因**:
```javascript
// ❌ 错误：使用显示值
value: ['是']
```

**HAP 实际存储**:
```json
"69b5dc145c2066509f21fd27": [
  {"key":"8e60a304-0bae-4a26-8c4a-2e01946c8960","value":"是"}
]
```

**修复**:
```javascript
// ✅ 正确：使用 option key
value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']
```

---

### 问题 3: 图片路径获取错误

**时间**: 18:28  
**现象**: 数据返回 2 条，但图片 URL 为空

**原因**:
```javascript
// ❌ 错误：使用字段 ID 读取
const imageField = row['69c4eb1c867350d552faf075'];
```

**HAP 实际返回**:
```json
{
  "image": [  // ← 使用别名，不是字段 ID！
    {
      "fileName": "xxx.png",
      "downloadUrl": "https://..."
    }
  ]
}
```

**修复**:
```javascript
// ✅ 正确：使用别名
const imageField = row.image;
const imageUrl = firstImage.downloadUrl;
```

---

## 📋 最终配置

### 1. 筛选条件

```javascript
filter: {
  type: 'group',
  logic: 'AND',
  children: [{
    type: 'condition',
    field: '69b5dc145c2066509f21fd27',  // 字段 ID
    operator: 'eq',
    value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']  // option key
  }]
}
```

### 2. 排序

```javascript
sorts: [{
  field: '69b5dc145c2066509f21fd26',  // 字段 ID
  isAsc: true
}]
```

### 3. 数据读取

```javascript
const banners = result.data.rows.map(row => ({
  id: row.rowid,
  image: row.image?.[0]?.downloadUrl || '',  // 使用别名
  link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value || '',  // 字段 ID
  link_target: row['69b5dc145c2066509f21fd25'] || ''  // 字段 ID
}));
```

---

## 🎯 字段使用规则

### 筛选条件 → 使用字段 ID

| 字段名 | 字段 ID | 用途 |
|--------|--------|------|
| 是否启用 | `69b5dc145c2066509f21fd27` | 筛选 |
| 排序 | `69b5dc145c2066509f21fd26` | 排序 |

### 读取数据 → 优先使用别名

| 字段名 | 别名 | 字段 ID | 使用方式 |
|--------|------|--------|---------|
| 图片 | `image` | `69c4eb1c867350d552faf075` | `row.image` |
| 名称 | `name` | `69b5dc145c2066509f21fd23` | `row.name` |
| 链接类型 | - | `69b5dc145c2066509f21fd24` | `row['69b5dc145c2066509f21fd24']` |
| 链接目标 | - | `69b5dc145c2066509f21fd25` | `row['69b5dc145c2066509f21fd25']` |

---

## 📊 HAP 数据结构

### 完整记录示例

```json
{
  "rowId": "7d66166f-2f99-465c-981c-6178c42e758b",
  "name": "广告 1",
  "image": [
    {
      "fileName": "cdaYcF52fc228J7P6b594i3e7ofafR5Y6Hd26m9P7V5Kane2adaW900VcZeP7M4b.png",
      "downloadUrl": "https://p1.mingdaoyun.cn/6a2818ed-3c2b-4263-b804-397d3d00e3d7/13bd197a-62d0-4883-b651-93c4a35f4fba/69b5dc147e3c8fc03e16dcab/20260326/5UaoeP9B5tcj7XdH9kcL2j3ycQdK7Gdh048v0X5G1x4Re5aY2X5E5M6U6xc34S3K.png"
    }
  ],
  "69b5dc145c2066509f21fd27": [
    {"key":"8e60a304-0bae-4a26-8c4a-2e01946c8960","value":"是"}
  ],
  "69b5dc145c2066509f21fd24": [],
  "69b5dc145c2066509f21fd25": ""
}
```

---

## ✅ 最终代码

### utils/api.js - getBanners()

```javascript
async function getBanners() {
  console.log('[API.getBanners] 开始请求 HAP 轮播图数据...');
  
  const result = await getRows(WORKSHEET_ID.banners, {
    filter: { 
      type: 'group', 
      logic: 'AND', 
      children: [{ 
        type: 'condition', 
        field: '69b5dc145c2066509f21fd27',
        operator: 'eq', 
        value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']
      }] 
    },
    pageSize: 10,
    sorts: [{ field: '69b5dc145c2066509f21fd26', isAsc: true }]
  });
  
  if (result.success && result.data?.rows) {
    const banners = result.data.rows.map(row => ({
      id: row.rowid,
      image: row.image?.[0]?.downloadUrl || '',
      link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value || '',
      link_target: row['69b5dc145c2066509f21fd25'] || ''
    }));
    
    return { success: true, data: banners };
  }
  
  return { success: false, data: [] };
}
```

---

## 🧪 测试结果

### 控制台输出

```
=== [轮播图] 开始加载 ===
[API.getBanners] 开始请求 HAP 轮播图数据...
[API.getBanners] 筛选条件：是否启用=是 (使用 option key)
[API.getBanners] HAP 响应：{success: true, data: {...}}
[API.getBanners] rows 数量：2
[API.getBanners] ✅ 处理完成，轮播图数量：2
[API.getBanners] 轮播图数据：[
  {
    id: "7d66166f-2f99-465c-981c-6178c42e758b",
    image: "https://p1.mingdaoyun.cn/.../xxx.png",
    link_type: "",
    link_target: ""
  },
  {
    id: "7dbff7ea-75db-4621-bc97-f97d8e093a8d",
    image: "https://p1.mingdaoyun.cn/.../yyy.png",
    link_type: "",
    link_target: ""
  }
]
[轮播图] ✅ 加载成功，数据：[...]
[轮播图 1] {id: "...", image: "https://..."}
[轮播图 2] {id: "...", image: "https://..."}
=== [轮播图] 加载结束 ===
```

### 模拟器显示

- ✅ 轮播图区域显示
- ✅ 2 张图片正常加载
- ✅ 自动播放
- ✅ 指示点显示

---

## 📚 经验总结

### 1. HAP V3 API 字段使用

**筛选条件** → 必须用字段 ID + option key
```javascript
field: '69b5dc145c2066509f21fd27'  // 字段 ID
value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']  // option key
```

**读取数据** → 优先用别名
```javascript
row.image  // 别名
row.name   // 别名
```

### 2. 单选字段格式

**存储格式**:
```json
"字段 ID": [
  {"key":"option-key","value":"显示值"}
]
```

**读取方式**:
```javascript
row['字段 ID']?.[0]?.value
```

### 3. 附件字段格式

**存储格式**:
```json
"image": [
  {
    "fileName": "xxx.png",
    "downloadUrl": "https://..."
  }
]
```

**读取方式**:
```javascript
row.image?.[0]?.downloadUrl
```

---

## 📁 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `utils/api.js` | getBanners() 函数 - 字段 ID、option key、图片路径 |
| `pages/index/index.js` | loadBanners() - 添加详细日志 |
| `修复说明 - 单选字段筛选.md` | 新建文档 |
| `修复说明 - 图片路径.md` | 新建文档 |
| `修复说明 - 使用 image 别名.md` | 新建文档 |
| `HAP 轮播图数据获取日志.md` | 本文档 |

---

**文档生成时间**: 2026-03-26 19:09  
**版本**: v1.0  
**状态**: ✅ 完成
