# 友趣小程序 (youqu)

友趣是一个微信小程序项目，使用原生开发。

## 技术栈

- 原生微信小程序
- HAP 明道云（数据存储）
- 通用登录 API（shuxiaohe-auth）

## 登录说明

登录使用通用 API：
- 接口地址：`https://100000whys.cn/shuxiaohe/api/user/code2session`
- 调用方式：`wx.login()` 获取 code → 调用 API 换取 openid

## 目录结构

```
├── app.js              # 小程序入口
├── app.json            # 小程序配置
├── pages/              # 页面
├── utils/
│   └── api.js         # API 封装
└── cloudfunctions/     # 云函数（已弃用）
```

## 开发

```bash
# 安装依赖（如有）
npm install

# 使用微信开发者工具打开项目
```

## 相关项目

- [shuxiaohe](https://github.com/aidegl/shuxiaohe) - 鼠小盒后端服务
