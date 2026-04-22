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
    const res = await api.getSysConfig();
    if (res.success) {
      this.globalData.configMode = res.isSpecialMode;
    }
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.hapUserId) {  // 确保有 HAP 用户 ID
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
    }
  },

  // 微信登录 - 获取 openid 并同步到 HAP
  async login() {
    return new Promise((resolve, reject) => {
      // 1. 获取微信登录 code
      wx.login({
        success: async (res) => {
          if (!res.code) {
            reject(new Error('获取微信 code 失败'));
            return;
          }
          console.log('===== [登录] 开始 =====');
          console.log('[登录] 微信 code:', res.code);

          try {
            // 2. 调用通用 API 用 code 换 openid
            const loginRes = await api.code2session(res.code);
            console.log('[登录] code2session 响应:', JSON.stringify(loginRes, null, 2));

            if (!loginRes.success) {
              console.error('[登录] code2session 失败:', loginRes.error_msg);
              reject(new Error(loginRes.error_msg || '登录失败'));
              return;
            }

            const { openid, nickname, avatar, token } = loginRes.data;
            console.log('[登录] 获取到 openid:', openid);

            // 3. 同步用户到 HAP（通过 openid 查找或创建）
            console.log('[登录] 开始同步用户到 HAP...');
            const hapUserRes = await api.getOrCreateUser(openid, { nickname, avatar });
            console.log('[登录] HAP 用户同步响应:', JSON.stringify(hapUserRes, null, 2));

            if (!hapUserRes.success) {
              console.error('[登录] HAP 用户同步失败:', hapUserRes.error_msg);
              reject(new Error('用户同步失败'));
              return;
            }

            // 4. 合并用户信息
            const userInfo = {
              id: hapUserRes.data.id,
              hapUserId: hapUserRes.data.id,
              openid: openid,
              nickname: hapUserRes.data.nickname || nickname || '用户',
              avatar: hapUserRes.data.avatar || avatar,
              token: token
            };

            console.log('===== [登录] 成功 =====');
            console.log('[登录] 最终用户信息:', JSON.stringify(userInfo, null, 2));
            console.log('[登录] HAP 用户 ID (用于关联):', userInfo.id);
            console.log('[登录] 微信 openid:', userInfo.openid);
            console.log('[登录] 昵称:', userInfo.nickname);
            console.log('[登录] 头像:', userInfo.avatar);

            this.globalData.userInfo = userInfo;
            this.globalData.openid = openid;
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('token', token);

            resolve(userInfo);
          } catch (err) {
            console.error('[登录] 异常:', err);
            reject(err);
          }
        },
        fail: (err) => {
          console.error('[登录] 失败:', err);
          reject(err);
        }
      });
    });
  },

  // 获取用户信息（更新昵称头像到 HAP）
  async getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: async (res) => {
          const userInfo = {
            ...this.globalData.userInfo,
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl
          };

          // 更新到 HAP 用户表
          if (userInfo.id) {
            try {
              // 用户表字段 ID：
              // - 昵称: 69b5db58a606df9d8178a040
              // - 头像: 69b5db58a606df9d8178a041 (文本框，存URL)
              // - 更新时间: 69b5db58a606df9d8178a046
              await api.updateRow(api.WORKSHEET_ID.users, userInfo.id, {
                '69b5db58a606df9d8178a040': userInfo.nickname,
                '69b5db58a606df9d8178a041': userInfo.avatar,
                '69b5db58a606df9d8178a046': new Date().toISOString()
              });
              console.log('[用户信息] 更新成功');
            } catch (err) {
              console.error('[用户信息] 更新失败:', err);
            }
          }

          this.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          resolve(userInfo);
        },
        fail: reject
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  }
});