# Jira Clone
### Features
Create and manage: Sprints, Kanban boards, Product backlog, Sprint backlog, Charts, User authentication & Management (modified in this version for public viewing)

### Stack
React, Supabase, React Router, Recharts, dndkit, Tanstack Table, Tailwind, shadcn/ui

| ![Image 1](https://i.imgur.com/UFrawBH.png) | ![Image 2](https://i.imgur.com/lRM8g0b.png) |
|---------------------------------------------|---------------------------------------------|
| ![Image 3](https://i.imgur.com/mRpWoH9.png) | ![Image 4](https://i.imgur.com/SKeR0ol.png) |

## Setup

1. Create a `.env` file in the root directory with the following keys from https://supabase.com/

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

2. Replace first snippet with second in `src/pages/LandingPage.tsx`

```
"redirectTo: https://fit2101-public.vercel.app/sprints"
```

```
"redirectTo: "http://localhost:5173/sprints"
```

3. Install dependencies and start the development server

```sh
npm install
npm run dev
```
