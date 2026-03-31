// pages/post/post.js - 帖子详情
const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    postId: '',
    post: null,
    comments: [],
    commentText: '',
    isLiked: false,
    isOwner: false,
    isFollowing: false,
    hasTaken: false,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ postId: options.id });
      this.loadData();
    }
  },

  async loadData() {
    await Promise.all([this.loadPostDetail(), this.loadComments()]);
  },

  // 加载帖子详情
  async loadPostDetail() {
    const res = await api.getPostDetail(this.data.postId);

    if (res.success) {
      const userInfo = app.globalData.userInfo;
      const isOwner = userInfo && userInfo.id === res.data.author.id;

      this.setData({
        post: res.data,
        isOwner,
        loading: false
      });

      // 检查是否已关注作者
      if (userInfo && !isOwner) {
        const followRes = await api.checkIsFollowing(userInfo.id, res.data.author.id);
        this.setData({ isFollowing: followRes.isFollowing });
      }
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载评论
  async loadComments() {
    const res = await api.getComments(this.data.postId);
    if (res.success) {
      this.setData({ comments: res.data });
    }
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.post.images
    });
  },

  // 点赞
  async toggleLike() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const post = this.data.post;
    const res = await api.toggleLike(userInfo.id, 'post', this.data.postId);

    if (res.success) {
      post.isLiked = true;
      post.likes_count += 1;
      this.setData({ post, isLiked: true });
    }
  },

  // 接取任务
  async takeTask() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const res = await api.takeTask(this.data.postId, userInfo.id);
    if (res.success) {
      wx.showToast({ title: '接取成功' });
      this.setData({ hasTaken: true });
    } else {
      wx.showToast({ title: res.error_msg || '接取失败', icon: 'none' });
    }
  },

  // 输入评论
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 提交评论
  async submitComment() {
    const text = this.data.commentText.trim();
    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const res = await api.addComment({
      post_id: this.data.postId,
      content: text
    });

    if (res.success) {
      await this.loadComments();
      this.setData({ commentText: '' });
      wx.showToast({ title: '评论成功' });
    } else {
      wx.showToast({ title: '评论失败', icon: 'none' });
    }
  },

  // 回复评论
  replyComment(e) {
    const nickname = e.currentTarget.dataset.nickname;
    this.setData({ commentText: `@${nickname} ` });
  },

  // 跳转用户空间
  goToUserSpace(e) {
    const userId = e.currentTarget.dataset.id;
    if (userId) {
      wx.navigateTo({ url: `/pages/profile-space/profile-space?id=${userId}` });
    }
  },

  // 关注/取消关注
  async toggleFollow() {
    console.log('[toggleFollow] 开始');
    const userInfo = app.globalData.userInfo;
    console.log('[toggleFollow] userInfo:', userInfo);

    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const authorId = this.data.post?.author?.id;
    console.log('[toggleFollow] authorId:', authorId);
    console.log('[toggleFollow] post:', this.data.post);

    if (!authorId) {
      wx.showToast({ title: '无法获取作者信息', icon: 'none' });
      return;
    }

    if (this.data.isFollowing) {
      // 取消关注
      const res = await api.unfollowUser(userInfo.id, authorId);
      if (res.success) {
        this.setData({ isFollowing: false });
        wx.showToast({ title: '已取消关注' });
      } else {
        wx.showToast({ title: res.error_msg || '操作失败', icon: 'none' });
      }
    } else {
      // 关注
      const res = await api.followUser(userInfo.id, authorId);
      if (res.success) {
        this.setData({ isFollowing: true });
        wx.showToast({ title: '关注成功' });
      } else {
        wx.showToast({ title: res.error_msg || '操作失败', icon: 'none' });
      }
    }
  },

  // 分享
  onShareAppMessage() {
    const post = this.data.post;
    if (!post) {
      return {
        title: '友趣 - 校园社区',
        path: '/pages/index/index'
      };
    }

    return {
      title: post.title,
      path: `/pages/post/post?id=${this.data.postId}`,
      imageUrl: post.cover || (post.images && post.images.length > 0 ? post.images[0] : '')
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const post = this.data.post;
    if (!post) {
      return {
        title: '友趣 - 校园社区',
        query: ''
      };
    }

    return {
      title: post.title,
      query: `id=${this.data.postId}`,
      imageUrl: post.cover || (post.images && post.images.length > 0 ? post.images[0] : '')
    };
  }
});