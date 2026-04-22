/**
 * webview0/js/api.js - HAP API 封装（浏览器版本）
 * 包含所有原生小程序 api.js 的功能，适配浏览器环境
 */

// HAP 应用配置
const HAP_CONFIG = {
  appkey: 'cd90921a105a7132',
  sign: 'ZmIxYzFjMmVkZjIzMWYyYzlmOGY5OGIzYTg1MmNkMDIxZGU3NzEyMzhkMjgyNTFjNGE1YzE4YTYwYjJmNjc1Nw==',
  baseUrl: 'https://api.mingdao.com'
};

// 通用登录 API 配置
const AUTH_API_BASE = 'https://100000whys.cn/youqu/api/user';

// 工作表 ID
const WORKSHEET_ID = {
  users: '69b5db5804186a1d512cb9d1',
  posts: '69b5db79d659982669a47c6b',
  comments: '69b5dbc4724cbbeab6557e21',
  likes: '69b5dbb3064e5630e80f4f90',
  follows: '69cac8d9f045950b8025e43a',
  messages: '69b5dbb4724cbbeab6557d8b',
  task_takers: '69b5dc137e3c8fc03e16dc99',
  chat_messages: '69cb54c92a26454c6e33ecc4',
  banners: '69b5dc147e3c8fc03e16dcab',
  albums: '69cf22246e13c0bcab5a3845',
  global_config: '69e2a118f7066f665c4ec8ef'
};

/**
 * HAP V3 API 请求封装（浏览器版本）
 */
