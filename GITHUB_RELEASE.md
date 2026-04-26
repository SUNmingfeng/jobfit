# GitHub Release 发布内容

## 标题
JobFit v1.0.0 - 智能简历匹配分析器

## 标签
v1.0.0

## 发布内容（请复制到GitHub Release）

```markdown
## 🎉 JobFit 首个正式版本发布！

**JobFit** 是一个智能简历与职位匹配分析 Chrome 插件，帮助求职者快速分析简历与招聘JD的匹配度。

![匹配度分析](https://img.shields.io/badge/匹配度-智能分析-blue)
![AI模型](https://img.shields.io/badge/AI-Kimi%20%7C%20DeepSeek-green)
![支持格式](https://img.shields.io/badge/简历-PDF%20%7C%20Word-orange)

---

### ✨ 核心功能

- 🤖 **双AI模型支持** - Kimi (Moonshot AI) & DeepSeek (深度求索)
- 📄 **智能简历解析** - 支持 PDF、DOC、DOCX 格式
- 🔍 **职位自动识别** - 专为 BOSS直聘 优化
- 📊 **深度匹配分析** - 多维度分析 + 优化建议
- 📋 **可视化报告** - 匹配度圆环 + 详细分析

---

### 🚀 快速开始

#### 1. 下载安装
下载 `jobfit-v1.0.0.zip` 并解压

#### 2. 配置API密钥
编辑 `config.js` 文件，填入你的API密钥：
- 获取 Kimi API Key: https://platform.moonshot.cn/
- 获取 DeepSeek API Key: https://platform.deepseek.com/

```javascript
kimi: {
  apiKey: 'sk-your-kimi-api-key',  // 替换为你的密钥
  // ...
},
deepseek: {
  apiKey: 'sk-your-deepseek-api-key',  // 替换为你的密钥
  // ...
}
```

#### 3. 安装到Chrome
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择解压后的 `jobfit` 文件夹

#### 4. 开始使用
1. 访问 [BOSS直聘](https://www.zhipin.com) 任意职位详情页
2. 点击浏览器工具栏的 🔍 **JobFit** 图标
3. 选择AI模型，上传简历
4. 点击"开始分析匹配度"
5. 查看AI生成的匹配报告

---

### 📊 匹配度评分标准

| 分数 | 评级 | 建议 |
|------|------|------|
| 85-100 | 优秀匹配 | 高度符合，建议立即投递 |
| 70-84 | 良好匹配 | 基本符合，可以考虑投递 |
| 50-69 | 一般匹配 | 部分符合，可谨慎尝试 |
| <50 | 匹配度较低 | 差距较大，建议优化简历 |

---

### 📁 项目结构

```
jobfit/
├── manifest.json          # Chrome扩展配置
├── config.js              # API配置（需填写密钥）
├── popup.html             # 主界面
├── popup.css              # 样式文件
├── popup.js               # 核心逻辑
├── content.js             # 页面内容提取
├── pdf.min.js             # PDF解析库
├── pdf.worker.js          # PDF工作线程
├── mammoth.browser.min.js # Word解析库
├── icons/                 # 图标文件
├── README.md              # 详细文档
└── RELEASE.md             # 发布说明
```

---

### 🔒 隐私说明

- ✅ 所有分析均在本地完成
- ✅ 仅在调用AI时传输必要文本
- ✅ 不收集个人信息
- ✅ 解析结果仅保存在浏览器本地

---

### 🛠️ 技术栈

- Chrome Extension Manifest V3
- PDF.js + Mammoth.js
- Kimi API / DeepSeek API

---

### 📄 许可证

MIT License

---

**让AI帮你找到最适合的工作！** 🚀

如有问题，欢迎提交 [Issue](https://github.com/yourusername/jobfit/issues)。
```

## 附件
- `jobfit-v1.0.0.zip` - 插件安装包

## 发布前检查清单

- [ ] config.js 中的 API 密钥是占位符（不是真实密钥）
- [ ] 所有文件已提交到 git
- [ ] README.md 内容完整
- [ ] 测试通过，功能正常
- [ ] 版本号一致（manifest.json, package.json 等）
