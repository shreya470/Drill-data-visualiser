from flask import Flask, render_template, jsonify, request
import pandas as pd

app = Flask(__name__)

# Load and preprocess the dataset
data = pd.read_csv('data/PlottingData.csv')
data['Time'] = pd.to_datetime(data['Time'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-data')
def get_data():
    basin = request.args.get('basin')
    filtered_data = data if basin is None or basin == 'All' else data[data['Basin'] == basin]
    return jsonify(filtered_data.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True)
