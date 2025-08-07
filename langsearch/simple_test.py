import os
import json
import requests
from dotenv import load_dotenv

def test_langsearch():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv("LANGSEARCH_API_KEY")
    if not api_key:
        print("❌ Error: LANGSEARCH_API_KEY not found in .env file")
        return
    
    # API endpoint and headers
    url = "https://api.langsearch.com/v1/web-search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Simple test query
    payload = {
        "query": "What is LangSearch?",
        "count": 3
    }
    
    print("🔍 Testing LangSearch API...")
    
    try:
        # Make the request
        print("\n🌐 Sending request to:", url)
        print("🔑 Using API key:", f"{api_key[:8]}...{api_key[-4:]}")
        
        # Save request details to file
        with open('api_debug.log', 'w', encoding='utf-8') as f:
            f.write("=== Request Details ===\n")
            f.write(f"URL: {url}\n")
            f.write("Headers:\n")
            f.write(json.dumps(headers, indent=2) + "\n")
            f.write("Payload:\n")
            f.write(json.dumps(payload, indent=2) + "\n\n")
            f.write("=== Response ===\n")
            
            # Make the request
            response = requests.post(url, headers=headers, json=payload)
            
            # Save response details
            f.write(f"Status Code: {response.status_code}\n")
            f.write("Headers:\n")
            f.write(json.dumps(dict(response.headers), indent=2) + "\n\n")
            f.write("Response Content:\n")
            f.write(response.text)
            
            # Save response to a separate file
            with open('api_response.json', 'w', encoding='utf-8') as f2:
                f2.write(response.text)
        
        print("✅ Request completed successfully!")
        print("📁 Debug information saved to api_debug.log")
        print("📄 Full response saved to api_response.json")
        
        # Try to parse and display a summary
        try:
            with open('api_response.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            print("\n📊 Response Summary:")
            print(f"Status: {data.get('code', 'N/A')}")
            print(f"Message: {data.get('msg', 'No message')}")
            
            # Display search results if available
            if 'data' in data and 'webPages' in data['data'] and 'value' in data['data']['webPages']:
                results = data['data']['webPages']['value']
                print(f"\n🔍 Found {len(results)} results:")
                
                for i, result in enumerate(results, 1):
                    print(f"\n{i}. {result.get('name', 'No title')}")
                    print(f"   URL: {result.get('url', 'No URL')}")
                    if 'snippet' in result:
                        snippet = result['snippet'].replace('\n', ' ').strip()
                        print(f"   {snippet[:150]}...")
            
        except json.JSONDecodeError:
            print("\n⚠️  Could not parse JSON response. Check api_response.json for details.")
            
    except Exception as e:
        print("\n❌ Error:", str(e))

if __name__ == "__main__":
    test_langsearch()
