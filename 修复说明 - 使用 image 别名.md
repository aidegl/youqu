# 🔧 修复：使用 image 别名获取图片

**问题**: 使用了字段 ID 但 HAP 返回的是别名  
**修复**: 使用 `row.image` 别名  
**日期**: 2026-03-26 18:50

---

## 📋 原始数据格式

```json
{
  "rowId": "7d66166f-2f99-465c-981c-6178c42e758b",
  "name": "广告 1",
  "image": [  // ← 使用别名！
    {
      "fileName": "cdaYcF52fc228J7P6b594i3e7ofafR5Y6Hd26m9P7V5Kane2adaW900VcZeP7M4b.png",
      "downloadUrl": "https://p1.mingdaoyun.cn/.../xxx.png"
    }
  ],
  "69b5dc145c2066509f21fd27": [
    {"key":"8e60a304-0bae-4a26-8c4a-2e01946c8960","value":"是"}
  ]
}
```

---

## ✅ 修复内容

### 修改前
```javascript
const imageField = row['69c4eb1c867350d552faf075'];  // ❌ 字段 ID
```

### 修改后
```javascript
const imageField = row.image;  // ✅ 使用别名
```

---

## 🎯 图片 URL 获取

```javascript
if (imageField && Array.isArray(imageField) && imageField.length > 0) {
  const firstImage = imageField[0];
  imageUrl = firstImage.downloadUrl || firstImage.large_thumbnail_full_path || '';
}
```

---

## 📋 字段使用总结

| 字段 | 使用方式 | 说明 |
|------|---------|------|
| 图片 | `row.image` | 使用别名 |
| 是否启用 | `row['69b5dc145c2066509f21fd27']` | 使用字段 ID（筛选） |
| 链接类型 | `row['69b5dc145c2066509f21fd24']` | 使用字段 ID |
| 链接目标 | `row['69b5dc145c2066509f21fd25']` | 使用字段 ID |
| 名称 | `row.name` | 使用别名 |

**规律**: 
- **筛选条件** → 用字段 ID
- **读取数据** → 优先用别名

---

**修复完成**: 2026-03-26 18:50
