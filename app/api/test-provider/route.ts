import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    let testResult;
    switch (provider) {
      case 'openai':
        testResult = await testOpenAI(apiKey);
        break;
      case 'anthropic':
        testResult = await testAnthropic(apiKey);
        break;
      case 'groq':
        testResult = await testGroq(apiKey);
        break;
      case 'google':
        testResult = await testGoogle(apiKey);
        break;
      case 'deepseek':
        testResult = await testDeepSeek(apiKey);
        break;
      case 'fireworks':
        testResult = await testFireworks(apiKey);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 }
        );
    }

    if (testResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: `API key is valid for ${provider}` 
      });
    } else {
      return NextResponse.json(
        { error: testResult.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to test API key" },
      { status: 500 }
    );
  }
}

async function testOpenAI(apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `OpenAI API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to OpenAI API' };
  }
}

async function testAnthropic(apiKey: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `Anthropic API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Anthropic API' };
  }
}

async function testGroq(apiKey: string) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `Groq API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Groq API' };
  }
}

async function testGoogle(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `Google API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Google API' };
  }
}

async function testDeepSeek(apiKey: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `DeepSeek API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to DeepSeek API' };
  }
}

async function testFireworks(apiKey: string) {
  try {
    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/llama-v2-7b-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error: `Fireworks API error: ${error}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Fireworks API' };
  }
}
