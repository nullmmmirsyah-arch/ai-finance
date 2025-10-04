import OpenAI from 'openai';

interface RawInsight {
  type?: string;
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'ExpenseTracker AI',
  },
});

export interface FinancialRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

export async function generateFinancialInsights(
  income: FinancialRecord[],
  expenses: FinancialRecord[]
): Promise<AIInsight[]> {
  try {
    const incomeSummary = income.map((inc) => ({
      amount: inc.amount,
      category: inc.category,
      description: inc.description,
      date: inc.date,
    }));

    const expensesSummary = expenses.map((exp) => ({
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
      date: exp.date,
    }));

    const prompt = `Analyze the following financial data and provide 3-4 actionable insights. 
    Return a JSON array of insights with this structure:
    {
      "type": "warning|info|success|tip",
      "title": "Brief title",
      "message": "Detailed insight message with specific numbers when possible",
      "action": "Actionable suggestion",
      "confidence": 0.8
    }

    Income Data:
    ${JSON.stringify(incomeSummary, null, 2)}

    Expense Data:
    ${JSON.stringify(expensesSummary, null, 2)}

    Focus on:
    1. Income vs. Expense comparison
    2. Spending patterns (day of week, categories)
    3. Budget alerts (high spending areas)
    4. Savings opportunities
    5. Positive reinforcement for good habits

    Return only valid JSON array, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        {
          role: 'system',
          content:
            'You are a financial advisor AI that analyzes financial data and provides actionable insights. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
    }

    const insights = JSON.parse(cleanedResponse);

    const formattedInsights = insights.map(
      (insight: RawInsight, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: insight.type || 'info',
        title: insight.title || 'AI Insight',
        message: insight.message || 'Analysis complete',
        action: insight.action,
        confidence: insight.confidence || 0.8,
      })
    );

    return formattedInsights;
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);

    return [
      {
        id: 'fallback-1',
        type: 'info',
        title: 'AI Analysis Unavailable',
        message:
          'Unable to generate personalized insights at this time. Please try again later.',
        action: 'Refresh insights',
        confidence: 0.5,
      },
    ];
  }
}

export async function categorizeIncome(description: string): Promise<string> {
  // For now, we'll use a simple hardcoded logic.
  const lowerCaseDescription = description.toLowerCase();
  if (lowerCaseDescription.includes('gaji') || lowerCaseDescription.includes('salary')) {
    return 'Gaji';
  }
  return 'Other';
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        {
          role: 'system',
          content:
            'You are an expense categorization AI. Categorize expenses into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. Respond with only the category name.',
        },
        {
          role: 'user',
          content: `Categorize this expense: "${description}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const category = completion.choices[0].message.content?.trim();

    const validCategories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Other',
    ];

    const finalCategory = validCategories.includes(category || '')
      ? category!
      : 'Other';
    return finalCategory;
  } catch (error) {
    console.error('❌ Error categorizing expense:', error);
    return 'Other';
  }
}

export async function generateAIAnswer(
  question: string,
  context: FinancialRecord[]
): Promise<string> {
  try {
    const contextSummary = context.map((record) => ({
      amount: record.amount,
      category: record.category,
      description: record.description,
      date: record.date,
    }));

    const prompt = `Based on the following financial data, provide a detailed and actionable answer to this question: "${question}"

    Financial Data:
    ${JSON.stringify(contextSummary, null, 2)}

    Provide a comprehensive answer that:
    1. Addresses the specific question directly
    2. Uses concrete data from the records when possible
    3. Offers actionable advice
    4. Keeps the response concise but informative (2-3 sentences)
    
    Return only the answer text, no additional formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful financial advisor AI that provides specific, actionable answers based on financial data. Be concise but thorough.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return response.trim();
  } catch (error) {
    console.error('❌ Error generating AI answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}