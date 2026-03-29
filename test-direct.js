/**
 * 直接测试轮播图数据
 * 在微信开发者工具控制台运行此代码
 */

const api = require('./utils/api.js');

console.log('=== 直接测试轮播图 ===\n');

// 测试 1: 获取所有记录（不过滤）
console.log('测试 1: 获取所有记录（不过滤）');
api.getRows(api.WORKSHEET_ID.banners, { pageSize: 10 }).then(res => {
  console.log('所有记录响应:', res);
  console.log('所有记录数量:', res.data?.rows?.length || 0);
  
  if (res.data?.rows) {
    console.log('\n详细数据:');
    res.data.rows.forEach((row, i) => {
      console.log(`\n[记录 ${i+1}]`);
      console.log('  rowid:', row.rowid);
      console.log('  名称:', row['69b5dc145c2066509f21fd23']);
      console.log('  是否启用:', row['69b5dc145c2066509f21fd27']);
      console.log('  图片:', row['69c4eb1c867350d552faf075']);
    });
  }
  
  // 测试 2: 使用字段 ID 筛选
  console.log('\n\n=== 测试 2: 使用字段 ID 筛选 ===');
  const filterRes = await api.getRows(api.WORKSHEET_ID.banners, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dc145c2066509f21fd27',
        operator: 'eq',
        value: ['是']
      }]
    },
    pageSize: 10
  });
  
  console.log('筛选后响应:', filterRes);
  console.log('筛选后数量:', filterRes.data?.rows?.length || 0);
  
  if (filterRes.data?.rows) {
    console.log('\n筛选后的数据:');
    filterRes.data.rows.forEach((row, i) => {
      console.log(`[记录 ${i+1}]`, {
        id: row.rowid,
        name: row['69b5dc145c2066509f21fd23'],
        image: row['69c4eb1c867350d552faf075']?.[0]?.downloadUrl
      });
    });
  }
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
