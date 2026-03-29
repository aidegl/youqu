// 更新轮播图记录 - 设置是否启用=是
const api = require('./utils/api.js');

async function updateBanners() {
  console.log('=== 更新轮播图数据 ===\n');
  
  // 先获取所有记录
  const result = await api.getRows(api.WORKSHEET_ID.banners, {
    pageSize: 10
  });
  
  if (!result.success || !result.data?.rows) {
    console.log('❌ 获取记录失败');
    return;
  }
  
  const records = result.data.rows;
  console.log(`找到 ${records.length} 条记录\n`);
  
  // 更新每条记录
  for (const record of records) {
    const rowId = record.rowid;
    const name = record.name || '无名称';
    
    console.log(`更新记录：${name} (${rowId})`);
    
    // 更新 是否启用 字段为"是"
    const updateResult = await api.updateRow(
      api.WORKSHEET_ID.banners,
      rowId,
      {
        '69b5dc145c2066509f21fd27': '是'  // 是否启用字段 ID
      },
      false  // 不触发工作流
    );
    
    if (updateResult.success) {
      console.log('✅ 更新成功\n');
    } else {
      console.log('❌ 更新失败:', updateResult.error_msg, '\n');
    }
  }
  
  console.log('=== 更新完成 ===');
}

updateBanners().catch(console.error);
