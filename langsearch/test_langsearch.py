import os
import json
from dotenv import load_dotenv
import requests

def test_langsearch_api():
    # Load environment variables from .env file
    load_dotenv()
    
    # Get API key from environment variables
    api_key = os.getenv("LANGSEARCH_API_KEY")
    
    if not api_key:
        print("❌ Error: LANGSEARCH_API_KEY not found in .env file")
        return
    
    # Define the endpoint and headers according to official documentation
    url = "https://api.langsearch.com/v1/web-search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Prepare the request payload as per official example
    query = "Latest AI trends in 2025"
    payload = json.dumps({
        "query": query,
        "freshness": "noLimit",
        "summary": True,
        "count": 3
    }, indent=2)
    
    print("🔍 Testing LangSearch Web Search API...")
    print(f"API Key: {api_key[:8]}...{api_key[-4:]}")
    print(f"Endpoint: {url}")
    print("-" * 50)
    
    try:
        # Make the API request as per official documentation
        print(f"\n🌐 Making request to: {url}")
        print(f"🔑 Using API key: {api_key[:8]}...{api_key[-4:]}")
        print(f"🔍 Request payload: {json.dumps(payload, indent=2)}")
        
        # Make the POST request as shown in the docs
        print("\nSending request to:", url)
        print("With headers:", json.dumps(headers, indent=2))
        print("With payload:", payload)
        
        response = requests.post(
            url,
            headers=headers,
            data=payload
        )
        
        # Output the response
        print(f"\n📊 Response Status: {response.status_code}")
        data = response.json()
        
        # Print the full response for debugging
        print("\n📋 Full API Response:")
        print(json.dumps(data, indent=2))
        
        if response.status_code == 200:
            print("\n✅ API Key is working!")
            
            # Print the search results
            results = data.get("results", [])
            if not results:
                print("\n⚠️  No results found in the 'results' field of the response.")
                return
                
            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result.get('title', 'No title')}")
                print(f"   URL: {result.get('url', 'No URL')}")
                if 'snippet' in result:
                    print(f"   {result['snippet']}")
                    
            # Print summary if available
            if 'summary' in data:
                print("\n📝 Summary:")
                print(data['summary'])
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        
    print("\n" + "="*50)
    print("API Request Details:")
    print(f"URL: {url}")
    print("Method: POST")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

if __name__ == "__main__":
    test_langsearch_api()
