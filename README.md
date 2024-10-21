# Jira Clone

## Setup

1. Create a `.env` file in the root directory with the following content from https://supabase.com/ :

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

3. Install dependencies and start the development server:

```sh
npm install
npm run dev
```
