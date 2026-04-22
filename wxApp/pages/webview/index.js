// pages/webview/index.js - WebView 页面
const app = getApp();

Page({
  data: {
    url: '',
    webviewKey: 0
  },

  onLoad(options) {
    this.loadWebview();
  },

  onShow() {
    // 每次显示时同步 openid 到 H5
    this.syncOpenid();
  },

  async loadWebview() {
    // 等待 app 初始化
    await this.waitAppReady();

    // URL 配置
    const COMMUNITY_URL = 'https://100000whys.cn/youqu/webview/websh.html';
    const TRAINING_URL = 'https://100000whys.cn/youqu/webview/index.html';

    // 根据审核状态决定显示哪个页面
    // configMode = true（审核模式） → 培训页
    // configMode = false（正常模式） → 社区页
    const configMode = app.globalData.configMode;
    const targetUrl = configMode ? TRAINING_URL : COMMUNITY_URL;

    // Cache Busting
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);

    // 构建基础 URL
    const baseUrl = `${targetUrl}?v=${timestamp}&_r=${random}`;

    // 获取 openid
    const openid = app.globalData.openid || wx.getStorageSync('userInfo')?.openid || '';
    const userId = app.globalData.userInfo?.id || '';

    // 通过 hash 传递用户信息
    let finalUrl = baseUrl;
    if (openid) {
      finalUrl += `#openid=${openid}&userId=${userId}`;
    }

    console.log('[Webview] configMode:', configMode);
    console.log('[Webview] 加载 URL:', finalUrl);

    // 强制刷新
    const newKey = this.data.webviewKey + 1;
    this.setData({ url: '', webviewKey: newKey }, () => {
      setTimeout(() => {
        this.setData({ url: finalUrl });
      }, 100);
    });
  },

  // 等待 app ready
  async waitAppReady() {
    return new Promise(resolve => {
      if (app.globalData) {
        resolve();
      } else {
        setTimeout(resolve, 50);
      }
    });
  },

  // 同步 openid 到 H5
  syncOpenid() {
    const openid = app.globalData.openid || wx.getStorageSync('userInfo')?.openid || '';
    const userId = app.globalData.userInfo?.id || '';

    if (!this.data.url || !openid) return;

    // 解析当前 URL
    const urlParts = this.data.url.split('#');
    const baseUrl = urlParts[0];
    const currentHash = urlParts[1] || '';

    // 构建新的 hash
    const newHash = `openid=${openid}&userId=${userId}`;
    const newUrl = `${baseUrl}#${newHash}`;

    // 只有 openid 变化才更新
    if (currentHash !== newHash) {
      console.log('[Webview] 同步 openid:', openid);
      this.setData({ url: newUrl });
    }
  },

  // 处理 H5 发来的消息
  onMessage(e) {
    console.log('[Webview] 收到消息:', e.detail);

    const data = e.detail.data;
    if (!data || data.length === 0) return;

    // 取最后一条消息
    const msg = data[data.length - 1];

    if (msg.type === 'login') {
      // H5 请求登录 → 跳转小程序登录页
      wx.navigateTo({ url: '/pages/login/index' });
    } else if (msg.type === 'navigate' && msg.url) {
      // H5 请求跳转页面
      wx.navigateTo({ url: msg.url });
    } else if (msg.type === 'switchTab' && msg.url) {
      // H5 请求切换 tab（但小程序没有 tabBar，所以用 navigate）
      wx.navigateTo({ url: msg.url });
    }
  },

  onShareAppMessage() {
    return {
      title: '友趣校园',
      path: '/pages/webview/index'
    };
  }
});