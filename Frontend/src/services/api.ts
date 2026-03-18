/**
 * API Service for Credence Backend
 * Uses Vite proxy in development, direct URL in production
 */

const API_BASE_URL = import.meta.env.PROD ? 'http://localhost:8000' : '';

export interface AnalysisResponse {
  analysis_id: string;
  overall_trust_score: number;
  verdict: string;
  summary: string;
  source_credibility: {
    score: number;
    domain: string | null;
    domain_age: string | null;
    bias: string;
    details: string;
  };
  claim_verification: {
    claims: any[];
    verified_count: number;
    false_count: number;
    unverifiable_count: number;
  };
  language_analysis: {
    sensationalism_score: number;
    clickbait_score: number;
    emotional_manipulation: string;
    political_bias: string;
    logical_fallacies: string[];
    tone: string;
  };
  media_integrity: {
    ai_generated_probability: number | null;
    exif_data: any | null;
    ela_result: any | null;
    reverse_search: any | null;
    deepfake_probability: number | null;
    ai_voice_probability: number | null;
    spectrogram_url: string | null;
    transcription: string | null;
    splice_detection: any | null;
    video_metadata: any | null;
    deepfake_frames: any | null;
  };
  cross_reference: {
    factcheck_results: any[];
    related_articles: any[];
    credible_sources_count: number;
    unreliable_sources_count: number;
  };
  web_search_evidence?: {
    search_performed: boolean;
    total_results_found: number;
    news_results_count: number;
    search_timestamp: string | null;
    coverage_level: string | null;
  };
  red_flags: string[];
  timestamp: string;
}

/**
 * Analyze text content
 */
export async function analyzeText(
  text: string,
  options: {
    check_bias?: boolean;
    check_fallacies?: boolean;
  } = {}
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      check_bias: options.check_bias ?? true,
      check_fallacies: options.check_fallacies ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Failed to analyze text');
  }

  return response.json();
}

/**
 * Analyze URL content
 */
export async function analyzeURL(url: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Failed to analyze URL');
  }

  return response.json();
}

/**
 * Analyze image file
 */
export async function analyzeImage(
  file: File,
  options: {
    check_ai_generated?: boolean;
    check_exif?: boolean;
    check_ela?: boolean;
    reverse_search?: boolean;
  } = {}
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('check_ai_generated', String(options.check_ai_generated ?? true));
  formData.append('check_exif', String(options.check_exif ?? true));
  formData.append('check_ela', String(options.check_ela ?? true));
  formData.append('reverse_search', String(options.reverse_search ?? true));

  const response = await fetch(`${API_BASE_URL}/api/analyze/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Failed to analyze image');
  }

  return response.json();
}

/**
 * Analyze video file
 */
export async function analyzeVideo(
  file: File,
  options: {
    check_deepfake?: boolean;
    check_ai_generated?: boolean;
    extract_audio?: boolean;
  } = {}
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('check_deepfake', String(options.check_deepfake ?? true));
  formData.append('check_ai_generated', String(options.check_ai_generated ?? true));
  formData.append('extract_audio', String(options.extract_audio ?? true));

  const response = await fetch(`${API_BASE_URL}/api/analyze/video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Failed to analyze video');
  }

  return response.json();
}

/**
 * Analyze audio file
 */
export async function analyzeAudio(
  file: File,
  options: {
    check_ai_voice?: boolean;
    transcribe?: boolean;
  } = {}
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('check_ai_voice', String(options.check_ai_voice ?? true));
  formData.append('transcribe', String(options.transcribe ?? true));

  const response = await fetch(`${API_BASE_URL}/api/analyze/audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Failed to analyze audio');
  }

  return response.json();
}

/**
 * Get analysis report by ID
 */
export async function getAnalysisReport(analysisId: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/report/${analysisId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch analysis report');
  }

  return response.json();
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return response.json();
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('API health check failed');
  }

  return response.json();
}
