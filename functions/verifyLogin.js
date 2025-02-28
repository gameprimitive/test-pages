const axios = require("axios");

/**
 * 驗證 Pi Network 用戶的 accessToken
 * @param {string} accessToken - 從前端獲取的 Pi Network accessToken
 * @returns {Promise<object>} - 返回用戶資訊或錯誤訊息
 */
const verifyLogin = async (accessToken) => {
  if (!accessToken) {
    throw new Error("❌ Missing access token");
  }

  try {
    // 向 Pi Network API 發送請求，驗證 accessToken
    const response = await axios.get("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("✅ 登入驗證成功:", response.data);
    return response.data; // 回傳用戶資料
  } catch (error) {
    console.error("❌ 登入驗證失敗:", error.response?.data || error.message);
    throw new Error("User not authorized");
  }
};

/**
 * Netlify Lambda 函數入口
 */
exports.handler = async (event) => {
  try {
    const { accessToken } = JSON.parse(event.body);

    if (!accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ 缺少 accessToken" }),
      };
    }

    const userData = await verifyLogin(accessToken);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✅ 登入驗證成功", user: userData }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
