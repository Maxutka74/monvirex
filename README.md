# Monvirex

**Full-stack cryptocurrency trading simulator** built with Django REST Framework, React, and TypeScript.

🌐 **[Live Demo — monvirex.online](https://www.monvirex.online/)**

Monvirex brings together simulated cryptocurrency trading, portfolio management, market charts, transaction history, notifications, and AI-assisted insights in one responsive application. It is a portfolio project demonstrating full-stack engineering, third-party integrations, and cloud deployment.

> **Disclaimer:** Monvirex is an educational simulator, **not** a cryptocurrency exchange, financial adviser, or real-money trading platform. Displayed balances and trades are simulated. Do not rely on AI-generated insights for investment decisions.

## Preview

Explore the [live application](https://www.monvirex.online/)


## Features

| Area | Capabilities |
| --- | --- |
| **Authentication** | Email/password, email verification, password reset, Google sign-in, Telegram sign-in, JWT access/refresh cookies |
| **Trading** | Simulated cryptocurrency buy, sell, and exchange operations; confirmation and transaction history |
| **Portfolio** | Asset holdings, balances, portfolio overview and analytics |
| **Market data** | Binance market-data integration, price charts, and WebSocket-based updates |
| **AI assistant** | Gemini-powered chat, market analysis, and portfolio analysis |
| **Payments** | Stripe Checkout integration, transaction tracking, and verified webhook handling |
| **Notifications** | In-app notifications and unread counts |
| **Administration** | Staff-only management interface and user details, including Telegram-linked accounts |
| **Profile** | Profile management and authentication-method-aware account actions |

Some features require configured third-party accounts or API keys. The availability of individual integrations may vary between local development and the live deployment.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Python 3.12, Django, Django REST Framework, Django Channels, drf-spectacular |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router |
| **State & HTTP** | Zustand, Axios, TanStack Query |
| **Database & caching** | PostgreSQL, Redis |
| **Background tasks** | Celery, Celery Beat |
| **Charts** | ECharts, Recharts |
| **External services** | Binance API, Google OAuth, Telegram, Stripe, SendGrid, Cloudinary, Google Gemini |
| **Infrastructure** | Docker / Docker Compose, Azure App Service, Azure Database for PostgreSQL, Vercel |
| **Code quality** | Ruff, ESLint, TypeScript checks |

## Architecture

```text
                 Browser
                    |
           React + TypeScript
             (Vercel SPA)
                    |
              REST / HTTPS
                    |
          Django REST Framework
            (Azure App Service)
              /     |      \
     PostgreSQL    Redis   External APIs
                     |
               Celery workers
               & scheduled jobs
```

The frontend follows a feature-oriented, **FSD-inspired** structure. The backend separates business domains into Django applications. PostgreSQL stores persistent data; Redis supports caching and asynchronous workflows. Celery handles background and scheduled work. WebSocket functionality supports live market updates.

Trading-related balance updates use database transactions and row-level locking where applicable to reduce concurrency issues. Backend permissions enforce access to protected operations; frontend route guards are an additional UX layer, not the security boundary.

### Repository structure

```text
monvirex/
├── backend/
│   ├── apps/
│   │   ├── admin_panel/
│   │   ├── ai/
│   │   ├── assets/
│   │   ├── auth_app/
│   │   ├── notifications/
│   │   ├── trades/
│   │   └── wallet/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.sample
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── widgets/
│   │   ├── features/
│   │   ├── entities/
│   │   └── shared/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.sample
└── README.md
```

## Engineering Highlights

- **Frontend performance:** Improved initial loading with route-based code splitting, `React.lazy`, `Suspense`, and chart-bundle optimization.
- **Live market data:** Combined market API requests, caching, and WebSockets to update chart data while limiting unnecessary requests.
- **Payment reliability:** Integrated Stripe webhooks and transaction status handling rather than treating a browser redirect as payment confirmation.
- **Background processing:** Used Celery and Redis for market-data synchronization and scheduled operations.
- **Authentication:** Supported multiple sign-in methods with cookie-based JWT sessions and account actions adapted to Telegram-linked users.

## Getting Started

### Requirements

- Git
- Python **3.12**
- Node.js and npm compatible with `frontend/package.json`
- PostgreSQL
- Redis
- Credentials for any external integrations you want to test

### 1. Clone

```bash
git clone https://github.com/Maxutka74/monvirex.git
cd monvirex
```

### 2. Configure environment variables

**Linux / macOS / Git Bash:**

```bash
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env
```

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.sample backend/.env
Copy-Item frontend/.env.sample frontend/.env
```

Edit both `.env` files with your local connection URLs and required provider credentials. **Never commit real `.env` files.**

For a non-containerized setup, database and Redis URLs typically point to `localhost`:

```dotenv
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/monvirex
REDIS_URL=redis://localhost:6379/0
```

If services run in Docker, replace `localhost` with the actual Compose service hostnames **inside the container** (for example, `db` and `redis`, only if those names match your Compose file).

### 3. Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# Linux / macOS
source .venv/bin/activate

# Windows PowerShell (run this instead on Windows)
# .\.venv\Scripts\Activate.ps1
```

Install dependencies and prepare the database:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend: `http://localhost:8000` · API base: `http://localhost:8000/api`

### 4. Frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

> Ensure `VITE_API_URL=http://localhost:8000/api` and `CORS_ALLOWED_ORIGINS=http://localhost:5173` for the default local setup. Restart Vite after changing its environment variables.

### Background jobs and Docker

Some features require running Redis, Celery workers, and Celery Beat separately. Starting Django alone does not start these services. Use the Celery app path and commands defined by your project configuration.

Docker / Docker Compose is also used in the project. Check the actual Compose file, service names, environment paths, and startup commands before using `docker compose up --build`; this README does not assume a specific Compose layout.

## Environment Configuration

The full variable templates live in **`backend/.env.sample`** and **`frontend/.env.sample`**.

**Backend**

| Category | Variables |
| --- | --- |
| Django | `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` |
| Database / cache | `DATABASE_URL`, `REDIS_URL` |
| Email | `SENDGRID_API_KEY`, `EMAIL_FROM` |
| Authentication | `GOOGLE_CLIENT_ID`, `TELEGRAM_BOT_TOKEN` |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` |
| Media | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| AI | `GEMINI_API_KEY` |
| Cross-origin requests | `CORS_ALLOWED_ORIGINS` |

**Frontend**

| Variable | Purpose |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID |
| `VITE_API_URL` | Backend API base URL, including `/api` |
| `ALLOWED_HOSTS` | Only applicable if explicitly read by `vite.config.ts`; not a built-in Vite environment option |

Variables beginning with `VITE_` are included in client-side builds. **Do not put private keys or tokens in frontend variables.**

## Tests and Quality Checks

Run the commands that match the installed tools and repository configuration.

**Backend:**

```bash
cd backend
python manage.py test
ruff check .
```

**Frontend:**

```bash
cd frontend
npm run lint
npm run build
```

For manual integration testing, check sign-in methods, portfolio and trade flows, charts, Stripe **test-mode** checkout/webhooks, notifications, and Gemini features with appropriate credentials.

## Deployment

| Component | Hosting |
| --- | --- |
| Frontend | Vercel |
| Backend | Azure App Service |
| Database | Azure Database for PostgreSQL – Flexible Server |
| Website | **https://www.monvirex.online/** |

Deployment requires production-specific environment variables, allowed hosts and CORS origins, HTTPS/cookie settings, database connectivity, static/media configuration, and correct OAuth/Stripe callbacks. Set `DEBUG=False` in production and keep all server-side credentials in the hosting platform's secret configuration.

## Security Notes

- Use unique, private credentials and rotate any key accidentally exposed in Git history.
- Keep Django `SECRET_KEY`, database credentials, Stripe secrets, Cloudinary secrets, and Gemini API keys on the server.
- Verify Stripe webhook signatures; a success redirect alone does not prove payment.
- Enforce permissions in backend endpoints, not only in React route guards.
- Configure cookie `Secure` / `SameSite`, HTTPS, CORS, and credentialed requests consistently for your domains.

## Troubleshooting

- **Database unavailable:** verify PostgreSQL is running and `DATABASE_URL` uses a reachable hostname, port, and credentials.
- **CORS / cookies:** check the exact frontend origin, `VITE_API_URL`, cookie attributes, and Axios credential settings.
- **OAuth / Telegram:** verify provider configuration, approved domains, and callback/widget settings.
- **Payments / AI / email:** check the provider keys, webhook or sender settings, and backend logs without exposing secrets.

## License

No license has been specified. Unless a license is added, the repository should not be assumed to grant permission to reuse or redistribute its code.
