// utils/api.js - HAP V3 API 封装

// 通用登录 API 配置
// youqu 独立路径，Nginx 自动加 X-Source: youqu
const AUTH_API_BASE = 'https://100000whys.cn/youqu/api/user';

// HAP 应用配置
const HAP_CONFIG = {
  appkey: 'cd90921a105a7132',
  sign: 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw==',
  baseUrl: 'https://api.mingdao.com'
};

// 工作表 ID
const WORKSHEET_ID = {
  users: '69b5db5804186a1d512cb9d1',
  posts: '69b5db79d659982669a47c6b',
  comments: '69b5dbc4724cbbeab6557e21',
  likes: '69b5dbb3064e5630e80f4f90',
  follows: '69cac8d9f045950b8025e43a',  // 关注表
  messages: '69b5dbb4724cbbeab6557d8b',
  task_takers: '69b5dc137e3c8fc03e16dc99',
  chat_messages: '69cb1737255f5b2b932010de',  // 聊天消息表
  banners: '69b5dc147e3c8fc03e16dcab'  // 轮播图
};

/**
 * HAP V3 API 请求封装
 */
function request(endpoint, method = 'GET', data = null) {
  console.log('[API request]', {
    url: `${HAP_CONFIG.baseUrl}${endpoint}`,
    method,
    data
  });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${HAP_CONFIG.baseUrl}${endpoint}`,
      method,
      header: {
        'Content-Type': 'application/json',
        'HAP-Appkey': HAP_CONFIG.appkey,
        'HAP-Sign': HAP_CONFIG.sign
      },
      data: data || {},
      success: (res) => {
        console.log('[API response]', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.data.success) {
          resolve(res.data);
        } else {
          console.error('HAP API Error:', res.data);
          resolve({ success: false, error_msg: res.data.error_msg, data: null });
        }
      },
      fail: (err) => {
        console.error('HAP API Request Failed:', err);
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

/**
 * 查询工作表记录列表
 */
async function getRows(worksheetId, options = {}) {
  const { filter, sorts, pageIndex = 1, pageSize = 20 } = options;
  const requestBody = { pageIndex, pageSize };
  if (filter) requestBody.filter = filter;
  if (sorts) requestBody.sorts = sorts;

  return request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', requestBody);
}

/**
 * 获取单条记录
 */
async function getRow(worksheetId, rowId) {
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'GET');
}

/**
 * 创建记录
 */
async function createRow(worksheetId, data, triggerWorkflow = true) {
  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows`, 'POST', { fields, triggerWorkflow });
}

/**
 * 更新记录
 */
async function updateRow(worksheetId, rowId, data, triggerWorkflow = true) {
  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'PATCH', { fields, triggerWorkflow });
}

/**
 * 格式化单选字段
 */
function formatOption(field) {
  if (!field || !Array.isArray(field) || field.length === 0) return '';
  return field[0]?.value || '';
}

/**
 * 解析头像字段
 * 支持多种格式：
 * 1. 直接 URL 字符串
 * 2. 字符串格式的 JSON 数组 '[{"large_thumbnail_full_path":"..."}]'
 * 3. 对象数组 [{"large_thumbnail_full_path":"..."}]
 */
function parseAvatar(avatarField) {
  if (!avatarField) {
    return 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
  }

  // 如果是对象数组
  if (Array.isArray(avatarField) && avatarField.length > 0) {
    const first = avatarField[0];
    if (typeof first === 'object') {
      return first.large_thumbnail_full_path || first.downloadUrl || first.url || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
    }
  }

  // 如果是字符串
  if (typeof avatarField === 'string') {
    // 尝试解析为 JSON 数组
    if (avatarField.startsWith('[')) {
      try {
        const parsed = JSON.parse(avatarField);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].large_thumbnail_full_path || parsed[0].downloadUrl || parsed[0].url || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
        }
      } catch (e) {
        // 解析失败，当作普通 URL
      }
    }
    // 普通 URL 字符串
    if (avatarField.startsWith('http')) {
      return avatarField;
    }
  }

  return 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
}

/**
 * 解析图片
 */
function parseImages(images) {
  if (!images || !Array.isArray(images)) return [];
  return images.map(img => img.downloadUrl || img.url || '');
}

/**
 * 格式化时间
 */
function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  return date.toLocaleDateString('zh-CN');
}

/**
 * 格式化帖子
 */
