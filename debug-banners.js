/**
 * 调试轮播图数据问题
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');

console.log('=== 调试轮播图数据问题 ===\n');

// 步骤 1: 获取原始数据（不使用筛选条件）
console.log('步骤 1: 获取所有轮播图记录（不过滤）...');

api.getRows(api.WORKSHEET_ID.banners, { pageSize: 50 }).then(res => {
  console.log('原始数据响应:', res);
  
  if (!res.success) {
    console.log('❌ API 调用失败:', res.error_msg);
    return;
  }
  
  const rows = res.data?.rows || [];
  console.log(`✅ 获取到 ${rows.length} 条记录\n`);
  
  if (rows.length === 0) {
    console.log('❌ HAP 中没有任何轮播图记录！');
    console.log('解决方案：请先在明道云中创建记录');
    return;
  }
  
  // 显示所有记录的详细信息
  console.log('所有记录详情:');
  rows.forEach((row, index) => {
    console.log(`\n[记录 ${index + 1}]`);
    console.log('  记录 ID:', row.rowid);
    console.log('  名称:', row.name || row['名称'] || '无');
    console.log('  是否启用:', row['是否启用'] || row['69b5dc145c2066509f21fd27'] || '空值');
    console.log('  排序:', row['排序'] || row['69b5dc145c2066509f21fd26'] || '空值');
    console.log('  图片:', row.image?.[0]?.downloadUrl || row.image?.[0]?.url || '无');
    console.log('  链接类型:', row['链接类型'] || '无');
    console.log('  链接目标:', row['链接目标'] || '无');
  });
  
  // 步骤 2: 检查筛选条件
  console.log('\n\n=== 步骤 2: 检查筛选条件 ===');
  const enabledRows = rows.filter(row => {
    const isEnabled = row['是否启用'] || row['69b5dc145c2066509f21fd27'];
    return isEnabled === '是';
  });
  
  console.log(`符合"是否启用=是"的记录数：${enabledRows.length}`);
  
  if (enabledRows.length === 0) {
    console.log('\n❌ 问题找到：所有记录的"是否启用"字段都不是"是"');
    console.log('\n解决方案（2 选 1）:');
    console.log('  方法 1: 在明道云中编辑记录，设置"是否启用=是"');
    console.log('  方法 2: 运行下面的代码批量更新');
    
    // 提供批量更新代码
    console.log('\n\n批量更新代码（复制到控制台运行）:');
    console.log('```javascript');
    console.log('const api = require("./utils/api.js");');
    console.log('api.getRows(api.WORKSHEET_ID.banners, { pageSize: 50 }).then(res => {');
    console.log('  res.data.rows.forEach(row => {');
    console.log('    api.updateRow(api.WORKSHEET_ID.banners, row.rowid, {');
    console.log('      "是否启用": "是"');
    console.log('    });');
    console.log('    console.log("更新:", row.name);');
    console.log('  });');
    console.log('});');
    console.log('```');
  } else {
    console.log('\n✅ 有符合条件的记录');
    console.log('符合的记录:', enabledRows);
  }
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
