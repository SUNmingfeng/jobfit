// JobFit - 简历JD智能匹配分析器主逻辑

// 全局状态
let state = {
  resumeFile: null,
  resumeText: '',
  resumeParsed: null,
  jobInfo: null,
  analysisResult: null,
  isBossPage: false,
  currentUrl: '',
  selectedLLM: 'kimi'
};

// DOM 元素
let elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 配置 PDF.js worker 路径
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.js');
  }
  
  initElements();
  bindEvents();
  await checkUrlAndLoadState();
});

// 初始化DOM元素引用
function initElements() {
  elements = {
    // LLM选择
    llmOptions: document.querySelectorAll('input[name="llm"]'),
    
    // 上传相关
    uploadArea: document.getElementById('uploadArea'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInput: document.getElementById('fileInput'),
    fileSelected: document.getElementById('fileSelected'),
    fileName: document.getElementById('fileName'),
    deleteBtn: document.getElementById('deleteBtn'),
    cacheStatus: document.getElementById('cacheStatus'),
    
    // 职位预览
    jobPreviewSection: document.getElementById('jobPreviewSection'),
    jobContent: document.getElementById('jobContent'),
    
    // 错误提示
    errorSection: document.getElementById('errorSection'),
    errorUrl: document.getElementById('errorUrl'),
    
    // 按钮和状态
    uploadSection: document.getElementById('uploadSection'),
    actionSection: document.getElementById('actionSection'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    loadingSection: document.getElementById('loadingSection'),
    loadingText: document.getElementById('loadingText'),
    loadingSubtext: document.getElementById('loadingSubtext'),
    resultSection: document.getElementById('resultSection'),
    
    // 结果相关
    scoreProgress: document.getElementById('scoreProgress'),
    scoreNumber: document.getElementById('scoreNumber'),
    scoreRating: document.getElementById('scoreRating'),
    scoreSummary: document.getElementById('scoreSummary'),
    matchedHeader: document.getElementById('matchedHeader'),
    matchedContent: document.getElementById('matchedContent'),
    matchedCount: document.getElementById('matchedCount'),
    unmatchedHeader: document.getElementById('unmatchedHeader'),
    unmatchedContent: document.getElementById('unmatchedContent'),
    unmatchedCount: document.getElementById('unmatchedCount'),
    suggestionsList: document.getElementById('suggestionsList'),
    
    // 底部按钮
    copyBtn: document.getElementById('copyBtn'),
    exportBtn: document.getElementById('exportBtn'),
    restartBtn: document.getElementById('restartBtn')
  };
}

// 绑定事件
function bindEvents() {
  // LLM选择
  elements.llmOptions.forEach(radio => {
    radio.addEventListener('change', handleLLMChange);
  });
  
  // 文件上传
  elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileSelect);
  elements.uploadArea.addEventListener('dragover', handleDragOver);
  elements.uploadArea.addEventListener('dragleave', handleDragLeave);
  elements.uploadArea.addEventListener('drop', handleDrop);
  elements.deleteBtn.addEventListener('click', clearFile);
  
  // 分析按钮
  elements.analyzeBtn.addEventListener('click', startAnalysis);
  
  // 折叠/展开
  elements.matchedHeader.addEventListener('click', () => toggleGroup(elements.matchedHeader));
  elements.unmatchedHeader.addEventListener('click', () => toggleGroup(elements.unmatchedHeader));
  
  // 底部按钮
  elements.copyBtn.addEventListener('click', copyResult);
  elements.exportBtn.addEventListener('click', exportReport);
  elements.restartBtn.addEventListener('click', restart);
}

// 加载保存的LLM选择
function loadSavedLLM() {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_LLM);
  if (saved && CONFIG.LLM_CONFIGS[saved]) {
    state.selectedLLM = saved;
    const radio = document.querySelector(`input[name="llm"][value="${saved}"]`);
    if (radio) radio.checked = true;
  }
}

// LLM选择变化处理
function handleLLMChange(e) {
  state.selectedLLM = e.target.value;
  localStorage.setItem(CONFIG.STORAGE_KEYS.SELECTED_LLM, state.selectedLLM);
}

// 获取当前LLM配置
function getCurrentLLMConfig() {
  return CONFIG.LLM_CONFIGS[state.selectedLLM] || CONFIG.LLM_CONFIGS[CONFIG.DEFAULT_LLM];
}

