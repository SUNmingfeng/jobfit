# JobFit v1.0.0 - 首个正式版本

🎉 **JobFit** - 智能简历与职位匹配分析器正式发布！

## ✨ 核心功能

### 1. 双AI模型支持
- 🌙 **Kimi** (Moonshot AI) - 中文理解强，长文本处理优秀
- 🔮 **DeepSeek** (深度求索) - 性价比高，推理能力强
- 支持一键切换，自动保存偏好

### 2. 智能简历解析
- 支持 **PDF**、**DOC**、**DOCX** 格式
- AI自动提取关键信息（技能、经验、项目等）
- 解析结果本地缓存7天，避免重复上传

### 3. 职位信息自动获取
- 专为 **BOSS直聘** 优化
- 自动识别职位页面，提取职位描述、要求、薪资等
- URL智能验证，确保在正确的页面使用

### 4. 深度匹配分析
AI从多维度分析简历与职位匹配度：
- **匹配项分析** - JD要求与简历的对应关系
- **不匹配项识别** - 仅标记JD明确要求但缺失的内容
- **优化建议** - 针对性的简历改进和投递策略

### 5. 可视化结果展示
- 圆环进度条展示匹配度百分比
- 分级评分（优秀/良好/一般/较低）
- 可折叠的详细分析区域
- 一键复制或导出JSON报告

## 🚀 快速开始

### 安装步骤

1. **下载代码**
   ```bash
   git clone https://github.com/yourusername/jobfit.git
   ```

2. **配置API密钥**
   编辑 `config.js` 文件：
   ```javascript
   LLM_CONFIGS: {
     kimi: {
       apiKey: 'sk-your-kimi-api-key',  // 从 platform.moonshot.cn 获取
       // ...
     },
     deepseek: {
       apiKey: 'sk-your-deepseek-api-key',  // 从 platform.deepseek.com 获取
       // ...
     }
   }
   ```

3. **安装到Chrome**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `jobfit` 文件夹

4. **开始使用**
   - 访问 BOSS直聘 职位详情页
   - 点击浏览器工具栏的 JobFit 图标
   - 上传简历，点击"开始分析匹配度"

## 📋 使用说明

### 基本流程
```
1. 打开BOSS直聘职位页 → 点击JobFit图标
2. 选择AI模型 (Kimi/DeepSeek)
3. 上传简历 (PDF/DOC/DOCX)
4. 等待AI解析简历
5. 点击"开始分析匹配度"
6. 查看分析结果和建议
```

### 结果解读
- **匹配度 85%+** - 优秀匹配，建议立即投递
- **匹配度 70-84%** - 良好匹配，可以考虑投递
- **匹配度 50-69%** - 一般匹配，谨慎考虑
- **匹配度 <50%** - 匹配度较低，建议优化简历

## 🔒 隐私说明

- ✅ 所有简历解析和匹配分析均在本地完成
- ✅ 仅在调用AI API时传输必要文本数据
- ✅ 不收集、不上传任何个人信息到第三方服务器
- ✅ 解析结果仅保存在浏览器本地存储

## 🛠️ 技术栈

- **Manifest V3** - Chrome扩展最新标准
- **PDF.js** - PDF文件解析
- **Mammoth.js** - Word文件解析
- **Kimi API / DeepSeek API** - AI分析服务

## 📁 文件结构

```
jobfit/
├── manifest.json          # 扩展配置
├── config.js              # API配置（需自行填写密钥）
├── popup.html             # 主界面
├── popup.css              # 样式
├── popup.js               # 核心逻辑
├── content.js             # 页面内容提取
├── pdf.min.js             # PDF解析库
├── pdf.worker.js          # PDF工作线程
├── mammoth.browser.min.js # Word解析库
├── icons/                 # 图标文件
└── README.md              # 详细说明
```

## ⚠️ 注意事项

1. **API密钥安全**
   - 不要将包含真实API密钥的文件提交到公共仓库
   - 建议在本地开发时使用，或使用环境变量管理密钥

2. **API费用**
   - Kimi和DeepSeek API调用会产生费用
   - 请关注各自平台的计费标准

3. **使用限制**
   - 仅支持BOSS直聘职位页面
   - 需要网络连接调用AI服务

## 🔮 未来计划

- [ ] 支持更多招聘网站（拉勾、智联招聘等）
- [ ] 简历模板推荐
- [ ] 历史分析记录管理
- [ ] 多简历对比功能
- [ ] AI生成优化后的简历内容

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue
- 描述清楚问题和复现步骤
- 提供浏览器版本和插件版本
- 如有错误信息请一并提供

### 提交PR
- 确保代码风格与现有代码一致
- 添加必要的注释说明
- 测试通过后再提交

## 📝 更新日志

### v1.0.0 (2026-04-26)
- 🎉 首个正式版本发布
- ✨ 支持Kimi和DeepSeek双AI模型
- ✨ 支持PDF/DOC/DOCX简历解析
- ✨ BOSS直聘职位自动识别
- ✨ 智能匹配度分析
- ✨ 可视化结果展示

## 📄 许可证

MIT License

Copyright (c) 2026 JobFit Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

**让AI帮你找到最适合的工作！** 🚀

如有问题或建议，欢迎通过 GitHub Issues 反馈。
