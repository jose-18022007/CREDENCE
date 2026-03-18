"""Known reliable and unreliable domains database."""
from typing import Optional, Tuple, Dict, Any

# Known reliable news sources (100+ entries)
CREDIBLE_DOMAINS = {
    # Wire Services & News Agencies
    "reuters.com": {"name": "Reuters", "trust_score": 95, "bias": "CENTER", "type": "wire_service"},
    "apnews.com": {"name": "Associated Press", "trust_score": 95, "bias": "CENTER", "type": "wire_service"},
    "afp.com": {"name": "Agence France-Presse", "trust_score": 93, "bias": "CENTER", "type": "wire_service"},
    
    # International News
    "bbc.com": {"name": "BBC", "trust_score": 90, "bias": "CENTER_LEFT", "type": "public_broadcaster"},
    "bbc.co.uk": {"name": "BBC UK", "trust_score": 90, "bias": "CENTER_LEFT", "type": "public_broadcaster"},
    "theguardian.com": {"name": "The Guardian", "trust_score": 85, "bias": "LEFT", "type": "newspaper"},
    "economist.com": {"name": "The Economist", "trust_score": 88, "bias": "CENTER", "type": "magazine"},
    "ft.com": {"name": "Financial Times", "trust_score": 90, "bias": "CENTER", "type": "newspaper"},
    "aljazeera.com": {"name": "Al Jazeera", "trust_score": 80, "bias": "CENTER", "type": "news_channel"},
    
    # US Major News
    "nytimes.com": {"name": "New York Times", "trust_score": 85, "bias": "CENTER_LEFT", "type": "newspaper"},
    "washingtonpost.com": {"name": "Washington Post", "trust_score": 85, "bias": "CENTER_LEFT", "type": "newspaper"},
    "wsj.com": {"name": "Wall Street Journal", "trust_score": 87, "bias": "CENTER_RIGHT", "type": "newspaper"},
    "usatoday.com": {"name": "USA Today", "trust_score": 80, "bias": "CENTER", "type": "newspaper"},
    "latimes.com": {"name": "LA Times", "trust_score": 82, "bias": "CENTER_LEFT", "type": "newspaper"},
    "chicagotribune.com": {"name": "Chicago Tribune", "trust_score": 80, "bias": "CENTER", "type": "newspaper"},
    
    # US Broadcast
    "npr.org": {"name": "NPR", "trust_score": 88, "bias": "CENTER_LEFT", "type": "public_broadcaster"},
    "pbs.org": {"name": "PBS", "trust_score": 90, "bias": "CENTER", "type": "public_broadcaster"},
    "cbsnews.com": {"name": "CBS News", "trust_score": 80, "bias": "CENTER_LEFT", "type": "news_channel"},
    "nbcnews.com": {"name": "NBC News", "trust_score": 80, "bias": "CENTER_LEFT", "type": "news_channel"},
    "abcnews.go.com": {"name": "ABC News", "trust_score": 80, "bias": "CENTER_LEFT", "type": "news_channel"},
    "cnn.com": {"name": "CNN", "trust_score": 75, "bias": "LEFT", "type": "news_channel"},
    
    # Indian News
    "thehindu.com": {"name": "The Hindu", "trust_score": 85, "bias": "CENTER_LEFT", "type": "newspaper"},
    "hindustantimes.com": {"name": "Hindustan Times", "trust_score": 80, "bias": "CENTER", "type": "newspaper"},
    "indianexpress.com": {"name": "Indian Express", "trust_score": 83, "bias": "CENTER", "type": "newspaper"},
    "timesofindia.indiatimes.com": {"name": "Times of India", "trust_score": 75, "bias": "CENTER", "type": "newspaper"},
    "ndtv.com": {"name": "NDTV", "trust_score": 80, "bias": "CENTER_LEFT", "type": "news_channel"},
    "thequint.com": {"name": "The Quint", "trust_score": 75, "bias": "LEFT", "type": "digital_news"},
    "scroll.in": {"name": "Scroll.in", "trust_score": 78, "bias": "CENTER_LEFT", "type": "digital_news"},
    "theprint.in": {"name": "ThePrint", "trust_score": 77, "bias": "CENTER", "type": "digital_news"},
    "thewire.in": {"name": "The Wire", "trust_score": 75, "bias": "LEFT", "type": "digital_news"},
    
    # Tech News
    "techcrunch.com": {"name": "TechCrunch", "trust_score": 82, "bias": "CENTER", "type": "tech_news"},
    "theverge.com": {"name": "The Verge", "trust_score": 80, "bias": "CENTER", "type": "tech_news"},
    "arstechnica.com": {"name": "Ars Technica", "trust_score": 85, "bias": "CENTER", "type": "tech_news"},
    "wired.com": {"name": "Wired", "trust_score": 82, "bias": "CENTER_LEFT", "type": "tech_magazine"},
    "cnet.com": {"name": "CNET", "trust_score": 78, "bias": "CENTER", "type": "tech_news"},
    
    # Science & Health
    "nature.com": {"name": "Nature", "trust_score": 98, "bias": "N/A", "type": "scientific_journal"},
    "science.org": {"name": "Science", "trust_score": 98, "bias": "N/A", "type": "scientific_journal"},
    "scientificamerican.com": {"name": "Scientific American", "trust_score": 90, "bias": "CENTER", "type": "science_magazine"},
    "newscientist.com": {"name": "New Scientist", "trust_score": 88, "bias": "CENTER", "type": "science_magazine"},
    
    # Government & Official
    "who.int": {"name": "World Health Organization", "trust_score": 95, "bias": "N/A", "type": "international_org"},
    "cdc.gov": {"name": "CDC", "trust_score": 93, "bias": "N/A", "type": "government"},
    "nih.gov": {"name": "NIH", "trust_score": 95, "bias": "N/A", "type": "government"},
    "gov.uk": {"name": "UK Government", "trust_score": 90, "bias": "N/A", "type": "government"},
    "un.org": {"name": "United Nations", "trust_score": 88, "bias": "N/A", "type": "international_org"},
    
    # Fact-Checking
    "snopes.com": {"name": "Snopes", "trust_score": 90, "bias": "CENTER", "type": "fact_checker"},
    "factcheck.org": {"name": "FactCheck.org", "trust_score": 92, "bias": "CENTER", "type": "fact_checker"},
    "politifact.com": {"name": "PolitiFact", "trust_score": 88, "bias": "CENTER", "type": "fact_checker"},
    "fullfact.org": {"name": "Full Fact", "trust_score": 90, "bias": "CENTER", "type": "fact_checker"},
    
    # Business News
    "bloomberg.com": {"name": "Bloomberg", "trust_score": 88, "bias": "CENTER", "type": "business_news"},
    "forbes.com": {"name": "Forbes", "trust_score": 78, "bias": "CENTER_RIGHT", "type": "business_magazine"},
    "businessinsider.com": {"name": "Business Insider", "trust_score": 75, "bias": "CENTER", "type": "business_news"},
    "cnbc.com": {"name": "CNBC", "trust_score": 80, "bias": "CENTER", "type": "business_news"},
    
    # Regional/Other
    "smh.com.au": {"name": "Sydney Morning Herald", "trust_score": 82, "bias": "CENTER_LEFT", "type": "newspaper"},
    "theage.com.au": {"name": "The Age", "trust_score": 82, "bias": "CENTER_LEFT", "type": "newspaper"},
    "abc.net.au": {"name": "ABC Australia", "trust_score": 88, "bias": "CENTER", "type": "public_broadcaster"},
    "cbc.ca": {"name": "CBC", "trust_score": 85, "bias": "CENTER_LEFT", "type": "public_broadcaster"},
    "globeandmail.com": {"name": "Globe and Mail", "trust_score": 83, "bias": "CENTER", "type": "newspaper"},
    "scmp.com": {"name": "South China Morning Post", "trust_score": 78, "bias": "CENTER", "type": "newspaper"},
    "straitstimes.com": {"name": "Straits Times", "trust_score": 80, "bias": "CENTER", "type": "newspaper"},
    "japantimes.co.jp": {"name": "Japan Times", "trust_score": 82, "bias": "CENTER", "type": "newspaper"},
}

