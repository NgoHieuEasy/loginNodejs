const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const readline = require("readline");
const input = require("input");
const fs = require("fs");
const apiId = 23415111;
const apiHash = "12f7ac0fc718d7afbef4deb99c42e39f";
const phoneNumber = "+84382507792";

const sessionFile = "session.txt";

const savedSession = async () => {
  const stringSession = new StringSession("");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();
    // Kết nối đến Telegram
    await client.start({
      phoneNumber: async () => phoneNumber,
      password: async () => await input.text("Mật khẩu (nếu có)?"),
      phoneCode: async () => await input.text("Nhập mã OTP?"),
      onError: (err) => console.log(err),
    });

    console.log("Đăng nhập thành công!");

    // Lưu session vào file session.txt
    const sessionString = client.session.save();
    fs.writeFileSync(sessionFile, sessionString, "utf-8");
    console.log(`Session đã được lưu vào ${sessionFile}`);
  } catch (error) {
    console.error("Đăng nhập thất bại:", error.message);
  }

  await client.disconnect();
};

const generateOTP = async () => {
  console.log("Starting generateOTP function...");

  const token = fs.readFileSync(sessionFile, "utf-8");
  const stringSession = new StringSession(token);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();

    if (!(await client.checkAuthorization())) {
      console.log("Session không hợp lệ, cần đăng nhập lại.");
    } else {
      console.log("Bạn đã đăng nhập!");

      client.addEventHandler(async (update) => {
        console.log("Received update:", update);
        const messageText = update?.message?.message;
        if (messageText) {
          console.log("Received message:", messageText);
          const otpMatch = messageText.match(/\b(\d{5})\b/);
          if (otpMatch) {
            const otpCode = otpMatch[0];
            console.log(`Mã OTP của ${phoneNumber} là: ${otpCode}`);
          }
        }
      }, new NewMessage({ fromUsers: 777000 })); // Không có điều kiện cụ thể

      console.log("Lắng nghe tin nhắn...");
    }
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error.message);
  } finally {
    // Đóng kết nối nếu cần
    // await client.disconnect();
  }
};

(async () => {
  generateOTP();
})();
