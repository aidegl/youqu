// utils/api.js - HAP V3 API 封装
const app = getApp();

// 通用登录 API 配置
const AUTH_API_BASE = 'https://100000whys.cn/shuxiaohe/api/user';

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
  messages: '69b5dbb4724cbbeab6557d8b',
  task_takers: '69b5dc137e3c8fc03e16dc99',
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
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'PUT', { fields, triggerWorkflow });
}

/**
 * 格式化单选字段
 */
function formatOption(field) {
  if (!field || !Array.isArray(field) || field.length === 0) return '';
  return field[0]?.value || '';
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
  
  // 获取 category 字段（使用字段 ID 69b5db79440840fde287375b）
  const categoryField = row['69b5db79440840fde287375b'];
  const categoryValue = categoryField?.[0]?.value || '';
  
  // 获取作者信息：zznc 和 zztx 直接在 row 层级
  let authorNickname = '未知';
  let authorAvatar = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
  let authorId = '';
  
  // 昵称从 zznc 获取（直接在 row 层级）
  if (row.zznc && typeof row.zznc === 'string') {
    authorNickname = row.zznc;
  }
  
  // 头像从 zztx 获取（直接在 row 层级，和封面图同样方式）
  if (row.zztx && Array.isArray(row.zztx) && row.zztx.length > 0) {
    const avatarImg = row.zztx[0];
    if (typeof avatarImg === 'object') {
      authorAvatar = avatarImg.downloadUrl || avatarImg.large_thumbnail_full_path || avatarImg.url || '';
    }
  }
  
  // 作者 ID 从 author_id 关联字段获取
  if (row.author_id && Array.isArray(row.author_id) && row.author_id.length > 0) {
    authorId = row.author_id[0].sid || row.author_id[0].id || '';
  }
  
  // 获取帖子 ID（兼容 rowid 和 rowId）
  const id = row.rowid || row.rowId || '';
  
  return {
    id: id,
    title: row.title || '',
    content: row.content || '',
    cover: coverUrl,
    images: postImages,
    author: {
      id: authorId,
      nickname: authorNickname,
      avatar: authorAvatar
    },
    category: categoryValue,
    task_type: formatOption(row.task_type),
    bounty_amount: parseFloat(row.bounty_amount) || 0,
    likes_count: parseInt(row.likes_count) || 0,
    comments_count: parseInt(row.comments_count) || 0,
    views_count: parseInt(row.views_count) || 0,
    status: formatOption(row.status),
    created_at: formatTime(row.created_at)
  };
}

/**
 * 格式化评论
 */
