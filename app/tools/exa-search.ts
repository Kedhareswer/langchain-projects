import { Tool } from "@langchain/core/tools";
import Exa from "exa-js";

/**
 * Tool for performing web searches using EXA AI
 * Replaces SERPAPI functionality with more advanced AI-powered search
 */
export class ExaSearchTool extends Tool {
  name = "exa_search";
  description = "Search the web for current information. Useful for finding recent news, facts, or data. Input should be a search query.";

  private exa: Exa;

  constructor(apiKeyOverride?: string) {
    super();
    
    const apiKey = apiKeyOverride || process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY environment variable is not set. Please set it to use the ExaSearchTool.");
    }
    
    this.exa = new Exa(apiKey);
  }

  async _call(input: string): Promise<string> {
    try {
      // Perform search with EXA AI
      const results = await this.exa.search(input, {
        numResults: 5,
        type: "neural", // Use neural search for better results
        useAutoprompt: true // Let EXA optimize the query
      });

      if (!results.results || results.results.length === 0) {
        return "No search results found for the given query.";
      }

      // Format the results
      const formattedResults = results.results.map((result, index) => {
        return `${index + 1}. ${result.title}\n   URL: ${result.url}\n   ${result.text ? `Content: ${result.text.substring(0, 200)}...` : ''}\n`;
      }).join('\n');

      return `Search results for "${input}":\n\n${formattedResults}`;
    } catch (error) {
      console.error("EXA search error:", error);
      return `Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Enhanced EXA AI tool that can also retrieve full content
 */
export class ExaSearchAndContentTool extends Tool {
  name = "exa_search_with_content";
  description = "Search the web and retrieve full content of results. Useful for detailed research and analysis. Input should be a search query.";

  private exa: Exa;

  constructor(apiKeyOverride?: string) {
    super();
    
    const apiKey = apiKeyOverride || process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY environment variable is not set. Please set it to use the ExaSearchAndContentTool.");
    }
    
    this.exa = new Exa(apiKey);
  }

  async _call(input: string): Promise<string> {
    try {
      // Perform search and retrieve content
      const results = await this.exa.searchAndContents(input, {
        numResults: 3,
        type: "neural",
        text: true,
        useAutoprompt: true
      });

      if (!results.results || results.results.length === 0) {
        return "No search results found for the given query.";
      }

      // Format the results with full content
      const formattedResults = results.results.map((result, index) => {
        const content = result.text ? result.text.substring(0, 500) + "..." : "No content available";
        return `${index + 1}. ${result.title}\n   URL: ${result.url}\n   Content: ${content}\n`;
      }).join('\n');

      return `Detailed search results for "${input}":\n\n${formattedResults}`;
    } catch (error) {
      console.error("EXA search with content error:", error);
      return `Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * EXA AI tool for getting direct answers to questions
 */
export class ExaAnswerTool extends Tool {
  name = "exa_answer";
  description = "Get direct answers to questions using web search. Useful for factual questions and current information. Input should be a question.";

  private exa: Exa;

  constructor(apiKeyOverride?: string) {
    super();
    
    const apiKey = apiKeyOverride || process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY environment variable is not set. Please set it to use the ExaAnswerTool.");
    }
    
    this.exa = new Exa(apiKey);
  }

  async _call(input: string): Promise<string> {
    try {
      // Get direct answer using EXA AI
      const answer = await this.exa.answer(input, {
        text: true
      });

      return `Answer: ${answer.answer}\n\nSources: ${answer.citations?.map(citation => citation.title).join(', ') || 'No citations available'}`;
    } catch (error) {
      console.error("EXA answer error:", error);
      return `Error getting answer: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
