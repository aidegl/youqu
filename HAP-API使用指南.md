# HAP V3 API 使用指南

## 1. 基础配置

### 1.1 API 凭证

```javascript
const HAP_CONFIG = {
  appkey: 'cd90921a105a7132',
  sign: 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw==',
  baseUrl: 'https://api.mingdao.com'
};
```

### 1.2 请求头

```javascript
const headers = {
  'Content-Type': 'application/json',
  'HAP-Appkey': HAP_CONFIG.appkey,
  'HAP-Sign': HAP_CONFIG.sign
};
```

### 1.3 工作表 ID

```javascript
const WORKSHEET_ID = {
  users: '69b5db5804186a1d512cb9d1',      // 用户表
  posts: '69b5db79d659982669a47c6b',      // 帖子表
  comments: '69b5dbc4724cbbeab6557e21',   // 评论表
  likes: '69b5dbb3064e5630e80f4f90',      // 喜欢表
  follows: '69cac8d9f045950b8025e43a',    // 关注表
  messages: '69b5dbb4724cbbeab6557d8b',   // 消息表
  task_takers: '69b5dc137e3c8fc03e16dc99', // 任务接取表
  chat_messages: '69cb54c92a26454c6e33ecc4', // 聊天消息表
  banners: '69b5dc147e3c8fc03e16dcab'     // 轮播图表
};
```

### 1.4 各表字段 ID 速查表 ⭐ 重要

**帖子表 (posts)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 标题 | `69b5db79440840fde2873756` | 文本 |
| 内容 | `69b5db79440840fde2873757` | 文本 |
| 作者 | `69b5db79440840fde2873759` | 关联(用户) |
| 分类 | `69b5db79440840fde287375b` | 单选 |
| 任务类型 | `69b5db79440840fde287375c` | 单选 |
| 悬赏金额 | `69b5db79440840fde287375d` | 数值 |
| 状态 | `69b5db79440840fde287375e` | 单选 |
| 点赞数 | `69b5db79440840fde287375f` | 数值 |
| 评论数 | `69b5db79440840fde2873760` | 数值 |
| 浏览数 | `69b5db79440840fde2873761` | 数值 |
| 发布时间 | `69b5db79440840fde2873762` | 日期时间 |
| 封面图 | `fengmiantu` (别名) | 附件 |

**评论表 (comments)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 帖子ID | `69b5dbc4947a225402a9097d` | 关联(帖子) |
| 评论者 | `69b5dbc4947a225402a9097f` | 关联(用户) |
| 评论内容 | `69b5dbc4947a225402a90981` | 文本 |
| 点赞数 | `69b5dbc4947a225402a90982` | 数值 |
| 是否采纳 | `69b5dbc4947a225402a90983` | 单选 |
| 评论时间 | `69b5dbc4947a225402a90984` | 日期时间 |
| 父评论 | `69b5dbceba48d7134c7ac35e` | 关联(评论) |

**用户表 (users)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 微信ID | `69b5db58a606df9d8178a03e` | 文本 |
| 昵称 | `69b5db58a606df9d8178a040` | 文本 |
| 头像(文本) | `69b5db58a606df9d8178a041` | 文本 |
| 手机号 | `69b5db58a606df9d8178a043` | 文本 |
| 创建时间 | `69b5db58a606df9d8178a045` | 日期时间 |
| 头像(附件) | `69c527ef867350d552fb710f` | 附件 |

**喜欢表 (likes)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 用户 | `69b5dbb304186a1d512cbcfd` | 关联(用户) |
| 目标类型 | `69b5dbb304186a1d512cbcff` | 单选 |
| 目标ID | `69b5dbb304186a1d512cbd00` | 文本 |
| 点赞时间 | `69b5dbb304186a1d512cbd01` | 日期时间 |

**关注表 (follows)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 关注人 | `69cac8d9d128aadb0c7a7bbc` | 关联(用户) |
| 被关注人 | `69cac8d9d128aadb0c7a7bbe` | 关联(用户) |
| 关注时间 | `69cac8d9d128aadb0c7a7bc0` | 日期时间 |

