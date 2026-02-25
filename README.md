# Pokè countdown 🍣

App per tenere traccia di quante **pokè** ti mancano ancora (es. 42 da ricevere da un amico). Stile kawaii, un tap per segnare quando ne prendi una, con conferma per evitare pressioni accidentali.

## Funzionalità

- **Countdown**: numero di pokè che mancano (partenza 42).
- **Bottone "Ho preso una pokè!"**: apre un modale di conferma ("Sei sicuro?") per evitare tap accidentali.
- **Storico**: elenco con data e nickname di quando sono state segnate.
- **Un utente per giorno**: se un altro utente ha già segnato oggi, compare l'avviso *"Un altro utente ha già segnato la/le pokè oggi"* e non è possibile segnare. Lo stesso utente può segnare più pokè nella stessa giornata.

## Setup

1. **Installa**
   ```bash
   npm install
   ```

2. **Storage (Vercel Blob)**  
   L'app salva i dati in **Vercel Blob**. Non servono token GitHub né Gist.

3. **Avvio in locale**
   - Collega il progetto a Vercel (`vercel link` se non l'hai già fatto).
   - Crea uno **Blob store** nel progetto su Vercel (tab **Storage** → Create Database → Blob).
   - Scarica le variabili d'ambiente: `vercel env pull` (crea/aggiorna `.env.local` con `BLOB_READ_WRITE_TOKEN`).
   - Avvia: `npm run dev` e apri [http://localhost:3000](http://localhost:3000).

## Deploy su Vercel

1. Push del repo su GitHub e importa il progetto su [Vercel](https://vercel.com).
2. Nel progetto Vercel vai in **Storage** → **Create Database** → scegli **Blob**.
3. Crea un nuovo Blob store (nome a piacere, accesso **Private**).
4. Il token `BLOB_READ_WRITE_TOKEN` viene aggiunto automaticamente al progetto.
5. Fai **Redeploy** se il deploy era già partito prima di creare lo store.

L'app salva un unico file (`poke/data.json`) nello store; non serve configurare altre variabili d'ambiente.

## Tecnologie

- Next.js (App Router), TypeScript, Tailwind CSS.
- Storage: **Vercel Blob** (`@vercel/blob`).
