# DataSight — Sistema de Analise Empresarial

Desafio Integrador 5 Periodo - Engenharia de Software - Campo Real 2026

## Stack
- Frontend: Next.js 15 + React + Recharts
- Backend: NestJS + TypeORM + PostgreSQL
- ML Service: FastAPI + scikit-learn (Random Forest)

## Como rodar

### 1. Criar o banco
```sql
CREATE DATABASE datasight;
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### 3. ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Ou com Docker
```bash
docker compose up
```

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs
- ML Service: http://localhost:8000/docs
