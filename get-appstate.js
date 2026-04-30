const login = require("facebook-chat-api");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Facebook AppState Generator ===");

rl.question("thekingoflaxmipur@gmail.com: ", (email) => {
  rl.question("@tahsenai12: ", (password) => {
    rl.close();
    
    console.log("⏳ Logging in...");
    
    login({ email, password }, (err, api) => {
      if (err) {
        // 2FA (Two-Factor Authentication) থাকলে
        if (err.message.includes("login-approval")) {
          console.log("🔐 2FA কোড প্রয়োজন! আপনার ফোন চেক করুন।");
          const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          rl2.question("📱 Enter 2FA Code: ", (code) => {
            rl2.close();
            
            login({ email, password, code: code }, (err, api) => {
              if (err) {
                console.error("❌ Login failed:", err.message);
                process.exit(1);
              }
              
              saveAppState(api);
            });
          });
        } else {
          console.error("❌ Login failed:", err.message);
          process.exit(1);
        }
        return;
      }
      
      saveAppState(api);
    });
  });
});

function saveAppState(api) {
  const appState = api.getAppState();
  fs.writeFileSync("appstate.json", JSON.stringify(appState, null, 2));
  console.log("✅ Login successful!");
  console.log(`👤 User ID: ${api.getCurrentUserID()}`);
  console.log(`📁 AppState saved to: appstate.json`);
  console.log("\n🔑 এই ফাইলটি GitHub Secret এ আপলোড করুন!");
  process.exit(0);
}
