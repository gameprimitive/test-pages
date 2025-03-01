const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post("/login", async (req, res) => {
    const { accessToken } = req.body;

    try {
        // 用 accessToken 向 Pi 伺服器驗證身份
        const response = await axios.get("https://api.minepi.com/v2/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log("✅ Pi 帳號驗證成功:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Pi 登入失敗:", error);
        res.status(400).json({ error: "登入失敗" });
    }
});

app.listen(3000, () => console.log("伺服器運行於 http://localhost:3000"));
