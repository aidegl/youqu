// pages/profile-space/profile-space.js - 用户个人空间
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userId: '',
    isSelf: false,
    userInfo: null,
    stats: { posts: 0 },
    currentTab: '赏金任务',
    tabs: ['赏金任务', '问答', '吐槽'],
    posts: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      const isSelf = options.id === 'self' || options.id === app.globalData.userInfo?.id;
      this.setData({
        userId: isSelf ? app.globalData.userInfo?.id : options.id,
        isSelf
      });
      this.loadData();
    }
  },

  async loadData() {
    await Promise.all([this.loadUserInfo(), this.loadPosts()]);
  },

  async loadUserInfo() {
    const res = await api.getUserInfo(this.data.userId);
    if (res.success) {
      this.setData({ userInfo: res.data });
    }
  },

  async loadPosts() {
    this.setData({ loading: true });
    const res = await api.getUserPosts(this.data.userId, this.data.currentTab);
    if (res.success) {
      // 统计总数
      const allPosts = await api.getUserPosts(this.data.userId);
      this.setData({
        posts: res.data,
        stats: { posts: allPosts.data?.length || 0 },
        loading: false
      });
    } else {
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadPosts();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/post/post?id=' + e.currentTarget.dataset.id });
  }
});