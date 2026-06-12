# posters/ — reference poster library (RAG source)

Save the actual reference image files here:
```
posters/realestate/   <- drop the real-estate / developer poster images (.jpg/.png)
```
(Images are gitignored — they may be copyrighted. Docs + structure are tracked.)

- `reference-dna.md` — the design DNA extracted from the references (the knowledge).
- The same patterns are encoded as RAG templates in `lib/templates/realestate.ts`,
  which get embedded + stored in Supabase when you run the seed (needs OpenAI credit).

Two ways references become templates:
1. CURATED (done for these 12): Claude studied each image and hand-authored templates.
2. AUTOMATED (later): a gpt-4o vision script can extract DNA from new images in bulk.
