// pages/album/album.js - 我的相册
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    images: [],
    loading: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.loadImages();
  },

  onShow() {
    // 刷新数据
    this.setData({ page: 1, images: [], hasMore: true });
    this.loadImages();
  },

  async loadImages(loadMore = false) {
    if (this.data.loading || (!loadMore && !this.data.hasMore)) return;

    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    const page = loadMore ? this.data.page + 1 : 1;
    const res = await api.getUserAlbums(userInfo.id, page, 20);

    if (res.success) {
      const newImages = loadMore ? [...this.data.images, ...res.data] : res.data;
      this.setData({
        images: newImages,
        page,
        loading: false,
        hasMore: res.data.length >= 20
      });
    } else {
      this.setData({ loading: false, hasMore: false });
    }
  },

  // 选择并上传图片
  async chooseImage() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...' });

        const tempFiles = res.tempFiles;
        let successCount = 0;

        for (const file of tempFiles) {
          try {
            // 上传到临时服务器
            const imageUrl = await api.uploadImageToTemp(file.tempFilePath);

            // 保存到相册表
            const result = await api.uploadAlbumImage(userInfo.id, imageUrl);
            if (result.success) {
              successCount++;
            }
          } catch (e) {
            console.error('上传失败:', e);
          }
        }

        wx.hideLoading();

        if (successCount > 0) {
          wx.showToast({ title: `上传成功 ${successCount} 张`, icon: 'success' });
          // 刷新列表
          this.setData({ page: 1, images: [], hasMore: true });
          this.loadImages();
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    const urls = this.data.images.map(img => img.image);
    wx.previewImage({
      current: src,
      urls
    });
  },

  // 删除图片
  async deleteImage(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.deleteAlbumImage(id);
          if (result.success) {
            wx.showToast({ title: '已删除', icon: 'success' });
            // 从列表中移除
            const images = this.data.images.filter(img => img.id !== id);
            this.setData({ images });
          } else {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadImages(true);
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, images: [] });
    await this.loadImages();
    wx.stopPullDownRefresh();
  }
});