function formatPost(row) {
  // 获取帖子图片（使用别名 fengmiantu）
  const postImages = [];
  if (row.fengmiantu && Array.isArray(row.fengmiantu)) {
    row.fengmiantu.forEach(img => {
      if (typeof img === 'object') {
        postImages.push(img.downloadUrl || img.large_thumbnail_full_path || img.url || '');
      }
    });
  }

  // 获取封面图（取第一张）
  const coverUrl = postImages.length > 0 ? postImages[0] : '';

  // 获取分类字段（字段 ID: 69b5db79440840fde287375b）
  const categoryValue = row['69b5db79440840fde287375b']?.[0]?.value || '';

  // 获取任务类型字段（字段 ID: 69b5db79440840fde287375c）
  const taskTypeValue = row['69b5db79440840fde287375c']?.[0]?.value || '';

  // 获取状态字段（字段 ID: 69b5db79440840fde287375e）
  const statusValue = row['69b5db79440840fde287375e']?.[0]?.value || '';

  // 获取悬赏金额（字段 ID: 69b5db79440840fde287375d）
  const bountyAmount = parseFloat(row['69b5db79440840fde287375d']) || 0;

  // 获取发布时间（字段 ID: 69b5db79440840fde2873762）
  const createdAt = row['69b5db79440840fde2873762'] || row.created_at || '';

  // 获取作者信息：zznc 和 zztx 是他表字段，从关联的用户表获取
  let authorNickname = '未知';
  let authorAvatar = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
  let authorId = '';

  // 昵称从 zznc 获取（他表字段，文本类型）
  if (row.zznc) {
    authorNickname = typeof row.zznc === 'string' ? row.zznc : (row.zznc[0]?.value || '未知');
  }

  // 头像从 zztx 获取（他表字段，使用 parseAvatar 解析）
  authorAvatar = parseAvatar(row.zztx);

  // 作者 ID 从作者关联字段获取（字段 ID: 69b5db79440840fde2873759）
  const authorField = row['69b5db79440840fde2873759'];
  if (authorField && Array.isArray(authorField) && authorField.length > 0) {
    authorId = authorField[0].sid || authorField[0].id || '';
  }

  // 获取统计字段
  const likesCount = parseInt(row['69b5db79440840fde287375f']) || parseInt(row.likes_count) || 0;
  const commentsCount = parseInt(row['69b5db79440840fde2873760']) || parseInt(row.comments_count) || 0;
  const viewsCount = parseInt(row['69b5db79440840fde2873761']) || parseInt(row.views_count) || 0;

  // 获取帖子 ID（兼容 rowid 和 rowId）
  const id = row.rowid || row.rowId || '';

  // 标题和内容 - 同时检查别名和字段 ID
  // 标题字段 ID: 69b5db79440840fde2873756
  // 内容字段 ID: 69b5db79440840fde2873757
  const title = row.title || row['69b5db79440840fde2873756'] || '';
  const content = row.content || row['69b5db79440840fde2873757'] || '';

  return {
    id: id,
    title: title,
    content: content,
    cover: coverUrl,
    images: postImages,
    author: {
      id: authorId,
      nickname: authorNickname,
      avatar: authorAvatar
    },
    category: categoryValue,
    task_type: taskTypeValue,
    bounty_amount: bountyAmount,
    likes_count: likesCount,
    comments_count: commentsCount,
    views_count: viewsCount,
    status: statusValue,
    created_at: formatTime(createdAt)
  };
}

/**
 * 格式化评论
 */
/**
 * 格式化评论
 * 评论表字段 ID：
 * - 帖子ID: 69b5dbc4947a225402a9097d
 * - 评论者: 69b5dbc4947a225402a9097f
 * - 评论内容: 69b5dbc4947a225402a90981
 * - 点赞数: 69b5dbc4947a225402a90982
 * - 评论时间: 69b5dbc4947a225402a90984
 * - 父评论: 69b5dbceba48d7134c7ac35e
 */
function formatComment(row) {
  return {
    id: row.rowid || row.rowId,
    post_id: row['69b5dbc4947a225402a9097d']?.[0]?.sid || '',
    author: {
      id: row['69b5dbc4947a225402a9097f']?.[0]?.sid || '',
      nickname: row['69b5dbc4947a225402a9097f']?.[0]?.name || '未知',
      avatar: 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg'
    },
    content: row['69b5dbc4947a225402a90981'] || '',
    parent_id: row['69b5dbceba48d7134c7ac35e']?.[0]?.sid || '',
    likes_count: parseInt(row['69b5dbc4947a225402a90982']) || 0,
    created_at: formatTime(row['69b5dbc4947a225402a90984'])
  };
}

// ==================== 业务 API ====================

async function getPosts(category = '', page = 1, pageSize = 20) {
  console.log('[API.getPosts] 开始请求帖子列表...');
  
  const categoryKeys = {
    '赏金任务': '8eb44026-eebe-4677-bc9c-435e972729a6',
    '问答': '9e5f96d9-6255-4ec5-aef4-4df2f7c0e760',
    '吐槽': '9646cbb4-2eee-4c91-88ac-b4cdd394be5e'
  };
  
  const children = [];
  if (category && categoryKeys[category]) {
    children.push({ 
      type: 'condition', 
      field: '69b5db79440840fde287375b',
      operator: 'eq', 
      value: [categoryKeys[category]]
    });
  }

  const result = await getRows(WORKSHEET_ID.posts, {
    filter: children.length > 0 ? { type: 'group', logic: 'AND', children } : null,
    pageIndex: page,
    pageSize,
    sorts: [{ field: 'created_at', isAsc: false }]
  });

  console.log('[API.getPosts] API 响应:', result);

  if (result.success && result.data?.rows) {
    console.log('[API.getPosts] 第一条原始数据:', JSON.stringify(result.data.rows[0], null, 2));
    const posts = result.data.rows.map(formatPost);
    console.log('[API.getPosts] 格式化后第一条:', posts[0]);
    return { success: true, data: posts };
  }
  
  return { success: false, data: [] };
}

async function getPostDetail(postId) {
  console.log('===== [getPostDetail] 开始 =====');
  console.log('帖子 ID:', postId);
  
  // 使用列表 API 通过 rowid 筛选获取记录
  const result = await getRows(WORKSHEET_ID.posts, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ 
        type: 'condition', 
        field: 'rowid', 
        operator: 'eq', 
        value: [postId]  // 用数组格式
      }]
    },
    pageIndex: 1,
    pageSize: 1
  });
  
  console.log('API 响应 success:', result.success);
  console.log('API 响应 error_msg:', result.error_msg);
  console.log('rows 数量:', result.data?.rows?.length || 0);
  
  if (result.success && result.data?.rows && result.data.rows.length > 0) {
    const row = result.data.rows[0];
    console.log('获取到记录 ID:', row.rowid || row.rowId);
    console.log('===== [getPostDetail] 成功 =====\n');
    
    // 更新浏览量（静默更新，不处理错误）
    // 浏览量字段 ID: 69b5db79440840fde2873761
    try {
      const viewsCount = parseInt(row['69b5db79440840fde2873761']) || 0;
      updateRow(WORKSHEET_ID.posts, postId, { '69b5db79440840fde2873761': viewsCount + 1 }, false).catch(() => {
        // 静默忽略更新失败
      });
    } catch (e) {
      // 静默忽略
    }
    
    return { success: true, data: formatPost(row) };
  }
  
  console.log('===== [getPostDetail] 失败：未找到记录 =====\n');
  return { success: false, data: null };
}