**消息表 (messages)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 接收者 | `69b5dbb5b73fe81519fbdcd5` | 关联(用户) |
| 发送者 | `69b5dbb5b73fe81519fbdcd7` | 关联(用户) |
| 消息类型 | `69b5dbb5b73fe81519fbdcd9` | 单选 |
| 标题 | `69b5dbb5b73fe81519fbdcda` | 文本 |
| 内容 | `69b5dbb5b73fe81519fbdcdb` | 文本 |
| 相关帖子 | `69b5dbb5b73fe81519fbdcdc` | 关联(帖子) |
| 是否已读 | `69b5dbb5b73fe81519fbdcde` | 单选 |
| 消息时间 | `69b5dbb5b73fe81519fbdcdf` | 日期时间 |

**任务接取表 (task_takers)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 任务 | `69b5dc13401e6eb020edf41f` | 关联(帖子) |
| 发布者 | `69b5dc13401e6eb020edf421` | 关联(用户) |
| 接取者 | `69b5dc13401e6eb020edf423` | 关联(用户) |
| 状态 | `69b5dc13401e6eb020edf425` | 单选 |
| 结果 | `69b5dc13401e6eb020edf426` | 文本 |
| 评分 | `69b5dc13401e6eb020edf427` | 数值 |
| 接取时间 | `69b5dc13401e6eb020edf428` | 日期时间 |
| 完成时间 | `69b5dc13401e6eb020edf429` | 日期时间 |

**聊天消息表 (chat_messages)**
| 字段名 | 字段 ID | 类型 |
|-------|---------|------|
| 任务 | `69cb54c9075399e7d17c705e` | 关联(任务接取表) |
| 发送者 | `69cb54c9075399e7d17c7060` | 关联(用户) |
| 接收者 | `69cb54c9075399e7d17c7062` | 关联(用户) |
| 消息内容 | `69cb54c9075399e7d17c7064` | 文本 |
| 发送时间 | `69cb54c9075399e7d17c7065` | 日期时间 |

---

## 2. API 端点与 HTTP 方法

| 操作 | 方法 | 端点 |
|-----|------|------|
| 查询记录列表 | POST | `/v3/app/worksheets/{worksheetId}/rows/list` |
| 获取单条记录 | GET | `/v3/app/worksheets/{worksheetId}/rows/{rowId}` |
| 创建记录 | POST | `/v3/app/worksheets/{worksheetId}/rows` |
| 更新记录 | **PATCH** | `/v3/app/worksheets/{worksheetId}/rows/{rowId}` |
| 删除记录 | DELETE | `/v3/app/worksheets/{worksheetId}/rows/{rowId}` |
| 获取工作表结构 | GET | `/v3/app/worksheets/{worksheetId}` |

### ⚠️ 重要：更新记录必须用 PATCH，不是 PUT！

```javascript
// ❌ 错误：返回 405
return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'PUT', data);

// ✅ 正确
return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'PATCH', data);
```

---

## 3. 查询记录

### 3.1 基础查询

```javascript
const result = await request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', {
  pageIndex: 1,
  pageSize: 20
});
```

### 3.2 带筛选条件的查询

```javascript
const result = await request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', {
  pageIndex: 1,
  pageSize: 20,
  filter: {
    type: 'group',
    logic: 'AND',
    children: [
      {
        type: 'condition',
        field: '字段ID',
        operator: 'eq',
        value: ['值']
      }
    ]
  },
  sorts: [
    { field: 'created_at', isAsc: false }
  ]
});
```

### 3.3 筛选操作符

| 操作符 | 说明 | value 格式 |
|-------|------|-----------|
| `eq` | 等于 | `["值"]` |
| `ne` | 不等于 | `["值"]` |
| `gt` | 大于 | `["值"]` |
| `gte` | 大于等于 | `["值"]` |
| `lt` | 小于 | `["值"]` |
| `lte` | 小于等于 | `["值"]` |
| `contains` | 包含 | `["值"]` |
| `in` | 在...中 | `["值1", "值2"]` |
| `belongsto` | 关联字段筛选 | `["记录ID"]` |
| `isempty` | 为空 | 不需要 value |
| `isnotempty` | 不为空 | 不需要 value |

### 3.4 通过 rowid 查询单条记录

