# TruthLens Trust Score Algorithm

## Overview

The TruthLens trust score is a weighted composite score (0-100) that evaluates content credibility across multiple dimensions.

## Scoring Components

### 1. Content Credibility (30-45% weight)

**Source:** Gemini AI claim verification

**Calculation:**
- Analyzes all factual claims in content
- Each claim gets verdict: TRUE, FALSE, MISLEADING, PARTIALLY_TRUE, UNVERIFIED
- Score = weighted average of claim verdicts

**Weights per verdict:**
- TRUE: 100 points
- PARTIALLY_TRUE: 60 points
- MISLEADING: 30 points
- FALSE: 0 points
- UNVERIFIED: 50 points (neutral)

**Example:**
```
3 TRUE claims + 1 FALSE claim + 1 MISLEADING claim
= (100 + 100 + 100 + 0 + 30) / 5
= 66/100
```

### 2. Source Reliability (25% weight)

**Source:** Domain analysis + WHOIS + known domain database

**Factors:**
- Domain reputation (known reliable/unreliable sources)
- Domain age (older = more credible)
- WHOIS completeness
- SSL certificate validity
- Historical fact-check flags

**Score ranges:**
- 85-100: Highly credible (reuters.com, who.int)
- 70-84: Generally credible (major news outlets)
- 50-69: Mixed reputation (unknown domains)
- 30-49: Questionable
- 0-29: Unreliable (known fake news sites)

### 3. Media Integrity (25% weight)

**Source:** AI detection, EXIF analysis, deepfake detection

**For images:**
- AI-generated probability (0-1)
- EXIF metadata presence/authenticity
- Error Level Analysis (ELA) results
- Reverse image search matches

**For videos:**
- Deepfake probability (0-1)
- Frame consistency analysis
- Audio-visual sync verification

**For audio:**
- AI voice probability (0-1)
- Spectrogram anomalies
- Voice cloning detection

**Calculation:**
```
Score = 100 - (avg_manipulation_probability * 100)
```

### 4. Language & Bias (10-30% weight)

**Source:** Gemini AI language analysis

**Factors:**
- Sensationalism score (0-100)
- Clickbait score (0-100)
- Emotional manipulation score (0-100)
- Logical fallacies count
- Tone assessment

**Calculation:**
```
avg_manipulation = (sensationalism + clickbait + emotional_manipulation) / 3
Score = 100 - avg_manipulation
```

**Penalties:**
- Each logical fallacy: -5 points
- Inflammatory tone: -10 points
- Propaganda tone: -20 points

### 5. Cross-Reference (10-25% weight)

**Source:** Fact-check APIs + News APIs

**Factors:**
- Google Fact Check Tools results
- NewsAPI cross-references
- GNews cross-references
- Credible vs unreliable source ratio

**Calculation:**
```
if (credible_sources + unreliable_sources) > 0:
    Score = (credible_sources / total_sources) * 100
else:
    Score = 50 (neutral)
```

## Weight Distribution

### Text-Only Analysis (no URL/media)
```
Content Credibility:    45%
Language & Bias:        30%
Cross-Reference:        25%
```

### URL Analysis (with source)
```
Content Credibility:    30%
Source Reliability:     25%
Language & Bias:        20%
Cross-Reference:        25%
```

### Media Analysis (image/video/audio)
```
Content Credibility:    30%
Source Reliability:     25%
Media Integrity:        25%
Language & Bias:        10%
Cross-Reference:        10%
```

## Final Score Calculation

```python
final_score = (
    content_score * content_weight +
    source_score * source_weight +
    media_score * media_weight +
    language_score * language_weight +
    cross_ref_score * cross_ref_weight
)

# Clamp to 0-100
final_score = max(0, min(100, final_score))
```

## Verdict Mapping

| Score Range | Verdict | Description |
|-------------|---------|-------------|
| 85-100 | VERIFIED | Highly credible, verified by multiple sources |
| 65-84 | MOSTLY CREDIBLE | Generally trustworthy with minor concerns |
| 45-64 | SUSPICIOUS | Mixed signals, requires further verification |
| 25-44 | LIKELY MISLEADING | Multiple red flags, likely false or misleading |
| 0-24 | FAKE/FABRICATED | Strong evidence of fabrication or misinformation |

## Red Flag System

Red flags are aggregated from all analysis modules:

### From Gemini Analysis:
- False claims detected
- High sensationalism (>70)
- High clickbait (>70)
- High emotional manipulation (>70)
- Multiple logical fallacies (>2)
- Viral forward patterns detected

### From Source Analysis:
- Unreliable domain (score <30)
- No WHOIS data
- Recently created domain (<1 year)
- Known fake news site

### From Media Analysis:
- AI-generated probability >70%
- Deepfake probability >70%
- Missing/manipulated EXIF data
- ELA shows manipulation

### From Cross-Reference:
- No credible sources found
- Multiple unreliable sources
- Contradicted by fact-checkers

## Examples

### Example 1: Fake News

**Input:** "BREAKING: Government adding microchips to vaccines! Share before deleted!"

**Analysis:**
- Content: 2 FALSE claims → 0/100
- Language: Sensationalism 95, Clickbait 90 → 2.5/100
- Viral Forward: Detected → Red flag
- Cross-ref: 0 credible sources → 50/100

**Weights (text-only):**
```
Score = (0 * 0.45) + (2.5 * 0.30) + (50 * 0.25)
      = 0 + 0.75 + 12.5
      = 13.25
```

**Final:** 13/100 → FAKE/FABRICATED

### Example 2: Credible News

**Input:** "Study published in Nature shows new carbon capture method"

**Analysis:**
- Content: 1 TRUE claim, 1 PARTIALLY_TRUE → 80/100
- Source: nature.com → 95/100
- Language: Sensationalism 10, Clickbait 5 → 92.5/100
- Cross-ref: 3 credible sources → 100/100

**Weights (URL analysis):**
```
Score = (80 * 0.30) + (95 * 0.25) + (92.5 * 0.20) + (100 * 0.25)
      = 24 + 23.75 + 18.5 + 25
      = 91.25
```

**Final:** 91/100 → VERIFIED

### Example 3: Biased Content

**Input:** "The radical left is destroying America with socialist policies!"

**Analysis:**
- Content: 0 verifiable claims → 50/100
- Language: Sensationalism 85, Emotional 80 → 17.5/100
- Political Bias: FAR_RIGHT → Red flag
- Fallacies: Appeal to Fear, Hasty Generalization → Red flags

**Weights (text-only):**
```
Score = (50 * 0.45) + (17.5 * 0.30) + (50 * 0.25)
      = 22.5 + 5.25 + 12.5
      = 40.25
```

**Final:** 40/100 → SUSPICIOUS

## Continuous Improvement

The scoring algorithm can be tuned based on:
- User feedback on accuracy
- False positive/negative rates
- Comparison with expert fact-checkers
- A/B testing different weight distributions