/**
 * 上传图片到临时服务器，获取 HTTP URL
 * 用于后续写入 HAP 附件字段（HAP 会从 URL 下载并永久存储）
 *
 * @param {string} localFilePath - 微信小程序本地图片路径
 * @returns {Promise<string>} - 临时 HTTP URL
 */
async function uploadImageToTemp(localFilePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: 'https://100000whys.cn/temp/',
      filePath: localFilePath,
      name: 'file',
      success: (res) => {
        console.log('[uploadImageToTemp] 响应:', res.data);
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data.data.url);  // https://100000whys.cn/temp/xxx.png
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('解析响应失败'));
        }
      },
      fail: (err) => {
        console.error('[uploadImageToTemp] 上传失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 批量上传图片到临时服务器
 *
 * @param {string[]} localFilePaths - 本地图片路径数组
 * @returns {Promise<string[]>} - HTTP URL 数组
 */
async function uploadImagesToTemp(localFilePaths) {
  if (!localFilePaths || localFilePaths.length === 0) return [];

  const results = [];
  for (const filePath of localFilePaths) {
    try {
      const url = await uploadImageToTemp(filePath);
      results.push(url);
      console.log('[uploadImagesToTemp] 成功:', url);
    } catch (e) {
      console.error('[uploadImagesToTemp] 失败:', filePath, e);
      // 单个失败不中断整个流程，可以继续上传其他图片
    }
  }
  return results;
}

/**
 * 创建帖子（包含图片上传）
 * 图片流程：本地图片 → 临时服务器 → HAP 附件字段（永久存储）
 *
 * @param {Object} data - 帖子数据
 * @param {Object} userInfo - 用户信息（可选，不传则自动获取）
 */
async function createPost(data, userInfo = null) {
  // 在函数内部获取 app，避免模块加载时 getApp() 返回 undefined
  const app = getApp();
  const user = userInfo || app?.globalData?.userInfo || {};

  // 1. 先上传图片到临时服务器
  let imageUrls = [];
  if (data.images?.length > 0) {
    console.log('[createPost] 开始上传图片，数量:', data.images.length);
    imageUrls = await uploadImagesToTemp(data.images);
    console.log('[createPost] 图片上传完成，URLs:', imageUrls);
  }

  // 2. 构建 HAP 数据 - 使用字段 ID + option key
  // 字段 ID 对照表：
  // - 标题: 69b5db79440840fde2873756 (别名 title)
  // - 内容: 69b5db79440840fde2873757 (别名 content)
  // - 作者: 69b5db79440840fde2873759 (关联字段)
  // - 分类: 69b5db79440840fde287375b
  // - 任务类型: 69b5db79440840fde287375c
  // - 悬赏金额: 69b5db79440840fde287375d
  // - 状态: 69b5db79440840fde287375e
  // - 点赞数: 69b5db79440840fde287375f
  // - 评论数: 69b5db79440840fde2873760
  // - 浏览数: 69b5db79440840fde2873761
  // - 发布时间: 69b5db79440840fde2873762
  // - 封面图: 69c52489934946ff834d930d (别名 fengmiantu)
  // - zztx/zznc 是他表字段，只读不可写入！

  const postData = {
    // 基础字段 - 使用字段 ID 确保写入成功
    // 标题字段 ID: 69b5db79440840fde2873756
    '69b5db79440840fde2873756': data.title,
    // 内容字段 ID: 69b5db79440840fde2873757
    '69b5db79440840fde2873757': data.content,
    // 分类字段 - 字段 ID: 69b5db79440840fde287375b
    '69b5db79440840fde287375b': getCategoryKey(data.category),
    // 统计字段
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    // 发布时间 - 字段 ID: 69b5db79440840fde2873762
    '69b5db79440840fde2873762': new Date().toISOString()
  };

  // 任务类型 - 字段 ID: 69b5db79440840fde287375c
  if (data.task_type) {
    postData['69b5db79440840fde287375c'] = getTaskTypeKey(data.task_type);
  }

  // 悬赏金额 - 字段 ID: 69b5db79440840fde287375d
  if (data.bounty_amount) {
    postData['69b5db79440840fde287375d'] = parseFloat(data.bounty_amount) || 0;
  }

  // 状态字段 - 字段 ID: 69b5db79440840fde287375e，默认"进行中"
  postData['69b5db79440840fde287375e'] = ['e0c24f01-b748-4b17-8030-31a8a2c58760'];

  // 封面图字段（使用别名 fengmiantu）
  if (imageUrls.length > 0) {
    postData.fengmiantu = imageUrls.map(url => ({
      url,
      name: 'image.jpg'
    }));
  }

  // 作者关联字段 - 字段 ID: 69b5db79440840fde2873759
  // zztx/zznc 是他表字段（Lookup），只读不可写入，会自动从关联的用户表获取
  if (user.id) {
    postData['69b5db79440840fde2873759'] = [user.id];
  }

  console.log('[createPost] 发送数据:', postData);
  return createRow(WORKSHEET_ID.posts, postData);
}

/**
 * 获取分类字段的 option key
 * 分类字段 ID: 69b5db79440840fde287375b
 */
function getCategoryKey(categoryName) {
  const categoryKeys = {
    '赏金任务': '8eb44026-eebe-4677-bc9c-435e972729a6',
    '问答': '9e5f96d9-6255-4ec5-aef4-4df2f7c0e760',
    '吐槽': '9646cbb4-2eee-4c91-88ac-b4cdd394be5e',
    '活动': '09a2a118-7b3a-4886-a460-906a770669a9'
  };
  const key = categoryKeys[categoryName];
  return key ? [key] : [];
}

/**
 * 获取任务类型字段的 option key
 * 任务类型字段 ID: 69b5db79440840fde287375c
 */
function getTaskTypeKey(taskTypeName) {
  const taskTypeKeys = {
    '一对多': '25e48b7a-16cd-475d-b0fb-f2e538aa9974',
    '一对一': 'a47135a2-546b-4274-8bf2-b5d5b84b1a7b',
    '摄影': '151862d5-cf37-4a0d-96d8-c603c2033050',
    '娱乐': '7ed69cf4-8194-4331-bb66-4fc973776ada',
    '学习': '40191eef-4548-4f94-8242-74734ef3a459',
    '运动': '1df9a140-8ce8-4771-8210-ddea617f9baa',
    '美食': 'b9f8d3b1-19ac-437c-9cd0-1d4f07992c7b'
  };
  const key = taskTypeKeys[taskTypeName];
  return key ? [key] : [];
}

async function getComments(postId, page = 1, pageSize = 50) {
  // 评论表字段 ID：帖子ID = 69b5dbc4947a225402a9097d
  const result = await getRows(WORKSHEET_ID.comments, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dbc4947a225402a9097d',  // 帖子ID 字段
        operator: 'belongsto',
        value: [postId]
      }]
    },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69b5dbc4947a225402a90984', isAsc: true }]  // 评论时间字段
  });
  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(formatComment) };
  }
  return { success: false, data: [] };
}

