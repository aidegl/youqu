// pages/index/index.js
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    navHeight: 0,
    isSpecialMode: true,  // 默认特殊模式（审核）
    loading: true,

    // 培训数据
    courses: [
      { id: 1, title: '公司规章制度', desc: '了解公司基本规章制度和员工行为准则', icon: '📋', progress: 100, completed: true },
      { id: 2, title: '安全培训', desc: '工作场所安全知识和应急处理流程', icon: '🛡️', progress: 80, completed: false },
      { id: 3, title: '业务流程培训', desc: '核心业务流程和操作规范', icon: '📊', progress: 50, completed: false },
      { id: 4, title: '团队协作', desc: '团队沟通技巧和协作工具使用', icon: '👥', progress: 30, completed: false },
      { id: 5, title: '产品知识', desc: '公司产品线介绍和核心功能', icon: '📦', progress: 0, completed: false }
    ],
    stats: { total: 5, completed: 1, inProgress: 3, notStarted: 1 },

    // 社区数据
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
    hasMore: true
  },

  async onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const navHeight = systemInfo.statusBarHeight + 44;
    this.setData({ navHeight, loading: true });

    // 检查后端配置
    const res = await api.getSysConfig();
    const isSpecialMode = res.success && res.isSpecialMode;

    this.setData({ isSpecialMode, loading: false });

    if (isSpecialMode) {
      // 特殊模式：显示培训
      this.calculateStats();
    } else {
      // 正常模式：加载社区数据
      this.loadBanners();
      this.loadPosts();
    }
  },

  onShow() {
    if (!this.data.isSpecialMode) {
      this.setData({ page: 1, posts: [], hasMore: true });
      this.loadPosts();
    }
  },

  // === 培训功能 ===
  calculateStats() {
    const courses = this.data.courses;
    this.setData({
      stats: {
        total: courses.length,
        completed: courses.filter(c => c.completed).length,
        inProgress: courses.filter(c => !c.completed && c.progress > 0).length,
        notStarted: courses.filter(c => c.progress === 0).length
      }
    });
  },

  startCourse(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${courseId}` });
  },

  // === 社区功能 ===
  async loadBanners() {
    const res = await api.getBanners();
    if (res.success && res.data.length > 0) {
      this.setData({ banners: res.data });
    } else {
      this.setData({ banners: [{ image: 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg', link_type: '无' }] });
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
    if (item.link_type === '内容' && item.link_target) {
      wx.navigateTo({ url: `/pages/post/post?id=${item.link_target}` });
    }
  },

  goToDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/post/post?id=${postId}` });
  },

  goToPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' });
  },

  onReachBottom() {
    if (!this.data.isSpecialMode && this.data.hasMore && !this.data.loading) {
      this.loadPosts(true);
    }
  },

  async onPullDownRefresh() {
    if (!this.data.isSpecialMode) {
      this.setData({ page: 1, hasMore: true, posts: [] });
      await Promise.all([this.loadBanners(), this.loadPosts()]);
    }
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return { title: '友趣', path: '/pages/index/index' };
  },

  onShareTimeline() {
    return { title: '友趣', query: '' };
  }
});