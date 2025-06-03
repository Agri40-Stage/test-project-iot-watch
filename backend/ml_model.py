import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

def train_predict_temperature(data):
    # Conversion robuste du timestamp
    try:
        # Solution 1 (recommandée) : Utilisation directe des timestamps
        data['timestamp_num'] = pd.to_datetime(data['timestamp']).view('int64') // 10**9
        
        # Solution alternative si problème avec view():
        # data['timestamp_num'] = pd.to_datetime(data['timestamp']).astype('int64') // 10**9
        
        X = data['timestamp_num'].values.reshape(-1, 1)
        y = data['temperature'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        last_time = X[-1][0]
        predict_time = np.array([[last_time + 3600]])  # +1h (3600 secondes)
        return float(model.predict(predict_time)[0])
        
    except Exception as e:
        print(f"Erreur dans train_predict_temperature: {str(e)}")
        raise