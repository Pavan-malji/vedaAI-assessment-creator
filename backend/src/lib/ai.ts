import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { AssignmentConfig, QuestionPaper } from '../types';

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. API calls will fail.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const sectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    difficulty: z.string().transform(v => v.toLowerCase() as 'easy' | 'medium' | 'hard'),
    marks: z.number()
  }))
});

const questionPaperSchema = z.object({
  sections: z.array(sectionSchema)
});

const buildFallbackQuestionPaper = (config: AssignmentConfig): QuestionPaper => {
  const totalQuestions = Math.max(1, config.numberOfQuestions || 1);
  const sectionsCount = Math.max(1, Math.min(config.questionTypes.length || 1, totalQuestions));
  const baseCount = Math.floor(totalQuestions / sectionsCount);
  let remainder = totalQuestions % sectionsCount;

  const topics = [
    config.topic,
    config.subject,
    ...(config.additionalInstructions ? [config.additionalInstructions] : []),
  ].filter(Boolean);

  const questionTypes = config.questionTypes.length > 0 ? config.questionTypes : ['General Questions'];

  const sections = Array.from({ length: sectionsCount }, (_, sectionIndex) => {
    const sectionTitle = `Section ${String.fromCharCode(65 + sectionIndex)}`;
    const questionCount = baseCount + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);

    const questions = Array.from({ length: Math.max(1, questionCount) }, (_, questionIndex) => {
      const globalIndex = sectionIndex * totalQuestions + questionIndex + 1;
      const questionType = questionTypes[(sectionIndex + questionIndex) % questionTypes.length];
      const topic = topics[(sectionIndex + questionIndex) % topics.length] || config.subject;
      const difficulty: 'easy' | 'medium' | 'hard' = questionIndex % 3 === 0
        ? 'easy'
        : questionIndex % 3 === 1
          ? 'medium'
          : 'hard';

      return {
        id: String(globalIndex),
        text: `${questionType} based question ${globalIndex} on ${topic}`,
        difficulty,
        marks: config.marksPerQuestion,
      };
    });

    return {
      title: sectionTitle,
      instruction: sectionIndex === 0 ? 'Attempt all questions.' : 'Answer the questions in this section.',
      questions,
    };
  });

  return { sections };
};

export const generateQuestionPaper = async (config: AssignmentConfig): Promise<QuestionPaper> => {
  try {
    const prompt = `
Generate a question paper based on the following config:
Subject: ${config.subject}
Topic: ${config.topic}
Question Types: ${config.questionTypes.join(', ')}
Total Marks: ${config.totalMarks}
Number of Questions: ${config.numberOfQuestions}
Marks Per Question: ${config.marksPerQuestion}
Instructions: ${config.additionalInstructions}

Organize the paper into sections.
Keep each question concise, and do not add explanations, answers, or extra commentary.
Return exactly the requested number of questions and keep section instructions short.

The JSON schema must strictly follow this structure:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "id": "1",
          "text": "question text here",
          "difficulty": "easy" | "medium" | "hard",
          "marks": 5
        }
      ]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are an expert teacher. Respond ONLY with valid JSON. No markdown, no backticks, no explanation. Just raw JSON.',
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            sections: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  instruction: { type: SchemaType.STRING },
                  questions: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        id: { type: SchemaType.STRING },
                        text: { type: SchemaType.STRING },
                        difficulty: { type: SchemaType.STRING },
                        marks: { type: SchemaType.NUMBER }
                      },
                      required: ["id", "text", "difficulty", "marks"]
                    }
                  }
                },
                required: ["title", "instruction", "questions"]
              }
            }
          },
          required: ["sections"]
        }
      }
    });

    // Call the model with retries for transient failures (503s) and backoff
    const maxAttempts = 4;
    let attempt = 0;
    let bodyText: string | null = null;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        const result = await model.generateContent(prompt);
        bodyText = result.response.text();
        break;
      } catch (err: any) {
        lastError = err;
        const isTransient = err && (err.status === 503 || /high demand|Service Unavailable/i.test(err.message || ''));
        console.warn(`AI request attempt ${attempt} failed${isTransient ? ' (transient)' : ''}:`, err?.message || err);
        if (!isTransient || attempt >= maxAttempts) break;
        // exponential backoff
        const delay = 500 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (!bodyText) {
      console.error('AI generation failed after retries:', lastError);
      throw lastError || new Error('AI_REQUEST_FAILED');
    }

    // Safety fallback: try to clean markdown fences and extract the first top-level JSON object
    const cleanedText = bodyText.replace(/```json\n?|\n?```/g, '').trim();

    // Attempt direct parse first, then try to extract a balanced JSON block
    let jsonParsed: any = null;
    try {
      jsonParsed = JSON.parse(cleanedText);
    } catch (parseErr) {
      // Try to extract balanced JSON starting from first '{'
      const firstBrace = cleanedText.indexOf('{');
      if (firstBrace === -1) {
        console.error('No JSON object found in AI response. Raw response:', cleanedText);
        throw parseErr;
      }

      let depth = 0;
      let endIndex = -1;
      for (let i = firstBrace; i < cleanedText.length; i++) {
        const ch = cleanedText[i];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }

      if (endIndex === -1) {
        console.error('Could not find balanced JSON in AI response. Raw response:', cleanedText);
        throw parseErr;
      }

      const jsonSubstr = cleanedText.slice(firstBrace, endIndex + 1);
      try {
        jsonParsed = JSON.parse(jsonSubstr);
      } catch (finalErr) {
        console.error('Final JSON parse failed. Extracted text:', jsonSubstr);
        throw finalErr;
      }
    }

    const validatedData = questionPaperSchema.parse(jsonParsed);

    const hasQuestions = validatedData.sections.some((section) => section.questions.length > 0);
    if (!hasQuestions) {
      console.warn('AI returned an empty paper; using fallback generator.');
      return buildFallbackQuestionPaper(config);
    }

    return validatedData as QuestionPaper;
  } catch (error) {
    console.error('Error generating question paper, using fallback:', error);
    return buildFallbackQuestionPaper(config);
  }
};