async function addComment(data) {
  const app = getApp();
  const userInfo = app?.globalData?.userInfo || {};

  // 评论表字段 ID：
  // - 帖子ID: 69b5dbc4947a225402a9097d
  // - 评论者: 69b5dbc4947a225402a9097f
  // - 评论内容: 69b5dbc4947a225402a90981
  // - 点赞数: 69b5dbc4947a225402a90982
  // - 评论时间: 69b5dbc4947a225402a90984
  // - 父评论: 69b5dbceba48d7134c7ac35e
  const commentData = {
    '69b5dbc4947a225402a9097d': [data.post_id],      // 帖子ID
    '69b5dbc4947a225402a90981': data.content,        // 评论内容
    '69b5dbc4947a225402a90982': 0,                   // 点赞数
    '69b5dbc4947a225402a90984': new Date().toISOString()  // 评论时间
  };

  // 评论者关联
  if (userInfo.id) {
    commentData['69b5dbc4947a225402a9097f'] = [userInfo.id];
  }

  // 父评论
  if (data.parent_id) {
    commentData['69b5dbceba48d7134c7ac35e'] = [data.parent_id];
  }

  const result = await createRow(WORKSHEET_ID.comments, commentData);

  // 更新帖子评论数
  if (result.success) {
    try {
      const post = await getRow(WORKSHEET_ID.posts, data.post_id);
      if (post.success) {
        // 评论数字段 ID: 69b5db79440840fde2873760
        const currentCount = parseInt(post.data['69b5db79440840fde2873760']) || 0;
        await updateRow(WORKSHEET_ID.posts, data.post_id, {
          '69b5db79440840fde2873760': currentCount + 1
        }, false);
      }
    } catch (e) {
      console.error('[addComment] 更新评论数失败:', e);
    }
  }
  return result;
}

async function toggleLike(userId, targetType, targetId) {
  console.log('===== [toggleLike] 开始 =====');
  console.log('[toggleLike] userId:', userId);
  console.log('[toggleLike] targetType:', targetType);
  console.log('[toggleLike] targetId:', targetId);

  if (!userId) {
    console.error('[toggleLike] userId 为空，请检查登录状态');
    return { success: false, error_msg: '用户未登录' };
  }

  // 点赞表字段 ID：
  // - 用户: 69b5dbb304186a1d512cbcfd (关联记录)
  // - 目标类型: 69b5dbb304186a1d512cbcff (单选，需要 option key)
  // - 目标ID: 69b5dbb304186a1d512cbd00 (文本框)
  // - 点赞时间: 69b5dbb304186a1d512cbd01 (日期时间)

  // 目标类型 option key 映射
  const targetTypeKeys = {
    'post': 'f62392cf-a4fb-4b0d-9545-8f8a19265245',
    'comment': 'b7c18be7-51ce-4c09-931b-529b01e5eab5'
  };

  const likeData = {
    '69b5dbb304186a1d512cbcfd': [userId],                                    // 用户关联
    '69b5dbb304186a1d512cbcff': [targetTypeKeys[targetType]],                // 目标类型(单选key)
    '69b5dbb304186a1d512cbd00': targetId,                                    // 目标ID(文本)
    '69b5dbb304186a1d512cbd01': new Date().toISOString()                     // 点赞时间
  };

  console.log('[toggleLike] 发送数据:', JSON.stringify(likeData, null, 2));

  const result = await createRow(WORKSHEET_ID.likes, likeData);
  console.log('[toggleLike] 创建结果:', JSON.stringify(result, null, 2));

  if (result.success) {
    try {
      const worksheetId = targetType === 'post' ? WORKSHEET_ID.posts : WORKSHEET_ID.comments;
      const target = await getRow(worksheetId, targetId);

      if (target.success) {
        // 点赞数字段 ID: 69b5db79440840fde287375f
        const currentCount = parseInt(target.data['69b5db79440840fde287375f']) || 0;
        await updateRow(worksheetId, targetId, {
          '69b5db79440840fde287375f': currentCount + 1
        }, false);
      }
    } catch (e) {
      console.error('[toggleLike] 更新点赞数失败:', e);
    }
  }
  return result;
}

