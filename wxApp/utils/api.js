// utils/api.js - HAP API 封装（小程序版）

console.log('===== [API module] 加载 =====');

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

// 全局配置行 ID（存储审核状态的行）
const CONFIG_ROW_ID = '23638c6a-0305-40e8-bbcf-8731439aa6b4';

// 全局配置字段 ID（存储审核状态值的字段）
const CONFIG_VALUE_FIELD_ID = '69e2a118f7066f665c4ec8f1';

console.log('[API] HAP_CONFIG:', HAP_CONFIG);
console.log('[API] WORKSHEET_ID:', WORKSHEET_ID);
console.log('[API] CONFIG_ROW_ID:', CONFIG_ROW_ID);
console.log('[API] CONFIG_VALUE_FIELD_ID:', CONFIG_VALUE_FIELD_ID);

// HAP API 请求
function request(endpoint, method = 'GET', data = null) {
  const url = `${HAP_CONFIG.baseUrl}${endpoint}`;
  console.log('[API request] url:', url);
  console.log('[API request] method:', method);
  console.log('[API request] data:', data);

  return new Promise((resolve) => {
    wx.request({
      url: url,
      method,
      header: {
        'Content-Type': 'application/json',
        'HAP-Appkey': HAP_CONFIG.appkey,
        'HAP-Sign': HAP_CONFIG.sign
      },
      data: data || {},
      success: (res) => {
        console.log('[API response] statusCode:', res.statusCode);
        console.log('[API response] data:', JSON.stringify(res.data, null, 2));

        if (res.data.success) {
          resolve(res.data);
        } else {
          resolve({ success: false, error_msg: res.data.error_msg, data: null });
        }
      },
      fail: (err) => {
        console.error('[API request fail]', err);
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

// 查询记录列表
async function getRows(worksheetId, options = {}) {
  console.log('[API getRows] worksheetId:', worksheetId);
  console.log('[API getRows] options:', options);

  const { filter, pageIndex = 1, pageSize = 20 } = options;
  const requestBody = { pageIndex, pageSize };
  if (filter) requestBody.filter = filter;

  return request(`/v3/app/worksheets/${worksheetId}/rows/list`, 'POST', requestBody);
}

// 获取单条记录
async function getRow(worksheetId, rowId) {
  console.log('[API getRow] worksheetId:', worksheetId);
  console.log('[API getRow] rowId:', rowId);

  return request(`/v3/app/worksheets/${worksheetId}/rows/${rowId}`, 'GET');
}

// 创建记录
async function createRow(worksheetId, data) {
  console.log('[API createRow] worksheetId:', worksheetId);
  console.log('[API createRow] data:', data);

  const fields = Object.entries(data).map(([id, value]) => ({ id, value }));
  return request(`/v3/app/worksheets/${worksheetId}/rows`, 'POST', { fields });
}

// 通过 code 换取 openid
async function code2session(code) {
  console.log('[API code2session] code:', code);

  return new Promise((resolve) => {
    wx.request({
      url: `${AUTH_API_BASE}/code2session`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { code },
      success: (res) => {
        console.log('[API code2session] response:', res.data);

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
        console.error('[API code2session] fail:', err);
        resolve({ success: false, error_msg: err.errMsg, data: null });
      }
    });
  });
}

// 获取或创建 HAP 用户
async function getOrCreateUser(openid, userInfo = {}) {
  console.log('[API getOrCreateUser] openid:', openid);
  console.log('[API getOrCreateUser] userInfo:', userInfo);

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

  console.log('[API getOrCreateUser] 查询结果:', result);

  if (result.success && result.data?.rows?.length > 0) {
    const user = result.data.rows[0];
    console.log('[API getOrCreateUser] 找到现有用户:', user);
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
  console.log('[API getOrCreateUser] 用户不存在，创建新用户');
  const createResult = await createRow(WORKSHEET_ID.users, {
    '69b5db58a606df9d8178a03e': openid,
    '69b5db58a606df9d8178a040': userInfo.nickname || '用户' + Math.floor(Math.random() * 10000),
    '69b5db58a606df9d8178a045': new Date().toISOString()
  });

  console.log('[API getOrCreateUser] 创建结果:', createResult);

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

/**
 * 获取系统配置（审核状态）
 *
 * HAP 数据表：69e2a118f7066f665c4ec8ef
 * 行 ID：23638c6a-0305-40e8-bbcf-8731439aa6b4
 * 字段 ID：69e2a118f7066f665c4ec8f1（存储审核状态值）
 *
 * value = "1" → 审核模式（显示培训页）
 * value = "0" → 正常模式（显示社区页）
 */
async function getSysConfig() {
  console.log('===== [API getSysConfig] 开始 =====');
  console.log('[API] 工作表 ID:', WORKSHEET_ID.global_config);
  console.log('[API] 行 ID:', CONFIG_ROW_ID);
  console.log('[API] 字段 ID:', CONFIG_VALUE_FIELD_ID);

  const result = await getRow(WORKSHEET_ID.global_config, CONFIG_ROW_ID);

  console.log('===== [API getSysConfig] HAP 原始响应 =====');
  console.log('[API] result.success:', result.success);
  console.log('[API] result.error_msg:', result.error_msg);

  if (result.success && result.data) {
    const rawData = result.data;

    console.log('[API] rawData (原始数据):');
    console.log(JSON.stringify(rawData, null, 2));

    // 打印所有字段
    console.log('[API] 所有字段列表:');
    for (const key in rawData) {
      console.log(`  ${key}: ${rawData[key]}`);
    }

    // 尝试多种方式获取配置值
    // 1. 通过字段 ID 获取
    const fieldValueById = rawData[CONFIG_VALUE_FIELD_ID];
    console.log('[API] 通过字段 ID 获取:', CONFIG_VALUE_FIELD_ID, '=', fieldValueById);

    // 2. 通过别名获取（可能的别名）
    const fieldValueByAlias = rawData.value;
    console.log('[API] 通过别名 value 获取:', fieldValueByAlias);

    // 3. 其他可能的字段名
    const otherValues = {
      '69e2a118f7066f665c4ec8f1': rawData['69e2a118f7066f665c4ec8f1'],
      'value': rawData['value'],
      'Value': rawData['Value'],
      '配置值': rawData['配置值']
    };
    console.log('[API] 其他可能字段:', otherValues);

    // 取第一个有值的
    const value = fieldValueById || fieldValueByAlias || '0';
    console.log('[API] 最终取到的 value:', value);
    console.log('[API] value 类型:', typeof value);

    // 判断审核模式
    // value = "1" 或 value = 1 表示审核模式
    const isSpecialMode = value === '1' || value === 1 || value === true;
    console.log('[API] isSpecialMode:', isSpecialMode);
    console.log('[API] 判断逻辑: value === "1" ?', value === '1');
    console.log('[API] 判断逻辑: value === 1 ?', value === 1);
    console.log('[API] 判断逻辑: value === true ?', value === true);

    console.log('===== [API getSysConfig] 完成 =====');

    return {
      success: true,
      isSpecialMode: isSpecialMode,
      value: value
    };
  }

  console.log('[API] 获取配置失败');
  console.log('===== [API getSysConfig] 完成（失败） =====');

  return {
    success: false,
    isSpecialMode: false,
    value: '0'
  };
}

module.exports = {
  getRows,
  getRow,
  createRow,
  code2session,
  getOrCreateUser,
  getSysConfig,
  WORKSHEET_ID,
  HAP_CONFIG,
  CONFIG_ROW_ID,
  CONFIG_VALUE_FIELD_ID
};