```javascript
const result = await request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', {
  filter: {
    type: 'group',
    logic: 'AND',
    children: [{
      type: 'condition',
      field: 'rowid',
      operator: 'eq',
      value: [rowId]
    }]
  },
  pageIndex: 1,
  pageSize: 1
});

const record = result.data?.rows?.[0];
```

---

## 4. 字段类型处理

### 4.1 文本字段

```javascript
// 写入
{ '字段ID': '文本内容' }

// 读取
const text = row['字段ID'] || '';
```

### 4.2 数值字段

```javascript
// 写入：传数字类型
{ '字段ID': 100 }

// 读取：返回字符串，需要转换
const num = parseInt(row['字段ID']) || 0;
```

### 4.3 单选字段 ⭐ 重要

```javascript
// 写入：必须用选项 key（UUID），且是数组格式
{ '字段ID': ['选项key-uuid'] }

// 读取：返回对象数组
// row['字段ID'] = [{ key: 'uuid', value: '显示文本' }]
const value = row['字段ID']?.[0]?.value || '';
const key = row['字段ID']?.[0]?.key || '';
```

**选项 key 映射表示例：**

```javascript
const categoryKeys = {
  '赏金任务': '8eb44026-eebe-4677-bc9c-435e972729a6',
  '问答': '9e5f96d9-6255-4ec5-aef4-4df2f7c0e760',
  '吐槽': '9646cbb4-2eee-4c91-88ac-b4cdd394be5e'
};

// 筛选时使用 key
{ field: '字段ID', operator: 'eq', value: [categoryKeys['赏金任务']] }
```

### 4.4 多选字段

```javascript
// 写入：多个选项 key 数组
{ '字段ID': ['key1', 'key2'] }

// 读取：对象数组
const values = row['字段ID']?.map(item => item.value) || [];
```

### 4.5 关联字段 ⭐ 重要

```javascript
// 写入：传记录 ID 数组
{ '字段ID': ['关联记录的rowid'] }

// 读取：返回对象数组，包含 sid 和 name
// row['字段ID'] = [{ sid: '记录ID', name: '记录名称' }]
const relatedId = row['字段ID']?.[0]?.sid || '';
const relatedName = row['字段ID']?.[0]?.name || '';
```

**筛选关联字段：**

```javascript
// 必须使用 belongsto 操作符
{
  type: 'condition',
  field: '关联字段ID',
  operator: 'belongsto',  // ⚠️ 不是 eq
  value: ['记录ID']
}
```

### 4.6 附件字段（图片）⭐ 重点

附件字段返回的是对象数组，包含多种 URL 属性：

```javascript
// 读取返回的数据结构
row['字段ID'] = [
  {
    file_id: '...',
    fileName: '图片.png',
    downloadUrl: 'https://p1.mingdaoyun.cn/.../图片.png',
    url: 'https://...',
    large_thumbnail_full_path: 'https://p1.mingdaoyun.cn/.../缩略图.png',
    middle_thumbnail_full_path: 'https://...',
    small_thumbnail_full_path: 'https://...',
    file_size: 123456,
    ext: '.png'
  }
]
```

**URL 属性说明：**

| 属性 | 说明 | 推荐场景 |
|-----|------|---------|
| `downloadUrl` | 原图下载链接 | 需要下载原图时 |
| `large_thumbnail_full_path` | 大缩略图 | **列表页/封面图**（推荐） |
| `middle_thumbnail_full_path` | 中缩略图 | 小卡片展示 |
| `small_thumbnail_full_path` | 小缩略图 | 头像等小图 |
| `url` | 原图链接（可能为空） | 备用 |

**读取图片的最佳实践：**

```javascript
// 1. 封装通用解析函数
function parseImage(imageField) {
  if (!imageField || !Array.isArray(imageField) || imageField.length === 0) {
    return '';
  }
  const img = imageField[0];
  // 优先使用缩略图，性能更好
  return img.large_thumbnail_full_path ||
         img.downloadUrl ||
         img.url || '';
}

// 2. 获取多张图片
function parseImages(imageField) {
  if (!imageField || !Array.isArray(imageField)) return [];
  return imageField.map(img =>
    img.large_thumbnail_full_path ||
    img.downloadUrl ||
    img.url || ''
  ).filter(Boolean);
}

// 3. 使用示例
const coverUrl = parseImage(row['附件字段ID']);
const allImages = parseImages(row['附件字段ID']);
```

