// 明道云API调用组件（微信小程序版本）
class MingDaoYunAPI {
  constructor() {
    // 固定配置 - 需要替换为实际的 youqu 项目配置
    this.appKey = "your-app-key";
    this.sign = "your-sign";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/getRowByIdPost";
  }

  /**
   * 核心方法：获取单行数据
   * @param {String} rowid - 记录ID
   * @param {String} worksheetId - 工作表ID
   * @returns {Object} {success: Boolean, data: Object, error_msg: String, error_code: Number}
   */
  getData(rowid, worksheetId) {
    console.log("[明道云] 调用 getData, rowid:", rowid, "worksheetId:", worksheetId);

    return new Promise((resolve, reject) => {
      try {
        const requestBody = {
          "appKey": this.appKey,
          "sign": this.sign,
          "worksheetId": worksheetId,
          "rowId": rowid,
          "getSystemControl": "false"
        };

        console.log("[明道云] 请求体:", requestBody);

        const postRequest = () => {
          return new Promise((postResolve, postReject) => {
            wx.request({
              url: this.baseUrl,
              method: 'POST',
              data: requestBody,
              header: {
                'content-type': 'application/json'
              },
              timeout: 5000,
              success: (res) => {
                console.log("[明道云] 请求成功:", res);
                if (res.statusCode === 200) {
                  postResolve(res.data);
                } else {
                  postReject(new Error(`HTTP错误: ${res.statusCode}`));
                }
              },
              fail: (err) => {
                console.error("[明道云] 请求失败:", err);
                postReject(err);
              }
            });
          });
        };

        postRequest()
          .then(mdResult => {
            console.log("[明道云] 返回结果:", mdResult);

            let outputData = null;
            let success = false;
            let error_msg = "";
            let error_code = 0;

            if (mdResult.success) {
              outputData = mdResult.data;
              success = true;
              error_code = mdResult.error_code || 1;
            } else {
              error_msg = mdResult.error_msg || "接口调用失败";
              error_code = mdResult.error_code || 10101;
            }

            resolve({
              success: success,
              data: outputData,
              error_msg: error_msg,
              error_code: error_code
            });
          })
          .catch(err => {
            console.error("[明道云] 第一次请求失败:", err);
            // 重试一次
            postRequest()
              .then(mdResult => {
                console.log("[明道云] 重试成功:", mdResult);
                let outputData = null;
                let success = false;
                let error_msg = "";
                let error_code = 0;

                if (mdResult.success) {
                  outputData = mdResult.data;
                  success = true;
                  error_code = mdResult.error_code || 1;
                } else {
                  error_msg = mdResult.error_msg || "接口调用失败";
                  error_code = mdResult.error_code || 10101;
                }

                resolve({
                  success: success,
                  data: outputData,
                  error_msg: error_msg,
                  error_code: error_code
                });
              })
              .catch(err2 => {
                console.error("[明道云] 重试失败:", err2);
                resolve({
                  success: false,
                  data: null,
                  error_msg: `网络错误：${err2.errMsg || err2.message}`,
                  error_code: 99999
                });
              });
          });
      } catch (error) {
        console.error("[明道云] 异常:", error.message);
        resolve({
          success: false,
          data: null,
          error_msg: `解析错误：${error.message}`,
          error_code: 99999
        });
      }
    });
  }
}

module.exports = MingDaoYunAPI;