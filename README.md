# Hydraulic Fault Dashboard

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-8B5CF6?logo=react)](https://ui.shadcn.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-F7931E?logo=scikitlearn)](https://scikit-learn.org/)
[![Recharts](https://img.shields.io/badge/Recharts-Visualization-FF6384?logo=recharts)](https://recharts.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

# Hydraulic Fault Dashboard

**Live Demo:**
- Frontend: [hydraulic-fault-dashboard.netlify.app](https://hydraulic-fault-dashboard.netlify.app)
- Backend API: [backend-icy-mountain-7835.fly.dev](https://backend-icy-mountain-7835.fly.dev)

Hydraulic Fault Dashboard is a real-time monitoring and analytics platform for hydraulic systems. It features live data visualization, fault simulation, machine learning-based anomaly detection, and predictive maintenance tools—all in a modern, responsive web interface.

---

## Deployment

- **Frontend** is deployed on [Netlify](https://hydraulic-fault-dashboard.netlify.app)
- **Backend API** is deployed on [Fly.io](https://backend-icy-mountain-7835.fly.dev)

You can access the dashboard UI via the Netlify link above. The frontend communicates with the FastAPI backend hosted on Fly.io for real-time data, analytics, and ML predictions.

---

## Features

- **Real-time Monitoring:** Track pressure, temperature, and flow with live charts.
- **Fault Simulation:** Inject and visualize system faults (leaks, overheating, cavitation, sensor noise).
- **AI/ML Analytics:** Isolation Forest-based anomaly detection and predictive analytics.
- **Role-based Access:** Admin, Operator, and Viewer roles with secure authentication.
- **Service History:** Maintenance records, event logs, and exportable data.
- **Modern UI:** Built with React, TypeScript, Tailwind CSS, and shadcn/ui.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** Python 3.11, FastAPI, Pydantic
- **ML/AI:** Scikit-learn (Isolation Forest)
- **Other:** Vite, Supabase (optional), Docker (for backend)

---

## Quick Start

```bash
# Clone and install frontend
git clone <repo-url>
cd Hydraulic-Fault-Dashboard
npm install
npm run dev
```

- For backend setup, see `backend/README.md` or run:
  ```bash
  cd backend
  pip install -r requirements.txt
  python run.py
  ```

---

## Usage

1. Open the dashboard in your browser (see live demo or local dev URL)
2. Log in with your credentials (admin/operator/viewer)
3. Start simulation, inject faults, and monitor system health
4. View analytics, export data, and manage service history

---

## Project Structure

```
Hydraulic-Fault-Dashboard/
├── src/           # Frontend (React, Vite)
├── backend/       # Backend (FastAPI, ML)
├── public/        # Static assets
├── env.example    # Environment variables
└── ...            # Config, scripts, etc.
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