**写入图片：**

```javascript
// 方式1：通过 URL 写入
{ '字段ID': [{ url: 'https://example.com/image.jpg', name: '图片.jpg' }] }

// 方式2：通过微信小程序本地文件上传
// 先上传到临时服务器获取 URL，再写入 HAP
const tempUrl = await uploadImageToTemp(localFilePath);
{ '字段ID': [{ url: tempUrl, name: 'image.jpg' }] }
```

### 4.7 他表字段中的图片

他表字段（Lookup）获取关联表的附件字段时，数据格式可能不同：

```javascript
// 他表字段返回的图片可能是：
// 情况1：对象数组（正常）
row['他表字段'] = [{ downloadUrl: '...', large_thumbnail_full_path: '...' }]

// 情况2：字符串格式的 JSON 数组（需要解析）
row['他表字段'] = '[{"downloadUrl":"...","large_thumbnail_full_path":"..."}]'

// 情况3：直接是 URL 字符串
row['他表字段'] = 'https://...'
```

**通用解析函数（兼容所有情况）：**

```javascript
function parseAvatar(avatarField) {
  if (!avatarField) {
    return 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';  // 默认头像
  }

  // 情况1：对象数组
  if (Array.isArray(avatarField) && avatarField.length > 0) {
    const first = avatarField[0];
    if (typeof first === 'object') {
      return first.large_thumbnail_full_path ||
             first.downloadUrl ||
             first.url || '默认头像';
    }
  }

  // 情况2：字符串格式的 JSON 数组
  if (typeof avatarField === 'string') {
    if (avatarField.startsWith('[')) {
      try {
        const parsed = JSON.parse(avatarField);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].large_thumbnail_full_path ||
                 parsed[0].downloadUrl || '默认头像';
        }
      } catch (e) {}
    }
    // 情况3：直接是 URL
    if (avatarField.startsWith('http')) {
      return avatarField;
    }
  }

  return '默认头像';
}
```

### 4.8 日期时间字段

```javascript
// 写入：ISO 格式字符串
{ '字段ID': new Date().toISOString() }

// 读取：字符串
const dateStr = row['字段ID'];
```

---

## 5. 创建记录

```javascript
const result = await request(`/v3/app/worksheets/${worksheetId}/rows`, 'POST', {
  fields: [
    { id: '字段ID', value: '值' },
    { id: '文本字段', value: '文本' },
    { id: '数值字段', value: 100 },
    { id: '单选字段', value: ['选项key'] },
    { id: '关联字段', value: ['记录ID'] }
  ],
  triggerWorkflow: true  // 是否触发工作流
});

// 返回结果
// result.data.rowid = '新记录ID'
```

---

## 6. 更新记录

```javascript
const result = await request(
  `/v3/app/worksheets/${worksheetId}/rows/${rowId}`,
  'PATCH',  // ⚠️ 必须用 PATCH，不能用 PUT
  {
    fields: [
      { id: '字段ID', value: '新值' }
    ],
    triggerWorkflow: false  // 静默更新，不触发工作流
  }
);
```

---

## 7. 删除记录

```javascript
const result = await request(
  `/v3/app/worksheets/${worksheetId}/rows/${rowId}`,
  'DELETE',
  { permanent: true }  // true = 永久删除，false = 放入回收站
);
```

---

## 8. 常见错误

### 8.1 405 Method Not Allowed

**原因**：更新记录用了 PUT 方法

**解决**：改用 PATCH 方法

```javascript
// ❌ 错误
request(url, 'PUT', data);

// ✅ 正确
request(url, 'PATCH', data);
```

### 8.2 筛选无结果

**原因**：单选/多选字段用了显示文本而不是 key

```javascript
// ❌ 错误
{ field: 'category', operator: 'eq', value: ['赏金任务'] }

// ✅ 正确
{ field: 'category', operator: 'eq', value: ['8eb44026-eebe-4677-bc9c-435e972729a6'] }
```

### 8.3 关联字段筛选失败

**原因**：关联字段用了 eq 操作符

```javascript
// ❌ 错误
{ field: 'author_id', operator: 'eq', value: ['用户ID'] }

// ✅ 正确
{ field: 'author_id', operator: 'belongsto', value: ['用户ID'] }
```

