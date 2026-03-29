// pages/task/task.js
const app = getApp();
Page({
  data: {
    task: { id: '1', title: '帮我取快递', content: '菜鸟驿站8866，有偿5元', task_type: '一对多', bounty_amount: 5, status: '进行中' },
    takers: [
      { id: 'u1', nickname: '用户A', avatar: '', status: '进行中' },
      { id: 'u2', nickname: '用户B', avatar: '', status: '已完成' }
    ],
    isOwner: false
  },
  onLoad(options) { if (options.id) { this.setData({ taskId: options.id }); } },
  takeTask() { wx.showToast({ title: '接取成功' }); }
});