/**
 * 测试轮播图图片加载
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');

console.log('=== 测试轮播图图片 ===\n');

api.getBanners().then(res => {
  console.log('API 响应:', res);
  
  if (!res.success || res.data.length === 0) {
    console.log('❌ 无数据');
    console.log('success:', res.success);
    console.log('data:', res.data);
    return;
  }
  
  console.log(`✅ 获取到 ${res.data.length} 条轮播图\n`);
  
  res.data.forEach((banner, i) => {
    console.log(`[轮播图 ${i + 1}]`);
    console.log(`  ID: ${banner.id}`);
    console.log(`  图片 URL: ${banner.image}`);
    console.log(`  URL 是否有效：${banner.image && banner.image.startsWith('http') ? '✅ 是' : '❌ 否'}`);
    
    // 测试图片是否可访问
    if (banner.image && banner.image.startsWith('http')) {
      wx.request({
        url: banner.image,
        method: 'HEAD',
        success: (res) => {
          console.log(`  图片访问测试：✅ 成功 (状态码：${res.statusCode})`);
        },
        fail: (err) => {
          console.log(`  图片访问测试：❌ 失败 (${err.errMsg})`);
        }
      });
    }
    
    console.log('');
  });
  
  console.log('=== 测试完成 ===\n');
  console.log('下一步:');
  console.log('1. 检查上面的图片 URL 是否有效');
  console.log('2. 检查图片访问测试结果');
  console.log('3. 如果 URL 有效但图片不显示，检查域名配置');
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
