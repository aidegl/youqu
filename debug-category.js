/**
 * 调试分类筛选问题
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');

console.log('=== 调试分类筛选 ===\n');

// 测试 1: 获取所有帖子（不筛选）
console.log('测试 1: 获取所有帖子');
api.getRows(api.WORKSHEET_ID.posts, { pageSize: 10 }).then(res => {
  console.log('所有帖子响应:', res);
  console.log('帖子数量:', res.data?.rows?.length || 0);
  
  if (res.data?.rows) {
    console.log('\n=== 原始数据分析 ===');
    res.data.rows.forEach((row, i) => {
      console.log(`\n[帖子 ${i+1}]`);
      console.log('  title:', row.title);
      console.log('  category 字段 ID:', row['69b5db79440840fde287375b']);
      console.log('  category value:', row['69b5db79440840fde287375b']?.[0]?.value);
    });
  }
  
  // 测试 2: 筛选"问答"分类
  console.log('\n\n=== 测试 2: 筛选"问答"分类 ===');
  api.getPosts('问答', 1, 10).then(res => {
    console.log('问答分类响应:', res);
    console.log('问答分类数量:', res.data?.length || 0);
    
    if (res.data && res.data.length > 0) {
      console.log('\n问答分类的帖子:');
      res.data.forEach((post, i) => {
        console.log(`[${i+1}] ${post.title} - category: ${post.category}`);
      });
    } else {
      console.log('❌ 没有问答分类的帖子');
    }
    
    // 测试 3: 筛选"赏金任务"分类
    console.log('\n\n=== 测试 3: 筛选"赏金任务"分类 ===');
    api.getPosts('赏金任务', 1, 10).then(res => {
      console.log('赏金任务响应:', res);
      console.log('赏金任务数量:', res.data?.length || 0);
      
      if (res.data && res.data.length > 0) {
        console.log('\n赏金任务的帖子:');
        res.data.forEach((post, i) => {
          console.log(`[${i+1}] ${post.title} - category: ${post.category}`);
        });
      } else {
        console.log('❌ 没有赏金任务的帖子');
      }
      
      console.log('\n=== 调试完成 ===\n');
    });
  });
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
