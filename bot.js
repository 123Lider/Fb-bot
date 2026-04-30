// bot.js - Facebook Personal Account Auto Reply Bot
const login = require("facebook-chat-api");
const fs = require("fs");

// appstate.json ফাইল থেকে লগিন ডাটা পড়া
let appState = {};
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
  console.log("✅ AppState loaded successfully!");
} catch (err) {
  console.error("❌ Failed to load appstate.json:", err.message);
  process.exit(1);
}

// AppState দিয়ে লগিন করা
login({ appState: appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    
    // AppState পুরনো হয়ে গেলে নতুন করে জেনারেট করতে হবে
    if (err.message.includes("Invalid AppState")) {
      console.log("⚠️ AppState expired! Generate new appstate.json locally.");
    }
    process.exit(1);
  }

  console.log("✅ Successfully logged in to Facebook!");
  console.log(`👤 Logged in as: ${api.getCurrentUserID()}`);
  
  // Auto Reply সিস্টেম চালু করা
  startAutoReply(api);
});

function startAutoReply(api) {
  console.log("🤖 Auto Reply Bot is now listening for messages...");
  
  // Facebook MQTT লিসেনার - নতুন মেসেজ ধরা
  api.listenMqtt((err, event) => {
    if (err) {
      console.error("❌ Listen error:", err);
      return;
    }
    
    // শুধু মেসেজ টাইপ ইভেন্ট হ্যান্ডেল করা
    if (event.type === "message") {
      const senderID = event.threadID;
      const messageText = event.body ? event.body.toLowerCase() : "";
      const isGroup = event.isGroup;
      const senderName = event.senderID;
      
      // গ্রুপ চ্যাট ইগনোর করা (শুধু পার্সোনাল মেসেজে রিপ্লাই)
      if (isGroup) {
        return;
      }
      
      console.log(`📩 New message from ${senderID}: "${event.body}"`);
      
      // ===== Auto Reply Logic =====
      let replyText = "";
      
      // বিভিন্ন কীওয়ার্ড অনুযায়ী রিপ্লাই
      if (messageText.includes("hello") || messageText.includes("hi") || messageText.includes("হ্যালো")) {
        replyText = "👋 Hello! Thanks for messaging me. How can I help you today?";
      }
      else if (messageText.includes("help") || messageText.includes("সাহায্য") || messageText.includes("হেল্প")) {
        replyText = "📋 Available Commands:\n- Price / মূল্য\n- Hours / সময়\n- Contact / যোগাযোগ\n- Location / ঠিকানা";
      }
      else if (messageText.includes("price") || messageText.includes("মূল্য") || messageText.includes("দাম")) {
        replyText = "💰 আমাদের সার্ভিসের মূল্য তালিকা:\n1. Basic: $50\n2. Standard: $100\n3. Premium: $200\n\nবিস্তারিত জানতে 'Details' লিখুন।";
      }
      else if (messageText.includes("hours") || messageText.includes("সময়") || messageText.includes("খোলা")) {
        replyText = "🕐 আমাদের অফিসের সময়:\n- শনিবার-বৃহস্পতিবার: 9 AM - 6 PM\n- শুক্রবার: বন্ধ\n- শনিবার: সীমিত সময়";
      }
      else if (messageText.includes("contact") || messageText.includes("যোগাযোগ") || messageText.includes("ফোন")) {
        replyText = "📞 আমাদের সাথে যোগাযোগ করুন:\n- Phone: +880-XXXXXXXXX\n- Email: example@email.com\n- Website: www.example.com";
      }
      else if (messageText.includes("location") || messageText.includes("ঠিকানা") || messageText.includes("কোথায়")) {
        replyText = "📍 আমাদের ঠিকানা:\nHouse #12, Road #5, Block-A\nMirpur, Dhaka - 1216\nBangladesh";
      }
      else if (messageText.includes("bye") || messageText.includes("বিদায়") || messageText.includes("আচ্ছা")) {
        replyText = "👋 Thank you for messaging! Have a great day! 😊";
      }
      else {
        // ডিফল্ট রিপ্লাই - যদি কোন কীওয়ার্ড না মেলে
        replyText = "✅ আপনার মেসেজটি পেয়েছি। আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করবো। \n\nধন্যবাদ! 🙏";
      }
      
      // ===== রিপ্লাই পাঠানো =====
      api.sendMessage(replyText, senderID, (err, messageInfo) => {
        if (err) {
          console.error(`❌ Failed to send reply to ${senderID}:`, err);
        } else {
          console.log(`✅ Reply sent to ${senderID}: "${replyText.substring(0, 30)}..."`);
          console.log(`📊 Message ID: ${messageInfo.messageID}`);
        }
      });
    }
  });
}

// 🔄 Error হ্যান্ডলিং - unexpected error এ রিস্টার্ট
process.on('uncaughtException', (err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err);
  process.exit(1);
});
