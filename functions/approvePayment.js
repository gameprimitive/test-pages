// approvePayment.js
const axios = require('axios');

exports.handler = async function(event, context) {
     try {
        const body = JSON.parse(event.body);
        const { paymentId, uid } = body; // 获取 paymentId 和 uid
        console.log("收到的请求 body:", body);
        console.log("收到的 paymentId:", paymentId);
        console.log("收到的用户 UID:", uid);

        if (!paymentId) {
            console.error("❌ 错误: 缺少 paymentId");
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: "缺少 paymentId" })
            };
        }

    // 替換為您的 Pi 應用的 API 金鑰
    const API_KEY = process.env.API_KEY;
 if (!API_KEY) {
            console.error("❌ 错误: API_KEY 未定义，请检查 Netlify 环境变量设置");
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "服务器错误: API_KEY 未定义" })
            };
        }
   // 調用 Pi 的 /approve API 進行支付批准
        const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: {
                'Authorization': `Key ${API_KEY}`
            }
        });

        console.log("✅ Pi 服务器返回数据:", response.data);

         if (response.data && response.data.txid) {
            // 支付已成功批准
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, txid: response.data.txid })
            };
        } else {
            console.error("❌ 服务器错误: Pi API 没有返回 txid", response.data);
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: "Pi API 没有返回交易 ID (txid)" })
            };
        }
    } catch (error) {
        console.error("❌ 伺服器批准支付失敗:", error.response ? error.response.data : error.message);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                error: error.response ? error.response.data : error.message 
            })
        };
    }
};
