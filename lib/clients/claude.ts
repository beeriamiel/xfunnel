export function createClaudeClient() {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    console.error("Missing CLAUDE_API_KEY environment variable");
    throw new Error("Missing CLAUDE_API_KEY");
  }
  
  console.log("\n=== Claude Client Initialization ===");
  console.log("API Key:", `${apiKey.substring(0, 8)}...`);
  
  return {
    apiKey,
    baseUrl: 'https://api.anthropic.com/v1'
  };
} 