function formatComment(row) {
  return {
    id: row.rowid,
    post_id: row.post_id?.[0]?.sid || '',
    author: {
      id: row.author_id?.[0]?.sid || '',
      nickname: row.author_id?.[0]?.name || '未知',
      avatar: 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg'
    },
    content: row.content || '',
    parent_id: row.parent_id?.[0]?.sid || '',
    likes_count: parseInt(row.likes_count) || 0,
    created_at: formatTime(row.created_at)
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
    try {
      const viewsCount = parseInt(row['69b5db79440840fde2873760'] || row.views_count) || 0;
      updateRow(WORKSHEET_ID.posts, postId, { views_count: viewsCount + 1 }, false).catch(() => {
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

async function createPost(data) {
  const userInfo = app.globalData.userInfo || {};
  const postData = {
    title: data.title,
    content: data.content,
    category: data.category,
    task_type: data.task_type || '',
    bounty_amount: data.bounty_amount || 0,
    status: '进行中',
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    created_at: new Date().toISOString()
  };
  if (data.images?.length > 0) {
    postData.images = data.images.map(url => ({ url, name: 'image.jpg' }));
  }
  if (userInfo.id) {
    postData.author_id = [userInfo.id];
  }
  return createRow(WORKSHEET_ID.posts, postData);
}

async function getComments(postId, page = 1, pageSize = 50) {
  const result = await getRows(WORKSHEET_ID.comments, {
    filter: { type: 'group', logic: 'AND', children: [{ type: 'condition', field: 'post_id', operator: 'belongsto', value: [postId] }] },
    pageIndex: page,
    pageSize,
    sorts: [{ field: 'created_at', isAsc: true }]
  });
  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(formatComment) };
  }
  return { success: false, data: [] };
}

async function addComment(data) {
  const userInfo = app.globalData.userInfo || {};
  const commentData = {
    post_id: [data.post_id],
    content: data.content,
    likes_count: 0,
    created_at: new Date().toISOString()
  };
  if (userInfo.id) commentData.author_id = [userInfo.id];
  if (data.parent_id) commentData.parent_id = [data.parent_id];

  const result = await createRow(WORKSHEET_ID.comments, commentData);
  if (result.success) {
    const post = await getRow(WORKSHEET_ID.posts, data.post_id);
    if (post.success) {
      await updateRow(WORKSHEET_ID.posts, data.post_id, { comments_count: (parseInt(post.data.comments_count) || 0) + 1 }, false);
    }
  }
  return result;
}

async function toggleLike(userId, targetType, targetId) {
  const result = await createRow(WORKSHEET_ID.likes, {
    user_id: [userId],
    target_type: targetType,
    target_id: [targetId],
    created_at: new Date().toISOString()
  });
  if (result.success) {
    const worksheetId = targetType === 'post' ? WORKSHEET_ID.posts : WORKSHEET_ID.comments;
    const target = await getRow(worksheetId, targetId);
    if (target.success) {
      await updateRow(worksheetId, targetId, { likes_count: (parseInt(target.data.likes_count) || 0) + 1 }, false);
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
        'Content-Type': 'application/json',
        'X-Source': 'youqu'
      },
      data: { code },
      success: (res) => {
        console.log('[code2session] 响应:', res.data);
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

async function getOrCreateUser(openid, userInfo = {}) {

  if (result.success && result.data?.rows?.length > 0) {
    const user = result.data.rows[0];
    return { success: true, data: { id: user.rowid, openid: user.openid, nickname: user.nickname || '用户', avatar: user.avatar || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg' } };
  }

  const createResult = await createRow(WORKSHEET_ID.users, {
    openid,
    nickname: userInfo.nickName || '用户' + Math.floor(Math.random() * 10000),
    avatar: userInfo.avatarUrl || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg',
    created_at: new Date().toISOString()
  });

  if (createResult.success) {
    return { success: true, data: { id: createResult.data.rowid, openid, nickname: userInfo.nickName || '用户', avatar: userInfo.avatarUrl || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg' } };
  }
  return { success: false, data: null };
}

async function getUserInfo(userId) {
  const result = await getRow(WORKSHEET_ID.users, userId);
  if (result.success && result.data) {
    return { success: true, data: { id: result.data.rowid, openid: result.data.openid, nickname: result.data.nickname || '用户', avatar: result.data.avatar || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg', student_id: result.data.student_id || '', phone: result.data.phone || '' } };
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

  const result = await createRow(WORKSHEET_ID.task_takers, {
    post_id: [postId],
    owner_id: post.data.author_id || [],
    taker_id: [takerId],
    status: '进行中',
    created_at: new Date().toISOString()
  });

  if (result.success && post.data.author_id) {
    const user = await getUserInfo(takerId);
    await createRow(WORKSHEET_ID.messages, {
      receiver_id: post.data.author_id,
      sender_id: [takerId],
      type: '通知',
      title: '有人接取了你的任务',
      content: `${user.data?.nickname || '未知'} 接取了你的任务：${post.data.title || '无标题'}`,
      related_post_id: [postId],
      is_read: '否',
      created_at: new Date().toISOString()
    });
  }
  return result;
}

module.exports = {
  getRows, getRow, createRow, updateRow,
  getPosts, getPostDetail, createPost,
  getComments, addComment, toggleLike,
  getOrCreateUser, getUserInfo, code2session, getUserPosts,
  getMessages, getBanners, markMessageRead, takeTask,
  WORKSHEET_ID, HAP_CONFIG
};
