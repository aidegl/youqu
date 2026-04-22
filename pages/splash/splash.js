// pages/splash/splash.js
const api = require('../../utils/api.js');

Page({
  data: {
    navHeight: 0
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const navHeight = systemInfo.statusBarHeight + 44;
    this.setData({ navHeight });

    this.checkConfigAndNavigate();
  },

  async checkConfigAndNavigate() {
    try {
      const res = await api.getSysConfig();

      if (res.success && res.isSpecialMode) {
        wx.reLaunch({ url: '/pages/index/index' });
      } else {
        wx.switchTab({ url: '/pages/main/main' });
      }
    } catch (e) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});