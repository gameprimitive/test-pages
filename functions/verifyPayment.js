const axios = require("axios");

// 1️⃣ 新增状态映射函数
const mapPaymentState = (piResponse) => {
  const status = piResponse.status || {};
  return {
    identifier: piResponse.identifier,
    amount: piResponse.amount,
    status: {
      isApproved: status.developer_approved,
      isVerified: status.transaction_verified,
      isCompleted: status.developer_completed,
      isCancelled: status.cancelled || status.user_cancelled
    },
    // 2️⃣ 添加时间戳用于调试
    timestamps: {
      created: piResponse.created_at,
      updated: piResponse.updated_at
    }
  };
};

// 3️⃣ 添加请求缓存（简单内存缓存示例）
const paymentCache = new Map();
const CACHE_TTL = 30000; // 30秒

const verifyPayment = async (paymentId) => {
  // 4️⃣ 验证 paymentId 格式
  if (!/^payment_[a-zA-Z0-9_]+$/.test(paymentId)) {
    throw new Error("无效支付 ID 格式");
  }

  // 检查缓存
  if (paymentCache.has(paymentId)) {
    const cached = paymentCache.get(paymentId);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const API_KEY = 'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';
    const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${API_KEY}` },
      timeout: 10000 // 5️⃣ 添加超时控制
    });

    // 6️⃣ 转换数据结构
    const mappedData = mapPaymentState(response.data);
    
    // 更新缓存
    paymentCache.set(paymentId, {
      timestamp: Date.now(),
      data: mappedData
    });

    return mappedData;

  } catch (error) {
    // 7️⃣ 增强错误处理
    const errorData = error.response?.data || {};
    console.error("支付验证失败:", {
      paymentId,
      status: error.response?.status,
      error: errorData.error || error.message
    });

    throw new Error(errorData.error_message || "支付状态查询失败");
  }
};

exports.handler = async (event) => {
  // 添加 CORS 支持
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const { paymentId } = JSON.parse(event.body);
    
    if (!paymentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "缺少支付 ID", code: "MISSING_PAYMENT_ID" })
      };
    }

    const paymentData = await verifyPayment(paymentId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(paymentData)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        code: error.code || "INTERNAL_ERROR"
      })
    };
  }
};