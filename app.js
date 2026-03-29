// app.js - 友趣小程序入口
const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    openid: null
  },

  onLaunch() {
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
    }
  },

  // 微信登录 - 使用云开发获取 openid
  async login() {
    return new Promise((resolve, reject) => {
      // 初始化云开发（需要在 app.json 配置 cloud 字段）
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        reject(new Error('云开发基础库版本过低'));
        return;
      }

      wx.cloud.init();
      
      // 使用云开发获取 openid
      wx.cloud.callFunction({
        name: 'login',
        success: async (res) => {
          console.log('[云开发登录] 成功:', res);
          const openid = res.result.openid;
          
          // 调用 HAP API 获取或创建用户
          const userRes = await api.getOrCreateUser(openid);
          
          if (userRes.success) {
            const userInfo = userRes.data;
            this.globalData.userInfo = userInfo;
            this.globalData.openid = openid;
            wx.setStorageSync('userInfo', userInfo);
            resolve(userInfo);
          } else {
            reject(new Error('获取用户信息失败'));
          }
        },
        fail: (err) => {
          console.error('[云开发登录] 失败:', err);
          reject(err);
        }
      });
    });
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: async (res) => {
          const userInfo = {
            ...this.globalData.userInfo,
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl
          };

          // 更新到 HAP
          if (userInfo.id) {
            // 使用字段 ID 更新昵称和头像
            const updateData = {};
            // 昵称字段别名 zznc，字段 ID: 69b5db5804186a1d512cb9d7
            updateData['69b5db5804186a1d512cb9d7'] = userInfo.nickname;
            // 头像字段别名 zztx
            updateData['69b5db5804186a1d512cb9d8'] = [{ url: userInfo.avatar }];
            
            await api.updateRow(api.WORKSHEET_ID.users, userInfo.id, updateData);
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
  }
});