import { NextRequest, NextResponse } from "next/server";
import { createClient, validateApiKey, getProvider } from "@/utils/ai-providers";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    if (!validateApiKey(provider, apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    // Get the provider configuration and use the first available model
    const providerConfig = getProvider(provider);
    if (!providerConfig) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Use the first available model for testing
    const testModel = providerConfig.models[0]?.id || "gpt-4o-mini";
    
    // Create a test client with a valid model
    const client = createClient(provider, testModel, apiKey);

    // Test the connection with a simple message
    const testMessage = "Hello, this is a test message.";
    
    try {
      const response = await client.invoke(testMessage);
      
      if (response && response.content) {
        return NextResponse.json({ 
          success: true, 
          message: "API key is valid",
          provider,
          model: testModel
        });
      } else {
        return NextResponse.json(
          { error: "Invalid response from provider" },
          { status: 400 }
        );
      }
    } catch (error: any) {
      // Provide more specific error messages
      let errorMessage = error.message || "Unknown error";
      
      // Handle common API errors
      if (errorMessage.includes("401")) {
        errorMessage = "Invalid API key - please check your credentials";
      } else if (errorMessage.includes("403")) {
        errorMessage = "Access denied - please check your API key permissions";
      } else if (errorMessage.includes("429")) {
        errorMessage = "Rate limit exceeded - please try again later";
      } else if (errorMessage.includes("model") && errorMessage.includes("not found")) {
        errorMessage = "Model not available - please check your provider configuration";
      }
      
      return NextResponse.json(
        { error: `API test failed: ${errorMessage}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
