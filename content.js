// Content Script - 在BOSS直聘页面中提取职位信息

// 提取职位信息的函数
function extractJobInfoFromBoss() {
  const jobInfo = {
    title: '',
    company: '',
    salary: '',
    location: '',
    experience: '',
    education: '',
    jobType: '',
    description: '',
    requirements: '',
    companyInfo: '',
    tags: [],
    url: window.location.href,
    extractTime: new Date().toISOString()
  };
  
  try {
    // 职位名称 - 多个可能的选择器
    const titleSelectors = [
      '.job-name',
      '.job-title',
      'h1',
      '[class*="job-name"]',
      '[class*="position-name"]',
      '.name',
      'h1.name'
    ];
    
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.title = el.textContent.trim();
        break;
      }
    }
    
    // 公司名称
    const companySelectors = [
      '.company-name',
      '.company-title',
      '.company',
      '[class*="company-name"]',
      '[class*="company-title"]'
    ];
    
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.company = el.textContent.trim();
        break;
      }
    }
    
    // 薪资
    const salarySelectors = [
      '.salary',
      '.job-salary',
      '[class*="salary"]',
      '.money'
    ];
    
    for (const selector of salarySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        jobInfo.salary = el.textContent.trim();
        break;
      }
    }
    
    // 地点、经验、学历等信息通常在同一个区域
    const infoSelectors = [
      '.job-tags',
      '.job-info',
      '.job-tags span',
      '.job-primary .info',
      '.job-list .job-primary .info',
      '.job-primary .info-primary .tag-container',
      '.job-requirement'
    ];
    
    for (const selector of infoSelectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent.trim();
        
        // 提取地点
        if (!jobInfo.location && /[\u4e00-\u9fa5]+(市|区|省|县)/.test(text)) {
          const match = text.match(/([\u4e00-\u9fa5]+(市|区|省|县)[\u4e00-\u9fa5]*)/);
          if (match) jobInfo.location = match[1];
        }
        
        // 提取经验要求
        if (!jobInfo.experience && (/\d+.*年|经验|应届|在校/.test(text))) {
          const match = text.match(/(\d+.*年.*经验|应届.*生|在校.*生|经验.*不限)/);
          if (match) jobInfo.experience = match[1];
        }
        
        // 提取学历要求
        if (!jobInfo.education && (/本科|硕士|博士|大专|专科|学历/.test(text))) {
          const match = text.match(/(本科|硕士|博士|大专|专科|学历.*不限)/);
          if (match) jobInfo.education = match[1];
        }
      }
    }
    
    // 职位描述
    const descSelectors = [
      '.job-sec-text',
      '.job-description',
      '.job-sec .text',
      '[class*="job-description"]',
      '[class*="job-sec-text"]',
      '.detail-section .text',
      '.job-detail'
    ];
    
    for (const selector of descSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim().length > 100) {
        jobInfo.description = el.textContent.trim();
        break;
      }
    }
    
    // 团队介绍/公司信息
    const companyInfoSelectors = [
      '.company-sec .text',
      '.company-section .text',
      '.team-intro',
      '[class*="company-sec"]'
    ];
    
    for (const selector of companyInfoSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim().length > 50) {
        jobInfo.companyInfo = el.textContent.trim();
        break;
      }
    }
    
    // 提取标签/关键词
    const tagSelectors = [
      '.job-tags span',
      '.tag-container span',
      '.job-card .tags span',
      '[class*="tag"]'
    ];
    
    for (const selector of tagSelectors) {
      const els = document.querySelectorAll(selector);
      const tags = [];
      els.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 20 && !tags.includes(text)) {
          tags.push(text);
        }
      });
      if (tags.length > 0) {
        jobInfo.tags = tags.slice(0, 10);
        break;
      }
    }
    
    // 组合完整信息供AI分析
    jobInfo.fullText = `
职位名称: ${jobInfo.title}
公司名称: ${jobInfo.company}
薪资范围: ${jobInfo.salary}
工作地点: ${jobInfo.location}
经验要求: ${jobInfo.experience}
学历要求: ${jobInfo.education}

职位描述:
${jobInfo.description}

公司/团队信息:
${jobInfo.companyInfo}

标签: ${jobInfo.tags.join(', ')}
`.trim();
    
  } catch (error) {
    console.error('提取职位信息失败:', error);
  }
  
  return jobInfo;
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobInfo') {
    const jobInfo = extractJobInfoFromBoss();
    sendResponse({ jobInfo });
  }
  return true;
});

// 页面加载完成后自动提取
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('JobFit: 页面已加载，准备提取职位信息');
  });
} else {
  console.log('JobFit: 页面已加载，准备提取职位信息');
}
