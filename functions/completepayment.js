const axios = require('axios');

// 从客户端接收的支付 ID 和交易 ID
const payment_id = req.body.payment_id;
const txid = req.body.txid;

// Pi Network API 密钥，建议存储在环境变量中
const APIKEY =  'he0f7kqvflgdilyarfinvgyaulpbff1fosodotrhzlf5poeici6aufviegjdhtww';

// 设置请求头
const headers = {
  headers: { authorization: `key ${APIKEY}` }
};

// 构建请求 URL
const postingURL = `https://api.minepi.com/v2/payments/${payment_id}/complete`;

// 向 Pi Network 服务器发送请求以完成支付
axios.post(postingURL, { txid: txid }, headers)
  .then(response => {
    // 处理成功响应
    const paymentDTO = response.data;
    console.log(paymentDTO);
    // 根据业务逻辑处理 paymentDTO
    res.status(200).json(paymentDTO);
  })
  .catch(error => {
    // 处理错误响应
    console.error(error);
	console.error(payment_id);
    res.status(500).json({ error: '支付完成处理失败' });
  });
