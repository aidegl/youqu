/**
 * 测试活动页面数据加载
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');

console.log('=== 测试活动数据加载 ===\n');

// 测试 1: 获取所有帖子
console.log('测试 1: 获取所有帖子（不筛选）');
api.getPosts('', 1, 10).then(res => {
  console.log('所有帖子响应:', res);
  console.log('所有帖子数量:', res.data?.length || 0);
  
  if (res.data && res.data.length > 0) {
    console.log('\n帖子列表:');
    res.data.forEach((post, i) => {
      console.log(`[${i + 1}] ${post.title}`);
      console.log(`    category: ${post.category}`);
      console.log(`    task_type: ${post.task_type}`);
    });
  }
  
  // 测试 2: 筛选活动
  console.log('\n\n=== 测试 2: 筛选活动（category=活动） ===');
  api.getPosts('活动', 1, 10).then(res => {
    console.log('活动响应:', res);
    console.log('活动数量:', res.data?.length || 0);
    
    if (res.data && res.data.length > 0) {
      console.log('\n活动列表:');
      res.data.forEach((activity, i) => {
        console.log(`[${i + 1}] ${activity.title}`);
        console.log(`    category: ${activity.category}`);
        console.log(`    task_type: ${activity.task_type}`);
        console.log(`    bounty_amount: ${activity.bounty_amount}`);
      });
    } else {
      console.log('\n❌ 没有活动数据');
      console.log('\n解决方案:');
      console.log('1. 运行 add-activity-data.js 添加活动数据');
      console.log('2. 或者在 HAP 中手动创建活动记录（category=活动）');
    }
    
    console.log('\n=== 测试完成 ===\n');
  }).catch(err => {
    console.error('❌ 测试 2 异常:', err);
  });
  
}).catch(err => {
  console.error('❌ 测试 1 异常:', err);
});
