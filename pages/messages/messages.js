// pages/messages/messages.js - 消息列表
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    currentTab: '',
    messages: [],
    loading: false
  },

  onShow() {
    this.loadMessages();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab === 'all' ? '' : tab });
    this.loadMessages();
  },

  async loadMessages() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      this.setData({ messages: [] });
      return;
    }

    this.setData({ loading: true });
    const res = await api.getMessages(userInfo.id, this.data.currentTab);

    if (res.success) {
      this.setData({ messages: res.data, loading: false });
    } else {
      this.setData({ loading: false });
    }
  },

  async goToDetail(e) {
    const msg = e.currentTarget.dataset.msg;

    // 标记已读
    if (!msg.is_read) {
      await api.markMessageRead(msg.id);
    }

    // 根据消息类型跳转
    if (msg.related_post_id) {
      wx.navigateTo({ url: `/pages/post/post?id=${msg.related_post_id}` });
    }
  },

  async onPullDownRefresh() {
    await this.loadMessages();
    wx.stopPullDownRefresh();
  }
});