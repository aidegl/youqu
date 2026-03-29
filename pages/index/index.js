// pages/index/index.js - 首页
const api = require('../../utils/api.js');

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
    // 刷新数据
    this.setData({ page: 1, posts: [], hasMore: true });
    this.loadPosts();
  },

  // 加载轮播图
  async loadBanners() {
    console.log('=== [轮播图] 开始加载 ===');
    console.log('[轮播图] 调用 API...');
    
    // 先测试：直接获取所有记录（不过滤）
    console.log('[轮播图] 测试：获取所有记录（不过滤）...');
    const allRes = await api.getRows(api.WORKSHEET_ID.banners, { pageSize: 10 });
    console.log('[轮播图] 所有记录响应:', allRes);
    console.log('[轮播图] 所有记录数量:', allRes.data?.rows?.length || 0);
    if (allRes.data?.rows) {
      allRes.data.rows.forEach((row, i) => {
        console.log(`[记录 ${i+1}]`, {
          rowid: row.rowid,
          name: row['69b5dc145c2066509f21fd23'],
          isEnable: row['69b5dc145c2066509f21fd27'],
          image: row['69c4eb1c867350d552faf075']
        });
      });
    }
    
    // 然后：获取启用的记录
    const res = await api.getBanners();
    
    console.log('[轮播图] API 响应:', res);
    console.log('[轮播图] success:', res.success);
    console.log('[轮播图] data 长度:', res.data ? res.data.length : 0);
    
    if (res.success && res.data.length > 0) {
      console.log('[轮播图] ✅ 加载成功，数据:', res.data);
      res.data.forEach((banner, index) => {
        console.log(`[轮播图 ${index + 1}]`);
        console.log(`  ID: ${banner.id}`);
        console.log(`  图片 URL: ${banner.image}`);
        console.log(`  URL 长度：${banner.image?.length || 0}`);
        console.log(`  URL 开头：${banner.image?.substring(0, 50)}`);
        console.log(`  链接类型：${banner.link_type}`);
        console.log(`  链接目标：${banner.link_target}`);
      });
      this.setData({ banners: res.data });
      console.log('[轮播图] ✅ setData 完成');
      console.log('[轮播图] 当前页面 banners 数量:', this.data.banners.length);
      console.log('[轮播图] 第一个 banner:', this.data.banners[0]);
    } else {
      console.log('[轮播图] ❌ 加载失败或无数据');
      console.log('[轮播图] 错误信息:', res.error_msg);
      console.log('[轮播图] 所有记录数:', allRes.data?.rows?.length || 0);
      console.log('[轮播图] 使用默认轮播图');
      this.setData({
        banners: [
          { image: 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg', link_type: '无' }
        ]
      });
    }
    
    console.log('=== [轮播图] 加载结束 ===\n');
  },

  // 加载帖子列表
  async loadPosts(loadMore = false) {
    console.log('=== [帖子加载] ===');
    console.log('[帖子加载] loadMore:', loadMore);
    console.log('[帖子加载] currentCategory:', this.data.currentCategory);
    console.log('[帖子加载] loading:', this.data.loading);
    console.log('[帖子加载] hasMore:', this.data.hasMore);
    
    if (this.data.loading || (!loadMore && !this.data.hasMore)) {
      console.log('[帖子加载] 跳过加载');
      return;
    }

    this.setData({ loading: true });
    console.log('[帖子加载] 设置 loading = true');

    const page = loadMore ? this.data.page + 1 : 1;
    console.log('[帖子加载] 请求页码:', page);
    console.log('[帖子加载] 调用 api.getPosts("', this.data.currentCategory, '",', page, ', 10)');

    const res = await api.getPosts(this.data.currentCategory, page, 10);

    console.log('[帖子加载] API 响应:', res);
    console.log('[帖子加载] success:', res.success);
    console.log('[帖子加载] data 长度:', res.data?.length || 0);

    if (res.success) {
      const newPosts = loadMore ? [...this.data.posts, ...res.data] : res.data;
      console.log('[帖子加载] newPosts 数量:', newPosts.length);
      
      this.setData({
        posts: newPosts,
        page,
        loading: false,
        hasMore: res.data.length >= 10
      });
      
      console.log('[帖子加载] ✅ setData 完成');
      console.log('[帖子加载] 当前 posts:', this.data.posts.length);
    } else {
      console.log('[帖子加载] ❌ API 失败:', res.error_msg);
      this.setData({ loading: false, hasMore: false });
    }
    
    console.log('[帖子加载] 加载结束\n');
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    console.log('=== [分类切换] ===');
    console.log('[分类切换] 点击分类:', category);
    console.log('[分类切换] 当前 currentCategory:', this.data.currentCategory);
    
    this.setData({
      currentCategory: category,
      page: 1,
      posts: [],
      hasMore: true
    });
    
    console.log('[分类切换] 设置后 currentCategory:', this.data.currentCategory);
    console.log('[分类切换] 开始加载帖子...');
    this.loadPosts();
  },

  // 轮播图点击事件
  onBannerTap(e) {
    const item = e.currentTarget.dataset.item;
    const linkType = item.link_type;
    const linkTarget = item.link_target;

    console.log('轮播图点击:', linkType, linkTarget);

    switch (linkType) {
      case '内容':
        // 跳转到内容详情
        if (linkTarget) {
          wx.navigateTo({
            url: `/pages/post/post?id=${linkTarget}`
          });
        }
        break;

      case '网页':
        // 打开外部网页
        if (linkTarget) {
          wx.navigateTo({
            url: `webview?url=${encodeURIComponent(linkTarget)}`
          });
        }
        break;

      default:
        // 无链接或未知类型，不做处理
        wx.showToast({
          title: '轮播图',
          icon: 'none'
        });
        break;
    }
  },

  // 跳转帖子详情
  goToDetail(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('[goToDetail] 点击帖子，dataset:', e.currentTarget.dataset);
    console.log('[goToDetail] postId:', postId);
    console.log('[goToDetail] 当前 posts:', this.data.posts);
    
    wx.navigateTo({
      url: `/pages/post/post?id=${postId}`
    });
  },

  // 跳转用户空间
  goToUserSpace(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile-space/profile-space?id=${userId}`
    });
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(true);
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, posts: [] });
    await Promise.all([this.loadBanners(), this.loadPosts()]);
    wx.stopPullDownRefresh();
  }
});