// 检查URL并加载缓存状态
async function checkUrlAndLoadState() {
  try {
    loadSavedLLM();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    state.currentUrl = tab.url;
    
    state.isBossPage = CONFIG.isBossUrl(state.currentUrl);
    
    if (state.isBossPage) {
      elements.jobPreviewSection.style.display = 'block';
      elements.errorSection.style.display = 'none';
      await fetchJobInfo();
    } else {
      elements.jobPreviewSection.style.display = 'none';
      elements.errorSection.style.display = 'block';
      elements.errorUrl.textContent = `当前页面: ${state.currentUrl}`;
      elements.analyzeBtn.disabled = true;
    }
    
    await loadCachedResume();
    
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 从缓存加载简历
async function loadCachedResume() {
  try {
    const data = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.RESUME_PARSE,
      CONFIG.STORAGE_KEYS.RESUME_TEXT,
      CONFIG.STORAGE_KEYS.SESSION_TIMESTAMP
    ]);
    
    const timestamp = data[CONFIG.STORAGE_KEYS.SESSION_TIMESTAMP];
    const now = Date.now();
    
    if (timestamp && (now - timestamp) < CONFIG.SESSION_MAX_AGE) {
      state.resumeParsed = data[CONFIG.STORAGE_KEYS.RESUME_PARSE];
      state.resumeText = data[CONFIG.STORAGE_KEYS.RESUME_TEXT];
      
      if (state.resumeParsed) {
        elements.cacheStatus.style.display = 'flex';
        updateAnalyzeButton();
      }
    } else {
      await clearCache();
    }
  } catch (error) {
    console.error('加载缓存失败:', error);
  }
}

// 清理缓存
async function clearCache() {
  await chrome.storage.local.remove([
    CONFIG.STORAGE_KEYS.RESUME_PARSE,
    CONFIG.STORAGE_KEYS.RESUME_TEXT,
    CONFIG.STORAGE_KEYS.SESSION_TIMESTAMP
  ]);
}

// 获取职位信息
async function fetchJobInfo() {
  try {
    elements.jobContent.innerHTML = '<p class="job-placeholder">正在获取职位信息...</p>';
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobInfoFromBoss
    });
    
    if (results && results[0] && results[0].result) {
      state.jobInfo = results[0].result;
      displayJobInfo(state.jobInfo);
      updateAnalyzeButton();
    } else {
      elements.jobContent.innerHTML = '<p class="job-placeholder">未能获取职位信息，请刷新页面重试</p>';
    }
  } catch (error) {
    console.error('获取职位信息失败:', error);
    elements.jobContent.innerHTML = '<p class="job-placeholder">获取职位信息失败</p>';
  }
}

// 在页面上下文中执行的函数
function extractJobInfoFromBoss() {
  const jobInfo = {
    title: '',
    company: '',
    salary: '',
    location: '',
    experience: '',
    education: '',
    description: '',
    url: window.location.href
  };
  
  try {
    const titleSelectors = ['.job-name', '.job-title', 'h1', '.name'];
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.title = el.textContent.trim();
        break;
      }
    }
    
    const companySelectors = ['.company-name', '.company', '[class*="company-name"]'];
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.company = el.textContent.trim();
        break;
      }
    }
    
    const salarySelectors = ['.salary', '.job-salary', '[class*="salary"]'];
    for (const selector of salarySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.salary = el.textContent.trim();
        break;
      }
    }
    
    const descSelectors = ['.job-sec-text', '.job-description', '.job-sec .text'];
    for (const selector of descSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim().length > 50) {
        jobInfo.description = el.textContent.trim().substring(0, 1000);
        break;
      }
    }
    
  } catch (error) {
    console.error('提取职位信息失败:', error);
  }
  
  return jobInfo;
}

// 显示职位信息
function displayJobInfo(jobInfo) {
  if (!jobInfo) return;
  
  let html = '';
  if (jobInfo.title) html += `<h4>${jobInfo.title}</h4>`;
  if (jobInfo.company) html += `<p><strong>公司:</strong> ${jobInfo.company}</p>`;
  if (jobInfo.salary) html += `<p><strong>薪资:</strong> ${jobInfo.salary}</p>`;
  if (jobInfo.location) html += `<p><strong>地点:</strong> ${jobInfo.location}</p>`;
  
  elements.jobContent.innerHTML = html || '<p class="job-placeholder">职位信息加载中...</p>';
}

