"""Test script for fact-checking and news services."""
import asyncio
from services.factcheck_service import FactCheckService
from services.news_service import NewsService
from utils.known_domains import get_domain_trust


async def test_factcheck_service():
    """Test the fact-check service."""
    print("\n" + "=" * 80)
    print("TESTING FACT-CHECK SERVICE")
    print("=" * 80)
    
    service = FactCheckService()
    
    # Test claim
    claim = "COVID-19 vaccines contain microchips"
    
    print(f"\n🔍 Searching fact-checks for: '{claim}'")
    results = await service.search_claims(claim)
    
    if results:
        print(f"\n✅ Found {len(results)} fact-check(s):")
        for i, fc in enumerate(results, 1):
            print(f"\n  Fact-Check {i}:")
            print(f"    Claim: {fc.get('claim_text', 'N/A')[:80]}...")
            print(f"    Rating: {fc.get('fact_check_rating', 'N/A')}")
            print(f"    Fact-Checker: {fc.get('fact_checker_name', 'N/A')}")
            print(f"    URL: {fc.get('fact_checker_url', 'N/A')}")
    else:
        print("\n❌ No fact-checks found (API may require key or claim not in database)")
    
    # Test multiple claims
    print("\n" + "-" * 80)
    claims = [
        "Earth is flat",
        "5G causes COVID-19",
        "Climate change is a hoax"
    ]
    
    print(f"\n🔍 Checking multiple claims...")
    multi_results = await service.check_multiple_claims(claims)
    
    print(f"\n📊 Results:")
    print(f"  Total fact-checks found: {multi_results.get('fact_checks_found', 0)}")
    print(f"  Verified: {multi_results.get('verified_count', 0)}")
    print(f"  False: {multi_results.get('false_count', 0)}")
    print(f"  Mixed: {multi_results.get('mixed_count', 0)}")


async def test_news_service():
    """Test the news service."""
    print("\n" + "=" * 80)
    print("TESTING NEWS SERVICE")
    print("=" * 80)
    
    service = NewsService()
    
    # Test query
    query = "climate change"
    
    print(f"\n🔍 Searching news for: '{query}'")
    
    # Test NewsAPI
    print("\n📰 NewsAPI Results:")
    newsapi_results = await service.search_newsapi(query, page_size=5)
    
    if newsapi_results:
        print(f"  Found {len(newsapi_results)} articles")
        for i, article in enumerate(newsapi_results[:3], 1):
            print(f"\n  Article {i}:")
            print(f"    Title: {article.get('title', 'N/A')[:60]}...")
            print(f"    Source: {article.get('source_name', 'N/A')}")
            print(f"    Domain: {article.get('domain', 'N/A')}")
            print(f"    Credible: {article.get('is_credible', False)}")
            print(f"    Trust Score: {article.get('trust_score', 'N/A')}")
    else:
        print("  ❌ No results (API key may be missing)")
    
    # Test cross-reference
    print("\n" + "-" * 80)
    print(f"\n🔍 Cross-referencing claim: '{query}'")
    
    cross_ref = await service.cross_reference_claim(query)
    
    print(f"\n📊 Cross-Reference Results:")
    print(f"  Total sources: {cross_ref.get('total_sources_count', 0)}")
    print(f"  Credible sources: {cross_ref.get('credible_sources_count', 0)}")
    print(f"  Coverage ratio: {cross_ref.get('coverage_ratio', 0):.2%}")
    print(f"  Cross-reference score: {cross_ref.get('cross_reference_score', 0)}/100")
    
    if cross_ref.get('credible_sources_list'):
        print(f"\n  Top credible sources:")
        for source in cross_ref['credible_sources_list'][:3]:
            print(f"    • {source.get('source_name', 'N/A')} (Trust: {source.get('trust_score', 'N/A')})")


async def test_domain_trust():
    """Test domain trust lookup."""
    print("\n" + "=" * 80)
    print("TESTING DOMAIN TRUST DATABASE")
    print("=" * 80)
    
    test_domains = [
        "reuters.com",
        "bbc.com",
        "nytimes.com",
        "thehindu.com",
        "infowars.com",
        "naturalnews.com",
        "theonion.com",
        "unknown-site.com"
    ]
    
    print("\n🔍 Checking domain trust scores:\n")
    
    for domain in test_domains:
        info = get_domain_trust(domain)
        print(f"  {domain:30} → Trust: {info['trust_score']:3}/100  Category: {info['category']:12}  {info.get('name', 'N/A')}")


async def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("TRUTHLENS SERVICES TEST SUITE")
    print("=" * 80)
    
    # Test domain trust (no API needed)
    await test_domain_trust()
    
    # Test fact-check service
    await test_factcheck_service()
    
    # Test news service
    await test_news_service()
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETE")
    print("=" * 80)
    print("\nNOTE: Some tests may show no results if API keys are not configured.")
    print("This is expected behavior - the system gracefully handles missing APIs.\n")


if __name__ == "__main__":
    asyncio.run(main())
