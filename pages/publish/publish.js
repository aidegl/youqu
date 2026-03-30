// pages/publish/publish.js - 发布页面
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    categories: [
      { id: '赏金任务', name: '赏金任务' },
      { id: '问答', name: '问答' },
      { id: '吐槽', name: '吐槽' }
    ],
    category: '',
    taskType: '',
    bountyAmount: '',
    title: '',
    content: '',
    images: [],
    submitting: false
  },

  onLoad() {
    if (!app.globalData.userInfo) {
      app.login();
    }
  },

  selectCategory(e) {
    this.setData({ category: e.currentTarget.dataset.id });
  },

  selectTaskType(e) {
    this.setData({ taskType: e.currentTarget.dataset.type });
  },

  onBountyInput(e) {
    this.setData({ bountyAmount: e.detail.value });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...newImages] });
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  async submitPost() {
    if (!this.data.category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    if (!this.data.title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!this.data.content) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    // 显示加载提示（如果有图片，提示正在上传）
    const loadingText = this.data.images.length > 0
      ? `正在上传图片(0/${this.data.images.length})...`
      : '发布中...';
    wx.showLoading({ title: loadingText, mask: true });

    const res = await api.createPost({
      title: this.data.title,
      content: this.data.content,
      category: this.data.category,
      task_type: this.data.taskType,
      bounty_amount: parseFloat(this.data.bountyAmount) || 0,
      images: this.data.images  // 本地路径，createPost 内部会上传
    });

    wx.hideLoading();
    this.setData({ submitting: false });

    if (res.success) {
      wx.showToast({ title: '发布成功' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } else {
      wx.showToast({ title: res.error_msg || '发布失败', icon: 'none' });
    }
  }
});