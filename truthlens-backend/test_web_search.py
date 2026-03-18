"""Test web search service."""
import asyncio
from services.web_search_service import WebSearchService


async def test_web_search():
    """Test web search functionality."""
    service = WebSearchService()
    
    # Test claim about a recent event
    test_claim = "Trump wins 2024 presidential election"
    
    print("=" * 80)
    print(f"Testing Web Search Service")
    print("=" * 80)
    print(f"\nTest Claim: {test_claim}\n")
    
    # Test search_and_compile_context
    print("Running comprehensive web search...")
    context = await service.search_and_compile_context(test_claim)
    
    print(f"\n✓ Total results found: {context['total_results_found']}")
    print(f"✓ News articles: {len(context['news_results'])}")
    print(f"✓ Web results: {len(context['web_results'])}")
    print(f"✓ Fact-check results: {len(context['factcheck_results'])}")
    print(f"✓ Search queries used: {context['search_queries_used']}")
    print(f"✓ Search timestamp: {context['search_timestamp']}")
    
    print("\n" + "=" * 80)
    print("NEWS RESULTS:")
    print("=" * 80)
    for i, result in enumerate(context['news_results'][:3], 1):
        print(f"\n{i}. {result['title']}")
        print(f"   Source: {result['source']}")
        print(f"   Date: {result.get('date', 'N/A')}")
        print(f"   URL: {result['url']}")
        print(f"   Snippet: {result['snippet'][:150]}...")
    
    print("\n" + "=" * 80)
    print("CONTEXT STRING (First 1000 chars):")
    print("=" * 80)
    print(context['context_string'][:1000])
    print("...")
    
    print("\n" + "=" * 80)
    print("✓ Web search test completed successfully!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_web_search())
