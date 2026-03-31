// pages/messages/messages.js - 消息列表
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    currentTab: 'task',
    messages: [],
    taskConversations: [],
    loading: false
  },

  onShow() {
    this.loadMessages();
    this.loadTaskConversations();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab !== 'task') {
      this.loadMessages();
    }
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

  async loadTaskConversations() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      this.setData({ taskConversations: [] });
      return;
    }

    const res = await api.getTaskConversations(userInfo.id);
    if (res.success) {
      this.setData({ taskConversations: res.data });
    }
  },

  async goToDetail(e) {
    const item = e.currentTarget.dataset.item;

    // 标记已读
    if (!item.is_read) {
      await api.markMessageRead(item.id);
    }

    // 根据消息类型跳转
    if (item.related_post_id) {
      wx.navigateTo({ url: `/pages/post/post?id=${item.related_post_id}` });
    }
  },

  goToChat(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/chat/chat?taskId=${item.taskId}&postId=${item.postId}&otherUserId=${item.otherUser.id}`
    });
  },

  async onPullDownRefresh() {
    await Promise.all([this.loadMessages(), this.loadTaskConversations()]);
    wx.stopPullDownRefresh();
  }
});