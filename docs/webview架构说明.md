# WebView 架构技术说明

## 项目结构

本项目采用 WebView 嵌入小程序技术路线，分为两部分：

### 1. wxApp（小程序壳）

小程序壳只包含一个 webview 页面，用于加载 H5 内容。

```
wxApp/
├── app.js              # 小程序入口，加载全局设置、用户登录
├── app.json            # 小程序配置
├── project.config.json # 项目配置
├── sitemap.json        # 紙站地图配置
├── MingdaoQuery.js     # 明道云 API 调用组件
└── pages/
    └── webview/
        ├── index.js    # webview 页面逻辑（Cache Busting、openid 同步）
        ├── index.wxml  # webview 页面模板
        ├── index.wxss  # webview 页面样式
        └── index.json  # webview 页面配置
```

### 2. webview0（H5 内容）

H5 内容一比一复制 youqu 原生小程序的功能：

```
webview0/
├── index.html          # 培训首页（审核时显示）- 课程列表、进度统计
├── websh.html          # 社区首页（审核通过后显示）- 轮播图、分类、帖子列表
├── css/
│   ├── styles.css      # 主样式文件
│   └── post.css        # 帖子详情页样式
├── js/
│   ├── app.js          # 核心功能（环境检测、URL解析、openid同步）
│   └── api.js          # HAP API 调用（复制 utils/api.js）
└── pages/
    ├── post.html       # 帖子详情页
    ├── messages.html   # 消息页
    └── profile.html    # 个人页
```

## 技术原理

### 审核状态控制

通过明道云全局配置表（dmsh 字段）控制显示哪个页面：

- `dmsh = "0"` 或未设置：显示培训首页（审核状态）
- `dmsh = "1"`：显示社区页面（已过审）

### 页面加载流程

1. 小程序启动 → app.js 加载全局设置
2. webview 页面获取 dmsh 值
3. 根据 dmsh 值决定加载 index.html 或 websh.html
4. URL 添加版本参数（Cache Busting）强制刷新
5. URL hash 携带 openid 同步用户身份

### Cache Busting（强制刷新）

每次 onLoad（冷启动）时生成唯一的时间戳版本号：

```javascript
const timestamp = new Date().getTime();
const random = Math.random().toString(36).substring(2, 9);
const baseUrlWithVersion = `${rawBaseUrl}?v=${timestamp}&_r=${random}`;
```

### openid 同步

通过 URL hash 将 openid 从小程序传递到 H5：

```javascript
let finalUrl = baseUrl;
if (openid) {
  finalUrl += `#openid=${openid}`;
}
```

H5 监听 hash 变化获取 openid：

```javascript
window.addEventListener('hashchange', () => {
  const params = getHashParams();
  if (params.openid) {
    localStorage.setItem('openid', params.openid);
  }
});
```

### H5 与小程序通信

H5 通过 `wx.miniProgram.postMessage()` 发送消息：

```javascript
window.wx.miniProgram.postMessage({
  data: { type: 'login' }
});
```

小程序通过 `bindmessage` 接收：

```xml
<web-view src="{{url}}" bindmessage="onMessage"></web-view>
```

### 页面跳转

H5 中使用统一的跳转方法：

```javascript
// 跳转到小程序页面
window.webview.navigateTo('/pages/course-detail/course-detail?id=1');

// 切换 Tab
window.webview.switchTab('/pages/profile/profile');

// 返回上一页
window.webview.navigateBack();
```

## 部署步骤

### 1. 配置明道云

需要在明道云中创建全局配置表（qjsz），包含 dmsh 字段：
- dmsh = "0"：审核模式
- dmsh = "1"：正式模式

### 2. 更新 wxApp 配置

1. 在 `wxApp/MingdaoQuery.js` 中填入实际的 appKey 和 sign
2. 在 `wxApp/app.js` 中填入实际的配置记录 rowId
3. 在 `wxApp/project.config.json` 中填入实际的 appid

### 3. 更新 H5 URL

在 `wxApp/pages/webview/index.js` 中配置 H5 部署地址：

```javascript
const IS_DEBUG = false;
const PROD_URL = 'https://your-domain.com/webview0/index.html';
```

### 4. 上传小程序

1. 在微信开发者工具中打开 wxApp 目录
2. 上传代码审核
3. 审核通过后将 dmsh 改为 "1"

### 5. 本地调试

设置 `IS_DEBUG = true`，使用本地服务器地址：

```javascript
const LOCAL_URL = 'http://127.0.0.1:5500/webview0/index.html';
```

## 参考项目

参考实现：`E:\Item\shuxiaohe\sxz\wxApp`

关键文件：
- `sxz/wxApp/pages/webview/index.js` - webview 页面实现
- `sxz/webview0/index.html` - H5 页面实现