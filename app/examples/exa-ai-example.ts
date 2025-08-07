import { ExaSearchTool, ExaSearchAndContentTool, ExaAnswerTool } from "../tools/exa-search";

/**
 * Example demonstrating EXA AI tools usage
 * This file shows how to use the different EXA AI tools
 */

async function demonstrateExaTools() {
  console.log("=== EXA AI Tools Demonstration ===\n");

  try {
    // 1. Basic Search
    console.log("1. Basic Search Example:");
    const searchTool = new ExaSearchTool();
    const searchResults = await searchTool.call("latest artificial intelligence developments");
    console.log(searchResults);
    console.log("\n" + "=".repeat(50) + "\n");

    // 2. Search with Content
    console.log("2. Search with Content Example:");
    const contentTool = new ExaSearchAndContentTool();
    const contentResults = await contentTool.call("quantum computing research");
    console.log(contentResults);
    console.log("\n" + "=".repeat(50) + "\n");

    // 3. Direct Answer
    console.log("3. Direct Answer Example:");
    const answerTool = new ExaAnswerTool();
    const answer = await answerTool.call("What are the main benefits of renewable energy?");
    console.log(answer);
    console.log("\n" + "=".repeat(50) + "\n");

  } catch (error) {
    console.error("Error demonstrating EXA tools:", error);
  }
}

// Example usage in an agent context
async function agentExample() {
  console.log("=== Agent Integration Example ===\n");

  const tools = [
    new ExaSearchTool(),
    new ExaAnswerTool()
  ];

  // Simulate agent tool selection
  const userQuery = "What are the latest developments in machine learning?";
  
  console.log(`User Query: ${userQuery}\n`);
  
  // Agent would typically choose the appropriate tool based on the query
  // Here we demonstrate using the answer tool for a question
  const answerTool = new ExaAnswerTool();
  const response = await answerTool.call(userQuery);
  
  console.log("Agent Response:");
  console.log(response);
}

// Export for use in other parts of the application
export { demonstrateExaTools, agentExample };

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateExaTools()
    .then(() => agentExample())
    .catch(console.error);
}
