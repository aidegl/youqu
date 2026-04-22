// 引入明道云API调用组件
const MingDaoYunAPI = require('./MingdaoQuery.js');

App({
  globalData: {
    openid: null,
    isAnonymous: true,
    globalSettings: null
  },

  onLaunch() {
    console.log('[App] onLaunch 执行');

    // 加载全局设置
    this.loadGlobalSettings();

    // 检查本地存储的 openid
    try {
      const stored = wx.getStorageSync('openid');
      if (stored) {
        this.globalData.openid = stored;
        this.globalData.isAnonymous = false;
        console.log('[App] 从缓存读取 openid:', stored);
      }
    } catch (e) {
      console.error('[App] 读取缓存失败:', e);
    }

    // 微信登录
    wx.login({
      success: (res) => {
        console.log('[App] wx.login 成功:', res.code);
        // 这里需要后端换取 openid
      },
      fail: (err) => {
        console.error('[App] wx.login 失败:', err);
      }
    });
  },

  /**
   * 加载全局设置（审核状态等）
   */
  async loadGlobalSettings() {
    console.log('[App] 开始加载全局设置...');
    try {
      if (typeof MingDaoYunAPI === 'undefined') {
        console.warn('[App] MingDaoYunAPI 未加载');
        return;
      }
      const api = new MingDaoYunAPI();
      // 配置表ID和记录ID
      const worksheetId = 'qjsz';
      const rowId = 'your-row-id'; // 需要替换为实际的记录ID

      const result = await api.getData(rowId, worksheetId);
      if (result && result.success) {
        console.log('[App] 全局设置加载成功:', result.data);
        this.globalData.globalSettings = result.data;
        try {
          wx.setStorageSync('globalSettings', result.data);
        } catch (e) {
          console.error('[App] 保存设置到缓存失败:', e);
        }
      } else {
        console.error('[App] 全局设置加载失败');
        // 尝试从缓存读取
        try {
          const cachedSettings = wx.getStorageSync('globalSettings');
          if (cachedSettings) {
            console.log('[App] 从缓存读取全局设置');
            this.globalData.globalSettings = cachedSettings;
          }
        } catch (e) {
          console.error('[App] 读取缓存失败:', e);
        }
      }
    } catch (error) {
      console.error('[App] 加载全局设置异常:', error);
    }
  }
});