const axios = require("axios");

const verifyPayment = async (paymentId) => {
	 // 替換為您的 Pi 應用的 API 金鑰
    const API_KEY = 'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';
    try {
        const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
            headers: { Authorization: `Key ${API_KEY}` },
        });

        return response.data;
    } catch (error) {
        console.error("❌ 無法獲取支付狀態:", error.response?.data || error.message);
        throw new Error("無法查詢支付狀態");
    }
};

exports.handler = async (event) => {
    try {
        const { paymentId } = JSON.parse(event.body);
        if (!paymentId) {
            return { statusCode: 400, body: JSON.stringify({ error: "缺少支付 ID" }) };
        }

        const paymentData = await verifyPayment(paymentId);
        return { statusCode: 200, body: JSON.stringify(paymentData) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
