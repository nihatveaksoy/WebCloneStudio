# WebClone Studio

[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english) | [🇪🇸 Español](#-español) | [🇨🇳 中文](#-中文)

> **Forked from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)** -- the original CLI-based website cloning engine powered by Claude Code. This fork transforms it into a **full web application** with a dashboard UI, AI-powered analysis, and enhanced version generation.

[![Watch the original template demo](docs/design-references/comparison.png)](https://youtu.be/O669pVZ_qr0)

---

## 🇹🇷 Türkçe

**WebClone Studio** -- Herhangi bir web sitesini klonlayın, AI ile analiz edin ve geliştirilmiş versiyonunu oluşturun.

### Özellikler

**Klonlama Motoru**
- Hedef siteyi fetch ederek HTML, CSS, font ve renk verilerini çıkarır
- Tech stack tespiti (Next.js, Tailwind, Bootstrap, jQuery vb.)
- Başlık, bağlantı ve görsel envanteri oluşturur
- Pipeline log'ları ile ilerlemeyi gerçek zamanlı takip edin

**AI Analiz ve Öneriler**
- 6 kategoride iyileştirme önerileri: UX, Performans, Erişilebilirlik, Modern Kalıplar, Tasarım, SEO
- Her öneri için öncelik seviyesi (Yüksek/Orta/Düşük) ve efor tahmini
- Mevcut durum vs. önerilen durum karşılaştırması
- Gemini 2.5 Flash Lite ile 2 ücretsiz deneme hakkı
- Kullanıcının kendi Anthropic API key'i ile sınırsız analiz

**İyileştirilmiş Versiyon**
- Önerilerden seçim yapın, "Select All" ile tümünü seçin
- AI ile iyileştirilmiş versiyon üretin
- Orijinal vs. iyileştirilmiş yan yana karşılaştırma görünümü

**Dashboard**
- Proje kartları site brand rengine göre smooth gradient ile renklenir
- Çapraz kayan web sitesi görselleriyle animasyonlu arkaplan
- Responsive tasarım (mobil + desktop)

### Kurulum

```bash
git clone https://github.com/nihatveaksoy/WebCloneStudio.git
cd WebCloneStudio
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

**Ortam Değişkenleri:**
```
GEMINI_API_KEY=...          # Ücretsiz deneme için (sunucu tarafı)
ANTHROPIC_API_KEY=sk-ant-...  # Sınırsız AI analiz için (opsiyonel)
```

### Mimari

```
+------------------------------------------+
|          WebClone Studio (UI)            |
|  Dashboard  |  Proje Workspace (3 Tab)   |
+-------------+----------------------------+
|  Clone Tab  |  Suggestions  |  Enhanced  |
+-------------+-------------+--------------+
|             API Routes (Next.js)         |
+------------------------------------------+
|  db.ts  |  claude.ts  |  gemini.ts       |
+---------+-------------+------------------+
|  JSON Dosya  |  Gemini / Claude API      |
+--------------+---------------------------+
|         usage.ts (IP bazlı trial)       |
+------------------------------------------+
```

### Test Kapsamı

| Modül | Durum | Açıklama |
|--------|-------|------------|
| API Routes | Calisiyor | 9 endpoint, CRUD + pipeline + usage |
| Clone Pipeline | Calisiyor | Fetch + HTML parse + extraction |
| AI Analiz | Calisiyor | Gemini free trial + Anthropic + mock |
| Enhanced | Calisiyor | Öneri seçimi + üretim |
| Dashboard UI | Calisiyor | Proje listesi + dialog + brand renk |
| Workspace UI | Calisiyor | 3 tab, status badge, polling |
| Free Trial | Calisiyor | IP bazlı 2 deneme hakkı |

---

## 🇬🇧 English

**WebClone Studio** -- Clone any website, analyze it with AI, and generate an enhanced version.

### Features

**Cloning Engine**
- Fetches target site HTML to extract fonts, colors, headings, and tech stack
- Detects frameworks (Next.js, Tailwind, Bootstrap, jQuery, etc.)
- Generates asset inventory (images, links, headings)
- Real-time pipeline logs

**AI Analysis & Suggestions**
- Improvement suggestions across 6 categories: UX, Performance, Accessibility, Modern Patterns, Design, SEO
- Priority levels (High/Medium/Low) and effort estimates per suggestion
- Current state vs. suggested state comparison
- 2 free trials with Gemini 2.5 Flash Lite (no API key needed)
- Unlimited analyses with user's own Anthropic API key

**Enhanced Version**
- Select individual suggestions or use "Select All"
- Generate an enhanced version via AI
- Side-by-side comparison: original vs. enhanced

**Dashboard**
- Project cards with smooth gradient based on site's brand color
- Animated diagonal scrolling background with web UI flyer images
- Responsive design (mobile + desktop)

### Installation

```bash
git clone https://github.com/nihatveaksoy/WebCloneStudio.git
cd WebCloneStudio
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

**Environment Variables:**
```
GEMINI_API_KEY=...            # Free trial AI (server-side)
ANTHROPIC_API_KEY=sk-ant-...  # Unlimited AI analysis (optional)
```

### Architecture

```
+------------------------------------------+
|          WebClone Studio (UI)            |
|  Dashboard  |  Project Workspace (3 Tab) |
+-------------+----------------------------+
|  Clone Tab  |  Suggestions  |  Enhanced  |
+-------------+-------------+--------------+
|             API Routes (Next.js)         |
+------------------------------------------+
|  db.ts  |  claude.ts  |  gemini.ts       |
+---------+-------------+------------------+
|  JSON File   |  Gemini / Claude API      |
+--------------+---------------------------+
|         usage.ts (IP-based trial)        |
+------------------------------------------+
```

### Test Coverage

| Module | Status | Description |
|--------|--------|-------------|
| API Routes | Working | 9 endpoints, CRUD + pipelines + usage |
| Clone Pipeline | Working | Fetch + HTML parse + extraction |
| AI Analysis | Working | Gemini free trial + Anthropic + mock |
| Enhanced | Working | Suggestion selection + generation |
| Dashboard UI | Working | Project list + creation dialog + brand colors |
| Workspace UI | Working | 3 tabs, status badges, polling |
| Free Trial | Working | IP-based 2 trial limit |

---

## 🇪🇸 Español

**WebClone Studio** -- Clone cualquier sitio web, analícelo con IA y genere una versión mejorada.

### Características

**Motor de Clonación**
- Obtiene el HTML del sitio objetivo para extraer fuentes, colores, encabezados y stack tecnológico
- Detecta frameworks (Next.js, Tailwind, Bootstrap, jQuery, etc.)
- Genera inventario de recursos (imágenes, enlaces, encabezados)
- Logs del pipeline en tiempo real

**Análisis IA y Sugerencias**
- Sugerencias de mejora en 6 categorías: UX, Rendimiento, Accesibilidad, Patrones Modernos, Diseño, SEO
- Niveles de prioridad (Alto/Medio/Bajo) y estimaciones de esfuerzo
- Comparación estado actual vs. estado sugerido
- 2 pruebas gratuitas con Gemini 2.5 Flash Lite
- Análisis ilimitado con clave API propia de Anthropic

**Versión Mejorada**
- Seleccione sugerencias individuales o use "Seleccionar Todo"
- Genere una versión mejorada con IA
- Comparación lado a lado: original vs. mejorada

### Instalación

```bash
git clone https://github.com/nihatveaksoy/WebCloneStudio.git
cd WebCloneStudio
npm install
npm run dev
```

Abra `http://localhost:3000` en su navegador.

**Variables de entorno:**
```
GEMINI_API_KEY=...            # Prueba gratuita de IA
ANTHROPIC_API_KEY=sk-ant-...  # Análisis IA ilimitado (opcional)
```

---

## 🇨🇳 中文

**WebClone Studio** -- 克隆任何网站，用AI分析并生成增强版本。

### 功能特点

**克隆引擎**
- 获取目标网站HTML，提取字体、颜色、标题和技术栈
- 检测框架（Next.js、Tailwind、Bootstrap、jQuery等）
- 生成资源清单（图片、链接、标题）
- 实时管道日志

**AI分析与建议**
- 6个类别的改进建议：UX、性能、可访问性、现代模式、设计、SEO
- 每个建议的优先级（高/中/低）和工作量估算
- 当前状态与建议状态对比
- 使用Gemini 2.5 Flash Lite免费2次试用
- 使用自己的Anthropic API密钥无限分析

**增强版本**
- 选择单个建议或使用“全选”
- 通过AI生成增强版本
- 并排对比：原始版 vs. 增强版

### 安装

```bash
git clone https://github.com/nihatveaksoy/WebCloneStudio.git
cd WebCloneStudio
npm install
npm run dev
```

在浏览器中打开 `http://localhost:3000`。

**环境变量:**
```
GEMINI_API_KEY=...            # 免费AI试用
ANTHROPIC_API_KEY=sk-ant-...  # 无限AI分析（可选）
```

---

## About the Original Template

This project is built on top of [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) by [@JCodesMore](https://github.com/JCodesMore) -- a CLI-based website cloning engine that uses Claude Code to reverse-engineer and rebuild any website as a pixel-perfect clone.

### What the Template Provides

- `/clone-website <url>` skill for Claude Code CLI
- Multi-phase pipeline: reconnaissance, foundation, component specs, parallel build, assembly & QA
- Chrome MCP integration for design token extraction
- Parallel builder agents in git worktrees
- Detailed component specification with `getComputedStyle()` values

### What WebClone Studio Adds

| Feature | Template (CLI) | WebClone Studio (Web App) |
|---------|---------------|--------------------------|
| Interface | Claude Code CLI | Browser-based dashboard |
| Clone | Full pixel-perfect via Puppeteer + agents | HTML fetch + extraction (MVP) |
| AI Analysis | -- | 6-category improvement suggestions |
| Enhancement | -- | AI-generated improved version |
| Free Trial | -- | 2 free analyses via Gemini |
| Comparison | -- | Side-by-side original vs. enhanced |
| Storage | File system | JSON file persistence |
| API | -- | 9 REST endpoints |

---

## Project Structure

```
src/
  app/
    layout.tsx                    # Root layout, navbar, background
    page.tsx                      # Dashboard (project list)
    globals.css                   # Tailwind v4 design tokens
    api/
      projects/
        route.ts                  # GET/POST projects
        [id]/
          route.ts                # GET/DELETE single project
          clone/route.ts          # POST start clone
          analyze/route.ts        # POST start AI analysis
          enhance/route.ts        # POST generate enhanced
      settings/route.ts           # GET/PUT app settings
      usage/route.ts              # GET usage/trial info

  components/
    ui/                           # shadcn/ui primitives (10)
    app/                          # Dashboard components
      AppNavbar.tsx               # Top navigation
      BackgroundFlyers.tsx        # Diagonal scrolling background
      ProjectCard.tsx             # Project card (brand color gradient)
      ProjectList.tsx             # Project grid
      NewProjectCard.tsx          # New project button (grid)
      NewProjectDialog.tsx        # Create project modal
      ApiKeyHint.tsx              # Free trial checkbox + API key input
      SettingsDialog.tsx          # Settings modal
    project/                      # Workspace components
      ProjectHeader.tsx           # Project info + status
      ProjectTabs.tsx             # Clone / Suggestions / Enhanced
      CloneTab.tsx                # Clone pipeline UI
      SuggestionsTab.tsx          # AI suggestions grid
      EnhancedTab.tsx             # Enhancement + comparison
      SuggestionCard.tsx          # Single suggestion card
      StatusBadge.tsx             # Pipeline status indicator
      MockModeBanner.tsx          # Trial/mock mode info banner

  lib/
    utils.ts                      # cn() utility
    db.ts                         # JSON file persistence + settings
    claude.ts                     # AI provider router (Anthropic > Gemini > mock)
    gemini.ts                     # Gemini API wrapper
    usage.ts                      # IP-based free trial tracking
    mock-data.ts                  # Mock suggestions data
    seed-demo.ts                  # Demo project seeder
    prompts/
      suggestions.ts              # Analysis prompt template
      enhance.ts                  # Enhancement prompt template

  types/
    project.ts                    # All TypeScript interfaces

  hooks/
    useProjectStatus.ts           # Polling hook
```

## Technologies

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript (strict) | 5.x |
| UI Library | React | 19.2.4 |
| Components | shadcn/ui (base-nova) | 4.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 1.6.x |
| AI (Free Trial) | Google Generative AI (Gemini 2.5 Flash Lite) | 0.24.x |
| AI (Premium) | Anthropic SDK (Claude Sonnet 4) | optional |
| Storage | JSON file (MVP) | -- |
| Notifications | Sonner | 2.x |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/[id]` | Get single project |
| DELETE | `/api/projects/[id]` | Delete project |
| POST | `/api/projects/[id]/clone` | Start clone pipeline |
| POST | `/api/projects/[id]/analyze` | Start AI analysis |
| POST | `/api/projects/[id]/enhance` | Generate enhanced version |
| GET | `/api/settings` | Get app settings |
| PUT | `/api/settings` | Update settings (API key) |
| GET | `/api/usage` | Get free trial status |

## License

MIT

## Credits

- Original template: [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) by [@JCodesMore](https://github.com/JCodesMore)
- Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by @vibeeval
