// pages/activities/activities.js
const api = require('../../utils/api.js');

Page({
  data: {
    activities: [],
    filteredActivities: [],
    currentType: '',
    page: 1,
    loading: false,
    hasMore: true,
    activityTypes: [
      { id: '', name: '全部' },
      { id: '摄影', name: '🎨 摄影' },
      { id: '娱乐', name: '🎵 娱乐' },
      { id: '学习', name: '📚 学习' },
      { id: '运动', name: '🏃 运动' },
      { id: '美食', name: '🍳 美食' }
    ]
  },

  onLoad() {
    console.log('=== [活动页面] onLoad ===');
    this.loadActivities();
  },

  onShow() {
    console.log('=== [活动页面] onShow ===');
    // 刷新数据
    this.setData({ page: 1, activities: [], hasMore: true });
    this.loadActivities();
  },

  // 加载活动列表
  async loadActivities(loadMore = false) {
    console.log('=== [活动页面] 开始加载活动列表 ===');
    console.log('[活动页面] loadMore:', loadMore);
    console.log('[活动页面] loading:', this.data.loading);
    console.log('[活动页面] hasMore:', this.data.hasMore);
    
    if (this.data.loading || (!loadMore && !this.data.hasMore)) {
      console.log('[活动页面] 跳过加载：loading=', this.data.loading, 'hasMore=', this.data.hasMore);
      return;
    }

    this.setData({ loading: true });
    console.log('[活动页面] 设置 loading = true');

    const page = loadMore ? this.data.page + 1 : 1;
    console.log('[活动页面] 请求页码:', page);
    console.log('[活动页面] 调用 api.getPosts("活动",', page, ', 10)');

    // 获取帖子列表，筛选 category='活动' 的数据
    const res = await api.getPosts('活动', page, 10);

    console.log('[活动页面] API 响应:', res);
    console.log('[活动页面] success:', res.success);
    console.log('[活动页面] data:', res.data);
    console.log('[活动页面] data 长度:', res.data ? res.data.length : 0);

    if (res.success) {
      const newActivities = loadMore ? [...this.data.activities, ...res.data] : res.data;
      
      console.log('[活动页面] newActivities 数量:', newActivities.length);
      console.log('[活动页面] currentType:', this.data.currentType);
      
      const filtered = this.filterByType(newActivities, this.data.currentType);
      console.log('[活动页面] filteredActivities 数量:', filtered.length);
      
      this.setData({
        activities: newActivities,
        filteredActivities: filtered,
        page,
        loading: false,
        hasMore: res.data.length >= 10
      });
      
      console.log('[活动页面] ✅ setData 完成');
      console.log('[活动页面] 当前 activities:', this.data.activities.length);
      console.log('[活动页面] 当前 filteredActivities:', this.data.filteredActivities.length);
      console.log('[活动页面] 当前 page:', this.data.page);
      console.log('[活动页面] 当前 hasMore:', this.data.hasMore);
    } else {
      console.log('[活动页面] ❌ API 失败:', res.error_msg);
      this.setData({ loading: false, hasMore: false });
    }
    
    console.log('=== [活动页面] 加载结束 ===\n');
  },

  // 按类型筛选
  filterByType(activities, type) {
    if (!type) return activities;
    return activities.filter(item => item.task_type === type);
  },

  // 切换活动类型
  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type,
      filteredActivities: this.filterByType(this.data.activities, type)
    });
  },

  // 跳转活动详情
  goToDetail(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/post/post?id=${activityId}`
    });
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities(true);
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, activities: [], filteredActivities: [] });
    await this.loadActivities();
    wx.stopPullDownRefresh();
  }
});