/**
 * 通用登录 API - 通过微信 code 换取 openid 并获取/创建用户
 * @param {string} code - 微信登录 code
 * @returns {Promise} { success, data: { id, openid, nickname, avatar, token } }
 */
async function code2session(code) {
  return new Promise((resolve) => {
    wx.request({
      url: `${AUTH_API_BASE}/code2session`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: { code },
      success: (res) => {
        console.log('[code2session] 响应:', res.data);
        // shuxiaohe-auth 返回格式: { code: 200, message: 'success', data: { token, expiresIn, user: { id, openid, nickname, avatar, balance, source } } }
        if (res.data && res.data.code === 200 && res.data.data) {
          resolve({
            success: true,
            data: {
              id: res.data.data.user.id,
              openid: res.data.data.user.openid,
              nickname: res.data.data.user.nickname,
              avatar: res.data.data.user.avatar,
              token: res.data.data.token
            }
          });
        } else {
          resolve({ success: false, error_msg: res.data?.message || '登录失败', data: null });
        }
      },
      fail: (err) => {
        console.error('[code2session] 请求失败:', err);
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

/**
 * 通过 openid 获取或创建 HAP 用户记录
 * 用户表字段 ID：
 * - 微信ID(openid): 69b5db58a606df9d8178a03e
 * - 昵称: 69b5db58a606df9d8178a040
 * - 头像: 69b5db58a606df9d8178a041 (文本框，存URL)
 * - 创建时间: 69b5db58a606df9d8178a045
 *
 * @param {string} openid - 微信 openid
 * @param {Object} userInfo - 用户信息（可选）
 * @returns {Promise} { success, data: { id, openid, nickname, avatar } }
 */
async function getOrCreateUser(openid, userInfo = {}) {
  console.log('===== [getOrCreateUser] 开始 =====');
  console.log('[getOrCreateUser] 查找用户, openid:', openid);

  // 1. 先通过 openid 查找用户
  const result = await getRows(WORKSHEET_ID.users, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5db58a606df9d8178a03e',  // 微信ID 字段
        operator: 'eq',
        value: [openid]
      }]
    },
    pageIndex: 1,
    pageSize: 1
  });

  console.log('[getOrCreateUser] 查询结果:', JSON.stringify(result, null, 2));

  // 2. 如果找到用户，返回用户信息
  if (result.success && result.data?.rows?.length > 0) {
    const user = result.data.rows[0];
    const rowId = user.rowId || user.rowid;  // HAP 返回的是 rowId（大写I）
    console.log('[getOrCreateUser] ✅ 找到现有用户');
    console.log('[getOrCreateUser] rowId:', rowId);
    console.log('[getOrCreateUser] 原始数据:', JSON.stringify(user, null, 2));
    return {
      success: true,
      data: {
        id: rowId,
        openid: openid,
        nickname: user['69b5db58a606df9d8178a040'] || userInfo.nickname || '用户',
        avatar: parseAvatar(user['69c527ef867350d552fb710f']) || userInfo.avatar || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg'
      }
    };
  }

  // 3. 用户不存在，创建新用户
  console.log('[getOrCreateUser] 用户不存在，创建新用户...');
  const now = new Date().toISOString();
  const createData = {
    '69b5db58a606df9d8178a03e': openid,                                          // 微信ID
    '69b5db58a606df9d8178a040': userInfo.nickname || '用户' + Math.floor(Math.random() * 10000),  // 昵称
    '69b5db58a606df9d8178a041': userInfo.avatar || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg',  // 头像URL
    '69b5db58a606df9d8178a045': now                                              // 创建时间
  };
  console.log('[getOrCreateUser] 创建数据:', JSON.stringify(createData, null, 2));

  const createResult = await createRow(WORKSHEET_ID.users, createData);
  console.log('[getOrCreateUser] 创建结果:', JSON.stringify(createResult, null, 2));

  if (createResult.success) {
    console.log('[getOrCreateUser] ✅ 创建用户成功');
    console.log('[getOrCreateUser] rowid:', createResult.data.rowid);
    return {
      success: true,
      data: {
        id: createResult.data.rowid,
        openid: openid,
        nickname: userInfo.nickname || '用户',
        avatar: userInfo.avatar || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg'
      }
    };
  }

  console.error('[getOrCreateUser] ❌ 创建用户失败:', createResult.error_msg);
  return { success: false, error_msg: createResult.error_msg, data: null };
}

async function getUserInfo(userId) {
  const result = await getRow(WORKSHEET_ID.users, userId);
  if (result.success && result.data) {
    return {
      success: true,
      data: {
        id: result.data.rowid || result.data.rowId,
        openid: result.data['69b5db58a606df9d8178a03e'] || '',
        nickname: result.data['69b5db58a606df9d8178a040'] || '用户',
        avatar: parseAvatar(result.data['69c527ef867350d552fb710f']),
        phone: result.data['69b5db58a606df9d8178a043'] || ''
      }
    };
  }
  return { success: false, data: null };
}

async function getUserPosts(userId, category = '', page = 1, pageSize = 20) {
  const children = [{ type: 'condition', field: 'author_id', operator: 'belongsto', value: [userId] }];
  if (category) children.push({ type: 'condition', field: 'category', operator: 'eq', value: [category] });

  const result = await getRows(WORKSHEET_ID.posts, {
    filter: { type: 'group', logic: 'AND', children },
    pageIndex: page,
    pageSize,
    sorts: [{ field: 'created_at', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(formatPost) };
  }
  return { success: false, data: [] };
}

async function getMessages(userId, type = '', page = 1, pageSize = 20) {
  const children = [{ type: 'condition', field: 'receiver_id', operator: 'belongsto', value: [userId] }];
  if (type) children.push({ type: 'condition', field: 'type', operator: 'eq', value: [type] });

  const result = await getRows(WORKSHEET_ID.messages, {
    filter: { type: 'group', logic: 'AND', children },
    pageIndex: page,
    pageSize,
    sorts: [{ field: 'created_at', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(row => ({
      id: row.rowid,
      type: formatOption(row.type),
      title: row.title || '',
      content: row.content || '',
      sender: { id: row.sender_id?.[0]?.sid || '', nickname: row.sender_id?.[0]?.name || '系统' },
      is_read: formatOption(row.is_read) === '是',
      created_at: formatTime(row.created_at)
    })) };
  }
  return { success: false, data: [] };
}

/**
 * 获取轮播图列表
 * 从 HAP 工作表 69b5dc147e3c8fc03e16dcab 获取启用的轮播图
 */
async function getBanners() {
  console.log('[API.getBanners] 开始请求 HAP 轮播图数据...');
  console.log('[API.getBanners] 工作表 ID:', WORKSHEET_ID.banners);
  console.log('[API.getBanners] 筛选条件：是否启用=是 (使用 option key)');
  console.log('[API.getBanners] 排序：排序升序');
  
  const result = await getRows(WORKSHEET_ID.banners, {
    filter: { 
      type: 'group', 
      logic: 'AND', 
      children: [{ 
        type: 'condition', 
        field: '69b5dc145c2066509f21fd27',  // 是否启用字段 ID
        operator: 'eq', 
        value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']  // 使用 option key，不是 '是'
      }] 
    },
    pageSize: 10,
    sorts: [{ field: '69b5dc145c2066509f21fd26', isAsc: true }]  // 排序字段 ID
  });
  
  console.log('[API.getBanners] HAP 响应:', result);
  console.log('[API.getBanners] success:', result.success);
  console.log('[API.getBanners] rows 数量:', result.data?.rows?.length || 0);
  
  if (result.data?.rows) {
    console.log('[API.getBanners] 原始数据:', JSON.stringify(result.data.rows, null, 2));
  }

  if (result.success && result.data?.rows) {
    const banners = result.data.rows.map(row => {
      // 获取图片字段（使用别名 image，数据格式是对象数组）
      const imageField = row.image;  // 直接用别名！
      let imageUrl = '';
      
      // 处理附件字段：取首个元素的 downloadUrl
      if (imageField && Array.isArray(imageField) && imageField.length > 0) {
        const firstImage = imageField[0];
        if (typeof firstImage === 'object') {
          imageUrl = firstImage.downloadUrl || firstImage.large_thumbnail_full_path || firstImage.url || '';
        }
      }
      
      return {
        id: row.rowid,
        image: imageUrl,
        // 使用字段 ID 获取链接类型（单选字段返回数组）
        link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value || '',
        // 使用字段 ID 获取链接目标
        link_target: row['69b5dc145c2066509f21fd25'] || ''
      };
    });
    
    console.log('[API.getBanners] ✅ 处理完成，轮播图数量:', banners.length);
    console.log('[API.getBanners] 轮播图数据:', banners);
    console.log('[API.getBanners] 图片 URL 示例:', banners[0]?.image);
    
    return { success: true, data: banners };
  }
  
  console.log('[API.getBanners] ❌ 无数据或失败');
  return { success: false, data: [] };
}

async function markMessageRead(messageId) {
  return updateRow(WORKSHEET_ID.messages, messageId, { is_read: '是' }, false);
}

async function takeTask(postId, takerId) {
  const post = await getRow(WORKSHEET_ID.posts, postId);
  if (!post.success) return { success: false, error_msg: '任务不存在' };

  // 任务接取表字段 ID：
  // - 任务: 69b5dc13401e6eb020edf41f
  // - 发布者: 69b5dc13401e6eb020edf421
  // - 接取者: 69b5dc13401e6eb020edf423
  // - 状态: 69b5dc13401e6eb020edf425
  // - 接取时间: 69b5dc13401e6eb020edf428

  // 获取作者 ID
  const authorId = post.data['69b5db79440840fde2873759']?.[0]?.sid || '';

  const result = await createRow(WORKSHEET_ID.task_takers, {
    '69b5dc13401e6eb020edf41f': [postId],        // 任务
    '69b5dc13401e6eb020edf421': authorId ? [authorId] : [],  // 发布者
    '69b5dc13401e6eb020edf423': [takerId],       // 接取者
    '69b5dc13401e6eb020edf428': new Date().toISOString()  // 接取时间
  });

  // 创建任务对话，发送欢迎消息
  if (result.success && authorId) {
    const taskTakerId = result.data.rowid;

    // 发送欢迎消息（发布者发给接取者）
    await sendChatMessage(taskTakerId, authorId, takerId, '感谢领取任务，有任务不清楚的地方可以问我~');

    // 同时发送系统通知
    const user = await getUserInfo(takerId);
    const postTitle = post.data['69b5db79440840fde2873756'] || post.data.title || '无标题';

    // 消息表字段 ID：
    // - 接收者: 69b5dbb5b73fe81519fbdcd5
    // - 发送者: 69b5dbb5b73fe81519fbdcd7
    // - 消息类型: 69b5dbb5b73fe81519fbdcd9
    // - 标题: 69b5dbb5b73fe81519fbdcda
    // - 内容: 69b5dbb5b73fe81519fbdcdb
    // - 相关帖子: 69b5dbb5b73fe81519fbdcdc
    // - 是否已读: 69b5dbb5b73fe81519fbdcde
    // - 消息时间: 69b5dbb5b73fe81519fbdcdf

    await createRow(WORKSHEET_ID.messages, {
      '69b5dbb5b73fe81519fbdcd5': [authorId],  // 接收者
      '69b5dbb5b73fe81519fbdcd7': [takerId],  // 发送者
      '69b5dbb5b73fe81519fbdcda': '有人接取了你的任务',  // 标题
      '69b5dbb5b73fe81519fbdcdb': `${user.data?.nickname || '未知'} 接取了你的任务：${postTitle}`,  // 内容
      '69b5dbb5b73fe81519fbdcdc': [postId],   // 相关帖子
      '69b5dbb5b73fe81519fbdcdf': new Date().toISOString()  // 消息时间
    });
  }
  return result;
}

/**
 * 发送聊天消息
 * 聊天消息表字段 ID：
 * - 任务: 69cb1737d128aadb0c7d2eda
 * - 发送者: 69cb1737d128aadb0c7d2edc
 * - 接收者: 69cb1737d128aadb0c7d2ede
 * - 消息内容: 69cb1737d128aadb0c7d2ee0
 * - 发送时间: 69cb1737d128aadb0c7d2ee1
 */
async function sendChatMessage(taskTakerId, senderId, receiverId, content) {
  return createRow(WORKSHEET_ID.chat_messages, {
    '69cb1737d128aadb0c7d2eda': [taskTakerId],   // 任务
    '69cb1737d128aadb0c7d2edc': [senderId],      // 发送者
    '69cb1737d128aadb0c7d2ede': [receiverId],    // 接收者
    '69cb1737d128aadb0c7d2ee0': content,         // 消息内容
    '69cb1737d128aadb0c7d2ee1': new Date().toISOString()  // 发送时间
  });
}

/**
 * 获取任务对话消息列表
 * @param {string} taskTakerId - 任务接取记录ID
 */
async function getChatMessages(taskTakerId) {
  const result = await getRows(WORKSHEET_ID.chat_messages, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69cb1737d128aadb0c7d2eda',
        operator: 'belongsto',
        value: [taskTakerId]
      }]
    },
    pageIndex: 1,
    pageSize: 100,
    sorts: [{ field: '69cb1737d128aadb0c7d2ee1', isAsc: true }]
  });

  if (result.success && result.data?.rows) {
    const messages = result.data.rows.map(row => ({
      id: row.rowid || row.rowId,
      sender: {
        id: row['69cb1737d128aadb0c7d2edc']?.[0]?.sid || '',
        nickname: row['69cb1737d128aadb0c7d2edc']?.[0]?.name || '未知'
      },
      receiver: {
        id: row['69cb1737d128aadb0c7d2ede']?.[0]?.sid || '',
        nickname: row['69cb1737d128aadb0c7d2ede']?.[0]?.name || '未知'
      },
      content: row['69cb1737d128aadb0c7d2ee0'] || '',
      created_at: formatTime(row['69cb1737d128aadb0c7d2ee1'])
    }));
    return { success: true, data: messages };
  }
  return { success: false, data: [] };
}

/**
 * 获取用户的任务对话列表
 * @param {string} userId - 用户ID
 */
async function getTaskConversations(userId) {
  // 查询用户参与的接取任务（作为发布者或接取者）
  const asOwner = await getRows(WORKSHEET_ID.task_takers, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dc13401e6eb020edf421',  // 发布者
        operator: 'belongsto',
        value: [userId]
      }]
    },
    pageIndex: 1,
    pageSize: 50,
    sorts: [{ field: '69b5dc13401e6eb020edf428', isAsc: false }]
  });

  const asTaker = await getRows(WORKSHEET_ID.task_takers, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dc13401e6eb020edf423',  // 接取者
        operator: 'belongsto',
        value: [userId]
      }]
    },
    pageIndex: 1,
    pageSize: 50,
    sorts: [{ field: '69b5dc13401e6eb020edf428', isAsc: false }]
  });

  const conversations = [];

  // 处理作为发布者的任务
  if (asOwner.success && asOwner.data?.rows) {
    for (const row of asOwner.data.rows) {
      const postId = row['69b5dc13401e6eb020edf41f']?.[0]?.sid;
      const takerId = row['69b5dc13401e6eb020edf423']?.[0]?.sid;
      const takerName = row['69b5dc13401e6eb020edf423']?.[0]?.name || '未知';
      const postTitle = row['69b5dc13401e6eb020edf41f']?.[0]?.name || '任务';

      conversations.push({
        id: row.rowid || row.rowId,
        taskId: row.rowid || row.rowId,
        postId,
        postTitle,
        otherUser: { id: takerId, nickname: takerName },
        isOwner: true,
        created_at: formatTime(row['69b5dc13401e6eb020edf428'])
      });
    }
  }

  // 处理作为接取者的任务
  if (asTaker.success && asTaker.data?.rows) {
    for (const row of asTaker.data.rows) {
      const postId = row['69b5dc13401e6eb020edf41f']?.[0]?.sid;
      const ownerId = row['69b5dc13401e6eb020edf421']?.[0]?.sid;
      const ownerName = row['69b5dc13401e6eb020edf421']?.[0]?.name || '未知';
      const postTitle = row['69b5dc13401e6eb020edf41f']?.[0]?.name || '任务';

      conversations.push({
        id: row.rowid || row.rowId,
        taskId: row.rowid || row.rowId,
        postId,
        postTitle,
        otherUser: { id: ownerId, nickname: ownerName },
        isOwner: false,
        created_at: formatTime(row['69b5dc13401e6eb020edf428'])
      });
    }
  }

  return { success: true, data: conversations };
}

