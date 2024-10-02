const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const readline = require("readline");
const input = require("input");
const fs = require("fs");

// add account here
const apiId = 0;
const apiHash = "";
const phoneNumber = "";
const sessionFile = `${phoneNumber}.session`;

const savedSession = async () => {
  const stringSession = new StringSession("");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  if (phoneNumber === "") {
    console.log("phoneNumber được trống");
    return;
  }
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

    if (fs.existsSync(sessionFile)) {
      const fileContent = fs.readFileSync(sessionFile, "utf-8");
      logs = fileContent.split("\n").filter((line) => line);
    }

    fs.writeFileSync(`${phoneNumber}.session`, sessionString);

    console.log(`Session đã lưu ${phoneNumber}.session`);
  } catch (error) {
    console.error("Đăng nhập thất bại:", error.message);
  }

  await client.disconnect();
};

const generateOTP = async () => {
  let token = "";

  if (fs.existsSync(sessionFile)) {
    token = fs.readFileSync(sessionFile, "utf-8").trim(); // Sử dụng trim() để loại bỏ khoảng trắng
    if (!token) {
      console.log(`File ${sessionFile} tồn tại nhưng rỗng. Gán token là rỗng.`);
      token = "";
    }
  }

  const stringSession = new StringSession(token);
  if (apiId === 0 || apiHash === "") {
    console.log("apiId và apiHash không được trống");
    return;
  }
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
        const messageText = update?.message?.message;
        if (messageText) {
          const otpMatch = messageText.match(/\b(\d{5})\b/);
          if (otpMatch) {
            const otpCode = otpMatch[0];
            console.log(`Mã OTP của ${phoneNumber} là: ${otpCode}`);
          }
        }
      }, new NewMessage({ fromUsers: 777000 }));

      console.log("Lắng nghe tin nhắn...");
    }
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error.message);
  } finally {
    // Đóng kết nối nếu cần
    await client.disconnect();
  }
};

(async () => {
  generateOTP();
})();
