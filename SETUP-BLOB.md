# Configurare Vercel Blob (passo per passo)

Se vedi **"Vercel Blob non configurato"**, il deploy non vede il token. Segui questi passi **nello stesso progetto Vercel** dove è deployata l’app.

---

## 1. Apri il progetto su Vercel

Vai su [vercel.com](https://vercel.com) → **Dashboard** → seleziona il progetto dell’app (es. `pok-`).

---

## 2. Controlla se il token c’è già

- Vai in **Settings** (impostazioni del progetto).
- Nel menu a sinistra clicca **Environment Variables**.
- Cerca una variabile che inizia con **`BLOB_READ_WRITE_TOKEN`** (es. `BLOB_READ_WRITE_TOKEN` o `BLOB_READ_WRITE_TOKEN_xxx`).

**Se la variabile c’è già** → passa allo **step 4 (Redeploy)**.

**Se non c’è** → continua con lo step 3.

---

## 3. Creare lo store e prendere il token

### 3a. Crea il Blob store (se non l’hai ancora fatto)

- Nel progetto Vercel, nel menu a sinistra clicca **Storage**.
- **Create Database** → scegli **Blob**.
- Nome a piacere (es. `poke-store`), accesso **Private**.
- Clicca **Create**. Lo store viene creato e **collegato al progetto**.

### 3b. Copia il token

- Sempre in **Storage**, apri lo **store** che hai creato (clic sul nome).
- Nella pagina dello store trovi **".env"** o **"Token"** / **"Read-Write Token"**.
- **Copia** il valore del token (una lunga stringa).

### 3c. Aggiungi la variabile al progetto

- Vai in **Settings** → **Environment Variables**.
- **Add New**:
  - **Name:** `BLOB_READ_WRITE_TOKEN`  
    (se quando hai creato lo store hai messo un suffisso custom, usa esattamente il nome che vedi in Storage, es. `BLOB_READ_WRITE_TOKEN_abc123`)
  - **Value:** incolla il token copiato.
  - Spunta almeno **Production** (e **Preview** se usi i deploy di preview).
- Salva.

---

## 4. Redeploy (obbligatorio)

Le variabili d’ambiente vengono lette **solo al momento del deploy**. Quindi dopo aver aggiunto o modificato il token:

- Vai in **Deployments**.
- Sul **ultimo deployment** clicca i **tre puntini (⋯)**.
- **Redeploy**.
- Attendi che il deploy finisca.

Poi ricarica l’app nel browser e riprova a segnare una pokè.

---

## Riepilogo

1. **Storage** → crea Blob store (se manca) → copia il token dallo store.
2. **Settings** → **Environment Variables** → aggiungi `BLOB_READ_WRITE_TOKEN` (o il nome con suffisso) con quel valore, per **Production** (e Preview se serve).
3. **Deployments** → **Redeploy** dell’ultimo deploy.

Se dopo il redeploy vedi ancora l’errore, controlla che il nome della variabile in **Environment Variables** sia **esattamente** quello che vedi in **Storage** per quello store (incluso eventuale suffisso).
