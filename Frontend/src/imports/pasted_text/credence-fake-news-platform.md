Design a modern, professional web application called "Credence" — a Fake News Detection & Media Integrity Platform. The platform allows users to verify any content (text, URLs, images, videos, audio) for misinformation, deepfakes, AI-generated content, and manipulation. Use a dark theme with deep navy/charcoal background (#0F1629), accent colors of electric blue (#3B82F6) and emerald green (#10B981) for trust indicators, red (#EF4444) for danger/fake indicators, amber/yellow (#F59E0B) for warnings, and white/light gray text. Clean, minimal, dashboard-style UI with glassmorphism cards (semi-transparent backgrounds with blur). Use rounded corners (12px-16px), subtle shadows, and smooth gradients. Sans-serif font like Inter or DM Sans.

---

PAGE 1: LANDING PAGE / HOME

Top navigation bar with:
- Logo on left: "TruthLens" with a magnifying glass + shield icon
- Nav links: Home, Analyze, Dashboard, About, API
- Right side: "Get Started" button (electric blue) and a dark mode toggle

Hero section:
- Large bold headline: "Don't Get Fooled. Verify Everything."
- Subtitle: "AI-powered platform that detects fake news, deepfakes, AI-generated media, and manipulated content across text, images, video, and audio."
- Two CTA buttons: "Start Analyzing" (electric blue filled) and "Watch Demo" (outlined)
- Below the buttons, show a subtle animated mockup or illustration of the platform analyzing content with a trust score gauge

Stats bar section (horizontal row of 4 glassmorphism cards):
- "5 Media Types Supported" with icons (text, URL, image, video, audio)
- "Real-time Analysis" with a lightning bolt icon
- "AI + Fact-Check Cross Reference" with a brain + checkmark icon
- "Detailed Trust Reports" with a report card icon

Features section with heading "What Can TruthLens Detect?" — show 6 feature cards in a 3x2 grid:
1. "Fake News Detection" — icon: newspaper with X — "Analyze articles and claims against fact-check databases and AI reasoning"
2. "AI-Generated Images" — icon: image with robot — "Detect MidJourney, DALL-E, Stable Diffusion generated images"
3. "Deepfake Videos" — icon: video camera with warning — "Frame-by-frame face manipulation and lip-sync analysis"
4. "AI Voice & Audio Cloning" — icon: microphone with waveform — "Identify ElevenLabs, cloned voices, and spliced audio"
5. "Source Credibility Scoring" — icon: globe with shield — "Domain reputation, age, bias detection, and reliability scoring"
6. "Manipulated Media Detection" — icon: layers with magnifier — "EXIF analysis, Error Level Analysis, and metadata inspection"

How it works section — 4 steps in a horizontal timeline:
Step 1: "Upload or Paste" — user uploads screenshot, pastes text, drops URL, or uploads media file
Step 2: "AI Processes" — OCR extraction, content scraping, media fingerprinting, AI model analysis
Step 3: "Cross-Reference" — fact-check databases, reverse image search, source credibility check
Step 4: "Get Your Report" — detailed trust score, red flags, evidence, and recommendations

Supported media types section — 5 horizontal cards showing:
- Text (clipboard icon)
- URL (link icon)
- Image (photo icon)
- Video (play icon)
- Audio (waveform icon)
Each card has a brief one-line description below the icon.

Footer with links, social icons, and "Built for Hackathon 2025"

---

PAGE 2: ANALYZE PAGE (Main Functionality Page)

This is the core page. Clean layout with a centered content area.

Top heading: "Analyze Content" with subtitle "Upload any content type and get an instant integrity report"

Below the heading, show 5 tabs in a horizontal tab bar (pill-style toggle buttons):
- Tab 1: 📝 Text (active/default)
- Tab 2: 🔗 URL
- Tab 3: 📸 Image
- Tab 4: 🎥 Video
- Tab 5: 🎙️ Audio

--- TAB 1: TEXT INPUT ---
A large text area input box (placeholder: "Paste the news article, claim, social media post, or any text you want to verify...")
Character count in bottom right corner
Below the text area: a "Analyze Text" button (electric blue, full width)
Checkboxes below: "Check for political bias" / "Deep fact-check mode" / "Check for logical fallacies"

--- TAB 2: URL INPUT ---
A single URL input field with a link icon (placeholder: "Paste the article URL here... e.g., https://example.com/article")
Below: a preview card that auto-generates showing the page title, domain name, and thumbnail when a URL is pasted
"Analyze URL" button (electric blue, full width)
Small text below: "We'll scrape the content, check source credibility, and verify all claims"

--- TAB 3: IMAGE UPLOAD ---
A large drag-and-drop zone with dashed border and cloud upload icon
Text: "Drag & drop an image or click to upload"
Supported formats: PNG, JPG, JPEG, WEBP (max 10MB)
Below the upload zone, show 4 small toggle chips/pills that the user can enable:
- "AI-Generated Detection"
- "Reverse Image Search"
- "EXIF Metadata Analysis"
- "Error Level Analysis (ELA)"
All enabled by default with checkmarks
"Analyze Image" button (electric blue, full width)
Show a small thumbnail preview of the uploaded image before analysis

--- TAB 4: VIDEO UPLOAD ---
A large drag-and-drop zone similar to image but with a video play icon
Text: "Drag & drop a video or click to upload"
Supported formats: MP4, MOV, AVI, WEBM (max 100MB)
Below the upload zone, show toggle chips:
- "Deepfake Face Detection"
- "AI-Generated Video Detection"
- "Frame-by-Frame Analysis"
- "Audio Track Extraction & Analysis"
- "Lip-Sync Verification"
All enabled by default
"Analyze Video" button
Show a video thumbnail preview with duration after upload

--- TAB 5: AUDIO UPLOAD ---
A drag-and-drop zone with a microphone/waveform icon
Text: "Drag & drop an audio file or click to upload"
Supported formats: MP3, WAV, M4A, OGG, FLAC (max 50MB)
OR a "Record Audio" button with a red microphone icon for live recording
Below the upload zone, show toggle chips:
- "AI Voice Detection"
- "Voice Cloning Detection"
- "Spectrogram Analysis"
- "Audio Splice Detection"
- "Transcription + Claim Analysis"
All enabled by default
"Analyze Audio" button
Show a waveform preview of the uploaded audio

Below ALL tabs, show a section: "Recent Analyses" — a horizontal scroll of small cards showing previously analyzed items with their trust scores (mini cards with icon, title snippet, score badge)

---

PAGE 3: RESULTS / REPORT PAGE

This page appears after analysis is complete. It's the most important page.

Top section — large hero result card (glassmorphism, full width):
- Left side: Large circular gauge/donut chart showing OVERALL TRUST SCORE (e.g., 35/100)
  - Color coded: 0-30 Red (Likely Fake), 31-60 Yellow (Suspicious), 61-80 Light Green (Mostly Credible), 81-100 Green (Verified/Trustworthy)
- Right side: Verdict text in large bold: "⚠️ SUSPICIOUS — LIKELY MISLEADING"
  - Below: one-line AI summary: "This article contains multiple unverified claims and originates from a low-credibility source with sensationalist language patterns."
  - Below: "Analyzed on: Dec 15, 2025 at 3:42 PM" timestamp
  - Three action buttons: "Share Report" / "Download PDF" / "Re-analyze"

Below the hero card, show 5 detailed analysis sections as expandable/collapsible glassmorphism cards:

--- CARD 1: SOURCE CREDIBILITY (icon: shield) ---
- Source/Domain name and favicon
- Trust rating: 5-star visual or bar (e.g., 1.5/5 stars)
- Domain age: "Registered 23 days ago ⚠️"
- Known bias: "Strong political bias detected — Far Right"
- Fact-check history: "This domain has been flagged by 3 fact-checking organizations"
- WHOIS info summary

--- CARD 2: CLAIM VERIFICATION (icon: magnifying glass + checkmark) ---
- List of extracted claims from the content (numbered)
- Each claim shows:
  - The claim text in quotes
  - Verdict badge: "TRUE ✅" / "FALSE ❌" / "MISLEADING ⚠️" / "UNVERIFIED ❓"
  - Evidence/source link
  - Brief AI explanation of why it's true/false
- Overall claims accuracy percentage bar

--- CARD 3: LANGUAGE & BIAS ANALYSIS (icon: text with chart) ---
- Sensationalism score: visual bar (Low / Medium / High / Extreme)
- Emotional manipulation: detected patterns listed (e.g., "fear-mongering", "outrage bait")
- Clickbait score: percentage
- Logical fallacies detected: listed with explanations (e.g., "Ad Hominem", "Straw Man", "Appeal to Fear")
- Political bias meter: a horizontal spectrum bar from Far Left to Far Right with a marker
- Tone: "Inflammatory" / "Neutral" / "Balanced" badge

--- CARD 4: MEDIA INTEGRITY (icon: image + shield) ---
This card adapts based on what was analyzed (image/video/audio):

For IMAGE results:
- AI-Generated probability: large percentage with bar (e.g., "92% AI Generated 🔴")
- Model prediction: "Likely generated by: Stable Diffusion"
- Reverse image search results: show matching images found with source links and dates
- EXIF metadata table: Camera, Date, GPS, Software, etc. or "Metadata Stripped ⚠️"
- Error Level Analysis: show the ELA image side-by-side with original — highlight edited regions
- Manipulation verdict: "Edited regions detected" or "No manipulation detected"

For VIDEO results:
- Deepfake probability: percentage with bar
- Frames analyzed: "247 frames analyzed, 89 flagged"
- Face consistency score
- Lip-sync match score: percentage
- Thumbnail grid showing flagged frames with red borders
- Audio track analysis summary (links to audio section)
- AI-generated video probability

For AUDIO results:
- AI-generated voice probability: percentage with bar
- Voice cloning likelihood
- Spectrogram visualization (colorful frequency chart)
- Splice/cut detection: timeline bar with markers where cuts were detected
- Transcription: full text transcript with timestamps
- Speaker identification confidence
- Background noise analysis

--- CARD 5: CROSS-REFERENCE & FACT-CHECK (icon: network/globe) ---
- Google Fact Check results: list of matching fact-checks with organization name, rating, and link
- Related articles from credible sources: 3-5 links with headlines
- Coverage comparison: "Found in 2 credible sources vs. 47 unreliable sources"
- Viral/forward detection: "This content matches patterns of viral misinformation"

At the bottom of the results page:
- "Similar Content Analyzed by Others" — horizontal card scroll
- "Report Inaccuracy" button
- "Was this helpful?" feedback (thumbs up / thumbs down)

---

PAGE 4: DASHBOARD PAGE

Top heading: "Your Dashboard" with subtitle "Track all your analyzed content"

Top stats row — 4 metric cards:
- "Total Analyses" with number (e.g., 47)
- "Fake/Misleading Detected" with number in red (e.g., 23)
- "Credible Content" with number in green (e.g., 18)
- "Suspicious/Unverified" with number in yellow (e.g., 6)

Charts section (2 charts side by side):
- Left: Pie/donut chart — "Content Breakdown by Type" (Text, URL, Image, Video, Audio)
- Right: Bar chart — "Trust Score Distribution" (showing how many items fell in each score range)

Below charts: A filterable, searchable table/list of all analyzed items:
- Columns: Type (icon), Content Preview (truncated), Source, Trust Score (color-coded badge), Date, Status
- Each row is clickable to view full report
- Filters: By type (Text/URL/Image/Video/Audio), By score range, By date
- Search bar at top

Trending Misinformation section at bottom:
- "Currently Trending Misinformation" — cards showing viral fake news being detected across the platform with warning badges

---

PAGE 5: ABOUT / HOW IT WORKS PAGE

Brief page with:
- Mission statement section
- Technology stack visual (showing all the AI models and APIs used in a nice icon grid)
- Team section (placeholder avatars and names)
- FAQ accordion section with 5-6 common questions
- Contact form

—

GLOBAL DESIGN NOTES:
- All pages should have a clean, professional white/light background (#FFFFFF primary, #F8FAFC secondary background for sections, #F1F5F9 for subtle card backgrounds)
- Primary accent color: Deep Navy Blue (#1E3A5F) for headers, key text, and authority feel
- Secondary accent: Professional Teal (#0D9488) for trust indicators and positive scores
- Danger/Fake indicators: Deep Red (#DC2626)
- Warning indicators: Amber (#D97706)
- Success/Verified indicators: Emerald Green (#059669)
- Neutral text: Charcoal (#1E293B) for body text, Medium Gray (#64748B) for secondary text
- Cards use clean white (#FFFFFF) with subtle light gray borders (#E2E8F0), soft box shadows (0 1px 3px rgba(0,0,0,0.08)), and rounded corners (10px-12px) — NO glassmorphism, NO transparency, NO blur effects
- Trust score colors are consistent everywhere: Red (0-30 Fake/Misleading), Amber (31-60 Suspicious), Green (61-100 Verified/Credible)
- Smooth, subtle hover effects on all interactive elements (slight shadow lift, gentle color shift)
- Loading states: show clean skeleton loaders with light gray shimmer while analysis is processing
- The analysis processing state should show a professional step-by-step progress indicator with a horizontal stepper bar: "Extracting text... → Checking source... → Verifying claims... → Analyzing media... → Generating report..." — each step highlights in navy blue as it completes with a checkmark
- Fully mobile responsive design with proper spacing and stacking
- All icons should be from a consistent icon set (Lucide or Heroicons — clean, minimal, outline style)
- Primary buttons: solid Deep Navy Blue (#1E3A5F) with white text, slight rounded corners (8px), clean shadow — NO gradients
- Secondary buttons: white background with navy blue border and navy text
- Typography: Clean sans-serif font like Inter, Plus Jakarta Sans, or DM Sans — large readable headings (bold 600-700 weight), well-spaced body text (16px, line-height 1.6)
- Section dividers: subtle light gray horizontal lines (#E2E8F0) or generous whitespace — NO harsh separators
- The overall feel should be: government-grade trustworthy, clean, minimal, modern, and highly professional — like a combination of GOV.UK design system, WHO dashboards, and modern SaaS platforms (think Linear, Notion, Stripe level of cleanliness)
- Generous whitespace and padding throughout — nothing should feel cramped
- Data visualizations (charts, gauges, score meters) should use flat, professional colors — no 3D effects, no glossy styles
- Tables and lists should follow clean data-table patterns with alternating row backgrounds (#F8FAFC and #FFFFFF), sortable headers, and proper alignment
- No decorative elements, no unnecessary gradients, no flashy animations — every element should serve a functional purpose
- Accessibility first: proper contrast ratios (WCAG AA minimum), clear focus states with navy outline rings, readable font sizes, proper label associations


