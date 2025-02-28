const axios = require("axios");

const verifyPayment = async (paymentId) => {
  const API_KEY = 'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';
  
  try {
    // 添加请求超时和验证
    const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${API_KEY}` },
      timeout: 8000, // 8秒超时
      validateStatus: (status) => status < 500 // 忽略5xx错误
    });

    // 强制返回标准化结构
    return {
      success: true,
      data: {
        ...response.data,
        status: response.data.status || {} // 确保status字段存在
      }
    };

  } catch (error) {
    // 增强错误信息
    return {
      success: false,
      error: {
        code: error.response?.status || 1001,
        message: error.response?.data?.message || "PI_API_CONNECTION_FAILED"
      }
    };
  }
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const { paymentId } = JSON.parse(event.body);
    if (!paymentId) throw new Error("MISSING_PAYMENT_ID");

    const result = await verifyPayment(paymentId);
    
    if (!result.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(result.error)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        code: "SERVER_ERROR",
        message: error.message
      })
    };
  }
};