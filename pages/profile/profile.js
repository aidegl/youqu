// pages/profile/profile.js - 个人中心
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

  async onShow() {
    await this.loadData();
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
    // 先调用微信登录获取 openid
    await app.login();
    
    // 再获取用户头像昵称
    try {
      await app.getUserProfile();
    } catch (e) {
      // 用户拒绝授权，使用默认信息
      console.log('用户拒绝授权，使用默认头像昵称');
    }
    
    this.setData({ userInfo: app.globalData.userInfo });
    this.loadData();
  },

  // 修改头像
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
        
        // 上传头像到 HAP（需要实现上传接口）
        // 这里暂时使用临时路径显示
        const newAvatar = tempFilePath;
        
        // 更新本地用户信息
        const userInfo = {
          ...this.data.userInfo,
          avatar: newAvatar
        };
        
        // 更新到 HAP
        if (userInfo.id) {
          await api.updateRow(api.WORKSHEET_ID.users, userInfo.id, {
            avatar: newAvatar
          });
        }
        
        // 更新全局和本地
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        
        wx.hideLoading();
        this.setData({ userInfo });
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }
    });
  },

  // 修改昵称
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
          
          // 更新到 HAP
          const userInfo = {
            ...this.data.userInfo,
            nickname: newNickname
          };
          
          if (userInfo.id) {
            await api.updateRow(api.WORKSHEET_ID.users, userInfo.id, {
              nickname: newNickname
            });
          }
          
          // 更新全局和本地
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

  goToMessages() {
    wx.switchTab({ url: '/pages/messages/messages' });
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          
          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          
          // 提示并返回上一页或刷新
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 刷新当前页面
          setTimeout(() => {
            this.setData({ userInfo: null });
            // 返回到首页
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1000);
        }
      }
    });
  }
});