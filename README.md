# 幻影画布 | PixelForge

![App Screenshot](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)

**幻影画布 (PixelForge)** 是一个现代化的 Web 图像处理工具箱，结合了 Google Gemini 的强大视觉能力与本地 Canvas 处理技术。它提供了一站式的图片背景去除、尺寸调整和色彩提取功能，并在设计上注重隐私与用户体验。

## ✨ 功能特性

### 1. 智能抠图 (Background Remover)
*   **AI 驱动**：利用 **Google Gemini 2.5 Flash** 视觉模型精确识别主体。
*   **真·透明背景**：生成带有 Alpha 通道的 PNG 图片，而非单纯的白色背景。
*   **魔术棒工具 (Magic Wand)**：提供手动修正功能，通过颜色容差算法（Flood Fill）去除 AI 未处理干净的区域。
*   **对比视图**：左右分屏实时对比原图与处理后的效果。

### 2. 图片调整 (Image Resizer)
*   **无损缩放**：支持按比例或自定义尺寸调整图片大小。
*   **快速预设**：提供 0.25x, 0.5x, 2x 等常用缩放倍率。
*   **锁定比例**：自动保持图片长宽比，防止变形。

### 3. 颜色提取 (Color Extractor)
*   **调色板生成**：自动分析图片，提取 8 种主要色调。
*   **一键复制**：支持点击复制 HEX 或 RGB 格式的颜色代码。

### 4. 其他特性
*   **多语言支持**：内置中文与英文界面，根据系统语言自动切换。
*   **隐私优先**：除了抠图功能需要将图片数据发送至 Google API 外，调整大小和颜色提取均在本地浏览器中完成。
*   **响应式设计**：完美支持桌面端与移动端操作。
*   **深色模式**：自动适配系统的深色/浅色主题。

## 🛠 技术栈

*   **前端框架**: React 19, TypeScript
*   **构建工具**: Vite (推荐)
*   **样式库**: Tailwind CSS
*   **AI 模型**: Google Gemini API (`@google/genai`)
*   **图标库**: Lucide React

## 🚀 快速开始

### 前置要求

1.  Node.js (v18 或更高版本)
2.  Google AI Studio API Key (需要在 [Google AI Studio](https://aistudio.google.com/) 申请)

### 本地开发

1.  **克隆项目**

    ```bash
    git clone https://github.com/leugan/pixelforge.git
    cd pixelforge
    ```

2.  **安装依赖**

    ```bash
    npm install
    ```

3.  **配置环境变量**

    在项目根目录创建一个 `.env` 文件（如果是 Vite 项目，通常使用 `.env.local`），并填入你的 API Key：

    ```env
    # 如果使用 Vite，变量名可能需要根据配置调整，例如 VITE_API_KEY
    # 本项目代码中直接使用了 process.env.API_KEY，需确保构建工具支持注入
    API_KEY=your_google_gemini_api_key_here
    ```

    *注意：请勿将 API Key 提交到代码仓库中。*

4.  **启动开发服务器**

    ```bash
    npm run dev
    ```

5.  打开浏览器访问 `http://localhost:5173` (或其他终端显示的端口)。

## 📦 部署

本项目是一个纯静态的 SPA (Single Page Application)，非常适合部署在 Vercel, Netlify 或 Cloudflare Pages 上。

### 部署到 Vercel

1.  将代码推送到 GitHub/GitLab。
2.  在 Vercel 控制台导入项目。
3.  在 **Environment Variables** 设置中添加：
    *   Key: `API_KEY`
    *   Value: `你的_Google_Gemini_API_Key`
4.  点击 **Deploy**。

## ⚠️ 注意事项

*   **API 配额**：Gemini API 有免费层级配额限制，请留意你的使用量。
*   **图片大小**：虽然 Gemini 支持较大图片，但在浏览器端处理超大分辨率图片可能会导致性能问题，建议上传 4K 以下的图片。

## 📄 许可证

MIT License
