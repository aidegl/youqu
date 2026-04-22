// utils/api.js - HAP API 封装（小程序版）

// 通用登录 API 配置
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
  global_config: '69e2a118f7066f665c4ec8ef'
};

// HAP API 请求
function request(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
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
        if (res.data.success) {
          resolve(res.data);
        } else {
          resolve({ success: false, error_msg: res.data.error_msg, data: null });
        }
      },
      fail: (err) => {
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

// 查询记录列表
async function getRows(worksheetId, options = {}) {
  const { filter, pageIndex = 1, pageSize = 20 } = options;
  const requestBody = { pageIndex, pageSize };
  if (filter) requestBody.filter = filter;
  return request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', requestBody);
}

// 获取单条记录
async function getRow(worksheetId, rowId) {
  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'GET');
}

// 创建记录
async function createRow(worksheetId, data) {
  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows`, 'POST', { fields });
}

// 通过 code 换取 openid
async function code2session(code) {
  return new Promise((resolve) => {
    wx.request({
      url: `${AUTH_API_BASE}/code2session`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { code },
      success: (res) => {
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
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

// 获取或创建 HAP 用户
async function getOrCreateUser(openid, userInfo = {}) {
  // 先查找用户
  const result = await getRows(WORKSHEET_ID.users, {
    filter: {
      type: 'group',
      logic: 'AND',
      children: [{ type: 'condition', field: '69b5db58a606df9d8178a03e', operator: 'eq', value: [openid] }]
    },
    pageIndex: 1,
    pageSize: 1
  });

  if (result.success && result.data?.rows?.length > 0) {
    const user = result.data.rows[0];
    return {
      success: true,
      data: {
        id: user.rowId || user.rowid,
        openid: openid,
        nickname: user['69b5db58a606df9d8178a040'] || userInfo.nickname || '用户'
      }
    };
  }

  // 创建新用户
  const createResult = await createRow(WORKSHEET_ID.users, {
    '69b5db58a606df9d8178a03e': openid,
    '69b5db58a606df9d8178a040': userInfo.nickname || '用户' + Math.floor(Math.random() * 10000),
    '69b5db58a606df9d8178a045': new Date().toISOString()
  });

  if (createResult.success) {
    return {
      success: true,
      data: {
        id: createResult.data.rowid,
        openid: openid,
        nickname: userInfo.nickname || '用户'
      }
    };
  }

  return { success: false, error_msg: createResult.error_msg, data: null };
}

// 获取系统配置
async function getSysConfig() {
  const result = await getRow(WORKSHEET_ID.global_config, '23638c6a-0305-40e8-bbcf-8731439aa6b4');
  if (result.success && result.data) {
    const value = result.data.value || result.data['69e2a118f7066f665c4ec8f1'] || '0';
    return { success: true, isSpecialMode: value === '1' };
  }
  return { success: false, isSpecialMode: false };
}

module.exports = {
  getRows, getRow, createRow,
  code2session, getOrCreateUser, getSysConfig,
  WORKSHEET_ID, HAP_CONFIG
};