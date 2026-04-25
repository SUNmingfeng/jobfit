// API 配置
// 请替换为您的API密钥
const CONFIG = {
  // 默认使用的LLM
  DEFAULT_LLM: 'kimi',
  
  // LLM配置 - 添加新模型只需在此添加配置
  LLM_CONFIGS: {
    kimi: {
      name: 'Kimi',
      icon: '🌙',
      description: 'Moonshot AI',
      apiKey: 'sk-JHE9BPzgjxjTbe38lhBEiLXWzrUeStdRerJbqEUp7YrKrx2a',  // 请替换为Kimi API密钥
      apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshot-v1-8k',
      systemPrompt: '你是一个专业的简历分析助手，擅长提取和结构化简历信息。'
    },
    deepseek: {
      name: 'DeepSeek',
      icon: '🔮',
      description: '深度求索',
      apiKey: 'sk-8ed503daf1094cad8beb5d4a70255068',  // 请替换为DeepSeek API密钥
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      systemPrompt: '你是一个专业的简历分析助手，擅长提取和结构化简历信息。'
    }
    // 添加新模型示例：
    // openai: {
    //   name: 'OpenAI',
    //   icon: '🤖',
    //   description: 'GPT-4',
    //   apiKey: 'sk-your-openai-key',
    //   apiUrl: 'https://api.openai.com/v1/chat/completions',
    //   model: 'gpt-4',
    //   systemPrompt: '你是一个专业的简历分析助手。'
    // }
  },
  
  // BOSS直聘URL匹配模式
  isBossUrl: (url) => {
    return url && url.startsWith('https://www.zhipin.com/web/geek/jobs');
  },
  
  // 缓存键名
  STORAGE_KEYS: {
    RESUME_PARSE: 'jobfit_resume_parsed',
    RESUME_TEXT: 'jobfit_resume_text',
    SESSION_TIMESTAMP: 'jobfit_session_timestamp',
    SELECTED_LLM: 'jobfit_selected_llm'
  },
  
  // 会话有效期（毫秒）- 7天
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000
};

// 获取当前LLM配置
function getCurrentLLMConfig() {
  const selectedLLM = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_LLM) || CONFIG.DEFAULT_LLM;
  return CONFIG.LLM_CONFIGS[selectedLLM] || CONFIG.LLM_CONFIGS[CONFIG.DEFAULT_LLM];
}

// 获取所有可用的LLM列表（用于动态填充下拉框）
function getAvailableLLMs() {
  return Object.entries(CONFIG.LLM_CONFIGS).map(([key, config]) => ({
    key: key,
    name: config.name,
    icon: config.icon || '🤖',
    description: config.description || ''
  }));
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getCurrentLLMConfig, getAvailableLLMs };
}
