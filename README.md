Acest proiect reprezintă o aplicație web realizată pentru gestionarea unei clinici stomatologice. Aplicația este dezvoltată în Next.js și are ca scop prezentarea serviciilor clinicii, gestionarea programărilor și oferirea unui panou de administrare pentru medic.

Proiectul a fost realizat ca aplicație web pentru lucrarea de licență și include atât partea de prezentare pentru pacienți, cât și o zonă administrativă pentru doctor.

## Tehnologii folosite

Pentru dezvoltarea aplicației am folosit următoarele tehnologii:

- Next.js - framework React pentru dezvoltarea aplicațiilor web moderne
- React - bibliotecă JavaScript pentru construirea interfeței
- TypeScript - pentru un cod mai organizat și mai sigur
- Tailwind CSS - pentru stilizarea interfeței
- MongoDB Atlas - baza de date principală, când este configurat `MONGODB_URI`
- SQLite - bază de date locală de rezervă pentru testare fără conexiune externă
- API Routes în Next.js - pentru partea de backend
- Node.js - pentru rularea aplicației și accesarea bazei de date

## Descrierea aplicației

Aplicația este gândită pentru o clinică stomatologică și include mai multe secțiuni importante:

- pagină de prezentare a clinicii;
- prezentarea serviciilor stomatologice;
- zonă pentru programări;
- panou pentru doctor;
- listă de pacienți;
- gestionarea programărilor;
- cereri de programare;
- tarife pentru servicii;
- notițe de tratament;
- notificări interne;
- chatbot pentru pacienți și doctor.

Scopul aplicației este să ofere o soluție simplă prin care o clinică stomatologică poate gestiona mai ușor pacienții și programările.

## Funcționalități principale

Partea publică a aplicației permite pacientului să consulte serviciile, tarifele,
recenziile și să trimită o cerere de programare. Formularul salvează numele,
telefonul, emailul, serviciul dorit, data preferată și mesajul pacientului.

Panoul intern este protejat prin autentificare și este folosit pentru activitatea
de zi cu zi a cabinetului:

- afișarea profilului utilizatorului conectat;
- administrarea conturilor pentru doctori și asistente;
- acordarea de permisiuni pentru programări, cereri, pacienți și conturi;
- acceptarea, marcarea ca văzută sau refuzarea unei cereri;
- programarea unei cereri prin calendar cu disponibilitate live;
- blocarea intervalelor deja ocupate;
- anularea și restabilirea programărilor;
- evidența emailurilor simulate trimise către pacienți;
- afișarea rapidă a următorului pacient, a cererilor urgente și a sloturilor libere.

Pentru partea de email, aplicația folosește momentan un outbox intern. Mesajele
sunt salvate în baza de date și marcate ca trimise în simulare, deoarece proiectul
nu depinde de un serviciu extern SMTP.

## Flux de lucru

1. Pacientul completează formularul de programare de pe pagina publică.
2. Cererea apare în inboxul din panoul doctorului.
3. Doctorul sau asistenta poate accepta, refuza sau marca cererea ca văzută.
4. Pentru programare, se deschide calendarul cu ore libere și ocupate.
5. După salvarea programării, cererea este marcată ca programată.
6. Programarea apare imediat în lista de programări confirmate.

## Baza de date

Aplicația este pregătită să folosească MongoDB Atlas prin variabila
`MONGODB_URI`. Dacă această variabilă nu există sau conexiunea nu este
disponibilă, aplicația folosește automat o bază de date SQLite locală, utilă
pentru testare și dezvoltare.

Exemplu de configurare MongoDB:

```env
MONGODB_URI="mongodb+srv://user:parola@cluster/cata-stoma?retryWrites=true&w=majority"
MONGODB_DB="cata-stoma"
```

Baza SQLite de rezervă este salvată în proiect în folderul:

```txt
data/cata-stoma.sqlite
```

Tabelele importante sunt:

- `appointment_requests` - cererile trimise de pacienți;
- `appointments` - programările confirmate;
- `staff_users` - conturile interne pentru doctori și asistente;
- `outbound_emails` - emailurile simulate trimise către pacienți;
- `patients` - date sumarizate despre pacienți;
- `reviews` - recenziile afișate pe pagina publică.

## Verificarea proiectului

Pentru verificarea codului se pot rula următoarele comenzi:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
