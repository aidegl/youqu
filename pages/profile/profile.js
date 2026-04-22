// pages/profile/profile.js
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      posts: 0,
      followers: 0,
      following: 0
    }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo });
  },

  async loadData() {
    this.setData({ userInfo: app.globalData.userInfo });

    if (app.globalData.userInfo?.id) {
      const [postsRes, followStatsRes] = await Promise.all([
        api.getUserPosts(app.globalData.userInfo.id),
        api.getFollowStats(app.globalData.userInfo.id)
      ]);

      this.setData({
        stats: {
          posts: postsRes.data?.length || 0,
          followers: followStatsRes.data?.followerCount || 0,
          following: followStatsRes.data?.followingCount || 0
        }
      });
    }
  },

  async login() {
    await app.login();
    try {
      await app.getUserProfile();
    } catch (e) {}
    this.setData({ userInfo: app.globalData.userInfo });
    this.loadData();
  },

  async editAvatar() {
    if (!this.data.userInfo) {
      await this.login();
      return;
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '上传中...' });

        try {
          const imageUrl = await api.uploadImageToTemp(tempFilePath);
          await api.updateRow(api.WORKSHEET_ID.users, this.data.userInfo.id, {
            '69c527ef867350d552fb710f': [{ url: imageUrl, name: 'avatar.jpg' }]
          });

          const userInfo = { ...this.data.userInfo, avatar: imageUrl };
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);

          wx.hideLoading();
          this.setData({ userInfo });
          wx.showToast({ title: '头像已更新', icon: 'success' });
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    });
  },

  async editNickname() {
    if (!this.data.userInfo) {
      await this.login();
      return;
    }

    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: async (res) => {
        if (res.confirm && res.content) {
          const newNickname = res.content.trim();
          if (newNickname.length < 2 || newNickname.length > 20) {
            wx.showToast({ title: '昵称长度 2-20 字符', icon: 'none' });
            return;
          }

          wx.showLoading({ title: '保存中...' });
          const userInfo = { ...this.data.userInfo, nickname: newNickname };

          if (userInfo.id) {
            await api.updateRow(api.WORKSHEET_ID.users, userInfo.id, { nickname: newNickname });
          }

          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);

          wx.hideLoading();
          this.setData({ userInfo });
          wx.showToast({ title: '昵称已更新', icon: 'success' });
        }
      }
    });
  },

  goToMyPosts() {
    wx.navigateTo({ url: '/pages/profile-space/profile-space?id=self' });
  },

  goToAlbum() {
    wx.navigateTo({ url: '/pages/album/album' });
  },

  goToMessages() {
    wx.switchTab({ url: '/pages/messages/messages' });
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');

          wx.showToast({ title: '已退出登录', icon: 'success' });
          setTimeout(() => {
            this.setData({ userInfo: null });
            wx.switchTab({ url: '/pages/index/index' });
          }, 1000);
        }
      }
    });
  }
});