// 文件选择处理
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

// 拖拽处理
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadArea.classList.remove('dragover');
  
  const file = e.dataTransfer.files[0];
  if (file && isValidFileType(file)) {
    processFile(file);
  } else {
    alert('请上传 PDF 或 Word 格式的文件');
  }
}

// 检查文件类型
function isValidFileType(file) {
  return file.type === 'application/pdf' || 
         file.type === 'application/msword' || 
         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

// 处理文件
async function processFile(file) {
  await clearCache();
  state.resumeParsed = null;
  elements.cacheStatus.style.display = 'none';
  
  state.resumeFile = file;
  elements.fileName.textContent = file.name;
  elements.uploadArea.style.display = 'none';
  elements.fileSelected.style.display = 'flex';
  
  elements.loadingSection.style.display = 'block';
  elements.uploadSection.style.display = 'none';
  elements.actionSection.style.display = 'none';
  elements.jobPreviewSection.style.display = 'none';
  elements.errorSection.style.display = 'none';
  elements.loadingText.textContent = '正在解析简历...';
  elements.loadingSubtext.textContent = 'AI正在提取简历关键信息';
  
  try {
    let text = '';
    if (file.type === 'application/pdf') {
      text = await extractPdfText(file);
    } else if (file.type.includes('word')) {
      text = await extractWordText(file);
    }
    state.resumeText = text;
    
    const llmName = getCurrentLLMConfig().name;
    elements.loadingText.textContent = `${llmName}正在解析简历...`;
    state.resumeParsed = await parseResumeWithKimi(text);
    
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.RESUME_PARSE]: state.resumeParsed,
      [CONFIG.STORAGE_KEYS.RESUME_TEXT]: state.resumeText,
      [CONFIG.STORAGE_KEYS.SESSION_TIMESTAMP]: Date.now()
    });
    
    elements.loadingSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    elements.fileSelected.style.display = 'flex';
    elements.cacheStatus.style.display = 'flex';
    
    if (state.isBossPage) {
      elements.jobPreviewSection.style.display = 'block';
      await fetchJobInfo();
    } else {
      elements.errorSection.style.display = 'block';
    }
    elements.actionSection.style.display = 'block';
    
    updateAnalyzeButton();
    
  } catch (error) {
    console.error('文件解析失败:', error);
    alert('简历解析失败: ' + error.message);
    
    elements.loadingSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    elements.uploadArea.style.display = 'block';
    elements.fileSelected.style.display = 'none';
    clearFile();
  }
}

// 提取PDF文本
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  
  return text;
}

// 提取Word文本
async function extractWordText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// 使用AI解析简历
async function parseResumeWithKimi(resumeText) {
  const prompt = `
请解析以下简历内容，提取关键信息并以JSON格式返回。

简历内容：
${resumeText.substring(0, 8000)}

请提取以下信息并以JSON格式返回：
{
  "name": "姓名",
  "education": { "school": "", "major": "", "degree": "" },
  "workExperience": [{ "company": "", "position": "", "duration": "" }],
  "skills": ["技能1", "技能2"],
  "summary": "简历核心亮点",
  "totalYears": 0
}

只返回JSON，不要有其他文字。`;

  const response = await callKimiAPI(prompt, 0.3);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析简历结构');
  } catch (error) {
    return {
      summary: response.substring(0, 300),
      skills: [],
      totalYears: 0,
      rawText: resumeText
    };
  }
}

