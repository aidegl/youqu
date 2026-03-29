/**
 * 轮播图测试脚本
 * 在微信开发者工具控制台中运行此代码
 */

const api = require('./utils/api.js');

console.log('=== 轮播图功能测试 ===\n');

// 测试 1: 获取轮播图数据
console.log('测试 1: 获取轮播图数据');
api.getBanners().then(res => {
  console.log('API 响应:', res);
  
  if (res.success) {
    console.log(`✅ 获取成功！共 ${res.data.length} 条轮播图\n`);
    
    res.data.forEach((banner, index) => {
      console.log(`[轮播图 ${index + 1}]`);
      console.log(`  ID: ${banner.id}`);
      console.log(`  图片 URL: ${banner.image.substring(0, 50)}...`);
      console.log(`  链接类型: ${banner.link_type || '无'}`);
      console.log(`  链接目标: ${banner.link_target || '无'}`);
      console.log('');
    });
    
    // 测试 2: 验证图片 URL 可访问性
    console.log('测试 2: 验证图片 URL 可访问性');
    res.data.forEach((banner, index) => {
      wx.request({
        url: banner.image,
        method: 'HEAD',
        success: () => {
          console.log(`✅ 轮播图 ${index + 1} 图片可访问`);
        },
        fail: (err) => {
          console.log(`❌ 轮播图 ${index + 1} 图片访问失败: ${err.errMsg}`);
        }
      });
    });
    
  } else {
    console.log('❌ 获取失败');
    console.log('错误信息:', res.error_msg);
    console.log('\n可能原因:');
    console.log('1. HAP 中没有"是否启用=是"的轮播图记录');
    console.log('2. HAP-Appkey 或 HAP-Sign 配置错误');
    console.log('3. 网络请求失败');
  }
  
  console.log('\n=== 测试完成 ===');
}).catch(err => {
  console.error('❌ 异常:', err);
});
