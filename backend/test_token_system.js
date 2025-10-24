// Test script for token-based authentication system
const testCredentials = {
  email: "test@example.com",
  password: "testpassword123"
};

const BACKEND_URL = "http://localhost:5001";

async function testExtensionLogin() {
  console.log("\n📝 Testing Extension Login...");
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/extension-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCredentials)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("   Token:", data.token.substring(0, 20) + "...");
      console.log("   User:", data.user.firstName, data.user.lastName);
      console.log("   Plan:", data.user.plan);
      console.log("   Tokens:", `${data.user.tokensUsed}/${data.user.tokenLimit}`);
      return data.token;
    } else {
      console.log("❌ Login failed:", data.message);
      return null;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return null;
  }
}

async function testGetProfile(token) {
  console.log("\n📝 Testing Get Profile...");
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Profile retrieved!");
      console.log("   User:", data.firstName, data.lastName);
      console.log("   Email:", data.email);
      console.log("   Plan:", data.plan);
      console.log("   Tokens:", `${data.tokensUsed}/${data.tokenLimit}`);
      return true;
    } else {
      console.log("❌ Failed to get profile:", data.message);
      return false;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return false;
  }
}

async function testConsumeToken(token) {
  console.log("\n📝 Testing Consume Token...");
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/consume-token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Token consumed!");
      console.log("   Tokens Used:", data.tokensUsed);
      console.log("   Token Limit:", data.tokenLimit);
      return true;
    } else {
      console.log("❌ Failed to consume token:", data.message);
      return false;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return false;
  }
}

async function testGetTokenStatus(token) {
  console.log("\n📝 Testing Get Token Status...");
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/token-status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Token status retrieved!");
      console.log("   Tokens Used:", data.tokensUsed);
      console.log("   Token Limit:", data.tokenLimit);
      console.log("   Has Tokens:", data.hasTokens);
      console.log("   Plan:", data.plan);
      return true;
    } else {
      console.log("❌ Failed to get token status:", data.message);
      return false;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Token System Tests");
  console.log("================================");
  
  // Test 1: Extension Login
  const token = await testExtensionLogin();
  if (!token) {
    console.log("\n❌ Cannot continue tests without token");
    return;
  }

  // Test 2: Get Profile
  await testGetProfile(token);

  // Test 3: Get Token Status
  await testGetTokenStatus(token);

  // Test 4: Consume Token
  await testConsumeToken(token);

  // Test 5: Verify token was consumed
  await testGetTokenStatus(token);

  console.log("\n================================");
  console.log("✅ All tests completed!");
  console.log("\nNote: Change testCredentials at the top of this file to test with your user account");
}

// Run all tests
runAllTests();
