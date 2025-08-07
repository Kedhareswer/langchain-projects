"""
LangSearch API Example

This script demonstrates how to use the LangSearch Web Search API to perform searches
and process the results. It includes error handling, response validation, and 
formatted output of search results.

Requirements:
- Python 3.6+
- requests library (install with: pip install requests)
- python-dotenv (install with: pip install python-dotenv)

Before running:
1. Get your API key from https://langsearch.com
2. Create a .env file with your API key:
   LANGSEARCH_API_KEY=your_api_key_here
"""

import os
import json
import requests
from dotenv import load_dotenv

class LangSearchAPI:
    """A simple client for the LangSearch Web Search API."""
    
    BASE_URL = "https://api.langsearch.com/v1"
    
    def __init__(self, api_key=None):
        """Initialize the API client with an optional API key."""
        self.api_key = api_key or os.getenv("LANGSEARCH_API_KEY")
        if not self.api_key:
            raise ValueError("API key is required. Set LANGSEARCH_API_KEY in .env file or pass it to the constructor.")
        
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })
    
    def search(self, query, count=5, freshness="noLimit", summary=True):
        """
        Perform a web search using the LangSearch API.
        
        Args:
            query (str): The search query
            count (int): Number of results to return (1-50)
            freshness (str): Filter by freshness ("day", "week", "month", "year", "noLimit")
            summary (bool): Whether to include a summary of results
            
        Returns:
            dict: The API response as a dictionary
        """
        url = f"{self.BASE_URL}/web-search"
        payload = {
            "query": query,
            "count": max(1, min(50, count)),  # Ensure count is between 1 and 50
            "freshness": freshness,
            "summary": summary
        }
        
        try:
            response = self.session.post(url, json=payload)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making API request: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status code: {e.response.status_code}")
                print(f"Response: {e.response.text}")
            raise

def format_search_results(response):
    """Format and print the search results in a readable way."""
    if not isinstance(response, dict):
        print("❌ Invalid response format")
        return
    
    # Basic response info
    print(f"\n🔎 Search Results")
    print(f"Status: {response.get('code', 'N/A')}")
    print(f"Message: {response.get('msg', 'No message')}")
    
    # Extract and display results
    try:
        results = response.get('data', {}).get('webPages', {}).get('value', [])
        if not results:
            print("\nNo results found.")
            return
            
        print(f"\nFound {len(results)} results:")
        print("-" * 80)
        
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result.get('name', 'No title')}")
            print(f"   URL: {result.get('url', 'No URL')}")
            
            # Clean up and display snippet
            if 'snippet' in result:
                snippet = ' '.join(result['snippet'].split())
                print(f"\n   {snippet[:200]}...")
            
            print("-" * 80)
        
        # Display summary if available
        if 'summary' in response.get('data', {}):
            print("\n📝 Summary:")
            print("-" * 80)
            print(response['data']['summary'])
            
    except Exception as e:
        print(f"\n⚠️  Error processing results: {str(e)}")

def main():
    """Main function to demonstrate the API usage."""
    # Load environment variables
    load_dotenv()
    
    try:
        # Initialize the API client
        print("🔍 Initializing LangSearch API client...")
        api = LangSearchAPI()
        
        # Example search
        query = "What is LangSearch?"
        print(f"\n🔍 Searching for: '{query}'")
        
        # Perform the search
        response = api.search(
            query=query,
            count=3,
            freshness="noLimit",
            summary=True
        )
        
        # Format and display results
        format_search_results(response)
        
        # Save full response to file
        with open('search_results.json', 'w', encoding='utf-8') as f:
            json.dump(response, f, indent=2)
        print("\n💾 Full response saved to 'search_results.json'")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Make sure you have set up your .env file with a valid LANGSEARCH_API_KEY")
        print("   You can get an API key from https://langsearch.com")

if __name__ == "__main__":
    main()
