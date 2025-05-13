const crypto = require("crypto");
const axios = require("axios");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const RAZORPAY_WEBHOOK_SECRET = "helloworld";
  const ESP32_URL = "http://<ESP32_IP>/success";

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  if (req.body.event === "payment_link.paid") {
    try {
      await axios.get(ESP32_URL);
      console.log("✅ ESP32 notified!");
    } catch (error) {
      console.error("❌ Failed to notify ESP32", error);
    }
  }

  res.status(200).send("Webhook processed");
}