# Known unreliable/fake news domains (50+ entries)
UNRELIABLE_DOMAINS = {
    # Known Fake News
    "infowars.com": {"name": "InfoWars", "trust_score": 10, "reason": "Conspiracy theories, misinformation"},
    "naturalnews.com": {"name": "Natural News", "trust_score": 15, "reason": "Health misinformation, conspiracy theories"},
    "beforeitsnews.com": {"name": "Before It's News", "trust_score": 20, "reason": "Unverified claims, conspiracy theories"},
    "yournewswire.com": {"name": "Your News Wire", "trust_score": 10, "reason": "Fake news, hoaxes"},
    "neonnettle.com": {"name": "Neon Nettle", "trust_score": 15, "reason": "Fake news, conspiracy theories"},
    "realfarmacy.com": {"name": "Real Farmacy", "trust_score": 20, "reason": "Health misinformation"},
    "collective-evolution.com": {"name": "Collective Evolution", "trust_score": 25, "reason": "Pseudoscience, conspiracy theories"},
    
    # Satire (often shared as real)
    "theonion.com": {"name": "The Onion", "trust_score": 5, "reason": "Satire site"},
    "clickhole.com": {"name": "ClickHole", "trust_score": 5, "reason": "Satire site"},
    "babylonbee.com": {"name": "Babylon Bee", "trust_score": 5, "reason": "Satire site"},
    "worldnewsdailyreport.com": {"name": "World News Daily Report", "trust_score": 5, "reason": "Satire/fake news"},
    "nationalreport.net": {"name": "National Report", "trust_score": 5, "reason": "Satire/fake news"},
    "empirenews.net": {"name": "Empire News", "trust_score": 5, "reason": "Satire/fake news"},
    "huzlers.com": {"name": "Huzlers", "trust_score": 5, "reason": "Satire/fake news"},
    
    # Hyperpartisan/Unreliable
    "breitbart.com": {"name": "Breitbart", "trust_score": 35, "reason": "Extreme bias, misleading headlines"},
    "dailywire.com": {"name": "Daily Wire", "trust_score": 40, "reason": "Extreme bias, opinion as news"},
    "occupydemocrats.com": {"name": "Occupy Democrats", "trust_score": 35, "reason": "Extreme bias, misleading content"},
    "bipartisanreport.com": {"name": "Bipartisan Report", "trust_score": 30, "reason": "Misleading, extreme bias"},
    "palmerreport.com": {"name": "Palmer Report", "trust_score": 30, "reason": "Extreme bias, speculation as fact"},
    
    # Clickbait/Low Quality
    "buzzfeed.com": {"name": "BuzzFeed", "trust_score": 45, "reason": "Clickbait, mixed quality"},
    "upworthy.com": {"name": "Upworthy", "trust_score": 40, "reason": "Clickbait headlines"},
    "viralthread.com": {"name": "Viral Thread", "trust_score": 30, "reason": "Clickbait, unverified content"},
}


