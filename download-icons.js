/**
 * 下载 HAP 轮播图图标到本地
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');
const fs = wx.getFileSystemManager ? wx.getFileSystemManager() : null;

console.log('=== 开始下载图标 ===\n');

// 创建 images 文件夹
const dirPath = `${wx.env.USER_DATA_PATH}/images`;
try {
  fs.mkdirSync(dirPath);
  console.log('✅ 创建 images 文件夹成功\n');
} catch (e) {
  console.log('ℹ️  images 文件夹已存在\n');
}

// 获取所有轮播图记录
api.getRows(api.WORKSHEET_ID.banners, { pageSize: 50 }).then(res => {
  if (!res.success) {
    console.log('❌ 获取记录失败:', res.error_msg);
    return;
  }
  
  const records = res.data?.rows || [];
  console.log(`找到 ${records.length} 条轮播图记录\n`);
  
  if (records.length === 0) {
    console.log('💡 提示：请先在 HAP 中创建轮播图记录并上传图片');
    return;
  }
  
  // 下载每个图标
  let downloaded = 0;
  let failed = 0;
  
  records.forEach((record, index) => {
    const name = record.name || `记录${index + 1}`;
    const imageField = record.image;
    
    if (!imageField || !Array.isArray(imageField) || imageField.length === 0) {
      console.log(`⚠️  [${index + 1}] ${name} - 无图片`);
      return;
    }
    
    const imageUrl = imageField[0].downloadUrl;
    const fileName = imageField[0].fileName || `icon_${index + 1}.png`;
    const localPath = `${dirPath}/${fileName}`;
    
    console.log(`[${index + 1}] ${name}`);
    console.log(`    原图：${imageUrl.substring(0, 60)}...`);
    console.log(`    保存：${localPath}`);
    
    // 下载图片
    wx.downloadFile({
      url: imageUrl,
      filePath: localPath,
      success: (res) => {
        if (res.statusCode === 200) {
          console.log(`    ✅ 下载成功\n`);
          downloaded++;
        } else {
          console.log(`    ❌ 下载失败：${res.statusCode}\n`);
          failed++;
        }
        
        // 最后一条完成后显示总结
        if (index === records.length - 1) {
          console.log('=== 下载完成 ===');
          console.log(`成功：${downloaded} 个`);
          console.log(`失败：${failed} 个`);
          console.log(`保存位置：${dirPath}`);
        }
      },
      fail: (err) => {
        console.log(`    ❌ 下载异常：${err.errMsg}\n`);
        failed++;
        
        if (index === records.length - 1) {
          console.log('=== 下载完成 ===');
          console.log(`成功：${downloaded} 个`);
          console.log(`失败：${failed} 个`);
        }
      }
    });
  });
  
}).catch(err => {
  console.error('❌ 异常:', err);
});