/**
 * 关注用户
 * @param {string} followerId - 关注人ID
 * @param {string} followingId - 被关注人ID
 */
async function followUser(followerId, followingId) {
  console.log('[followUser] 关注人:', followerId, '被关注人:', followingId);

  if (followerId === followingId) {
    return { success: false, error_msg: '不能关注自己' };
  }

  // 检查是否已关注
  // 关注表字段 ID：关注人=69cac8d9d128aadb0c7a7bbc，被关注人=69cac8d9d128aadb0c7a7bbe
  const existing = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [followerId] },
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [followingId] }
      ]
    },
    pageIndex: 1,
    pageSize: 1
  });

  console.log('[followUser] 检查已关注结果:', existing);

  if (existing.success && existing.data?.rows?.length > 0) {
    return { success: false, error_msg: '已经关注过了' };
  }

  // 创建关注记录
  const followData = {
    '69cac8d9d128aadb0c7a7bbc': [followerId],      // 关注人
    '69cac8d9d128aadb0c7a7bbe': [followingId],    // 被关注人
    '69cac8d9d128aadb0c7a7bc0': new Date().toISOString()  // 关注时间
  };
  console.log('[followUser] 创建关注记录:', followData);

  const result = await createRow(WORKSHEET_ID.follows, followData);
  console.log('[followUser] 创建结果:', result);

  return result;
}

