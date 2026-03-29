/**
 * 快速添加 5 个活动数据到 HAP
 * 在微信开发者工具控制台运行
 */

const api = require('./utils/api.js');

console.log('=== 开始添加活动数据 ===\n');

// 5 个活动数据
const activities = [
  {
    title: '🎨 春季摄影大赛',
    content: '记录春天的美好瞬间！拍摄你眼中最美的春天，参与我们的摄影大赛，赢取丰厚奖品！\n\n📸 参赛要求：\n1. 原创摄影作品\n2. 主题：春天\n3. 格式：JPG/PNG\n\n🏆 奖项设置：\n一等奖：500 元\n二等奖：300 元\n三等奖：200 元',
    category: '活动',
    task_type: '摄影',
    bounty_amount: 500
  },
  {
    title: '🎵 周末音乐节',
    content: '这个周末一起来狂欢！本地乐队现场演出，美食摊位，还有惊喜抽奖！\n\n⏰ 时间：周六晚 7 点\n📍 地点：中央公园\n🎫 门票：免费\n\n欢迎带上家人朋友一起参加！',
    category: '活动',
    task_type: '娱乐',
    bounty_amount: 0
  },
  {
    title: '📚 读书分享会',
    content: '每月一次的读书分享会又来了！本期主题：「个人成长」\n\n📖 分享书目：\n- 《原子习惯》\n- 《深度工作》\n- 《思考，快与慢》\n\n欢迎带上你喜欢的书来分享！',
    category: '活动',
    task_type: '学习',
    bounty_amount: 0
  },
  {
    title: '🏃 晨跑打卡挑战',
    content: '30 天晨跑挑战开始报名啦！每天早上 6 点，一起跑步打卡，养成健康生活习惯！\n\n✅ 挑战规则：\n1. 每天晨跑至少 3 公里\n2. 在群里打卡分享\n3. 坚持 30 天\n\n🎁 完成挑战有惊喜奖品！',
    category: '活动',
    task_type: '运动',
    bounty_amount: 200
  },
  {
    title: '🍳 美食制作大赛',
    content: '展示你的厨艺的时候到了！制作你的拿手好菜，拍照分享，赢取美食达人称号！\n\n🥘 比赛分类：\n- 中式料理\n- 西式料理\n- 甜品点心\n- 创意料理\n\n评委将由专业厨师担任！',
    category: '活动',
    task_type: '美食',
    bounty_amount: 300
  }
];

// 逐个添加
async function addActivities() {
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    console.log(`[${i + 1}/${activities.length}] 添加：${activity.title}`);
    
    try {
      const result = await api.createPost({
        title: activity.title,
        content: activity.content,
        category: activity.category,
        task_type: activity.task_type,
        bounty_amount: activity.bounty_amount,
        images: []
      });
      
      if (result.success) {
        console.log(`  ✅ 添加成功\n`);
        successCount++;
      } else {
        console.log(`  ❌ 失败：${result.error_msg}\n`);
        failCount++;
      }
    } catch (err) {
      console.log(`  ❌ 异常：${err.message}\n`);
      failCount++;
    }
    
    // 最后一个完成后显示总结
    if (i === activities.length - 1) {
      console.log('=== 添加完成 ===');
      console.log(`成功：${successCount} 个`);
      console.log(`失败：${failCount} 个`);
      console.log('\n现在可以访问活动页面查看数据了！');
      console.log('路径：/pages/activities/activities');
    }
  }
}

// 执行
addActivities();
