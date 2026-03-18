"""Test script for URL analysis."""
import asyncio
from services.scraper_service import ScraperService
from services.domain_service import DomainService


async def test_scraper():
    """Test the scraper service."""
    print("\n" + "=" * 80)
    print("TESTING SCRAPER SERVICE")
    print("=" * 80)
    
    service = ScraperService()
    
    # Test URLs
    test_urls = [
        "https://www.bbc.com/news",
        "https://www.reuters.com",
        "https://invalid-url-that-does-not-exist.com/article"
    ]
    
    for url in test_urls:
        print(f"\n🔍 Scraping: {url}")
        result = await service.scrape_article(url)
        
        if result.get("success"):
            print(f"  ✅ Success!")
            print(f"  Title: {result.get('title', 'N/A')[:60]}...")
            print(f"  Word Count: {result.get('word_count', 0)}")
            print(f"  Domain: {result.get('domain', 'N/A')}")
            print(f"  Method: {result.get('method', 'N/A')}")
            if result.get('authors'):
                print(f"  Authors: {', '.join(result['authors'][:3])}")
        else:
            print(f"  ❌ Failed: {result.get('error', 'Unknown error')}")


async def test_domain_service():
    """Test the domain service."""
    print("\n" + "=" * 80)
    print("TESTING DOMAIN SERVICE")
    print("=" * 80)
    
    service = DomainService()
    
    # Test domains
    test_urls = [
        "https://www.reuters.com/article/123",
        "https://www.bbc.com/news/world",
        "https://www.thehindu.com/news/national",
        "https://infowars.com/article",
        "https://unknown-new-site.com/news"
    ]
    
    for url in test_urls:
        print(f"\n🔍 Checking: {url}")
        result = await service.check_domain_credibility(url)
        
        if result.get("success"):
            print(f"  Domain: {result.get('domain', 'N/A')}")
            print(f"  Trust Score: {result.get('trust_score', 0)}/100")
            print(f"  Known Credible: {result.get('is_known_credible', False)}")
            print(f"  Known Unreliable: {result.get('is_known_unreliable', False)}")
            print(f"  Domain Age: {result.get('domain_age_days', 'Unknown')} days")
            print(f"  Age Flag: {result.get('domain_age_flag', 'N/A')}")
            print(f"  Political Bias: {result.get('political_bias', 'N/A')}")
            
            if result.get('warnings'):
                print(f"  ⚠️ Warnings:")
                for warning in result['warnings']:
                    print(f"    • {warning}")
        else:
            print(f"  ❌ Error: {result.get('error', 'Unknown')}")


async def test_quick_domain_check():
    """Test quick domain check."""
    print("\n" + "=" * 80)
    print("TESTING QUICK DOMAIN CHECK")
    print("=" * 80)
    
    service = DomainService()
    
    domains = [
        "reuters.com",
        "bbc.com",
        "infowars.com",
        "theonion.com",
        "unknown-site.com"
    ]
    
    print("\n📊 Quick Domain Checks:\n")
    
    for domain in domains:
        result = await service.quick_domain_check(domain)
        print(f"  {domain:30} → Trust: {result['trust_score']:3}/100  "
              f"Category: {result['category']:12}  Bias: {result.get('bias', 'N/A')}")


async def test_domain_extraction():
    """Test domain extraction."""
    print("\n" + "=" * 80)
    print("TESTING DOMAIN EXTRACTION")
    print("=" * 80)
    
    service = ScraperService()
    
    test_urls = [
        "https://www.bbc.com/news/world-123456",
        "http://reuters.com/article/abc",
        "https://www.thehindu.com/news/national/article123.ece",
        "www.example.com/page",
        "invalid-url"
    ]
    
    print("\n🔗 Domain Extraction:\n")
    
    for url in test_urls:
        domain = service.extract_domain(url)
        print(f"  {url:50} → {domain}")


async def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("URL ANALYSIS TEST SUITE")
    print("=" * 80)
    
    # Test domain extraction
    await test_domain_extraction()
    
    # Test quick domain check
    await test_quick_domain_check()
    
    # Test domain service
    await test_domain_service()
    
    # Test scraper
    await test_scraper()
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETE")
    print("=" * 80)
    print("\nNOTE: Some tests may fail due to network issues or site restrictions.")
    print("This is expected behavior - the system handles these gracefully.\n")


if __name__ == "__main__":
    asyncio.run(main())
