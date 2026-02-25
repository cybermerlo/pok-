# Pokè countdown 🍣

App per tenere traccia di quante **pokè** ti mancano ancora (es. 42 da ricevere da un amico). Stile kawaii, un tap per segnare quando ne prendi una, con conferma per evitare pressioni accidentali.

## Funzionalità

- **Countdown**: numero di pokè che mancano (partenza 42).
- **Bottone “Ho preso una pokè!”**: apre un modale di conferma (“Sei sicuro?”) per evitare tap accidentali.
- **Storico**: elenco con data e nickname di quando sono state segnate.
- **Un utente per giorno**: se un altro utente ha già segnato oggi, compare l’avviso *“Un altro utente ha già segnato la/le pokè oggi”* e non è possibile segnare. Lo stesso utente può segnare più pokè nella stessa giornata.

## Setup

1. **Clona e installa**
   ```bash
   npm install
   ```

2. **Variabili d’ambiente**
   - Copia `.env.local.example` in `.env.local`.
   - `GITHUB_GIST_ID`: ID del Gist (nell’URL è `gist.github.com/xxx/QUESTO_ID`).
   - `GITHUB_GIST_TOKEN`: [GitHub Personal Access Token](https://github.com/settings/tokens) con permesso **gist**.
   - Il Gist deve contenere un file `poke.json` (può essere `{}`); l’app lo aggiornerà.

3. **Avvio in locale**
   ```bash
   npm run dev
   ```
   Apri [http://localhost:3000](http://localhost:3000).

## Deploy su Vercel

1. Push del repo su GitHub.
2. Su [Vercel](https://vercel.com) importa il progetto da GitHub.
3. Nelle **Environment Variables** del progetto imposta:
   - `GITHUB_GIST_ID`
   - `GITHUB_GIST_TOKEN`
4. Deploy. L’app userà il Gist come “database”.

## Tecnologie

- Next.js (App Router), TypeScript, Tailwind CSS.
- Storage: file `poke.json` in un GitHub Gist aggiornato via API.
