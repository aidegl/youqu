// pages/webview/index.js - WebView 页面（小程序壳，不判断审核状态）
const app = getApp();

Page({
  data: {
    url: '',
    webviewKey: 0
  },

  onLoad(options) {
    console.log('[Webview] onLoad');
    console.log('[Webview] 小程序只作为壳，审核状态由 H5 判断');
    this.loadWebview();
  },

  onShow() {
    this.syncOpenid();
  },

  async loadWebview() {
    // 等待 app 初始化
    await this.waitAppReady();

    // 固定加载 H5 入口页面
    // H5 入口页面会自己判断审核状态，决定显示培训页还是社区页
    const ENTRY_URL = 'https://100000whys.cn/youqu/webview/entrance.html';

    // Cache Busting
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const baseUrl = `${ENTRY_URL}?v=${timestamp}&_r=${random}`;

    // 获取 openid
    const openid = app.globalData.openid || wx.getStorageSync('userInfo')?.openid || '';
    const userId = app.globalData.userInfo?.id || '';

    // 通过 hash 传递用户信息给 H5
    let finalUrl = baseUrl;
    if (openid) {
      finalUrl += `#openid=${openid}&userId=${userId}`;
    }

    console.log('[Webview] 加载 H5 入口页:', finalUrl);

    // 强制刷新 webview
    const newKey = this.data.webviewKey + 1;
    this.setData({ url: '', webviewKey: newKey }, () => {
      setTimeout(() => {
        this.setData({ url: finalUrl });
      }, 100);
    });
  },

  waitAppReady() {
    return new Promise(resolve => {
      if (app.globalData) {
        resolve();
      } else {
        setTimeout(() => this.waitAppReady().then(resolve), 50);
      }
    });
  },

  syncOpenid() {
    const openid = app.globalData.openid || wx.getStorageSync('userInfo')?.openid || '';
    const userId = app.globalData.userInfo?.id || '';

    if (!this.data.url || !openid) return;

    const urlParts = this.data.url.split('#');
    const baseUrl = urlParts[0];
    const currentHash = urlParts[1] || '';

    const newHash = `openid=${openid}&userId=${userId}`;
    const newUrl = `${baseUrl}#${newHash}`;

    if (currentHash !== newHash) {
      console.log('[Webview] 同步 openid:', openid);
      this.setData({ url: newUrl });
    }
  },

  // 处理 H5 发来的消息
  onMessage(e) {
    console.log('[Webview] 收到 H5 消息:', e.detail);

    const data = e.detail.data;
    if (!data || data.length === 0) return;

    const msg = data[data.length - 1];

    if (msg.type === 'login') {
      // H5 请求登录 → 跳转小程序登录页
      wx.navigateTo({ url: '/pages/login/index' });
    } else if (msg.type === 'navigate' && msg.url) {
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