// api/webhook.js
const crypto = require("crypto");
const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const esp32Url = "http://192.168.1.100/success"; // ⬅️ replace with ESP32 IP

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  if (req.body.event === "payment_link.paid") {
    try {
      await axios.get(esp32Url);
      console.log("✅ ESP32 Notified!");
    } catch (err) {
      console.error("❌ Failed to notify ESP32:", err);
    }
  }

  return res.status(200).json({ status: "success" });
};
