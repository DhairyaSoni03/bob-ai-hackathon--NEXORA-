# Architecture

## System Architecture

NEXORA uses a layered web-application architecture that takes grid and equipment measurements, prepares them for analysis, evaluates operational conditions through AI/ML models, converts the results into risk and health indicators, and presents the findings through an interactive operator dashboard.

The current proof of concept uses simulated sensor data so the complete monitoring, prediction, alerting, and advisory workflow can be demonstrated without requiring access to a live utility network.

```mermaid
graph TD
    A["Simulated Grid and Equipment Data"] --> B["Data Ingestion and Simulation"]
    B --> C["Data Processing and Feature Preparation"]
    C --> D["AI and ML Analysis"]

    D --> D1["Outage Risk Prediction"]
    D --> D2["Equipment Failure Risk Prediction"]
    D --> D3["Anomaly Detection"]

    D1 --> E["Risk Assessment"]
    D2 --> E
    D3 --> E

    E --> E1["Outage Risk"]
    E --> E2["Failure Risk"]
    E --> E3["Grid Health Score"]
    E --> E4["Equipment Health Score"]
    E --> E5["Risk Classification"]

    E --> F["AI Failure Advisor"]

    F --> F1["Risk Explanation"]
    F --> F2["Contributing Factors"]
    F --> F3["Estimated Risk Window"]
    F --> F4["Preventive Recommendations"]

    B --> G["In-Memory Application State"]
    E --> G
    F --> G

    G --> H["FastAPI Backend"]

    H --> H1["Grid API"]
    H --> H2["Equipment API"]
    H --> H3["Equipment Detail API"]
    H --> H4["Alerts API"]
    H --> H5["Advisor API"]
    H --> H6["Scenario Start API"]
    H --> H7["Scenario Stop API"]

    H --> I["Web Frontend"]

    I --> I1["Grid Overview"]
    I --> I2["Equipment Monitoring"]
    I --> I3["Grid Topology"]
    I --> I4["Active Alerts"]
    I --> I5["Historical Trends"]
    I --> I6["AI Failure Advisor"]
    I --> I7["AI Advisory Details"]

    I --> J["Grid Operator"]
