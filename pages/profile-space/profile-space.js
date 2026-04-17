// pages/profile-space/profile-space.js - 用户个人空间
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userId: '',
    isSelf: false,
    isFollowing: false,
    userInfo: null,
    stats: { posts: 0, followers: 0, following: 0 },
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
    await Promise.all([this.loadUserInfo(), this.loadPosts(), this.loadFollowStats()]);
    // 检查关注状态
    if (!this.data.isSelf && app.globalData.userInfo) {
      const res = await api.checkIsFollowing(app.globalData.userInfo.id, this.data.userId);
      this.setData({ isFollowing: res.isFollowing });
    }
  },

  async loadUserInfo() {
    const res = await api.getUserInfo(this.data.userId);
    if (res.success) {
      this.setData({ userInfo: res.data });
    }
  },

  async loadFollowStats() {
    const res = await api.getFollowStats(this.data.userId);
    if (res.success) {
      this.setData({
        stats: {
          ...this.data.stats,
          followers: res.data.followerCount,
          following: res.data.followingCount
        }
      });
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
        stats: {
          ...this.data.stats,
          posts: allPosts.data?.length || 0
        },
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
  },

  goToAlbum() {
    wx.navigateTo({ url: '/pages/album/album?userId=' + this.data.userId });
  },

  // 关注/取消关注
  async toggleFollow() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.isFollowing) {
      // 取消关注
      const res = await api.unfollowUser(userInfo.id, this.data.userId);
      if (res.success) {
        this.setData({
          isFollowing: false,
          'stats.followers': this.data.stats.followers - 1
        });
        wx.showToast({ title: '已取消关注' });
      } else {
        wx.showToast({ title: res.error_msg || '操作失败', icon: 'none' });
      }
    } else {
      // 关注
      const res = await api.followUser(userInfo.id, this.data.userId);
      if (res.success) {
        this.setData({
          isFollowing: true,
          'stats.followers': this.data.stats.followers + 1
        });
        wx.showToast({ title: '关注成功' });
      } else {
        wx.showToast({ title: res.error_msg || '操作失败', icon: 'none' });
      }
    }
  }
});