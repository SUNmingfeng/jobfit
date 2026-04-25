# 图标文件说明

本文件夹需要放置插件的图标文件，用于Chrome扩展程序显示。

## 所需文件

需要准备以下三个尺寸的PNG图标：

1. **icon16.png** - 16x16 像素
   - 用途：浏览器工具栏图标
   
2. **icon48.png** - 48x48 像素
   - 用途：扩展程序页面和Chrome Web Store
   
3. **icon128.png** - 128x128 像素
   - 用途：Chrome Web Store和安装界面

## 图标设计建议

### 设计方案1：使用Emoji（最简单）
1. 打开项目根目录下的 `icon_gen.html` 文件
2. 在浏览器中截图三个尺寸的图标
3. 使用图像编辑工具裁剪并保存为PNG格式

### 设计方案2：在线图标生成器
- https://favicon.io/favicon-generator/
- https://www.canva.com/
- https://www.figma.com/

### 设计方案3：使用纯色背景+文字
可以使用以下参数：
- 背景色：#2563EB (蓝色)
- 文字："J" 或 "🔍"
- 文字颜色：白色
- 圆角：20%

## 推荐图标样式

推荐使用"放大镜"图标或字母"J"，体现JobFit的搜索和匹配功能。

示例：
```
┌──────────┐
│  🔍      │
│  JobFit  │
└──────────┘
```

## 注意事项

- 图标必须是PNG格式
- 尺寸必须准确（16x16, 48x48, 128x128）
- 图标会被Chrome自动调整大小，所以设计时要考虑在小尺寸下的清晰度

## 临时解决方案

如果没有图标文件，可以暂时复制以下命令生成纯色图标（需要ImageMagick）：

```bash
cd icons

# 16x16 蓝色方块
convert -size 16x16 xc:"#2563EB" icon16.png

# 48x48 蓝色方块
convert -size 48x48 xc:"#2563EB" icon48.png

# 128x128 蓝色方块
convert -size 128x128 xc:"#2563EB" icon128.png
```

或者使用Python生成：

```python
from PIL import Image

# 16x16
img = Image.new('RGB', (16, 16), color='#2563EB')
img.save('icon16.png')

# 48x48
img = Image.new('RGB', (48, 48), color='#2563EB')
img.save('icon48.png')

# 128x128
img = Image.new('RGB', (128, 128), color='#2563EB')
img.save('icon128.png')
```
