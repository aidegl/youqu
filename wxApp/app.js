// app.js - 友趣小程序入口
const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    openid: null,
    configMode: false
  },

  onLaunch() {
    this.checkLogin();
    this.loadConfig();
  },

  // 加载系统配置
  async loadConfig() {
    try {
      const res = await api.getSysConfig();
      if (res.success) {
        this.globalData.configMode = res.isSpecialMode;
      }
    } catch (e) {
      console.error('[App] 加载配置失败:', e);
    }
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
      console.log('[App] 已登录:', userInfo.nickname);
    }
  },

  // 微信登录
  async login() {
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

            resolve(userInfo);
          } catch (err) {
            console.error('[App] 登录异常:', err);
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
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    wx.removeStorageSync('userInfo');
  }
});