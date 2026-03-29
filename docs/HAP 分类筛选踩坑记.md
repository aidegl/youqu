# 📋 HAP 分类字段筛选踩坑记

**日期**: 2026-03-26  
**项目**: youqu 小程序  
**状态**: ✅ 已解决

---

## 🎯 问题背景

在开发 youqu 小程序的分类筛选功能时，遇到了一个棘手的问题：

**现象**: 
- 前端分类按钮点击正常
- API 调用返回 success: true
- 但筛选结果总是返回 0 条数据

**预期**:
- 点击「问答」→ 显示 3 条问答类帖子
- 点击「赏金任务」→ 显示 1 条赏金任务帖子
- 点击「吐槽」→ 显示 1 条吐槽帖子

---

## 🔍 排查过程

### 第一步：检查前端代码

```javascript
// pages/index/index.js
categories: [
  { id: '', name: '全部' },
  { id: '赏金任务', name: '赏金任务' },
  { id: '问答', name: '问答' },
  { id: '吐槽', name: '吐槽' }
]
```

✅ 分类配置正确

---

### 第二步：检查 API 调用

```javascript
// utils/api.js
async function getPosts(category = '', page = 1, pageSize = 20) {
  const children = [];
  if (category) {
    children.push({ 
      type: 'condition', 
      field: 'category',  // ← 问题 1：使用字段名称
      operator: 'eq', 
      value: [category]   // ← 问题 2：使用中文 Value
    });
  }
  const result = await getRows(WORKSHEET_ID.posts, {...});
}
```

❌ **发现两个问题**:
1. 筛选条件使用了字段名称 `category`，应该用字段 ID
2. 筛选值使用了中文 `赏金任务`，可能应该用其他格式

---

### 第三步：用 MCP 直接查询 HAP 数据

```bash
claude "使用 hap-mcp-youqu 查询 posts 工作表的所有记录，
返回 category 字段的完整原始数据"
```

**返回结果**:

```json
{
  "title": "🎵 周末音乐节",
  "69b5db79440840fde287375b": [
    {
      "key": "9e5f96d9-6255-4ec5-aef4-4df2f7c0e760",
      "value": "问答"
    }
  ]
}
```

**💡 关键发现**:

1. **字段存储用 ID**: `69b5db79440840fde287375b`（不是 `category`）
2. **数据类型是数组**: `[{key: "...", value: "..."}]`
3. **实际存储的是 Key**: `9e5f96d9-6255-4ec5-aef4-4df2f7c0e760`（UUID 格式）
4. **Value 只是显示用**: `问答`（中文）

---

### 第四步：验证筛选条件

用 MCP 测试不同的筛选条件：

**测试 1**: 使用中文 Value
```javascript
filter: {
  field: '69b5db79440840fde287375b',
  value: ['问答']  // ❌ 错误
}
```
结果：0 条记录

**测试 2**: 使用 UUID Key
```javascript
filter: {
  field: '69b5db79440840fde287375b',
  value: ['9e5f96d9-6255-4ec5-aef4-4df2f7c0e760']  // ✅ 正确
}
```
结果：3 条记录（正确！）

---

## ✅ 解决方案

### 修复代码

```javascript
// utils/api.js
async function getPosts(category = '', page = 1, pageSize = 20) {
  // category 选项的 Key 映射
  const categoryKeys = {
    '赏金任务': '8eb44026-eebe-4677-bc9c-435e972729a6',
    '问答': '9e5f96d9-6255-4ec5-aef4-4df2f7c0e760',
    '吐槽': '9646cbb4-2eee-4c91-88ac-b4cdd394be5e'
  };
  
  const children = [];
  if (category && categoryKeys[category]) {
    children.push({ 
      type: 'condition', 
      field: '69b5db79440840fde287375b',  // ✅ 使用字段 ID
      operator: 'eq', 
      value: [categoryKeys[category]]     // ✅ 使用 Key（UUID）
    });
  }
  
  const result = await getRows(WORKSHEET_ID.posts, {...});
  // ...
}
```

---

## 📊 数据格式对比

### 存储格式（HAP 内部）
```json
"69b5db79440840fde287375b": [
  {
    "key": "9e5f96d9-6255-4ec5-aef4-4df2f7c0e760",
    "value": "问答"
  }
]
```

### 读取格式（前端显示）
```javascript
const category = row['69b5db79440840fde287375b']?.[0]?.value;
// 结果："问答"
```

### 筛选格式（API 查询）
```javascript
filter: {
  field: '69b5db79440840fde287375b',
  value: ['9e5f96d9-6255-4ec5-aef4-4df2f7c0e760']  // 用 Key！
}
```

