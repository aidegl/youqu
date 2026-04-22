/**
 * webview0/js/api.js - HAP API 封装（浏览器版本）
 * 复制 utils/api.js 的功能，适配浏览器环境
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
  console.log('===== [getPostDetail] 开始 =====');
  console.log('帖子 ID:', postId);

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
    console.log('===== [getPostDetail] 成功 =====\n');
    return { success: true, data: formatPost(row) };
  }

  console.log('===== [getPostDetail] 失败：未找到记录 =====\n');
  return { success: false, data: null };
}

/**
 * 获取轮播图列表
 */
async function getBanners() {
  console.log('[API.getBanners] 开始请求 HAP 轮播图数据...');

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

/**
 * 获取系统配置
 */
async function getSysConfig() {
  const result = await getRow(WORKSHEET_ID.global_config, '23638c6a-0305-40e8-bbcf-8731439aa6b4');
  if (result.success && result.data) {
    const value = result.data.value || result.data['69e2a118f7066f665c4ec8f1'] || '0';
    return {
      success: true,
      isSpecialMode: value === '1'
    };
  }
  return { success: false, isSpecialMode: false };
}

// 暴露到全局
window.API = {
  getRows,
  getRow,
  createRow,
  updateRow,
  getPosts,
  getPostDetail,
  getBanners,
  getSysConfig,
  WORKSHEET_ID,
  HAP_CONFIG
};