### 8.4 单选字段写入失败

**原因**：传了显示文本或没用数组格式

```javascript
// ❌ 错误
{ '字段ID': '赏金任务' }
{ '字段ID': ['赏金任务'] }

// ✅ 正确
{ '字段ID': ['8eb44026-eebe-4677-bc9c-435e972729a6'] }
```

---

## 9. 封装示例

### 9.1 通用请求函数

```javascript
function request(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${HAP_CONFIG.baseUrl}${endpoint}`,
      method,
      header: {
        'Content-Type': 'application/json',
        'HAP-Appkey': HAP_CONFIG.appkey,
        'HAP-Sign': HAP_CONFIG.sign
      },
      data: data || {},
      success: (res) => {
        if (res.data.success) {
          resolve(res.data);
        } else {
          resolve({ success: false, error_msg: res.data.error_msg, data: null });
        }
      },
      fail: (err) => {
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}
```

### 9.2 查询记录列表

```javascript
async function getRows(worksheetId, options = {}) {
  const { filter, sorts, pageIndex = 1, pageSize = 20 } = options;
  const requestBody = { pageIndex, pageSize };
  if (filter) requestBody.filter = filter;
  if (sorts) requestBody.sorts = sorts;

  return request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', requestBody);
}
```

### 9.3 创建记录

```javascript
async function createRow(worksheetId, data, triggerWorkflow = true) {
  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows`, 'POST', { fields, triggerWorkflow });
}
```

### 9.4 更新记录

```javascript
async function updateRow(worksheetId, rowId, data, triggerWorkflow = true) {
  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'PATCH', { fields, triggerWorkflow });
}
```

---

## 10. MCP 调用方式

如果配置了 HAP MCP，可以通过 MCP 工具操作数据：

### 10.1 创建工作表

```bash
curl -X POST "https://api.mingdao.com/mcp?HAP-Appkey=xxx&HAP-Sign=xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_worksheet",
      "arguments": {
        "name": "工作表名称",
        "fields": [...]
      }
    }
  }'
```

### 10.2 更新工作表字段

```bash
curl -X POST "https://api.mingdao.com/mcp?HAP-Appkey=xxx&HAP-Sign=xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_worksheet",
      "arguments": {
        "worksheet_id": "工作表ID",
        "editFields": [
          { "id": "字段ID", "name": "新名称" }
        ]
      }
    }
  }'
```

---

## 11. 调试技巧

### 11.1 查看工作表结构

```bash
curl -X GET "https://api.mingdao.com/v3/app/worksheets/{worksheetId}" \
  -H "HAP-Appkey: xxx" \
  -H "HAP-Sign: xxx"
```

### 11.2 查看工作表列表

```bash
curl -X POST "https://api.mingdao.com/v3/app/worksheets/list" \
  -H "Content-Type: application/json" \
  -H "HAP-Appkey: xxx" \
  -H "HAP-Sign: xxx" \
  -d '{}'
```

### 11.3 查看原始数据

```javascript
console.log('原始数据:', JSON.stringify(row, null, 2));
```

---

## 12. 快速参考卡片

| 字段类型 | 写入格式 | 读取格式 |
|---------|---------|---------|
| 文本 | `"值"` | `"值"` |
| 数值 | `100` | `"100"` (字符串) |
| 单选 | `["key"]` | `[{key, value}]` |
| 多选 | `["key1", "key2"]` | `[{key, value}]` |
| 关联 | `["rowid"]` | `[{sid, name}]` |
| 附件 | `[{url, name}]` | `[{downloadUrl, **large_thumbnail_full_path**, fileName}]` |
| 日期 | `"2024-01-01"` | `"2024-01-01"` |

**附件字段图片 URL 优先级：**
```javascript
// 推荐优先级：缩略图 > 原图（性能更好）
img.large_thumbnail_full_path || img.downloadUrl || img.url
```

**记住：**
- 更新用 **PATCH**，不是 PUT
- 单选/多选筛选用 **key**，不是显示文本
- 关联字段筛选用 **belongsto**，不是 eq
- 单选字段写入必须是 **数组格式** `["key"]`
- 图片优先用 **large_thumbnail_full_path**（缩略图性能更好）

---

*最后更新: 2026-03-31*