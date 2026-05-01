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
    console.log("Logging in...");
    
    login({ email, password, forceLogin: true }, (err, api) => {
      if (err) {
        console.log("Error:", err.message);
        process.exit(1);
      }
      const appState = api.getAppState();
      fs.writeFileSync("appstate.json", JSON.stringify(appState, null, 2));
      console.log("Success! appstate.json created");
      process.exit(0);
    });
  });
});