/**
 * 取消关注
 * @param {string} followerId - 关注人ID
 * @param {string} followingId - 被关注人ID
 */
async function unfollowUser(followerId, followingId) {
  // 查找关注记录
  const existing = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [followerId] },
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [followingId] }
      ]
    },
    pageIndex: 1,
    pageSize: 1
  });

  if (!existing.success || !existing.data?.rows?.length) {
    return { success: false, error_msg: '未关注该用户' };
  }

  const followRowId = existing.data.rows[0].rowid;

  // 删除关注记录
  return request(`/v3/app/worksheets/${WORKSHEET_ID.follows}/rows/${followRowId}`, 'DELETE', { permanent: true });
}

/**
 * 检查是否已关注
 * @param {string} followerId - 关注人ID
 * @param {string} followingId - 被关注人ID
 */
async function checkIsFollowing(followerId, followingId) {
  const result = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [followerId] },
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [followingId] }
      ]
    },
    pageIndex: 1,
    pageSize: 1
  });

  return { success: true, isFollowing: result.data?.rows?.length > 0 };
}

/**
 * 获取关注列表（我关注的人）
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getFollowingList(userId, page = 1, pageSize = 20) {
  const result = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [userId] }
      ]
    },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69cac8d9d128aadb0c7a7bc0', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    const followingList = result.data.rows.map(row => ({
      id: row.rowid,
      following: {
        id: row['69cac8d9d128aadb0c7a7bbe']?.[0]?.sid || '',
        nickname: row['69cac8d9d128aadb0c7a7bbe']?.[0]?.name || '未知'
      },
      created_at: formatTime(row['69cac8d9d128aadb0c7a7bc0'])
    }));
    return { success: true, data: followingList };
  }
  return { success: false, data: [] };
}

/**
 * 获取粉丝列表（关注我的人）
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getFollowerList(userId, page = 1, pageSize = 20) {
  const result = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [userId] }
      ]
    },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69cac8d9d128aadb0c7a7bc0', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    const followerList = result.data.rows.map(row => ({
      id: row.rowid,
      follower: {
        id: row['69cac8d9d128aadb0c7a7bbc']?.[0]?.sid || '',
        nickname: row['69cac8d9d128aadb0c7a7bbc']?.[0]?.name || '未知'
      },
      created_at: formatTime(row['69cac8d9d128aadb0c7a7bc0'])
    }));
    return { success: true, data: followerList };
  }
  return { success: false, data: [] };
}

/**
 * 获取关注数和粉丝数
 * @param {string} userId - 用户ID
 */
async function getFollowStats(userId) {
  // 获取关注数（我关注的人）
  const followingResult = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [userId] }
      ]
    },
    pageIndex: 1,
    pageSize: 1000
  });

  // 获取粉丝数（关注我的人）
  const followerResult = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [
        { type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [userId] }
      ]
    },
    pageIndex: 1,
    pageSize: 1000
  });

  return {
    success: true,
    data: {
      followingCount: followingResult.data?.rows?.length || 0,
      followerCount: followerResult.data?.rows?.length || 0
    }
  };
}

module.exports = {
  getRows, getRow, createRow, updateRow,
  getPosts, getPostDetail, createPost,
  getComments, addComment, toggleLike,
  getOrCreateUser, getUserInfo, code2session, getUserPosts,
  getMessages, getBanners, markMessageRead, takeTask,
  uploadImageToTemp, uploadImagesToTemp,
  followUser, unfollowUser, checkIsFollowing, getFollowingList, getFollowerList, getFollowStats,
  sendChatMessage, getChatMessages, getTaskConversations,
  WORKSHEET_ID, HAP_CONFIG
};