async function request(endpoint, method = 'GET', data = null) {
  console.log('[API request]', { url: `${HAP_CONFIG.baseUrl}${endpoint}`, method, data });

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': HAP_CONFIG.appkey,
      'HAP-Sign': HAP_CONFIG.sign
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${HAP_CONFIG.baseUrl}${endpoint}`, options);
    const result = await response.json();

    console.log('[API response]', { statusCode: response.status, data: result });

    if (result.success) {
      return result;
    } else {
      console.error('HAP API Error:', result);
      return { success: false, error_msg: result.error_msg, data: null };
    }
  } catch (err) {
    console.error('HAP API Request Failed:', err);
    return { success: false, error_msg: err.message, data: null };
  }
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
 * 删除记录
 */
async function deleteRow(worksheetId, rowId) {
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'DELETE', { permanent: true });
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
 */
function parseAvatar(avatarField) {
  if (!avatarField) {
    return 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
  }

  if (Array.isArray(avatarField) && avatarField.length > 0) {
    const first = avatarField[0];
    if (typeof first === 'object') {
      return first.large_thumbnail_full_path || first.downloadUrl || first.url || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
    }
  }

  if (typeof avatarField === 'string') {
    if (avatarField.startsWith('[')) {
      try {
        const parsed = JSON.parse(avatarField);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].large_thumbnail_full_path || parsed[0].downloadUrl || parsed[0].url || 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
        }
      } catch (e) {}
    }
    if (avatarField.startsWith('http')) {
      return avatarField;
    }
  }

  return 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
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
 * 获取分类字段的 option key
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

/**
 * 格式化帖子
 */
function formatPost(row) {
  const postImages = [];
  if (row.fengmiantu && Array.isArray(row.fengmiantu)) {
    row.fengmiantu.forEach(img => {
      if (typeof img === 'object') {
        postImages.push(img.downloadUrl || img.large_thumbnail_full_path || img.url || '');
      }
    });
  }

  const coverUrl = postImages.length > 0 ? postImages[0] : '';
  const categoryValue = row['69b5db79440840fde287375b']?.[0]?.value || '';
  const taskTypeValue = row['69b5db79440840fde287375c']?.[0]?.value || '';
  const statusValue = row['69b5db79440840fde287375e']?.[0]?.value || '';
  const bountyAmount = parseFloat(row['69b5db79440840fde287375d']) || 0;
  const createdAt = row['69b5db79440840fde2873762'] || row.created_at || '';

  let authorNickname = '未知';
  let authorAvatar = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg';
  let authorId = '';

  if (row.zznc) {
    authorNickname = typeof row.zznc === 'string' ? row.zznc : (row.zznc[0]?.value || '未知');
  }
  authorAvatar = parseAvatar(row.zztx);

  const authorField = row['69b5db79440840fde2873759'];
  if (authorField && Array.isArray(authorField) && authorField.length > 0) {
    authorId = authorField[0].sid || authorField[0].id || '';
  }

  const likesCount = parseInt(row['69b5db79440840fde287375f']) || parseInt(row.likes_count) || 0;
  const commentsCount = parseInt(row['69b5db79440840fde2873760']) || parseInt(row.comments_count) || 0;
  const viewsCount = parseInt(row['69b5db79440840fde2873761']) || parseInt(row.views_count) || 0;

  const id = row.rowid || row.rowId || '';
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
    sorts: [{ field: '69b5db79440840fde2873762', isAsc: false }]
  });

  console.log('[API.getPosts] API 响应:', result);

  if (result.success && result.data?.rows) {
    const posts = result.data.rows.map(formatPost);
    return { success: true, data: posts };
  }

  return { success: false, data: [] };
}

async function getPostDetail(postId) {
  console.log('[API.getPostDetail] 获取帖子详情:', postId);

  const result = await getRows(WORKSHEET_ID.posts, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: 'rowid',
        operator: 'eq',
        value: [postId]
      }]
    },
    pageIndex: 1,
    pageSize: 1
  });

  if (result.success && result.data?.rows && result.data.rows.length > 0) {
    const row = result.data.rows[0];

    // 更新浏览量（静默）
    try {
      const viewsCount = parseInt(row['69b5db79440840fde2873761']) || 0;
      updateRow(WORKSHEET_ID.posts, postId, { '69b5db79440840fde2873761': viewsCount + 1 }, false).catch(() => {});
    } catch (e) {}

    return { success: true, data: formatPost(row) };
  }

  return { success: false, data: null };
}

async function getComments(postId, page = 1, pageSize = 50) {
  const result = await getRows(WORKSHEET_ID.comments, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dbc4947a225402a9097d',
        operator: 'belongsto',
        value: [postId]
      }]
    },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69b5dbc4947a225402a90984', isAsc: true }]
  });
  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(formatComment) };
  }
  return { success: false, data: [] };
}

async function addComment(data, userInfo) {
  const commentData = {
    '69b5dbc4947a225402a9097d': [data.post_id],
    '69b5dbc4947a225402a90981': data.content,
    '69b5dbc4947a225402a90982': 0,
    '69b5dbc4947a225402a90984': new Date().toISOString()
  };

  if (userInfo?.id) {
    commentData['69b5dbc4947a225402a9097f'] = [userInfo.id];
  }

  if (data.parent_id) {
    commentData['69b5dbceba48d7134c7ac35e'] = [data.parent_id];
  }

  const result = await createRow(WORKSHEET_ID.comments, commentData);

  // 更新帖子评论数
  if (result.success) {
    try {
      const post = await getRow(WORKSHEET_ID.posts, data.post_id);
      if (post.success) {
        const currentCount = parseInt(post.data['69b5db79440840fde2873760']) || 0;
        await updateRow(WORKSHEET_ID.posts, data.post_id, {
          '69b5db79440840fde2873760': currentCount + 1
        }, false);
      }
    } catch (e) {}
  }
  return result;
}

async function toggleLike(userId, targetType, targetId) {
  if (!userId) {
    return { success: false, error_msg: '用户未登录' };
  }

  const targetTypeKeys = {
    'post': 'f62392cf-a4fb-4b0d-9545-8f8a19265245',
    'comment': 'b7c18be7-51ce-4c09-931b-529b01e5eab5'
  };

  const likeData = {
    '69b5dbb304186a1d512cbcfd': [userId],
    '69b5dbb304186a1d512cbcff': [targetTypeKeys[targetType]],
    '69b5dbb304186a1d512cbd00': targetId,
    '69b5dbb304186a1d512cbd01': new Date().toISOString()
  };

  const result = await createRow(WORKSHEET_ID.likes, likeData);

  if (result.success) {
    try {
      const worksheetId = targetType === 'post' ? WORKSHEET_ID.posts : WORKSHEET_ID.comments;
      const target = await getRow(worksheetId, targetId);
      if (target.success) {
        const currentCount = parseInt(target.data['69b5db79440840fde287375f']) || 0;
        await updateRow(worksheetId, targetId, {
          '69b5db79440840fde287375f': currentCount + 1
        }, false);
      }
    } catch (e) {}
  }
  return result;
}

async function getBanners() {
  console.log('[API.getBanners] 开始请求轮播图数据...');

  const result = await getRows(WORKSHEET_ID.banners, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{
        type: 'condition',
        field: '69b5dc145c2066509f21fd27',
        operator: 'eq',
        value: ['8e60a304-0bae-4a26-8c4a-2e01946c8960']
      }]
    },
    pageSize: 10,
    sorts: [{ field: '69b5dc145c2066509f21fd26', isAsc: true }]
  });

  if (result.success && result.data?.rows) {
    const banners = result.data.rows.map(row => {
      const imageField = row.image;
      let imageUrl = '';

      if (imageField && Array.isArray(imageField) && imageField.length > 0) {
        const firstImage = imageField[0];
        if (typeof firstImage === 'object') {
          imageUrl = firstImage.downloadUrl || firstImage.large_thumbnail_full_path || firstImage.url || '';
        }
      }

      return {
        id: row.rowid,
        image: imageUrl,
        link_type: row['69b5dc145c2066509f21fd24']?.[0]?.value || '',
        link_target: row['69b5dc145c2066509f21fd25'] || ''
      };
    });

    return { success: true, data: banners };
  }

  return { success: false, data: [] };
}

async function getSysConfig() {
  console.log('===== [API getSysConfig] 开始 =====');
  console.log('[API] 调用 getRow, worksheetId:', WORKSHEET_ID.global_config);
  console.log('[API] rowId: 23638c6a-0305-40e8-bbcf-8731439aa6b4');

  const result = await getRow(WORKSHEET_ID.global_config, '23638c6a-0305-40e8-bbcf-8731439aa6b4');

  console.log('[API] getRow 响应:', result);
  console.log('[API] result.success:', result.success);
  console.log('[API] result.data:', result.data);

  if (result.success && result.data) {
    const rawData = result.data;

    // 尝试多种方式获取配置值
    const value = rawData['69e2a118f7066f665c4ec8f1'] || rawData.value || rawData.Value || '0';

    console.log('[API] 配置值 value:', value);
    console.log('[API] value 类型:', typeof value);
    console.log('[API] isSpecialMode 判断: value === "1" ?', value === '1');

    const isSpecialMode = value === '1' || value === 1 || value === true;

    console.log('[API] isSpecialMode:', isSpecialMode);
    console.log('===== [API getSysConfig] 完成 =====');

    return {
      success: true,
      value: value,
      isSpecialMode: isSpecialMode
    };
  }

  console.log('[API] getSysConfig 失败');
  console.log('===== [API getSysConfig] 完成（失败） =====');

  return {
    success: false,
    value: '0',
    isSpecialMode: false,
    error_msg: result.error_msg || '获取配置失败'
  };
}

async function getUserPosts(userId, category = '', page = 1, pageSize = 20) {
  const children = [{ type: 'condition', field: '69b5db79440840fde2873759', operator: 'belongsto', value: [userId] }];

  if (category) {
    const categoryKeys = {
      '赏金任务': '8eb44026-eebe-4677-bc9c-435e972729a6',
      '问答': '9e5f96d9-6255-4ec5-aef4-4df2f7c0e760',
      '吐槽': '9646cbb4-2eee-4c91-88ac-b4cdd394be5e'
    };
    if (categoryKeys[category]) {
      children.push({ type: 'condition', field: '69b5db79440840fde287375b', operator: 'eq', value: [categoryKeys[category]] });
    }
  }

  const result = await getRows(WORKSHEET_ID.posts, {
    filter: { type: 'group', logic: 'AND', children },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69b5db79440840fde2873762', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    return { success: true, data: result.data.rows.map(formatPost) };
  }
  return { success: false, data: [] };
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

async function getFollowStats(userId) {
  const followingResult = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69cac8d9d128aadb0c7a7bbc', operator: 'belongsto', value: [userId] }]
    },
    pageIndex: 1,
    pageSize: 1000
  });

  const followerResult = await getRows(WORKSHEET_ID.follows, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69cac8d9d128aadb0c7a7bbe', operator: 'belongsto', value: [userId] }]
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

async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    return { success: false, error_msg: '不能关注自己' };
  }

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

  if (existing.success && existing.data?.rows?.length > 0) {
    return { success: false, error_msg: '已经关注过了' };
  }

  return createRow(WORKSHEET_ID.follows, {
    '69cac8d9d128aadb0c7a7bbc': [followerId],
    '69cac8d9d128aadb0c7a7bbe': [followingId],
    '69cac8d9d128aadb0c7a7bc0': new Date().toISOString()
  });
}

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

async function takeTask(postId, takerId) {
  const post = await getRow(WORKSHEET_ID.posts, postId);
  if (!post.success) return { success: false, error_msg: '任务不存在' };

  const authorId = post.data['69b5db79440840fde2873759']?.[0]?.sid || '';

  const result = await createRow(WORKSHEET_ID.task_takers, {
    '69b5dc13401e6eb020edf41f': [postId],
    '69b5dc13401e6eb020edf421': authorId ? [authorId] : [],
    '69b5dc13401e6eb020edf423': [takerId],
    '69b5dc13401e6eb020edf428': new Date().toISOString()
  });

  // 发送欢迎消息
  if (result.success && authorId) {
    const taskTakerId = result.data.rowid;
    await sendChatMessage(taskTakerId, authorId, takerId, '感谢领取任务，有任务不清楚的地方可以问我~');
  }
  return result;
}

async function getTaskConversations(userId) {
  const asOwner = await getRows(WORKSHEET_ID.task_takers, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69b5dc13401e6eb020edf421', operator: 'belongsto', value: [userId] }]
    },
    pageIndex: 1,
    pageSize: 50,
    sorts: [{ field: '69b5dc13401e6eb020edf428', isAsc: false }]
  });

  const asTaker = await getRows(WORKSHEET_ID.task_takers, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69b5dc13401e6eb020edf423', operator: 'belongsto', value: [userId] }]
    },
    pageIndex: 1,
    pageSize: 50,
    sorts: [{ field: '69b5dc13401e6eb020edf428', isAsc: false }]
  });

  const conversations = [];

  if (asOwner.success && asOwner.data?.rows) {
    for (const row of asOwner.data.rows) {
      conversations.push({
        id: row.rowid || row.rowId,
        taskId: row.rowid || row.rowId,
        postId: row['69b5dc13401e6eb020edf41f']?.[0]?.sid,
        postTitle: row['69b5dc13401e6eb020edf41f']?.[0]?.name || '任务',
        otherUser: { id: row['69b5dc13401e6eb020edf423']?.[0]?.sid, nickname: row['69b5dc13401e6eb020edf423']?.[0]?.name || '未知' },
        isOwner: true,
        created_at: formatTime(row['69b5dc13401e6eb020edf428'])
      });
    }
  }

  if (asTaker.success && asTaker.data?.rows) {
    for (const row of asTaker.data.rows) {
      conversations.push({
        id: row.rowid || row.rowId,
        taskId: row.rowid || row.rowId,
        postId: row['69b5dc13401e6eb020edf41f']?.[0]?.sid,
        postTitle: row['69b5dc13401e6eb020edf41f']?.[0]?.name || '任务',
        otherUser: { id: row['69b5dc13401e6eb020edf421']?.[0]?.sid, nickname: row['69b5dc13401e6eb020edf421']?.[0]?.name || '未知' },
        isOwner: false,
        created_at: formatTime(row['69b5dc13401e6eb020edf428'])
      });
    }
  }

  return { success: true, data: conversations };
}

async function getChatMessages(taskTakerId) {
  const result = await getRows(WORKSHEET_ID.chat_messages, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69cb54c9075399e7d17c705e', operator: 'belongsto', value: [taskTakerId] }]
    },
    pageIndex: 1,
    pageSize: 100,
    sorts: [{ field: '69cb54c9075399e7d17c7065', isAsc: true }]
  });

  if (result.success && result.data?.rows) {
    const messages = result.data.rows.map(row => ({
      id: row.rowid || row.rowId,
      sender: {
        id: row['69cb54c9075399e7d17c7060']?.[0]?.sid || '',
        nickname: row['69cb54c9075399e7d17c7060']?.[0]?.name || '未知'
      },
      receiver: {
        id: row['69cb54c9075399e7d17c7062']?.[0]?.sid || '',
        nickname: row['69cb54c9075399e7d17c7062']?.[0]?.name || '未知'
      },
      content: row['69cb54c9075399e7d17c7064'] || '',
      created_at: formatTime(row['69cb54c9075399e7d17c7065'])
    }));
    return { success: true, data: messages };
  }
  return { success: false, data: [] };
}

async function sendChatMessage(taskTakerId, senderId, receiverId, content) {
  return createRow(WORKSHEET_ID.chat_messages, {
    '69cb54c9075399e7d17c705e': [taskTakerId],
    '69cb54c9075399e7d17c7060': [senderId],
    '69cb54c9075399e7d17c7062': [receiverId],
    '69cb54c9075399e7d17c7064': content,
    '69cb54c9075399e7d17c7065': new Date().toISOString()
  });
}

async function getUserAlbums(userId, page = 1, pageSize = 20) {
  const result = await getRows(WORKSHEET_ID.albums, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69cf222475717a002c6b3762', operator: 'belongsto', value: [userId] }]
    },
    pageIndex: page,
    pageSize,
    sorts: [{ field: '69cf222475717a002c6b3765', isAsc: false }]
  });

  if (result.success && result.data?.rows) {
    const albums = result.data.rows.map(row => {
      const imageField = row['69cf222475717a002c6b3764'];
      let imageUrl = '';

      if (imageField && Array.isArray(imageField) && imageField.length > 0) {
        const firstImage = imageField[0];
        if (typeof firstImage === 'object') {
          imageUrl = firstImage.large_thumbnail_full_path || firstImage.downloadUrl || firstImage.url || '';
        }
      }

      return {
        id: row.rowid || row.rowId,
        image: imageUrl,
        created_at: formatTime(row['69cf222475717a002c6b3765'])
      };
    });
    return { success: true, data: albums };
  }
  return { success: false, data: [] };
}

// 暴露到全局
window.API = {
  getRows,
  getRow,
  createRow,
  updateRow,
  deleteRow,
  getPosts,
  getPostDetail,
  getComments,
  addComment,
  toggleLike,
  getBanners,
  getSysConfig,
  getUserPosts,
  getUserInfo,
  getFollowStats,
  followUser,
  checkIsFollowing,
  takeTask,
  getTaskConversations,
  getChatMessages,
  sendChatMessage,
  getUserAlbums,
  formatTime,
  getCategoryKey,
  getTaskTypeKey,
  WORKSHEET_ID,
  HAP_CONFIG
};