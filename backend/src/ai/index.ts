import { openaiClient, AI_MODEL } from './openaiClient';
import { SYSTEM_PROMPT } from './prompts/system';
import { CATEGORY_FOLLOW_UP } from './prompts/categories';
import { priceEstimator } from '../pricing';

export interface AIResponse {
  replySv: string;
  categorySlug: string;
  priceMin: number | null;
  priceMax: number | null;
  needsMoreInfo: boolean;
  followUpQuestions: string[];
}

const FALLBACK_REPLY = 'Tack for din forfragan! Vi har tagit emot din forfragan och aterkommer sa snart som mojligt med mer information. Har du fragor ar du valkommen att kontakta oss direkt.';

export async function generateLeadReply(params: {
  name: string;
  description: string;
  city: string;
  postalCode: string;
  categorySlug?: string;
}): Promise<AIResponse> {
  const categoryHint = params.categorySlug
    ? CATEGORY_FOLLOW_UP[params.categorySlug] || ''
    : '';
  const priceHint = params.categorySlug
    ? priceEstimator.estimate(params.categorySlug, params.description).hintSv
    : '';

  const userPrompt = `Ny serviceforfragan:
Kund: ${params.name}
Ort: ${params.city} (${params.postalCode})
Beskrivning: ${params.description}
${params.categorySlug ? `Preliminar kategori: ${params.categorySlug}` : ''}
${priceHint ? `Prisinfo: ${priceHint}` : ''}
${categoryHint ? `Vagledning for foljdfragor: ${categoryHint}` : ''}

Svara som Svara-assistenten.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Tomt svar fran AI');

    const parsed = JSON.parse(content) as AIResponse;
    return {
      replySv: parsed.replySv || FALLBACK_REPLY,
      categorySlug: parsed.categorySlug || params.categorySlug || 'ovrigt',
      priceMin: parsed.priceMin ?? null,
      priceMax: parsed.priceMax ?? null,
      needsMoreInfo: parsed.needsMoreInfo ?? false,
      followUpQuestions: parsed.followUpQuestions || [],
    };
  } catch (err) {
    console.error('[AI] Fel vid AI-svar:', err);
    return {
      replySv: FALLBACK_REPLY,
      categorySlug: params.categorySlug || 'ovrigt',
      priceMin: null,
      priceMax: null,
      needsMoreInfo: true,
      followUpQuestions: [],
    };
  }
}
