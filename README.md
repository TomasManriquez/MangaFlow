# 📚 MangaFlow - Modern Manga Reader

A modern, modular manga reader application with offline capabilities and multi-source scraping. Built with Astro frontend and TypeScript backend following clean architecture principles.

## ✨ Features

- 🎨 **Modern Minimalist Design** - Beautiful interface with orange accent theme
- 📱 **Responsive** - Works on all devices
- 🌐 **Multi-Source** - Scrapes from MangaDex, ZonaT.mo, and Manga Plus
- 💾 **Offline Ready** - Download chapters for offline reading
- 🔍 **Smart Search** - Search across all sources simultaneously
- 🏗️ **Modular Architecture** - Clean, scalable codebase
- 🤖 **AI-Ready** - Database structure ready for future AI integration

## 🏛️ Architecture

```
manga-reader/
├── frontend/          # Astro + React
│   ├── src/
│   │   ├── components/   # Reusable React/Astro components
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Routes
│   │   └── styles/       # Global CSS with design system
│
└── backend/          # TypeScript + Express
    ├── src/
    │   ├── models/       # Prisma database models
    │   ├── repositories/ # Data access layer
    │   ├── controllers/  # Business logic
    │   ├── routers/      # API routes
    │   ├── middleware/   # Express middleware
    │   └── scrapers/     # Source-specific scrapers
    └── prisma/          # Database schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Bash terminal (Git Bash on Windows)

### 🐳 Docker Deployment (Recommended)

The easiest way to run MangaFlow is using Docker:

```bash
# Copy environment template
copy .env.production.example .env.production

# Edit .env.production and set DB_PASSWORD

# Build and start all services
docker-compose up -d

# Initialize database
docker-compose exec backend npx prisma migrate deploy
```

Access at `http://localhost`

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Docker deployment guide**

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/manga_reader"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:4321`

## 📡 API Endpoints

### Manga

- `GET /api/manga` - List all mangas (paginated)
- `GET /api/manga/:id` - Get manga details
- `POST /api/manga/search` - Search mangas
- `POST /api/manga/sync` - Sync manga from source
- `GET /api/manga/stats` - Get statistics

### Chapters

- `GET /api/chapters/manga/:mangaId` - Get chapters for a manga
- `GET /api/chapters/:id` - Get chapter with pages
- `POST /api/chapters/:id/download` - Download chapter
- `POST /api/manga/:mangaId/chapters/sync` - Sync chapters
- `GET /api/chapters/downloaded` - Get all downloaded chapters

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Orange Accent** - HSL(25, 95%, 58%) as primary color
- **Dark Theme** - Minimalist dark background
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Micro-interactions for better UX
- **Typography** - Inter for body text, Outfit for headings

## 🔧 Technology Stack

### Frontend
- **Astro** - Static site generator
- **React** - Interactive components
- **TypeScript** - Type safety
- **CSS** - Custom design system

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Axios** - HTTP client
- **Cheerio** - Web scraping

## 📦 Project Structure

### Layered Backend Architecture

1. **Models** - Database schema and Prisma client
2. **Repositories** - Data access abstraction
3. **Controllers** - Business logic
4. **Routers** - HTTP endpoints
5. **Middleware** - Request/response processing
6. **Scrapers** - External source integration

### Scraping Strategy

Each scraper implements the `IScraper` interface:

```typescript
interface IScraper {
  searchManga(query: string): Promise<MangaSearchResult[]>
  getMangaDetails(id: string): Promise<MangaDetails>
  getChapterList(mangaId: string): Promise<ChapterInfo[]>
  getChapterPages(chapterId: string): Promise<PageInfo[]>
}
```

- **MangaDex** - Uses official API v5
- **ZonaT.mo** - Web scraping with Cheerio
- **Manga Plus** - API integration

## 🔮 Future Enhancements

- **AI Recommendations** - Personalized manga suggestions
- **Reading Analytics** - Track reading habits
- **Social Features** - Share and discuss with friends
- **Progressive Web App** - Install as native app
- **Multi-language** - Support for multiple languages

## 📝 Development Commands

### Backend
```bash
npm run dev         # Start dev server with nodemon
npm run build       # Compile TypeScript
npm run start       # Run production build
npm run prisma:studio # Open Prisma Studio (DB GUI)
```

### Frontend
```bash
npm run dev         # Start Astro dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🤝 Contributing

This is a modular, scalable architecture designed to be extended. The clean separation of concerns makes it easy to:

- Add new manga sources (implement `IScraper`)
- Add new features (extend controllers/repositories)
- Customize UI (modify design system)
- Integrate AI (use existing metadata structure)

## ⚠️ Legal Notice

This software is for educational purposes. Web scraping may violate terms of service for some websites. Always:

- Respect robots.txt
- Use rate limiting
- Prefer official APIs when available
- Check terms of service before scraping

**MangaDex** provides an official API which we use.  
**ZonaT.mo** and **Manga Plus** are scraped with respectful delays.

## 📄 License

This project is provided as-is for educational purposes.

---

**Built with ❤️ and modern web technologies**
