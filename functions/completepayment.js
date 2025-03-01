const axios = require('axios');

exports.handler = async (event) => {
  try {
    // 解析请求体
    const body = JSON.parse(event.body);
    const payment_id = body.payment_id;
    const txid = body.txid;

    if (!payment_id || !txid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "缺少支付 ID 或交易 ID" }),
      };
    }

    // Pi Network API 密钥（建议存储在环境变量中）
    const APIKEY =  process.env.API_KEY;
    if (!APIKEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "服务器配置错误，缺少 API KEY" }),
      };
    }

    // 设置请求头
    const headers = {
      headers: { authorization: `Key ${APIKEY}` },
    };

    // 构建请求 URL
    const postingURL = `https://api.minepi.com/v2/payments/${payment_id}/complete`;

    // 向 Pi Network 服务器发送请求以完成支付
    const response = await axios.post(postingURL, { txid: txid }, headers);

    // 返回 Pi Network 服务器的响应数据
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("❌ 支付完成处理失败:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "支付完成处理失败", details: error.message }),
    };
  }
};
