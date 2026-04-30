// messenger-bot-personal.js
const login = require("facebook-chat-api");
const fs = require("fs");

// অপশন ১: Email + Password দিয়ে
const credentials = {
  email: "thekingoflaxmipur@gmail.com",
  password: "@tahsenai12"
};

// অপশন ২: AppState (Cookie) JSON ফাইল থেকে
const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

// লগিন করা
login({ appState: appState }, (err, api) => {
  if (err) {
    console.error("Login failed:", err);
    
    // প্রথমবার লগিন করলে appstate.json সেভ করতে হবে
    if (err.message.includes("login-approval")) {
      // 2FA কোড ইনপুট
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question("Enter 2FA Code: ", (code) => {
        readline.close();
        login({ email: "your_email", password: "your_password", code: code }, (err, api) => {
          if (err) return console.error(err);
          
          // AppState সেভ করে রাখুন
          fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
          console.log("AppState saved! Next time you can use this file.");
          startListening(api);
        });
      });
      return;
    }
    return;
  }
  
  startListening(api);
});

function startListening(api) {
  console.log("✅ Logged in successfully!");
  
  // অটো রিপ্লাই সিস্টেম
  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    
    // শুধু মেসেজ ইভেন্ট হ্যান্ডেল করুন
    if (event.type === "message" && event.body) {
      const senderID = event.threadID;
      const message = event.body.toLowerCase();
      const isGroup = event.isGroup;
      
      // Auto Reply Logic
      let replyText = "";
      
      if (message.includes("hello") || message.includes("hi")) {
        replyText = "👋 Hello! How can I help you?";
      } 
      else if (message.includes("help") || message.includes("সাহায্য")) {
        replyText = "📌 Available commands:\n1. Price\n2. Hours\n3. Contact";
      }
      else if (message.includes("price") || message.includes("মূল্য")) {
        replyText = "💰 For pricing info, please contact our team.";
      }
      else if (message.includes("bye") || message.includes("বিদায়")) {
        replyText = "👋 Thank you! Have a great day!";
      }
      else {
        // Default reply
        replyText = "✅ Thanks for your message! We'll get back to you soon.";
      }
      
      // রিপ্লাই পাঠানো
      if (!isGroup) {
        api.sendMessage(replyText, senderID, (err, messageInfo) => {
          if (err) console.error("Failed to send:", err);
          else console.log(`Replied to ${senderID}: ${replyText}`);
        });
      }
    }
  });
}
