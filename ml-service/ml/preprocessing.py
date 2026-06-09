import numpy as np
import pandas as pd
from datetime import datetime, date
from typing import Tuple

FEATURES = ["total_pedidos","total_receita","ticket_medio","dias_sem_comprar","frequencia_mensal","taxa_cancelamento"]

def calcular_dias_sem_comprar(ultima_compra) -> int:
    if ultima_compra is None or pd.isna(ultima_compra): return 365
    if isinstance(ultima_compra, str):
        try: ultima_compra = datetime.strptime(ultima_compra[:10], "%Y-%m-%d").date()
        except: return 365
    hoje = date.today()
    if isinstance(ultima_compra, datetime): ultima_compra = ultima_compra.date()
    return max(0, (hoje - ultima_compra).days)

def preparar_features(dados: list) -> pd.DataFrame:
    df = pd.DataFrame(dados)
    for col in ["total_pedidos","total_receita","ticket_medio","cancelamentos"]:
        if col in df.columns: df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    df["dias_sem_comprar"] = df["ultima_compra"].apply(calcular_dias_sem_comprar) if "ultima_compra" in df.columns else 180
    df["frequencia_mensal"] = np.where(df["dias_sem_comprar"]>0, df["total_pedidos"]/np.maximum(df["dias_sem_comprar"]/30,1), df["total_pedidos"])
    df["taxa_cancelamento"] = np.where(df["total_pedidos"]>0, df.get("cancelamentos",0)/df["total_pedidos"]*100, 0)
    if "ticket_medio" not in df.columns or df["ticket_medio"].sum()==0:
        df["ticket_medio"] = np.where(df["total_pedidos"]>0, df["total_receita"]/df["total_pedidos"], 0)
    return df

def remover_duplicatas(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates(subset=["cliente_id"], keep="last") if "cliente_id" in df.columns else df.drop_duplicates()

def tratar_outliers(df: pd.DataFrame, features: list) -> pd.DataFrame:
    df = df.copy()
    for col in features:
        if col not in df.columns: continue
        q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        iqr = q3 - q1
        df[col] = df[col].clip(lower=q1-1.5*iqr, upper=q3+1.5*iqr)
    return df

def normalizar_zscore(df, features, media=None, desvio=None):
    df = df.copy()
    if media is None: media = {c: float(df[c].mean()) for c in features if c in df.columns}
    if desvio is None: desvio = {c: float(df[c].std()) if df[c].std()!=0 else 1.0 for c in features if c in df.columns}
    for col in features:
        if col in df.columns: df[col] = (df[col]-media[col])/desvio[col]
    return df, media, desvio

def preprocessar_para_treino(dados):
    df = preparar_features(dados)
    df = remover_duplicatas(df)
    df = tratar_outliers(df, FEATURES)
    df, media, desvio = normalizar_zscore(df, FEATURES)
    return df, media, desvio

def preprocessar_para_inferencia(dados, media, desvio):
    df = preparar_features(dados)
    df = tratar_outliers(df, FEATURES)
    df, _, _ = normalizar_zscore(df, FEATURES, media=media, desvio=desvio)
    return df
