// pages/main/main.js
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    banners: [],
    posts: [],
    categories: [
      { id: '', name: '全部' },
      { id: '赏金任务', name: '赏金任务' },
      { id: '问答', name: '问答' },
      { id: '吐槽', name: '吐槽' }
    ],
    currentCategory: '',
    page: 1,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadBanners();
    this.loadPosts();
  },

  onShow() {
    this.setData({ page: 1, posts: [], hasMore: true });
    this.loadPosts();
  },

  async loadBanners() {
    const res = await api.getBanners();
    if (res.success && res.data.length > 0) {
      this.setData({ banners: res.data });
    } else {
      this.setData({
        banners: [{ image: 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg', link_type: '无' }]
      });
    }
  },

  async loadPosts(loadMore = false) {
    if (this.data.loading || (!loadMore && !this.data.hasMore)) return;

    this.setData({ loading: true });
    const page = loadMore ? this.data.page + 1 : 1;
    const res = await api.getPosts(this.data.currentCategory, page, 10);

    if (res.success) {
      const newPosts = loadMore ? [...this.data.posts, ...res.data] : res.data;
      this.setData({
        posts: newPosts,
        page,
        loading: false,
        hasMore: res.data.length >= 10
      });
    } else {
      this.setData({ loading: false, hasMore: false });
    }
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category,
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  },

  onBannerTap(e) {
    const item = e.currentTarget.dataset.item;
    const linkType = item.link_type;
    const linkTarget = item.link_target;

    if (linkType === '内容' && linkTarget) {
      wx.navigateTo({ url: `/pages/post/post?id=${linkTarget}` });
    }
  },

  goToDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/post/post?id=${postId}` });
  },

  goToUserSpace(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/profile-space/profile-space?id=${userId}` });
  },

  goToPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(true);
    }
  },

  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, posts: [] });
    await Promise.all([this.loadBanners(), this.loadPosts()]);
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: '友趣',
      path: '/pages/main/main'
    };
  },

  onShareTimeline() {
    return {
      title: '友趣',
      query: ''
    };
  }
});
