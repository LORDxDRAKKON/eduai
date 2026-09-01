'use client';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import ConfigPanel from './ConfigPanel';
import GeneratedContentPanel from './GeneratedContentPanel';
import ContentSkeleton from './ContentSkeleton';
import { GeneratedContent, ContentConfig } from './types';
import { getChatCompletion } from '@/lib/ai/chatCompletion';

type GenerationState = 'idle' | 'generating' | 'done' | 'error';

function buildPrompt(cfg: ContentConfig): string {
  const typeInstructions: Record<string, string> = {
    story: `Create an educational story for Grade ${cfg.grade} students about "${cfg.topic}" in ${cfg.subject}.
Return a JSON object with:
- "title": engaging story title -"summary": 1-2 sentence overview -"sections": array of 4-5 objects each with "heading" (string) and "body" (2-3 paragraph narrative text)`,

    worksheet: `Create a worksheet for Grade ${cfg.grade} students on "${cfg.topic}" in ${cfg.subject}.
Return a JSON object with:
- "title": worksheet title -"summary": brief description of what students will practice -"sections": array of 2-3 objects each with "heading" and "body" (instructions/context)
- "questions": array of 8-10 objects each with "id" (string), "number" (int), "question" (string), "type" ("mcq"|"short"|"long"), "options" (array of 4 strings, only for mcq), "answer" (string), "hint" (string)`,

    problem: `Create a problem set for Grade ${cfg.grade} students on "${cfg.topic}" in ${cfg.subject}.
Return a JSON object with:
- "title": problem set title -"summary": brief description -"sections": array of 2-3 objects each with "heading" and "body" (concept explanation)
- "questions": array of 8-10 objects each with "id" (string), "number" (int), "question" (string), "type" ("mcq"|"short"|"long"), "options" (array of 4 strings, only for mcq), "answer" (string), "hint" (string)`,

    video: `Create a video lesson script for Grade ${cfg.grade} students on "${cfg.topic}" in ${cfg.subject}.
Return a JSON object with:
- "title": video lesson title -"summary": 1-2 sentence overview -"sections": array of 3-4 objects each with "heading" and "body" (key points for this segment)
- "scenes": array of 5-6 objects each with "id" (string), "title" (string), "description" (string), "narration" (2-3 sentences), "imagePrompt" (detailed visual description)`,
  };

  return `You are an expert educational content creator for Indian school curriculum (CBSE/ICSE).
Language: ${cfg.language === 'en' ? 'English' : cfg.language}
Grade: ${cfg.grade}
Subject: ${cfg.subject}
Topic: ${cfg.topic}

${typeInstructions[cfg.type] || typeInstructions.story}

IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text.`;
}

export default function ContentGenerationClient() {
  const [state, setState] = useState<GenerationState>('idle');
  const [config, setConfig] = useState<ContentConfig | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = useCallback(async (cfg: ContentConfig) => {
    setConfig(cfg);
    setState('generating');
    setContent(null);

    try {
      const prompt = buildPrompt(cfg);

      // Use Perplexity for all content generation
      const provider = 'PERPLEXITY';
      const model = 'perplexity/sonar-pro';

      const result = await getChatCompletion(
        provider,
        model,
        [
          { role: 'system', content: 'You are an expert educational content creator. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        { max_tokens: 2500, temperature: 0.7 }
      );

      const rawText: string = result?.choices?.[0]?.message?.content || '';
      // Strip markdown fences if present
      const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(jsonText);

      setContent({
        ...parsed,
        topic: cfg.topic,
        grade: cfg.grade,
        subject: cfg.subject,
        language: cfg.language,
        type: cfg.type,
        generatedAt: new Date().toISOString(),
      });
      setState('done');
      toast.success('Content generated successfully!');
    } catch (err) {
      console.error('Content generation error:', err);
      setState('error');
      toast.error('Failed to generate content. Please try again.');
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (config) handleGenerate(config);
  }, [config, handleGenerate]);

  const handleSave = useCallback(() => {
    if (content) {
      const saved = JSON.parse(localStorage.getItem('eduai-history') ?? '[]');
      saved.unshift({ ...content, id: `hist-${Date.now()}`, saved: true });
      localStorage.setItem('eduai-history', JSON.stringify(saved.slice(0, 50)));
      toast.success('Saved to your history!');
    }
  }, [content]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-700 text-foreground">Generate Learning Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your learning preferences and let AI create personalized content
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
        {/* Config panel */}
        <div className="lg:w-80 xl:w-96 shrink-0">
          <ConfigPanel onGenerate={handleGenerate} isGenerating={state === 'generating'} />
        </div>

        {/* Output panel */}
        <div className="flex-1 min-w-0">
          {state === 'idle' && <EmptyGenerationState />}
          {state === 'generating' && <ContentSkeleton />}
          {state === 'done' && content && (
            <GeneratedContentPanel
              content={content}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
            />
          )}
          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700 font-600">Failed to generate content</p>
              <p className="text-red-600 text-sm mt-1">Check your connection and try again</p>
              <button
                onClick={handleRegenerate}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-600 hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyGenerationState() {
  return (
    <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-indigo flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h3 className="font-600 text-foreground text-lg mb-2">Configure your content</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Select your grade, subject, and topic on the left, then click Generate to create personalized AI learning content.
      </p>
    </div>
  );
}