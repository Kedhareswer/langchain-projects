# EXA AI Tools Integration

This directory contains custom tools that integrate EXA AI's advanced search capabilities into the LangChain agent system, replacing the previous SERPAPI integration.

## Overview

EXA AI provides superior search capabilities compared to traditional search APIs:

- **Neural Search**: AI-powered search that understands context and intent
- **Content Retrieval**: Get full text content from search results
- **Direct Answers**: Get grounded answers to questions with citations
- **Autoprompt**: Automatic query optimization for better results

## Available Tools

### 1. ExaSearchTool
Basic web search functionality with neural search capabilities.

**Features:**
- Neural search for better understanding of queries
- Automatic query optimization with autoprompt
- Returns formatted search results with titles and URLs

**Usage:**
```typescript
const searchTool = new ExaSearchTool();
const results = await searchTool.call("latest AI developments");
```

### 2. ExaSearchAndContentTool
Enhanced search that also retrieves full content from search results.

**Features:**
- Neural search with content retrieval
- Full text content from web pages
- Useful for detailed research and analysis

**Usage:**
```typescript
const contentTool = new ExaSearchAndContentTool();
const results = await contentTool.call("quantum computing research");
```

### 3. ExaAnswerTool
Get direct answers to questions with citations.

**Features:**
- Grounded answers with source citations
- AI-powered answer generation
- Factual and current information

**Usage:**
```typescript
const answerTool = new ExaAnswerTool();
const answer = await answerTool.call("What is the population of New York City?");
```

## Setup

1. **Install the EXA AI SDK:**
   ```bash
   npm install exa-js
   ```

2. **Set up your API key:**
   Create a `.env.local` file in your project root and add:
   ```
   EXA_API_KEY=your_exa_api_key_here
   ```

3. **Get your API key:**
   - Visit [https://exa.ai](https://exa.ai)
   - Sign up for an account
   - Get your API key from the dashboard

## Migration from SERPAPI

The EXA AI tools provide several advantages over SERPAPI:

| Feature | SERPAPI | EXA AI |
|---------|---------|--------|
| Search Type | Traditional keyword search | Neural AI-powered search |
| Content Retrieval | Limited | Full text content |
| Query Optimization | Manual | Automatic (autoprompt) |
| Answer Generation | No | Direct answers with citations |
| Context Understanding | Basic | Advanced AI understanding |

## Error Handling

All tools include comprehensive error handling:

- API key validation
- Network error handling
- Graceful fallbacks for missing results
- Detailed error messages for debugging

## Configuration

You can customize the tools by modifying the parameters in the `_call` methods:

- `numResults`: Number of search results to return
- `type`: Search type ("neural" or "keyword")
- `useAutoprompt`: Enable automatic query optimization
- `text`: Include full text content in results

## Examples

### Basic Search
```typescript
const searchTool = new ExaSearchTool();
const results = await searchTool.call("latest technology news");
```

### Research with Content
```typescript
const contentTool = new ExaSearchAndContentTool();
const research = await contentTool.call("machine learning applications");
```

### Direct Question Answering
```typescript
const answerTool = new ExaAnswerTool();
const answer = await answerTool.call("What are the benefits of renewable energy?");
```

## Integration with Agents

The tools are automatically integrated into the agent system in `app/api/chat/agents/route.ts`:

```typescript
const tools = [
  new Calculator(), 
  new ExaSearchTool(), 
  new ExaAnswerTool()
];
```

This provides the agent with:
- Mathematical calculations (Calculator)
- Web search capabilities (ExaSearchTool)
- Direct question answering (ExaAnswerTool)

## Performance Considerations

- EXA AI's neural search may take slightly longer than traditional search
- Content retrieval adds additional processing time
- Consider using the basic search tool for simple queries
- Use the content tool for detailed research tasks

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `EXA_API_KEY` is set in your environment variables
2. **Network Errors**: Check your internet connection and API key validity
3. **No Results**: Try rephrasing your query or using different search terms

### Debug Mode

Enable detailed logging by checking the console for error messages:
```typescript
console.error("EXA search error:", error);
```

## Support

- EXA AI Documentation: [https://docs.exa.ai](https://docs.exa.ai)
- EXA AI Website: [https://exa.ai](https://exa.ai)
- GitHub Repository: [https://github.com/exa-labs/exa-js](https://github.com/exa-labs/exa-js)
