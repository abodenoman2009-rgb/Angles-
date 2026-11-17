# LinguaRead — starter (Reader-first)

This delivery contains the initial database schema and the first feature: a bilingual reading screen. It is a starter implementation, not yet a production-published app.

## Included
- Expo + React Native + TypeScript scaffold
- Supabase client placeholder configuration
- Initial PostgreSQL schema with row-level security
- Reader screen: paragraph progress, source/translation toggle, font sizing, TTS, word selection sheet, save-word callback
- Demo A1 story (original sample text)
- Translation provider interface with an explicitly marked demo fallback

## Setup
1. Install Node.js LTS and Expo Go, or configure native development builds.
2. Copy `.env.example` to `.env`.
3. Create a Supabase project and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/schema.sql` in Supabase Dashboard → SQL Editor.
5. Install dependencies: `npm install`.
6. Start: `npx expo start`.

## Notes before production
- The demo translation provider is not a real dictionary. Implement a server-side provider or Supabase Edge Function; never ship provider secrets in the app.
- The current reader uses a demo story. Load published stories and paragraphs from Supabase in the next integration step.
- Add Supabase Auth session persistence, secure local storage, offline downloads, local notifications, and robust error/loading states before release.
- Add storage bucket policies before enabling audio/story media uploads.
- Premium entitlements must be verified server-side; do not trust `is_premium` from the client.
- Account deletion must be implemented through a protected Edge Function / trusted server flow.
- Test RTL with Arabic and LTR with target-language text on physical iOS and Android devices.
