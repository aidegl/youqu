/**
 * 启用所有轮播图记录
 * 在微信开发者工具控制台运行此代码
 */

const api = require('./utils/api.js');

console.log('=== 启用轮播图记录 ===\n');

// 获取所有轮播图记录
api.getRows(api.WORKSHEET_ID.banners, { pageSize: 50 }).then(res => {
  if (!res.success) {
    console.log('❌ 获取记录失败:', res.error_msg);
    return;
  }
  
  const records = res.data.rows || [];
  console.log(`找到 ${records.length} 条轮播图记录\n`);
  
  if (records.length === 0) {
    console.log('💡 提示：请先在 HAP 中创建轮播图记录');
    return;
  }
  
  // 更新每条记录
  let updated = 0;
  let failed = 0;
  
  records.forEach((record, index) => {
    const name = record.name || `记录${index + 1}`;
    const rowId = record.rowid;
    
    // 更新 是否启用=是，并设置排序
    api.updateRow(api.WORKSHEET_ID.banners, rowId, {
      '69b5dc145c2066509f21fd27': '是',  // 是否启用
      '69b5dc145c2066509f21fd26': index + 1  // 排序
    }, false).then(result => {
      if (result.success) {
        console.log(`✅ [${index + 1}] ${name} - 已启用，排序=${index + 1}`);
        updated++;
      } else {
        console.log(`❌ [${index + 1}] ${name} - 更新失败：${result.error_msg}`);
        failed++;
      }
      
      // 最后一条记录完成后显示总结
      if (index === records.length - 1) {
        console.log('\n=== 更新完成 ===');
        console.log(`成功：${updated} 条`);
        console.log(`失败：${failed} 条`);
        console.log('\n现在可以运行 test-banners.js 测试轮播图功能');
      }
    });
  });
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
