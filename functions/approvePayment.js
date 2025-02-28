// approvePayment.js
const axios = require('axios');

exports.handler = async function(event, context) {
    const { paymentId } = JSON.parse(event.body);

    // 替換為您的 Pi 應用的 API 金鑰
    const API_KEY = 'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';

    try {
        // 調用 Pi 的 /approve API 進行支付批准
        const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: {
                'Authorization': `Key ${API_KEY}`
            }
        });

        if (response.data && response.data.txid) {
            // 支付已成功批准
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, txid: response.data.txid })
            };
        } else {
            // 批准失敗
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: 'Approval failed' })
            };
        }
    } catch (error) {
        console.error("伺服器批准支付失敗:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
