// app.js - 友趣小程序入口（仅作为 webview 壳）
const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    openid: null,
    configMode: null,     // 审核状态：true=审核模式（显示培训页），false=正常模式（显示社区页）
    configLoaded: false   // 配置是否已加载
  },

  async onLaunch() {
    console.log('===== [App onLaunch] 开始 =====');
    console.log('[App] globalData 初始状态:', JSON.stringify(this.globalData));

    // 检查本地登录状态
    this.checkLogin();

    // 加载系统配置（审核状态）
    console.log('[App] 开始加载系统配置...');
    await this.loadConfig();

    console.log('[App] 配置加载完成');
    console.log('[App] globalData 最终状态:', JSON.stringify(this.globalData));
    console.log('===== [App onLaunch] 完成 =====');
  },

  // 加载系统配置（审核状态）
  async loadConfig() {
    console.log('===== [App loadConfig] 开始 =====');

    try {
      console.log('[App] 调用 api.getSysConfig...');
      const res = await api.getSysConfig();

      console.log('===== [App getSysConfig 响应] =====');
      console.log('[App] res:', JSON.stringify(res, null, 2));
      console.log('[App] res.success:', res.success);
      console.log('[App] res.value:', res.value);
      console.log('[App] res.isSpecialMode:', res.isSpecialMode);

      if (res.success) {
        // value = "1" 表示审核模式，显示培训页
        // value = "0" 表示正常模式，显示社区页
        this.globalData.configMode = res.isSpecialMode;
        console.log('[App] configMode 设置为:', res.isSpecialMode);
        console.log('[App] configMode 类型:', typeof res.isSpecialMode);
      } else {
        // API 失败时默认显示社区页
        this.globalData.configMode = false;
        console.log('[App] API 失败，configMode 默认为 false');
      }

    } catch (e) {
      console.error('[App] loadConfig 异常:', e);
      this.globalData.configMode = false;
      console.log('[App] 异常处理，configMode = false');
    }

    this.globalData.configLoaded = true;
    console.log('[App] configLoaded 设置为 true');
    console.log('===== [App loadConfig] 完成 =====');
    console.log('[App] 最终 configMode:', this.globalData.configMode);
  },

  // 检查本地登录状态
  checkLogin() {
    console.log('[App] checkLogin...');
    const userInfo = wx.getStorageSync('userInfo');
    console.log('[App] 本地 userInfo:', userInfo);

    if (userInfo && userInfo.id) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
      console.log('[App] 已登录，openid:', userInfo.openid);
    } else {
      console.log('[App] 未登录');
    }
  },

  // 微信登录（供 login 页面调用）
  async login() {
    console.log('===== [App login] 开始 =====');
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          if (!res.code) {
            reject(new Error('获取微信 code 失败'));
            return;
          }
          console.log('[App] wx.login code:', res.code);

          try {
            // 调用后端换取 openid
            const loginRes = await api.code2session(res.code);
            console.log('[App] code2session 响应:', loginRes);

            if (!loginRes.success) {
              reject(new Error(loginRes.error_msg || '登录失败'));
              return;
            }

            const { openid, nickname, avatar, token } = loginRes.data;

            // 同步用户到 HAP
            const hapUserRes = await api.getOrCreateUser(openid, { nickname, avatar });
            console.log('[App] HAP 用户同步:', hapUserRes);

            if (!hapUserRes.success) {
              reject(new Error('用户同步失败'));
              return;
            }

            // 合并用户信息
            const userInfo = {
              id: hapUserRes.data.id,
              openid: openid,
              nickname: hapUserRes.data.nickname || nickname || '用户',
              avatar: hapUserRes.data.avatar || avatar,
              token: token
            };

            this.globalData.userInfo = userInfo;
            this.globalData.openid = openid;
            wx.setStorageSync('userInfo', userInfo);

            console.log('[App] 登录成功，userInfo:', userInfo);
            console.log('===== [App login] 完成 =====');
            resolve(userInfo);
          } catch (err) {
            console.error('[App] login 异常:', err);
            reject(err);
          }
        },
        fail: (err) => {
          console.error('[App] wx.login 失败:', err);
          reject(err);
        }
      });
    });
  },

  // 退出登录
  logout() {
    console.log('[App] logout');
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    wx.removeStorageSync('userInfo');
  }
});