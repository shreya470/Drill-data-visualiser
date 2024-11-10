# Drill Data Visualizer

## Table of Contents
  - [Overview](#overview)
  - [Project Structure](#project-structure)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Running the code](#running-the-code)

## Overview
It is a simple web application designed to display interactive plots of drilling data.
Users can visually analyze drilling parameters over time with intuitive features such as zooming, panning, and hover tooltips for detailed insights.

## Project Structure
- **Backend**: Flask is used as the web server framework to handle data requests and serve the web application.
- **Frontend**: The project utilizes D3.js for interactive data visualization, custom JavaScript for enhanced features, and a styled layout with styles.css.
- **Database**: The data is sourced from a structured table containing drilling metrics with timestamps.

## Features
- **Dynamic Chart Rendering**: Visualizes data for key metrics such as ROP, WOB, and RPM.
- **Hover Tooltips**: Displays detailed metric values and timestamps when hovering over data points.
- **Zoom and Pan**: Offers zoom functionality to inspect specific time intervals with adaptive tick intervals.

## Prerequisites
- Python
- pip
- Flask
- Pandas 
- D3.js (linked in index.html)
  
``` bash
pip install Flask 
pip install pandas
```

## Running the code

**Clone the repository**: Clone your project repository to your local machine.

```bash
git clone https://github.com/shreya470/Drill-data-visualiser.git
cd Drill-data-visualiser
```
**Run the Application**:
```bash
flask run
```
**Access the app**: Open your web browser and navigate to http://127.0.0.1:5000/.


