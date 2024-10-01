const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const readline = require("readline");
const input = require("input");

const apiId = 20437980;
const apiHash = "cc68e8f362f82867f997cc670c048880";
const stringSession = new StringSession("");
const phoneNumber = "+84862289117";

// const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
//   connectionRetries: 5,
// });

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    // Kết nối đến Telegram
    await client.connect();

    // Kiểm tra xem người dùng đã được ủy quyền hay chưa
    if (!(await client.checkAuthorization())) {
      // Đăng nhập
      await client.start({
        phoneNumber: async () => phoneNumber, // Sử dụng số điện thoại cố định
        password: async () => await input.text("Password (nếu có)?"), // Nhập mật khẩu nếu cần
        phoneCode: async () => {
          // Yêu cầu mã OTP
          const code = await input.text("Nhập mã OTP từ Telegram: ");
          return code;
        },
        onError: (err) => console.log("Lỗi:", err),
      });

      console.log("Đăng nhập thành công!");
    } else {
      console.log("Bạn đã đăng nhập!");
    }
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error.message);
  } finally {
    // Đóng kết nối nếu cần
    // await client.disconnect();
  }
})();
