
export interface GeneratePromptRequest {
  userInput: string;
  style: 'concise' | 'detailed' | 'professional';
  language: 'zh' | 'en';
}

export interface GeneratePromptResponse {
  success: boolean;
  prompt?: string;
  error?: string;
}

class AIService {
  private getSystemPrompt(style: string, language: string): string {
    const prompts = {
      zh: {
        concise: `你是一个专业的提示词工程师。用户会向你描述他们想要AI帮助完成的任务，你需要将这些描述转换为简洁、有效的AI提示词。

要求：
1. 生成的提示词要简洁明了，直接有效
2. 包含明确的角色设定和任务描述
3. 确保生成的提示词能让AI产生高质量的回答
4. 长度控制在200字以内

请直接输出优化后的提示词，不要包含解释或其他内容。`,

        detailed: `你是一个资深的提示词工程专家，擅长将用户的简单描述转换为结构化、专业的AI提示词。

你的任务是根据用户的描述，生成一个详细、专业的AI提示词。生成的提示词应该包含：

1. 角色设定：为AI设定一个专业的身份
2. 任务描述：清晰地说明AI需要完成的任务
3. 输出要求：明确指定输出的格式、风格、长度等
4. 质量标准：确保输出内容的质量和准确性

生成的提示词应该：
- 结构清晰，逻辑性强
- 包含具体的要求和约束
- 能够引导AI产生高质量、有针对性的回答
- 长度适中，既详细又不冗余

请直接输出优化后的提示词，确保其专业性和实用性。`,

        professional: `你是一位提示词工程领域的专家，具有丰富的企业级AI应用经验。你的专长是将用户的业务需求转换为高效、专业的AI提示词。

请根据用户描述的需求，创建一个企业级标准的AI提示词，要求：

结构要求：
1. 明确的角色定义（包含专业背景和能力）
2. 详细的任务描述（包含背景信息和具体目标）
3. 清晰的输出规范（格式、结构、质量标准）
4. 必要的约束条件（避免的内容、注意事项等）

质量标准：
- 符合企业应用场景的专业性
- 具备可重复性和一致性
- 能够产生标准化的高质量输出
- 包含充分的上下文信息

请生成一个完整、专业的提示词，确保其在企业环境中的有效性和实用性。`
      },
      en: {
        concise: `You are a professional prompt engineer. Users will describe tasks they want AI to help with, and you need to convert these descriptions into concise, effective AI prompts.

Requirements:
1. Generated prompts should be concise and effective
2. Include clear role setting and task description
3. Ensure the generated prompt can make AI produce high-quality responses
4. Keep length under 200 words

Please output the optimized prompt directly without explanations.`,

        detailed: `You are a senior prompt engineering expert, skilled at converting users' simple descriptions into structured, professional AI prompts.

Your task is to generate a detailed, professional AI prompt based on the user's description. The generated prompt should include:

1. Role Setting: Set a professional identity for the AI
2. Task Description: Clearly explain what the AI needs to accomplish
3. Output Requirements: Specify the format, style, length, etc. of the output
4. Quality Standards: Ensure the quality and accuracy of the output content

The generated prompt should be:
- Well-structured and logical
- Include specific requirements and constraints
- Guide AI to produce high-quality, targeted responses
- Appropriate length, detailed but not redundant

Please output the optimized prompt directly, ensuring its professionalism and practicality.`,

        professional: `You are an expert in prompt engineering with extensive experience in enterprise-level AI applications. You specialize in converting users' business requirements into efficient, professional AI prompts.

Please create an enterprise-standard AI prompt based on the user's described needs, with requirements:

Structure Requirements:
1. Clear role definition (including professional background and capabilities)
2. Detailed task description (including background information and specific goals)
3. Clear output specifications (format, structure, quality standards)
4. Necessary constraints (content to avoid, considerations, etc.)

Quality Standards:
- Professional quality suitable for enterprise application scenarios
- Repeatability and consistency
- Ability to produce standardized high-quality outputs
- Include sufficient contextual information

Please generate a complete, professional prompt that ensures effectiveness and practicality in enterprise environments.`
      }
    };

    return prompts[language as keyof typeof prompts][style as keyof typeof prompts.zh];
  }

  async generatePrompt(request: GeneratePromptRequest, apiKey: string): Promise<GeneratePromptResponse> {
    if (!apiKey) {
      return {
        success: false,
        error: '未配置 OpenAI API Key，请在设置中添加或使用 VITE_OPENAI_API_KEY 环境变量'
      };
    }

    if (!request.userInput.trim()) {
      return {
        success: false,
        error: '请输入你想要AI帮助完成的任务描述'
      };
    }

    try {
      const systemPrompt = this.getSystemPrompt(request.style, request.language);
      
      const response = await fetch('https://yunwu.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: request.userInput
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 调用失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API 返回数据格式错误');
      }

      const generatedPrompt = data.choices[0].message.content.trim();
      
      return {
        success: true,
        prompt: generatedPrompt
      };

    } catch (error) {
      console.error('AI 服务错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成提示词时发生未知错误'
      };
    }
  }

}

export const aiService = new AIService();
