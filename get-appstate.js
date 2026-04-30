const login = require("facebook-chat-api");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Facebook AppState Generator ===");
console.log("Tip: 2FA থাকলে App Password ব্যবহার করুন\n");

rl.question("thekingoflaxmipur@gmail.com: ", (email) => {
  rl.question("@tahsenai12: ", (password) => {
    rl.close();
    
    console.log("⏳ Logging in...");
    
    const loginOptions = {
      email: email,
      password: password,
      userAgent: "Mozilla/5.0 (Linux; Android 12; SM-S908E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
      logLevel: "silent",
      forceLogin: true
    };
    
    login(loginOptions, (err, api) => {
      if (err) {
        console.log("\n❌ Error:", err.message);
        
        if (err.message.includes("login-approval")) {
          console.log("\n🔐 2FA প্রয়োজন! আপনার ফোন চেক করুন।");
          const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          rl2.question("📱 2FA Code: ", (code) => {
            rl2.close();
            
            login({ email: email, password: password, code: code, forceLogin: true }, (err, api) => {
              if (err) {
                console.log("❌ Login failed:", err.message);
                process.exit(1);
              }
              saveState(api);
            });
          });
        } else if (err.message.includes("App password")) {
          console.log("\n💡 টিপ: Facebook সেটিংস থেকে 'App Password' বানিয়ে নিন!");
          console.log("Settings → Security → App Passwords");
        } else if (err.message.includes("blocked")) {
          console.log("\n⏳ Facebook টেম্পোরারি ব্লক করেছে। ২৪ ঘণ্টা পর চেষ্টা করুন।");
        } else if (err.message.includes("credentials")) {
          console.log("\n❌ ইমেইল বা পাসওয়ার্ড ভুল। চেক করে আবার চেষ্টা করুন।");
        }
        process.exit(1);
        return;
      }
      
      saveState(api);
    });
  });
});

function saveState(api) {
  const appState = api.getAppState();
  fs.writeFileSync("appstate.json", JSON.stringify(appState, null, 2));
  console.log("✅ Login successful!");
  console.log(`👤 User ID: ${api.getCurrentUserID()}`);
  console.log(`📁 AppState saved to: appstate.json`);
  console.log("\n🔑 এখন GitHub Secret এ আপলোড করুন!");
  process.exit(0);
}
