from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from ml.random_forest import treinar_modelos, predizer_churn, predizer_scoring, CHURN_FILE, FEATURES
from ml.preprocessing import FEATURES as FEATURE_LIST

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not CHURN_FILE.exists():
        print("Treinando modelos com dados sinteticos...")
        r = treinar_modelos()
        print(f"Modelos treinados! Acuracia churn: {r['metricas_churn']['acuracia']}%")
    else:
        print("Modelos carregados do disco.")
    yield

app = FastAPI(title="DataSight ML Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000","http://localhost:3001"], allow_methods=["*"], allow_headers=["*"])

class ClienteInput(BaseModel):
    cliente_id:    Optional[int]   = None
    nome:          Optional[str]   = ""
    total_pedidos: float           = Field(default=0, ge=0)
    total_receita: float           = Field(default=0, ge=0)
    ticket_medio:  float           = Field(default=0, ge=0)
    ultima_compra: Optional[str]   = None
    cancelamentos: float           = Field(default=0, ge=0)

class PredictRequest(BaseModel):
    clientes: list[ClienteInput]

@app.get("/")
def root(): return {"servico":"DataSight ML Service","status":"online","modelo":"Random Forest","features":FEATURE_LIST}

@app.get("/health")
def health(): return {"status":"ok" if CHURN_FILE.exists() else "modelos_nao_treinados"}

@app.get("/model/info")
def info():
    from ml.random_forest import carregar_modelos
    try:
        churn_model,_,_,_ = carregar_modelos()
        return {"modelo":"Random Forest","n_estimators":churn_model.n_estimators,"max_depth":churn_model.max_depth,"features":FEATURE_LIST,"importancia":dict(zip(FEATURES,[round(v*100,2) for v in churn_model.feature_importances_]))}
    except: raise HTTPException(503,"Modelos nao treinados")

@app.post("/model/train")
def treinar():
    try: return treinar_modelos()
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/predict/churn")
def churn(req: PredictRequest):
    if not req.clientes: raise HTTPException(400,"Lista vazia")
    try:
        preds = predizer_churn([c.model_dump() for c in req.clientes])
        alto  = [p for p in preds if p["churn_pct"]>=60]
        medio = [p for p in preds if 40<=p["churn_pct"]<60]
        baixo = [p for p in preds if p["churn_pct"]<40]
        return {"modelo":"Random Forest - Churn","total":len(preds),"resumo":{"alto_risco":len(alto),"medio_risco":len(medio),"baixo_risco":len(baixo)},"predicoes":sorted(preds,key=lambda x:x["churn_pct"],reverse=True)}
    except FileNotFoundError: raise HTTPException(503,"Modelos nao treinados. Chame POST /model/train")
    except Exception as e: raise HTTPException(500,str(e))

@app.post("/predict/scoring")
def scoring(req: PredictRequest):
    if not req.clientes: raise HTTPException(400,"Lista vazia")
    try: return {"modelo":"Random Forest - Scoring","total":len(req.clientes),"predicoes":predizer_scoring([c.model_dump() for c in req.clientes])}
    except FileNotFoundError: raise HTTPException(503,"Modelos nao treinados")
    except Exception as e: raise HTTPException(500,str(e))
