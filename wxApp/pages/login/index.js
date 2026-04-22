// pages/login/index.js - 登录页面
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    loading: false
  },

  async doLogin() {
    if (this.data.loading) return;

    this.setData({ loading: true });
    wx.showLoading({ title: '登录中...' });

    try {
      const userInfo = await app.login();
      wx.hideLoading();

      if (userInfo) {
        wx.showToast({ title: '登录成功', icon: 'success' });

        // 登录成功，返回 webview 页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});