// 调用AI API
async function callKimiAPI(prompt, temperature = 0.7) {
  const llmConfig = getCurrentLLMConfig();
  
  const response = await fetch(llmConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${llmConfig.apiKey}`
    },
    body: JSON.stringify({
      model: llmConfig.model,
      messages: [
        { role: 'system', content: llmConfig.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: temperature
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API调用失败: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// 清除文件
async function clearFile() {
  state.resumeFile = null;
  state.resumeText = '';
  state.resumeParsed = null;
  
  await clearCache();
  
  elements.fileInput.value = '';
  elements.fileSelected.style.display = 'none';
  elements.cacheStatus.style.display = 'none';
  elements.uploadArea.style.display = 'block';
  updateAnalyzeButton();
}

// 更新分析按钮状态
function updateAnalyzeButton() {
  const canAnalyze = state.isBossPage && state.resumeParsed && state.jobInfo;
  elements.analyzeBtn.disabled = !canAnalyze;
}

// 开始分析
async function startAnalysis() {
  if (!state.isBossPage || !state.resumeParsed || !state.jobInfo) {
    alert('请确保在BOSS直聘职位页并已上传简历');
    return;
  }
  
  elements.uploadSection.style.display = 'none';
  elements.actionSection.style.display = 'none';
  elements.jobPreviewSection.style.display = 'none';
  elements.errorSection.style.display = 'none';
  
  const llmName = getCurrentLLMConfig().name;
  elements.loadingSection.style.display = 'block';
  elements.loadingText.textContent = '正在分析匹配度...';
  elements.loadingSubtext.textContent = `${llmName}正在对比简历与职位要求`;
  
  try {
    state.analysisResult = await analyzeMatchWithKimi(state.resumeParsed, state.jobInfo);
    displayResult(state.analysisResult);
    
    elements.loadingSection.style.display = 'none';
    elements.resultSection.style.display = 'block';
    
  } catch (error) {
    console.error('分析失败:', error);
    alert('分析失败: ' + error.message);
    
    elements.loadingSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    elements.actionSection.style.display = 'block';
    if (state.isBossPage) {
      elements.jobPreviewSection.style.display = 'block';
    }
  }
}

// 分析匹配度
async function analyzeMatchWithKimi(resumeParsed, jobInfo) {
  const prompt = `
请作为资深HR分析以下简历与职位的匹配度。

【简历信息】
${JSON.stringify(resumeParsed, null, 2)}

【职位信息】
${JSON.stringify(jobInfo, null, 2)}

请提供分析结果（JSON格式）：

{
  "score": 75,
  "rating": "良好匹配",
  "ratingClass": "good",
  "summary": "一句话总结",
  "matched": [
    {
      "item": "匹配项名称",
      "weight": "high/medium/low",
      "resumeEvidence": "简历证据",
      "jdRequirement": "JD要求",
      "matchScore": 90
    }
  ],
  "unmatched": [
    {
      "item": "不匹配项",
      "weight": "high/medium/low",
      "resumeStatus": "简历情况",
      "jdRequirement": "JD要求",
      "suggestion": "改进建议"
    }
  ],
  "suggestions": ["建议1", "建议2", "建议3"]
}

规则：
1. matched项：JD明确要求且简历匹配的内容
2. unmatched项：仅当JD明确要求但简历缺失/不符时才列出
3. JD未提及的内容不要列入unmatched
4. 分析要具体、有参考价值
5. 只返回JSON
`;

  const response = await callKimiAPI(prompt, 0.5);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析匹配结果');
  } catch (error) {
    return {
      score: 60,
      rating: "分析完成",
      ratingClass: "average",
      summary: response.substring(0, 200),
      matched: [],
      unmatched: [],
      suggestions: ["AI返回格式异常"]
    };
  }
}

// 显示结果
function displayResult(result) {
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - ((result.score || 0) / 100) * circumference;
  
  elements.scoreProgress.style.strokeDasharray = circumference;
  elements.scoreProgress.style.strokeDashoffset = offset;
  
  animateNumber(elements.scoreNumber, result.score || 0, '%');
  
  elements.scoreRating.textContent = result.rating || '分析完成';
  elements.scoreRating.className = `score-rating ${result.ratingClass || 'average'}`;
  elements.scoreSummary.textContent = result.summary || '';
  
  // 匹配项
  const matched = result.matched || [];
  elements.matchedCount.textContent = `(${matched.length})`;
  elements.matchedContent.innerHTML = matched.map(item => `
    <div class="match-item">
      <div class="match-item-header">
        <span class="match-item-title">${item.item || '未命名'}</span>
        <span class="match-item-weight ${item.weight || 'medium'}">${item.weight === 'high' ? '高' : item.weight === 'medium' ? '中' : '低'}权重</span>
      </div>
      <div class="match-item-detail">简历: ${item.resumeEvidence || '未提供'}</div>
      <div class="match-item-detail">JD要求: ${item.jdRequirement || '未提供'}</div>
      <div class="match-item-score matched">匹配度: ${item.matchScore || 80}%</div>
    </div>
  `).join('') || '<div class="match-item"><p class="no-data">暂无匹配项</p></div>';
  
  // 不匹配项
  const unmatched = result.unmatched || [];
  elements.unmatchedCount.textContent = `(${unmatched.length})`;
  elements.unmatchedContent.innerHTML = unmatched.map(item => `
    <div class="match-item">
      <div class="match-item-header">
        <span class="match-item-title">${item.item || '未命名'}</span>
        <span class="match-item-weight ${item.weight || 'medium'}">${item.weight === 'high' ? '高' : item.weight === 'medium' ? '中' : '低'}权重</span>
      </div>
      <div class="match-item-detail">JD要求: ${item.jdRequirement || '未提供'}</div>
      <div class="match-item-detail">简历状态: ${item.resumeStatus || '未提及'}</div>
      <div class="match-item-suggestion">💡 建议: ${item.suggestion || '建议补充'}</div>
    </div>
  `).join('') || '<div class="match-item"><p class="no-data">无不匹配项</p></div>';
  
  // 优化建议
  const suggestions = result.suggestions || [];
  elements.suggestionsList.innerHTML = suggestions.map((s, i) => `
    <li><strong>${i + 1}.</strong> ${s}</li>
  `).join('') || '<li>暂无建议</li>';
}

// 数字动画
function animateNumber(element, target, suffix = '') {
  let current = 0;
  const duration = 1000;
  const step = target / (duration / 16);
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + suffix;
  }, 16);
}

// 折叠/展开
function toggleGroup(header) {
  header.classList.toggle('collapsed');
}

// 复制结果
function copyResult() {
  if (!state.analysisResult) return;
  
  const result = state.analysisResult;
  const text = `
JobFit 简历匹配分析报告
========================

职位: ${state.jobInfo?.title || '未知'}
公司: ${state.jobInfo?.company || '未知'}
匹配度: ${result.score || 0}%
评级: ${result.rating || '分析完成'}

✅ 匹配的项目 (${result.matched?.length || 0}项):
${result.matched?.map(m => `- ${m.item}: ${m.matchScore || 80}%`).join('\n') || '无'}

❌ 不匹配的项目 (${result.unmatched?.length || 0}项):
${result.unmatched?.map(u => `- ${u.item}: ${u.suggestion || '建议补充'}`).join('\n') || '无'}

💡 优化建议:
${result.suggestions?.map((s, i) => `${i + 1}. ${s}`).join('\n') || '无'}
  `.trim();
  
  navigator.clipboard.writeText(text).then(() => {
    elements.copyBtn.textContent = '✅ 已复制';
    setTimeout(() => elements.copyBtn.textContent = '📋 复制结果', 2000);
  });
}

// 导出报告
function exportReport() {
  if (!state.analysisResult || !state.jobInfo) return;
  
  const reportData = {
    timestamp: new Date().toISOString(),
    jobInfo: state.jobInfo,
    resumeSummary: state.resumeParsed?.summary || '',
    analysis: state.analysisResult
  };
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JobFit分析报告_${state.jobInfo.title || '职位'}_${new Date().toLocaleDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  elements.exportBtn.textContent = '✅ 已导出';
  setTimeout(() => elements.exportBtn.textContent = '💾 导出报告', 2000);
}

// 重新分析
function restart() {
  state.analysisResult = null;
  
  elements.resultSection.style.display = 'none';
  elements.uploadSection.style.display = 'block';
  elements.actionSection.style.display = 'block';
  
  if (state.resumeParsed) {
    elements.fileSelected.style.display = 'flex';
    elements.cacheStatus.style.display = 'flex';
    elements.uploadArea.style.display = 'none';
  } else {
    elements.fileSelected.style.display = 'none';
    elements.cacheStatus.style.display = 'none';
    elements.uploadArea.style.display = 'block';
  }
  
  if (state.isBossPage) {
    elements.jobPreviewSection.style.display = 'block';
    elements.errorSection.style.display = 'none';
    fetchJobInfo();
  } else {
    elements.jobPreviewSection.style.display = 'none';
    elements.errorSection.style.display = 'block';
  }
  
  elements.scoreProgress.style.strokeDashoffset = 314;
  elements.scoreNumber.textContent = '0%';
  elements.scoreRating.textContent = '分析中...';
  elements.scoreRating.className = 'score-rating';
  elements.scoreSummary.textContent = '';
  
  updateAnalyzeButton();
}
