// pages/chat/chat.js - 任务对话
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    taskId: '',           // 任务接取记录 ID
    postId: '',           // 帖子 ID
    otherUserId: '',      // 对方用户 ID
    taskInfo: {
      title: '',
      status: ''
    },
    messages: [],
    inputText: '',
    scrollToView: '',
    userInfo: null
  },

  onLoad(options) {
    // 获取当前用户信息
    this.setData({ userInfo: app.globalData.userInfo });

    if (options.taskId) {
      this.setData({
        taskId: options.taskId,
        postId: options.postId || '',
        otherUserId: options.otherUserId || ''
      });
      this.loadTaskInfo();
      this.loadMessages();
    }
  },

  onShow() {
    // 更新用户信息
    this.setData({ userInfo: app.globalData.userInfo });
    // 刷新消息
    this.loadMessages();
  },

  async loadTaskInfo() {
    if (this.data.postId) {
      const res = await api.getPostDetail(this.data.postId);
      if (res.success) {
        this.setData({
          taskInfo: {
            title: res.data.title,
            status: res.data.status || '进行中'
          }
        });
      }
    }
  },

  async loadMessages() {
    const res = await api.getChatMessages(this.data.taskId);
    if (res.success) {
      const userInfo = app.globalData.userInfo;
      const messages = res.data.map(msg => ({
        ...msg,
        isSelf: msg.sender.id === userInfo?.id
      }));

      this.setData({ messages });

      // 滚动到底部
      if (messages.length > 0) {
        this.setData({
          scrollToView: `msg-${messages.length - 1}`
        });
      }
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 发送消息
    const res = await api.sendChatMessage(
      this.data.taskId,
      userInfo.id,
      this.data.otherUserId,
      text
    );

    if (res.success) {
      this.setData({ inputText: '' });
      await this.loadMessages();
    } else {
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  goToPost() {
    if (this.data.postId) {
      wx.navigateTo({ url: `/pages/post/post?id=${this.data.postId}` });
    }
  }
});