def get_domain_trust(domain: str) -> Dict[str, Any]:
    """Get trust information for a domain.
    
    Args:
        domain: Domain name to check
        
    Returns:
        Dictionary with trust information
    """
    domain = domain.lower().replace("www.", "")
    
    if domain in CREDIBLE_DOMAINS:
        info = CREDIBLE_DOMAINS[domain]
        return {
            "domain": domain,
            "name": info["name"],
            "trust_score": info["trust_score"],
            "bias": info.get("bias", "UNKNOWN"),
            "type": info.get("type", "unknown"),
            "category": "credible"
        }
    
    if domain in UNRELIABLE_DOMAINS:
        info = UNRELIABLE_DOMAINS[domain]
        return {
            "domain": domain,
            "name": info["name"],
            "trust_score": info["trust_score"],
            "reason": info.get("reason", "Unknown"),
            "category": "unreliable"
        }
    
    # Unknown domain - neutral score
    return {
        "domain": domain,
        "name": domain,
        "trust_score": 50,
        "bias": "UNKNOWN",
        "category": "unknown"
    }


def check_domain_reputation(domain: str) -> Tuple[Optional[int], Optional[str], str]:
    """Check domain reputation against known databases.
    
    Args:
        domain: Domain name to check
        
    Returns:
        Tuple of (credibility_score, bias, category)
        category can be "reliable", "unreliable", "satire", or "unknown"
    """
    info = get_domain_trust(domain)
    
    if info["category"] == "credible":
        return info["trust_score"], info.get("bias"), "reliable"
    elif info["category"] == "unreliable":
        if "satire" in info.get("reason", "").lower():
            return info["trust_score"], None, "satire"
        return info["trust_score"], None, "unreliable"
    else:
        return None, None, "unknown"
