# Migration Guide: SERPAPI to EXA AI

This guide helps you migrate from SERPAPI to EXA AI in your LangChain project.

## Why Migrate to EXA AI?

EXA AI provides several advantages over SERPAPI:

- **Neural Search**: AI-powered search that understands context and intent
- **Content Retrieval**: Get full text content from search results
- **Direct Answers**: Get grounded answers to questions with citations
- **Autoprompt**: Automatic query optimization for better results
- **Better Accuracy**: More relevant and up-to-date results

## Step-by-Step Migration

### 1. Install EXA AI SDK

```bash
npm install exa-js
```

### 2. Update Environment Variables

Replace your SERPAPI key with an EXA AI key:

**Before (SERPAPI):**
```env
SERPAPI_API_KEY=your_serpapi_key
```

**After (EXA AI):**
```env
EXA_API_KEY=your_exa_api_key
```

### 3. Get Your EXA AI API Key

1. Visit [https://exa.ai](https://exa.ai)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

### 4. Update Your Code

**Before (SERPAPI):**
```typescript
import { SerpAPI } from "@langchain/community/tools/serpapi";

const tools = [new Calculator(), new SerpAPI()];
```

**After (EXA AI):**
```typescript
import { ExaSearchTool, ExaAnswerTool } from "./tools/exa-search";

const tools = [new Calculator(), new ExaSearchTool(), new ExaAnswerTool()];
```

### 5. Choose the Right Tool

EXA AI provides multiple tools for different use cases:

| Use Case | Tool | Description |
|----------|------|-------------|
| Basic search | `ExaSearchTool` | Simple web search with neural capabilities |
| Research | `ExaSearchAndContentTool` | Search with full content retrieval |
| Q&A | `ExaAnswerTool` | Direct answers to questions with citations |

## Code Examples

### Basic Search Migration

**SERPAPI:**
```typescript
import { SerpAPI } from "@langchain/community/tools/serpapi";

const serpapi = new SerpAPI();
const results = await serpapi.call("latest news");
```

**EXA AI:**
```typescript
import { ExaSearchTool } from "./tools/exa-search";

const exaSearch = new ExaSearchTool();
const results = await exaSearch.call("latest news");
```

### Advanced Search with Content

**EXA AI (New Feature):**
```typescript
import { ExaSearchAndContentTool } from "./tools/exa-search";

const exaContent = new ExaSearchAndContentTool();
const results = await exaContent.call("quantum computing research");
```

### Direct Question Answering

**EXA AI (New Feature):**
```typescript
import { ExaAnswerTool } from "./tools/exa-search";

const exaAnswer = new ExaAnswerTool();
const answer = await exaAnswer.call("What is the population of New York City?");
```

## Configuration Options

### Search Parameters

**EXA AI Search Options:**
```typescript
const results = await exa.search(input, {
  numResults: 5,           // Number of results
  type: "neural",          // "neural" or "keyword"
  useAutoprompt: true,     // Automatic query optimization
  includeDomains: ["example.com"], // Filter by domains
  excludeDomains: ["spam.com"],   // Exclude domains
  startPublishedDate: "2023-01-01", // Date filters
  endPublishedDate: "2023-12-31"
});
```

### Content Retrieval Options

```typescript
const results = await exa.searchAndContents(input, {
  numResults: 3,
  text: true,              // Include full text
  highlights: {             // Get highlights
    numSentences: 2
  }
});
```

## Error Handling

EXA AI tools include comprehensive error handling:

```typescript
try {
  const results = await exaSearch.call("your query");
} catch (error) {
  console.error("EXA search error:", error);
  // Handle error appropriately
}
```

## Performance Considerations

- **Neural Search**: May take slightly longer than traditional search but provides better results
- **Content Retrieval**: Adds processing time but provides richer data
- **Caching**: Consider implementing caching for frequently searched queries

## Testing Your Migration

1. **Test Basic Functionality:**
   ```typescript
   const searchTool = new ExaSearchTool();
   const results = await searchTool.call("test query");
   console.log(results);
   ```

2. **Test Error Handling:**
   ```typescript
   // Test with invalid API key
   process.env.EXA_API_KEY = "invalid_key";
   try {
     const results = await searchTool.call("test");
   } catch (error) {
     console.log("Error handled correctly:", error.message);
   }
   ```

3. **Compare Results:**
   - Run the same query with both SERPAPI and EXA AI
   - Compare result quality and relevance
   - Check response times

## Troubleshooting

### Common Issues

1. **API Key Error**
   ```
   Error: EXA_API_KEY environment variable is not set
   ```
   **Solution:** Ensure your API key is set in `.env.local`

2. **Network Errors**
   ```
   Error: Network request failed
   ```
   **Solution:** Check your internet connection and API key validity

3. **No Results**
   ```
   No search results found for the given query
   ```
   **Solution:** Try rephrasing your query or using different search terms

### Debug Mode

Enable detailed logging:
```typescript
console.error("EXA search error:", error);
```

## Benefits of Migration

| Feature | SERPAPI | EXA AI |
|---------|---------|--------|
| Search Quality | Basic keyword matching | AI-powered neural search |
| Content Access | Limited snippets | Full text content |
| Query Understanding | Literal matching | Context-aware understanding |
| Answer Generation | No | Direct answers with citations |
| Query Optimization | Manual | Automatic (autoprompt) |
| Result Relevance | Variable | Consistently high |

## Support Resources

- **EXA AI Documentation**: [https://docs.exa.ai](https://docs.exa.ai)
- **EXA AI Website**: [https://exa.ai](https://exa.ai)
- **GitHub Repository**: [https://github.com/exa-labs/exa-js](https://github.com/exa-labs/exa-js)
- **Community Support**: Check the EXA AI Discord or GitHub issues

## Rollback Plan

If you need to rollback to SERPAPI:

1. Reinstall SERPAPI:
   ```bash
   npm install @langchain/community
   ```

2. Restore original code:
   ```typescript
   import { SerpAPI } from "@langchain/community/tools/serpapi";
   const tools = [new Calculator(), new SerpAPI()];
   ```

3. Restore environment variable:
   ```env
   SERPAPI_API_KEY=your_serpapi_key
   ```

## Conclusion

Migrating from SERPAPI to EXA AI provides significant improvements in search quality, content access, and user experience. The neural search capabilities and direct answer generation make EXA AI a superior choice for AI-powered applications.

Take advantage of the new features like content retrieval and direct question answering to enhance your application's capabilities.
