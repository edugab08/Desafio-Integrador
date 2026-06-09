import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from .preprocessing import FEATURES, preprocessar_para_treino, preprocessar_para_inferencia

MODEL_PATH   = Path(__file__).parent / "models"
CHURN_FILE   = MODEL_PATH / "churn_model.joblib"
SCORING_FILE = MODEL_PATH / "scoring_model.joblib"
PARAMS_FILE  = MODEL_PATH / "scaler_params.joblib"

def gerar_dados_sinteticos(n=800, seed=42):
    rng = np.random.default_rng(seed)
    total_pedidos     = rng.integers(1,60,size=n).astype(float)
    total_receita     = total_pedidos * rng.uniform(200,8000,size=n)
    ticket_medio      = total_receita / total_pedidos
    dias_sem_comprar  = rng.integers(0,400,size=n).astype(float)
    frequencia_mensal = total_pedidos / np.maximum(dias_sem_comprar/30,1)
    taxa_cancelamento = rng.uniform(0,30,size=n)
    score_churn = (0.40*(dias_sem_comprar/400) + 0.25*(taxa_cancelamento/30) - 0.20*(frequencia_mensal/frequencia_mensal.max()) - 0.15*(total_receita/total_receita.max()) + rng.normal(0,0.05,size=n))
    churn = (score_churn > 0.30).astype(int)
    score_compra = (0.35*(frequencia_mensal/frequencia_mensal.max()) + 0.30*(total_receita/total_receita.max()) - 0.20*(dias_sem_comprar/400) - 0.15*(taxa_cancelamento/30) + rng.normal(0,0.05,size=n))
    alta_propensao = (score_compra > 0.45).astype(int)
    return pd.DataFrame({"cliente_id":range(1,n+1),"total_pedidos":total_pedidos,"total_receita":np.round(total_receita,2),"ticket_medio":np.round(ticket_medio,2),"dias_sem_comprar":dias_sem_comprar,"frequencia_mensal":np.round(frequencia_mensal,4),"taxa_cancelamento":np.round(taxa_cancelamento,2),"cancelamentos":np.round(total_pedidos*taxa_cancelamento/100).astype(int),"churn":churn,"alta_propensao":alta_propensao})

def treinar_modelos(dados=None):
    MODEL_PATH.mkdir(parents=True, exist_ok=True)
    df_raw = pd.DataFrame(dados) if dados else gerar_dados_sinteticos(n=1000)
    df, media, desvio = preprocessar_para_treino(df_raw.to_dict("records"))
    X = df[FEATURES].values
    y_churn = df_raw["churn"].values if "churn" in df_raw.columns else (df["dias_sem_comprar"]>0).astype(int).values
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_churn, test_size=0.2, random_state=42, stratify=y_churn)
    churn_model = RandomForestClassifier(n_estimators=200,max_depth=8,min_samples_split=4,min_samples_leaf=2,max_features="sqrt",class_weight="balanced",random_state=42,n_jobs=-1)
    churn_model.fit(X_tr, y_tr)
    y_pred = churn_model.predict(X_te)
    metricas_churn = {"acuracia":round(accuracy_score(y_te,y_pred)*100,2),"precision":round(precision_score(y_te,y_pred,zero_division=0)*100,2),"recall":round(recall_score(y_te,y_pred,zero_division=0)*100,2),"f1_score":round(f1_score(y_te,y_pred,zero_division=0)*100,2)}
    y_scoring = df_raw["alta_propensao"].values if "alta_propensao" in df_raw.columns else (df["frequencia_mensal"]>df["frequencia_mensal"].median()).astype(int).values
    X_tr2,X_te2,y_tr2,y_te2 = train_test_split(X,y_scoring,test_size=0.2,random_state=42,stratify=y_scoring)
    scoring_model = RandomForestClassifier(n_estimators=200,max_depth=8,min_samples_split=4,min_samples_leaf=2,max_features="sqrt",random_state=42,n_jobs=-1)
    scoring_model.fit(X_tr2,y_tr2)
    metricas_scoring = {"acuracia":round(accuracy_score(y_te2,scoring_model.predict(X_te2))*100,2)}
    joblib.dump(churn_model, CHURN_FILE)
    joblib.dump(scoring_model, SCORING_FILE)
    joblib.dump({"media":media,"desvio":desvio}, PARAMS_FILE)
    return {"status":"treinado","amostras_treino":len(X_tr),"metricas_churn":metricas_churn,"metricas_scoring":metricas_scoring,"feature_importance":dict(zip(FEATURES,churn_model.feature_importances_.tolist()))}

def carregar_modelos():
    if not CHURN_FILE.exists(): raise FileNotFoundError("Modelos nao treinados")
    params = joblib.load(PARAMS_FILE)
    return joblib.load(CHURN_FILE), joblib.load(SCORING_FILE), params["media"], params["desvio"]

def predizer_churn(dados):
    churn_model,_,media,desvio = carregar_modelos()
    df = preprocessar_para_inferencia(dados, media, desvio)
    probs = churn_model.predict_proba(df[FEATURES].values)
    resultados = []
    for i, dado in enumerate(dados):
        prob = round(float(probs[i][1])*100,1)
        seg  = "Perdido" if prob>=60 else "Em Risco" if prob>=40 else "Atencao" if prob>=20 else "Ativo"
        acao = "Contato urgente" if prob>=60 else "Campanha reengajamento" if prob>=30 else "Manter relacionamento"
        resultados.append({"cliente_id":dado.get("cliente_id"),"nome":dado.get("nome",""),"churn_pct":prob,"scoring":round(float(probs[i][0])*100,1),"segmento":seg,"acao_sugerida":acao})
    return resultados

def predizer_scoring(dados):
    _,scoring_model,media,desvio = carregar_modelos()
    df = preprocessar_para_inferencia(dados, media, desvio)
    probs = scoring_model.predict_proba(df[FEATURES].values)
    resultados = []
    for i, dado in enumerate(dados):
        score = round(float(probs[i][1])*100,1)
        prio  = "Alta" if score>=75 else "Media" if score>=50 else "Baixa"
        est   = "Upsell imediato" if score>=75 else "Campanha personalizada" if score>=50 else "Reengajamento"
        resultados.append({"cliente_id":dado.get("cliente_id"),"nome":dado.get("nome",""),"score_pct":score,"scoring":score,"prioridade":prio,"estrategia":est})
    return sorted(resultados, key=lambda x: x["score_pct"], reverse=True)