---

## 🎓 经验总结

### 1. HAP SingleSelect 字段的三种形态

| 场景 | 使用格式 | 示例 |
|------|---------|------|
| **存储** | Key（UUID） | `9e5f96d9-6255-4ec5-aef4-4df2f7c0e760` |
| **显示** | Value（中文） | `问答` |
| **筛选** | Key（UUID） | `9e5f96d9-6255-4ec5-aef4-4df2f7c0e760` |

**核心原则**: **筛选用 Key，显示用 Value**

---

### 2. 字段引用的两种方式

| 方式 | 示例 | 用途 |
|------|------|------|
| **字段 ID** | `69b5db79440840fde287375b` | 筛选、更新、创建 |
| **字段别名** | `fengmiantu`、`image` | 读取数据 |

**核心原则**: **写操作用 ID，读操作优先用别名**

---

### 3. 调试方法论

**三步排查法**:

1. **查看原始数据**
   ```bash
   claude "用 MCP 查询工作表的完整原始数据"
   ```

2. **验证筛选条件**
   ```bash
   claude "用 MCP 测试不同的筛选条件"
   ```

3. **对比预期结果**
   - 筛选返回几条？
   - 是否符合预期？
   - 数据格式对不对？

---

### 4. 添加调试日志

```javascript
function formatPost(row) {
  console.log('[formatPost] 原始 row:', row);
  console.log('[formatPost] categoryField:', row['69b5db79440840fde287375b']);
  console.log('[formatPost] categoryValue:', row['69b5db79440840fde287375b']?.[0]?.value);
  // ...
}
```

**好处**:
- 快速定位问题
- 理解数据结构
- 验证修复效果

---

## 📝 最佳实践

### ✅ 推荐做法

1. **用 MCP 直接查询原始数据**
   - 不要猜测字段格式
   - 直接看 HAP 返回什么

2. **建立字段映射表**
   ```javascript
   const categoryKeys = {
     '赏金任务': 'uuid-1',
     '问答': 'uuid-2',
     '吐槽': 'uuid-3'
   };
   ```

3. **添加详细日志**
   - 记录原始数据
   - 记录筛选条件
   - 记录处理结果

4. **先验证再编码**
   - 用 MCP 测试筛选条件
   - 确认有效后再写代码

---

### ❌ 避免踩坑

1. **不要假设字段格式**
   - 单选字段可能存 Key，不是 Value
   - 附件字段是数组，不是对象

2. **不要直接用字段名称**
   - 筛选/更新要用字段 ID
   - 读取可以优先用别名

3. **不要盲目调试前端**
   - 先用 MCP 验证后端数据
   - 确认数据没问题再查前端

---

## 🔑 关键要点

### HAP 字段类型对照表

| 字段类型 | 存储格式 | 筛选用 | 读取用 |
|---------|---------|--------|--------|
| **Text** | `"文本"` | `"文本"` | `row.field` |
| **SingleSelect** | `[{key:"uuid",value:"选项"}]` | `"uuid"` | `row.field?.[0]?.value` |
| **Attachment** | `[{fileName:"...",downloadUrl:"..."}]` | - | `row.field?.[0]?.downloadUrl` |
| **DateTime** | `"2026-03-26 12:00:00"` | `"2026-03-26"` | `row.field` |
| **Number** | `"100"` | `100` | `parseFloat(row.field)` |

---

## 🎉 最终效果

修复后的分类筛选功能：

| 分类 | 筛选 Key | 返回记录 | 帖子列表 |
|------|---------|---------|---------|
| 全部 | - | 5 条 | 所有帖子 |
| 赏金任务 | `8eb44026-...` | 1 条 | 📚 读书分享会 |
| 问答 | `9e5f96d9-...` | 3 条 | 🎵 周末音乐节、🍳 美食制作大赛、🎨 春季摄影大赛 |
| 吐槽 | `9646cbb4-...` | 1 条 | 🏃 晨跑打卡挑战 |

---

## 📚 相关文档

- `debug-category.js` - 分类筛选调试脚本
- `utils/api.js` - API 封装（已修复）
- `pages/index/index.js` - 首页分类逻辑

---

**踩坑时间**: 2 小时  
**根本原因**: SingleSelect 字段筛选要用 Key（UUID），不是 Value（中文）  
**解决方案**: 建立 category 映射表，将中文转换为 UUID  
**经验教训**: 先查原始数据，再写筛选代码

---

_记住：HAP 的筛选，单选字段用 Key，不要直接用中文！_ 🎯
