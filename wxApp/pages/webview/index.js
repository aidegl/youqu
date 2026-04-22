Page({
  data: {
    baseUrl: '',
    url: '',
    webviewKey: 0
  },

  onLoad(options) {
    const app = getApp();

    const loadWebviewPage = () => {
      // 获取全局设置中的 dmsh 值，决定加载哪个页面
      const globalSettings = app.globalData.globalSettings;
      const dmsh = globalSettings?.dmsh;
      console.log('[Webview] 全局设置 dmsh 值:', dmsh);

      // 调试模式：true 为本地调试，false 为线上
      const IS_DEBUG = false;
      // dmsh="1" 时加载社区页面，否则加载培训页面
      const LOCAL_URL = dmsh === "1"
        ? 'http://127.0.0.1:5500/webview0/websh.html'
        : 'http://127.0.0.1:5500/webview0/index.html';
      const PROD_URL = dmsh === "1"
        ? 'https://100000whys.cn/youqu/webview/websh.html'
        : 'https://100000whys.cn/youqu/webview/index.html';

      let rawBaseUrl = IS_DEBUG ? LOCAL_URL : PROD_URL;

      // 动态资源版本化 (Cache Busting)
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(2, 9);
      const separator = rawBaseUrl.includes('?') ? '&' : '?';
      const baseUrlWithVersion = `${rawBaseUrl}${separator}v=${timestamp}&_r=${random}`;

      console.log('[Webview] 版本号:', timestamp);
      console.log('[Webview] baseUrl:', baseUrlWithVersion);

      // 强制刷新策略：先清空 URL
      this.setData({ url: '', baseUrl: baseUrlWithVersion }, () => {
        setTimeout(() => {
          this.updateWebviewUrl(true);
        }, 50);
      });
    };

    // 检查全局设置是否已加载
    const globalSettings = app.globalData.globalSettings;
    if (globalSettings) {
      loadWebviewPage();
    } else {
      console.log('[Webview] 等待全局设置加载...');
      app.loadGlobalSettings().then(() => {
        console.log('[Webview] 全局设置加载完成');
        loadWebviewPage();
      }).catch((error) => {
        console.error('[Webview] 全局设置加载失败:', error);
        loadWebviewPage();
      });
    }
  },

  onShow() {
    console.log('[Webview] onShow');
    // 非初始加载时同步 openid
    this.updateWebviewUrl(false);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '友趣校园',
      path: '/pages/webview/index',
      imageUrl: ''
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '友趣校园',
      query: '',
      imageUrl: ''
    }
  },

  // 更新 webview URL
  updateWebviewUrl(isInitial = false) {
    const app = getApp();
    const globalOpenid = (app && app.globalData && app.globalData.openid) || '';
    const storedOpenid = wx.getStorageSync('openid') || '';
    const openid = globalOpenid || storedOpenid;
    let baseUrl = this.data.baseUrl;

    if (!baseUrl) {
      console.warn('[Webview] baseUrl 为空');
      return;
    }

    // 构建最终 URL，包含版本号和 openid
    let finalUrl = baseUrl;
    if (openid) {
      finalUrl += `#openid=${openid}`;
    } else {
      finalUrl += `#openid=`;
    }

    const currentUrl = this.data.url;
    if (isInitial || !currentUrl) {
      console.log('[Webview] 设置新 URL:', finalUrl);

      // 强制刷新：通过更新 key 确保 web-view 组件刷新
      const newKey = this.data.webviewKey + 1;
      this.setData({ url: '', webviewKey: newKey }, () => {
        setTimeout(() => {
          this.setData({ url: finalUrl });
        }, 100);
      });
      return;
    }

    // 非初始加载时，检查 openid 是否变化
    let currentOpenid = '';
    const hashIndex = currentUrl.indexOf('#');
    if (hashIndex >= 0) {
      const hash = currentUrl.slice(hashIndex + 1);
      const pairs = hash.split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.indexOf('openid=') === 0) {
          currentOpenid = decodeURIComponent(pair.split('=')[1] || '');
          break;
        }
      }
    }

    const nextOpenid = openid || '';
    if (currentOpenid !== nextOpenid) {
      console.log('[Webview] openid 变化，刷新:', nextOpenid || '(空)');
      this.setData({ url: finalUrl });
    }
  },

  // 处理来自 H5 的消息
  onMessage(e) {
    console.log('[Webview] 收到消息:', JSON.stringify(e.detail, null, 2));
    const data = e.detail.data;
    if (data && data.length > 0) {
      const lastMsg = data[data.length - 1];
      console.log('[Webview] 最后一条消息:', lastMsg);

      // 处理消息类型
      if (lastMsg.type === 'login') {
        // 处理登录请求
        console.log('[Webview] 收到登录请求');
        this.handleLogin();
      } else if (lastMsg.type === 'navigate') {
        // 处理页面跳转
        console.log('[Webview] 收到跳转请求:', lastMsg.url);
        if (lastMsg.url) {
          wx.navigateTo({ url: lastMsg.url });
        }
      }
    }
  },

  // 处理登录
  handleLogin() {
    wx.login({
      success: (res) => {
        console.log('[Webview] 登录成功:', res.code);
        // 这里需要将 code 发送到后端换取 openid
        // 然后通过 hash 传递给 webview
      },
      fail: (err) => {
        console.error('[Webview] 登录失败:', err);
      }
    });
  }
});