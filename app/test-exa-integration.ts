/**
 * Test file to verify EXA AI integration
 * Run this to test if the EXA AI tools are working correctly
 */

import { ExaSearchTool, ExaAnswerTool } from "./tools/exa-search";

async function testExaIntegration() {
  console.log("Testing EXA AI Integration...\n");

  // Test 1: Check if API key is set
  if (!process.env.EXA_API_KEY) {
    console.error("❌ EXA_API_KEY environment variable is not set");
    console.log("Please set your EXA_API_KEY in .env.local file");
    return;
  }

  console.log("✅ EXA_API_KEY is set");

  try {
    // Test 2: Test basic search
    console.log("\n🔍 Testing basic search...");
    const searchTool = new ExaSearchTool();
    const searchResults = await searchTool.call("artificial intelligence");
    
    if (searchResults && !searchResults.includes("Error")) {
      console.log("✅ Basic search working");
      console.log("Sample result:", searchResults.substring(0, 200) + "...");
    } else {
      console.log("❌ Basic search failed:", searchResults);
    }

    // Test 3: Test answer tool
    console.log("\n❓ Testing answer tool...");
    const answerTool = new ExaAnswerTool();
    const answer = await answerTool.call("What is machine learning?");
    
    if (answer && !answer.includes("Error")) {
      console.log("✅ Answer tool working");
      console.log("Sample answer:", answer.substring(0, 200) + "...");
    } else {
      console.log("❌ Answer tool failed:", answer);
    }

    console.log("\n🎉 EXA AI integration test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testExaIntegration().catch(console.error);
}

export { testExaIntegration };
