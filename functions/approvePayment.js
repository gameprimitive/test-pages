const axios = require('axios');

exports.handler = async function(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { paymentId, uid } = body; // 获取 paymentId 和 uid

        console.log("📌 收到的请求 body:", body);
        console.log("📌 收到的 paymentId:", paymentId);
        console.log("📌 收到的用户 UID:", uid);

        if (!paymentId) {
            console.error("❌ 错误: 缺少 paymentId");
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: "缺少 paymentId" })
            };
        }

        // 替換為您的 Pi 應用的 API 金鑰
        const API_KEY = 'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';

        // ✅ 先查询支付状态，确保它已完成
        const checkPaymentStatus = async () => {
            try {
                const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
                    headers: { 'Authorization': `Key ${API_KEY}` }
                });
                return response.data;
            } catch (error) {
                console.error("❌ 获取支付状态失败:", error.response ? error.response.data : error.message);
                return null;
            }
        };

        let paymentStatus = await checkPaymentStatus();
        console.log("📌 当前支付状态:", paymentStatus);

        // 如果支付还没完成，等待最多 15 秒（每 5 秒检查一次）
        let attempts = 0;
        while (paymentStatus && paymentStatus.status !== "completed" && attempts < 3) {
            console.log("⏳ 支付未完成，等待 5 秒后重试...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            paymentStatus = await checkPaymentStatus();
            console.log("📌 重新检查支付状态:", paymentStatus);
            attempts++;
        }

        if (!paymentStatus || paymentStatus.status !== "completed") {
            console.error("❌ Pi 服务器: 支付未完成，无法批准");
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: "支付未完成，无法批准" })
            };
        }

        // ✅ 现在支付已完成，调用 Pi 的 /approve API 进行支付批准
        console.log("🚀 发送支付批准请求...");
        const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { 'Authorization': `Key ${API_KEY}` }
        });

        console.log("✅ Pi 服务器返回数据:", response.data);

        if (response.data && response.data.txid) {
            // 支付已成功批准
            console.log("🎉 支付成功! 交易 ID:", response.data.txid);
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
