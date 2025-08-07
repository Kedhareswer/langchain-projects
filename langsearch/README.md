# Langsearch API Integration

## What is Langsearch?

Langsearch is a semantic search API that allows you to search through documents and content using natural language queries. It provides:

- **Semantic Search**: Find relevant content based on meaning, not just keywords
- **Document Processing**: Upload and index various document formats
- **Natural Language Queries**: Search using conversational language
- **Fast Retrieval**: Quick access to relevant information from large document collections

## Key Features

- **Multi-format Support**: PDFs, Word documents, text files, and more
- **Semantic Understanding**: Understands context and meaning, not just exact matches
- **Scalable**: Handle large document collections efficiently
- **RESTful API**: Easy integration with any programming language
- **Real-time Search**: Instant results for your queries

## Common Use Cases

1. **Document Search**: Search through company documents, manuals, and reports
2. **Knowledge Base**: Create searchable knowledge bases for customer support
3. **Research**: Search through academic papers and research documents
4. **Content Discovery**: Find relevant content in large content libraries
5. **Question Answering**: Get answers from document collections

## Getting Started

### Prerequisites

- Python 3.7 or higher
- Langsearch API key
- Required Python packages (see requirements.txt)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd langsearch
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your API key:
```bash
# Create a .env file
echo "LANGSEARCH_API_KEY=your_api_key_here" > .env
```

## API Key Testing

The following code examples will help you test your Langsearch API key and verify it's working correctly.

### Basic API Key Test

```python
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_key():
    """
    Test your Langsearch API key to ensure it's valid and working.
    """
    api_key = os.getenv('LANGSEARCH_API_KEY')
    
    if not api_key:
        print("❌ Error: LANGSEARCH_API_KEY not found in environment variables")
        print("Please set your API key in the .env file")
        return False
    
    # Langsearch API base URL (replace with actual endpoint)
    base_url = "https://api.langsearch.com"  # Update with actual URL
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test endpoint - adjust based on actual API
        response = requests.get(f"{base_url}/v1/health", headers=headers)
        
        if response.status_code == 200:
            print("✅ API key is valid and working!")
            print(f"Response: {response.json()}")
            return True
        elif response.status_code == 401:
            print("❌ Invalid API key")
            return False
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

if __name__ == "__main__":
    test_api_key()
```

### Advanced API Testing

```python
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

class LangsearchAPI:
    def __init__(self):
        self.api_key = os.getenv('LANGSEARCH_API_KEY')
        self.base_url = "https://api.langsearch.com"  # Update with actual URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self):
        """Test basic API connection"""
        try:
            response = requests.get(f"{self.base_url}/v1/health", headers=self.headers)
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, str(e)
    
    def test_search(self, query="test query"):
        """Test search functionality"""
        try:
            payload = {
                "query": query,
                "limit": 5
            }
            response = requests.post(f"{self.base_url}/v1/search", 
                                  headers=self.headers, 
                                  json=payload)
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, str(e)
    
    def test_document_upload(self, file_path=None):
        """Test document upload functionality"""
        if not file_path:
            # Create a test document
            test_content = "This is a test document for Langsearch API testing."
            with open("test_document.txt", "w") as f:
                f.write(test_content)
            file_path = "test_document.txt"
        
        try:
            with open(file_path, "rb") as f:
                files = {"file": f}
                response = requests.post(f"{self.base_url}/v1/documents/upload",
                                      headers={"Authorization": f"Bearer {self.api_key}"},
                                      files=files)
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, str(e)

def run_comprehensive_test():
    """Run comprehensive API tests"""
    api = LangsearchAPI()
    
    print("🔍 Testing Langsearch API...")
    print("=" * 50)
    
    # Test 1: Connection
    print("1. Testing API connection...")
    success, result = api.test_connection()
    if success:
        print("✅ Connection successful")
        print(f"   Response: {result}")
    else:
        print("❌ Connection failed")
        print(f"   Error: {result}")
    
    print()
    
    # Test 2: Search functionality
    print("2. Testing search functionality...")
    success, result = api.test_search("test query")
    if success:
        print("✅ Search test successful")
        print(f"   Results: {len(result.get('results', []))} items found")
    else:
        print("❌ Search test failed")
        print(f"   Error: {result}")
    
    print()
    
    # Test 3: Document upload
    print("3. Testing document upload...")
    success, result = api.test_document_upload()
    if success:
        print("✅ Document upload successful")
        print(f"   Document ID: {result.get('document_id', 'N/A')}")
    else:
        print("❌ Document upload failed")
        print(f"   Error: {result}")
    
    print()
    print("=" * 50)
    print("🎉 API testing completed!")

if __name__ == "__main__":
    run_comprehensive_test()
```

## Usage Examples

### Basic Search

```python
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def search_documents(query, api_key=None):
    """
    Search through indexed documents using Langsearch API
    """
    if not api_key:
        api_key = os.getenv('LANGSEARCH_API_KEY')
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "query": query,
        "limit": 10,
        "include_metadata": True
    }
    
    response = requests.post(
        "https://api.langsearch.com/v1/search",  # Update with actual URL
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Search failed: {response.text}")

# Example usage
results = search_documents("How to implement authentication?")
for result in results['results']:
    print(f"Title: {result['title']}")
    print(f"Content: {result['content'][:200]}...")
    print(f"Score: {result['score']}")
    print("-" * 50)
```

### Document Upload

```python
def upload_document(file_path, api_key=None):
    """
    Upload a document to Langsearch for indexing
    """
    if not api_key:
        api_key = os.getenv('LANGSEARCH_API_KEY')
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(
            "https://api.langsearch.com/v1/documents/upload",  # Update with actual URL
            headers=headers,
            files=files
        )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Upload failed: {response.text}")

# Example usage
result = upload_document("document.pdf")
print(f"Document uploaded with ID: {result['document_id']}")
```

## Configuration

Create a `.env` file in your project root:

```env
LANGSEARCH_API_KEY=your_actual_api_key_here
LANGSEARCH_BASE_URL=https://api.langsearch.com
```

## Error Handling

Common error codes and their meanings:

- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

## Rate Limits

- Free tier: 100 requests per hour
- Pro tier: 10,000 requests per hour
- Enterprise: Custom limits

## Support

- **Documentation**: [Langsearch API Docs](https://docs.langsearch.com)
- **Support**: support@langsearch.com
- **GitHub**: [Langsearch GitHub](https://github.com/langsearch)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Note**: This README contains example code that may need to be adjusted based on the actual Langsearch API endpoints and specifications. Please refer to the official Langsearch documentation for the most up-to-date information. 