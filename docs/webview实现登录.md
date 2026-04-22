### 2. 优化 WechatLogin.js

#### 添加环境检查

在执行跳转前检查是否在小程序环境中：

```javascript
toWxLogin() {
  if (!this.isInMiniProgram()) {
    console.log('[WechatLogin] 不在小程序环境中，无法跳转')
    alert('请在微信小程序中打开')
    return
  }
  // ...
}
```
#### 修复 postMessage 格式

将消息格式改为与小程序端 `onMessage` 处理逻辑匹配：

```javascript
// 修复前
window.wx.miniProgram.postMessage({
  data: { action: 'navigate', url: this.config.miniProgramLoginUrl }
})

// 修复后
window.wx.miniProgram.postMessage({
  data: { type: 'login' }
})
```
## 技术原理

### 小程序 Webview 通信机制

```
┌─────────────────┐                    ┌─────────────────┐
│   H5 页面       │                    │   小程序        │
│   (web-view)    │                    │                 │
├─────────────────┤                    ├─────────────────┤
│                 │  navigateTo()      │                 │
│ wx.miniProgram  │ ─────────────────► │ 页面跳转        │
│                 │                    │                 │
│                 │  postMessage()     │                 │
│                 │ ─────────────────► │ bindmessage     │
│                 │                    │ onMessage(e)    │
└─────────────────┘                    └─────────────────┘
```
### 关键 API

1. **wx.miniProgram.navigateTo()**

   - 直接跳转到小程序页面
   - 需要页面在 `app.json` 中注册
2. **wx.miniProgram.postMessage()**

   - 向小程序发送消息
   - 小程序通过 `bindmessage` 接收
   - 消息在特定时机触发（后退、组件销毁、分享时）
3. **环境检测**

   ```javascript
   isInMiniProgram() {
     return (
       window.__wxjs_environment === 'miniprogram' ||
       (window.wx && window.wx.miniProgram) ||
       /miniProgram/i.test(navigator.userAgent)
     )
   }
   ```

## 修改文件清单


| 文件                        | 修改内容               |
| --------------------------- | ---------------------- |
| `webview/index.html`        | 引入 JSSDK             |
| `webview/js/WechatLogin.js` | 环境检查、消息格式修复 |
| `webview/app.js`            | 版本号更新             |
| `webview/index.html`        | 版本号显示更新         |

## 版本信息

- 修复版本：1.0.5
- 修复日期：2026-03-26

## 参考代码

- 正常工作的参考实现：`e:\Item\shuxiaohe\sxz\webview0\js\WechatLogin.js`
- 小程序端消息处理：`e:\Item\shuxiaohe\wxapp\pages\webview\webview.js`

```