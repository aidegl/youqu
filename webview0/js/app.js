/**
 * webview0/js/app.js - 核心功能
 * 处理环境检测、URL 参数解析、openid 同步等
 */

(function() {
  'use strict';

  // 版本号
  const VERSION = '1.0.0';

  // 用户信息
  let userInfo = null;

  // 环境检测
  function isInMiniProgram() {
    return (
      window.__wxjs_environment === 'miniprogram' ||
      (window.wx && window.wx.miniProgram) ||
      /miniProgram/i.test(navigator.userAgent)
    );
  }

  // 从 URL hash 获取参数
  function getHashParams() {
    const hash = window.location.hash.slice(1);
    if (!hash) return {};

    const params = {};
    const pairs = hash.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(value || '');
      }
    });
    return params;
  }

  // 从 URL query 获取参数
  function getQueryParams() {
    const search = window.location.search.slice(1);
    if (!search) return {};

    const params = {};
    const pairs = search.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(value || '');
      }
    });
    return params;
  }

  // 获取用户信息
  function getUserInfo() {
    if (userInfo) return userInfo;

    // 从 localStorage 获取
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        userInfo = JSON.parse(stored);
        return userInfo;
      } catch (e) {}
    }

    // 从 hash 参数获取 openid
    const hashParams = getHashParams();
    if (hashParams.openid) {
      userInfo = { openid: hashParams.openid };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return userInfo;
    }

    return null;
  }

  // 保存用户信息
  function saveUserInfo(info) {
    userInfo = info;
    localStorage.setItem('userInfo', JSON.stringify(info));
  }

  // 监听 hash 变化
  function watchHashChange() {
    window.addEventListener('hashchange', () => {
      console.log('[Webview] hash 变化');
      const params = getHashParams();

      // 处理 openid
      if (params.openid) {
        console.log('[Webview] 收到 openid:', params.openid);
        userInfo = { openid: params.openid };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        window.dispatchEvent(new CustomEvent('openidUpdate', { detail: params.openid }));
      }
    });

    // 初始化时检查一次
    const params = getHashParams();
    if (params.openid) {
      console.log('[Webview] 初始化时发现 openid:', params.openid);
      userInfo = { openid: params.openid };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }

  // 页面跳转
  function navigateTo(url) {
    if (isInMiniProgram() && window.wx.miniProgram) {
      window.wx.miniProgram.navigateTo({ url });
    } else {
      window.location.href = url;
    }
  }

  // 返回上一页
  function navigateBack() {
    if (isInMiniProgram() && window.wx.miniProgram) {
      window.wx.miniProgram.navigateBack();
    } else {
      window.history.back();
    }
  }

  // 切换 Tab
  function switchTab(url) {
    if (isInMiniProgram() && window.wx.miniProgram) {
      window.wx.miniProgram.switchTab({ url });
    } else {
      window.location.href = url;
    }
  }

  // 发送消息到小程序
  function postMessage(data) {
    if (isInMiniProgram() && window.wx.miniProgram) {
      window.wx.miniProgram.postMessage({ data });
      console.log('[Webview] 发送消息到小程序:', data);
    }
  }

  // 初始化
  function init() {
    console.log('[Webview] 初始化, 版本:', VERSION);
    console.log('[Webview] 环境:', isInMiniProgram() ? '小程序' : '浏览器');
    console.log('[Webview] URL:', window.location.href);

    watchHashChange();

    // 暴露全局方法
    window.webview = {
      isInMiniProgram,
      getHashParams,
      getQueryParams,
      getUserInfo,
      saveUserInfo,
      navigateTo,
      navigateBack,
      switchTab,
      postMessage,
      VERSION
    };
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();