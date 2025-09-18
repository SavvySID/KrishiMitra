export class AIService {
  // Provider selection: prefer Groq if configured, else Gemini
  private readonly groqKey: string =
    import.meta.env.VITE_GROQ_API_KEY;
  private readonly groqModel: string =
    import.meta.env.VITE_GROQ_MODEL ||
    'llama-3.1-8b-instant';

  async getCropAdvisory(prompt: string, language: 'en' | 'hi' | 'pa' | 'regional' = 'en'): Promise<string> {
    const system = this.buildSystemPrompt(language);
    const body = {
      contents: [
        { role: 'user', parts: [{ text: system + '\n\nUser query: ' + prompt }] }
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512
      }
    } as any;
    console.log(this.groqKey)
    const useGroq = Boolean(this.groqKey);
    console.log(useGroq)
    const doCall = async (): Promise<string> => {
      if (useGroq) {
        // Groq OpenAI-compatible Chat Completions
        const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

        const tryGroq = async (model: string): Promise<string> => {
          const groqBody: any = {
            model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt }
            ],
            temperature: 0.6,
            max_tokens: 512
          };
          const resp = await fetch(groqUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.groqKey}`
            },
            body: JSON.stringify(groqBody)
          });
          let data: any = null;
          try { data = await resp.json(); } catch {}
          if (!resp.ok) {
            const msg = data?.error?.message || data?.message || `HTTP ${resp.status}`;
            throw new Error(msg);
          }
          const text = data?.choices?.[0]?.message?.content.replaceAll("*",'') || '';
          return text || 'No advice available.';
        };

        // Primary then fallbacks for deprecated/invalid models
        const fallbackModels = [
          this.groqModel,
          'llama-3.2-11b-text-preview',
          'llama-3.1-8b-instant',
          'mixtral-8x7b-32768'
        ];
        let lastErr: any = null;
        for (const m of fallbackModels) {
          try {
            return await tryGroq(m);
          } catch (e: any) {
            lastErr = e;
            const msg = (e?.message || '').toLowerCase();
            // continue to next model on deprecation/invalid model errors
            if (msg.includes('decommission') || msg.includes('invalid') || msg.includes('model')) {
              continue;
            }
            throw e;
          }
        }
        throw lastErr || new Error('Groq request failed');
      } else {
        // Fallback to Gemini if Groq is not available
        const geminiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error('No AI API key configured');
        }
        
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const geminiResp = await fetch(`${geminiUrl}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (!geminiResp.ok) {
          throw new Error(`Gemini API error: ${geminiResp.status}`);
        }
        
        const geminiData = await geminiResp.json();
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text || 'No advice available.';
      }
    };

    try {
      try {
        return await doCall();
      } catch {
        // brief retry once
        return await doCall();
      }
    } catch (err) {
      console.warn('AI advisory failed:', err);
      return `Sorry, I could not generate advice. ${err instanceof Error ? err.message : ''}`.trim();
    }
  }

  private buildSystemPrompt(language: 'en' | 'hi' | 'pa' | 'regional'): string {
    const base = 'You are KrishiMitra, an agricultural advisor for Indian farmers. Provide concise, actionable, safety-first crop advisory using Integrated Pest Management (IPM) with cultural, biological, and chemical (as last resort) measures. Include bullets for: What to check, Immediate steps, Prevention, and If severity is high. Keep response under 200 words.';
    switch (language) {
      case 'hi':
        return base + ' उत्तर हिंदी में दें। सरल भाषा का उपयोग करें।';
      case 'pa':
        return base + ' ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ। ਸੌਖੀ ਭਾਸ਼ਾ ਵਰਤੋਂ।';
      default:
        return base + ' Answer in English in simple terms.';
    }
  }
}


