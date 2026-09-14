"""
NEXORA AI Advisor Service
=========================
Provides natural-language failure explanations and maintenance recommendations.

Provider hierarchy:
1. IBM watsonx.ai (if WATSONX_API_KEY and WATSONX_PROJECT_ID are set)
2. Local deterministic advisory engine (always available as fallback)

Never claims local fallback is IBM AI.
"""
import os
from typing import Dict, List, Optional


def _get_watsonx_model():
    api_key    = os.getenv("WATSONX_API_KEY","").strip()
    project_id = os.getenv("WATSONX_PROJECT_ID","").strip()
    url        = os.getenv("WATSONX_URL","https://us-south.ml.cloud.ibm.com").strip()
    if not api_key or not project_id:
        return None, None
    try:
        from ibm_watsonx_ai import APIClient, Credentials
        from ibm_watsonx_ai.foundation_models import ModelInference
        credentials = Credentials(api_key=api_key, url=url)
        client = APIClient(credentials)
        model = ModelInference(
            model_id="ibm/granite-13b-instruct-v2",
            api_client=client,
            project_id=project_id,
            params={"decoding_method":"greedy","max_new_tokens":500,"min_new_tokens":50,"stop_sequences":["###"],"repetition_penalty":1.1},
        )
        return model, project_id
    except Exception as e:
        print(f"[advisor] IBM watsonx.ai unavailable: {e}")
        return None, None


def _build_prompt(asset, sensor, weather, incidents):
    inc_text = ""
    if incidents:
        inc_text = "Similar historical incidents:\n"
        for inc in incidents[:2]:
            inc_text += f"  - {inc['id']} ({inc['failure_type']}): {'; '.join(inc.get('pre_failure_signals',[])[:2])}\n"
    wx = f"Weather: {weather.get('temperature_c','N/A')}C, wind {weather.get('wind_speed_kph','N/A')} kph, storm prob {weather.get('storm_probability','N/A')}" if weather else ""
    return f"""### NEXORA Grid Equipment Failure Advisor\nYou are a senior power grid engineer. Analyze the following equipment data and provide a structured failure risk advisory.\n\nAsset: {asset.get('name')} ({asset.get('type')}) - {asset.get('substation')}, {asset.get('region')}\nAge: {asset.get('age_years')} years | Last maintenance: {asset.get('last_maintenance_days')} days ago | Fault history: {asset.get('fault_history')} events\nHealth score: {asset.get('health_score')}/100 | Failure probability: {round(asset.get('failure_probability',0)*100)}%\n\nLatest sensor readings:\n- Temperature: {sensor.get('temperature_c','N/A')}C (threshold: 85C)\n- Vibration: {sensor.get('vibration_mm_s','N/A')} mm/s (threshold: 5.0)\n- Oil quality: {sensor.get('oil_quality_index','N/A')}/100 (threshold: 60)\n- Load: {sensor.get('load_pct','N/A')}%\n- Partial discharge: {sensor.get('partial_discharge_pC','N/A')} pC\n\n{wx}\n{inc_text}\nProvide: 1) RISK LEVEL 2) Why at risk (3-5 bullets) 3) Recommended actions (3-5 steps) 4) Urgency\n###"""


def _required_equipment(asset, factors_text):
    atype = asset.get("type","transformer")
    equip = ["Thermal imaging camera","Personal protective equipment (PPE)"]
    if "oil" in factors_text: equip.append("Oil sampling kit (dissolved gas analysis)")
    if "vibration" in factors_text: equip.append("Vibration analyser")
    if "partial discharge" in factors_text: equip.append("Partial discharge meter")
    if "cooling" in factors_text or "temperature" in factors_text: equip.append("Cooling system inspection tools")
    if atype=="transformer": equip += ["Insulation resistance tester","Transformer oil test equipment"]
    elif atype=="substation": equip += ["Protection relay test set","Surge arrester tester"]
    elif atype=="feeder": equip += ["Conductor tension meter","Hot stick set","Line patrol vehicle"]
    return equip


def _local_advisory(asset: Dict, sensor: Dict, weather: Optional[Dict], incidents: List[Dict]) -> Dict:
    fprob=asset.get("failure_probability",0); health=asset.get("health_score",100)
    age=asset.get("age_years",0); maint=asset.get("last_maintenance_days",0); faults=asset.get("fault_history",0)
    temp=sensor.get("temperature_c",0); vib=sensor.get("vibration_mm_s",0); load=sensor.get("load_pct",0)
    oq=sensor.get("oil_quality_index",100); pd=sensor.get("partial_discharge_pC",0); volt=sensor.get("voltage_pu",1.0)
    storm_prob=weather.get("storm_probability",0) if weather else 0; wind_kph=weather.get("wind_speed_kph",0) if weather else 0

    if fprob>=0.65 or health<45: risk_level="CRITICAL"; urgency="Immediate - deploy crew within 24 hours"; risk_window="24-72 hours"
    elif fprob>=0.45 or health<60: risk_level="HIGH"; urgency="Within 48 hours"; risk_window="3-7 days"
    elif fprob>=0.25 or health<75: risk_level="MEDIUM"; urgency="Within 1 week"; risk_window="1-3 weeks"
    else: risk_level="LOW"; urgency="Routine scheduled maintenance"; risk_window="No immediate risk"

    factors=[]
    if temp>85: factors.append(f"Equipment temperature critically high ({temp}C) - exceeds 85C safety threshold; accelerated insulation degradation")
    elif temp>70: factors.append(f"Equipment temperature elevated ({temp}C) - above normal operating range; thermal stress on insulation")
    if vib>7.0: factors.append(f"Vibration critically elevated ({vib} mm/s) - mechanical wear, loose components, or bearing failure indicated")
    elif vib>4.0: factors.append(f"Vibration above normal ({vib} mm/s) - potential mechanical looseness or developing wear")
    if oq<50: factors.append(f"Oil quality critically degraded ({oq}/100) - advanced dielectric breakdown; immediate oil service required")
    elif oq<70: factors.append(f"Oil quality declining ({oq}/100) - dielectric performance reduced; DGA oil sampling recommended")
    if load>90: factors.append(f"Load critically high ({load}%) - significantly exceeds rated capacity; thermal and electrical stress")
    elif load>80: factors.append(f"Load elevated ({load}%) - operating above recommended sustained load level")
    if pd>60: factors.append(f"Partial discharge activity high ({pd} pC) - insulation voids or contamination; failure precursor")
    if age>=20: factors.append(f"Asset age {age} years - beyond typical design life; component degradation probability elevated")
    elif age>=15: factors.append(f"Asset age {age} years - approaching end of design life; wear-related risks increasing")
    if maint>200: factors.append(f"Maintenance {maint} days overdue (recommended interval: 180 days)")
    if faults>=3: factors.append(f"{faults} prior fault events on record - recurring issues; root cause may not be fully resolved")
    if storm_prob>0.6: factors.append(f"Severe weather forecast (storm probability {round(storm_prob*100)}%, wind {wind_kph} kph)")
    elif storm_prob>0.4: factors.append(f"Storm system approaching (probability {round(storm_prob*100)}%) - additional weather stress expected")
    if volt<0.90: factors.append(f"Voltage significantly below nominal ({volt} pu) - supply quality degraded")
    if not factors: factors.append("No individual threshold exceedances - risk driven by combined factor accumulation")

    historical_note=""
    if incidents:
        inc=incidents[0]; historical_note=f"Historical pattern match: {inc['id']} ({inc['failure_type']}) showed similar pre-failure conditions. Resolution: {inc.get('resolution','N/A')}"

    recs=[]
    if temp>70 or oq<70: recs.append("Inspect cooling system - check fans, coolant flow, heat exchangers, and thermal regulation")
    if oq<75: recs.append("Perform dissolved gas analysis (DGA) oil sampling - assess insulation degradation and contamination")
    if vib>4.0: recs.append("Vibration analysis inspection - check mechanical looseness, bearing condition, and mounting integrity")
    if load>80: recs.append("Review load management - evaluate load balancing or temporary reduction options")
    if pd>40: recs.append("Partial discharge investigation - inspect insulation, clean bushings, check for contamination or voids")
    if maint>150: recs.append("Schedule comprehensive preventive maintenance - inspection now overdue per standard intervals")
    if storm_prob>0.5: recs.append("Pre-storm preparation - secure external components, verify protection settings, prepare switching plan")
    if risk_level in ("CRITICAL","HIGH"):
        recs.append("Pre-position replacement equipment and spare parts at nearest depot for rapid deployment")
        recs.append(f"Prepare contingency switching plan to isolate {asset.get('name')} if conditions deteriorate")
    if not recs: recs.append("Continue normal monitoring schedule"); recs.append("Verify protection relay settings are current")

    factors_text=" ".join(factors).lower()
    summary=f"{asset.get('name')} ({asset.get('type')}) at {asset.get('substation')} is assessed at {risk_level} risk with failure probability {round(fprob*100)}% and health score {health}/100. Primary risk drivers: {'; '.join(factors[:3])}. Estimated risk window: {risk_window}."
    if historical_note: summary+=f" {historical_note}"

    return {
        "provider":"Local Advisory Engine (NEXORA Risk Calculator)","ibm_ai_used":False,
        "asset_id":asset.get("id"),"asset_name":asset.get("name"),
        "risk_level":risk_level,"failure_probability_pct":round(fprob*100,1),"risk_window":risk_window,
        "urgency":urgency,"health_score":health,"executive_summary":summary,
        "contributing_factors":factors,"historical_similarity":historical_note,
        "weather_contribution":(f"Storm probability {round(storm_prob*100)}%, wind {wind_kph} kph - "+("significant weather contribution" if storm_prob>0.5 else "moderate weather contribution" if storm_prob>0.3 else "low weather contribution")) if weather else "Weather data not available",
        "recommendations":recs,"crew_type":"Transformer specialist crew with DGA/oil system capability" if asset.get("type")=="transformer" else "Substation electrical specialist crew" if asset.get("type")=="substation" else "Overhead line/feeder specialist crew",
        "required_equipment":_required_equipment(asset,factors_text),
        "grid_impact":{"impact_score":asset.get("impact_score",0),"customers_affected":asset.get("customers_affected",0),"critical_facilities":asset.get("critical_facilities",[])},
    }


def generate_advisory(asset: Dict, sensor: Dict, weather: Optional[Dict], incidents: List[Dict]) -> Dict:
    model, project_id = _get_watsonx_model()
    if model is not None:
        try:
            prompt = _build_prompt(asset, sensor, weather, incidents)
            response = model.generate_text(prompt=prompt)
            raw_text = response if isinstance(response,str) else str(response)
            result = _local_advisory(asset, sensor, weather, incidents)
            result["ibm_ai_used"] = True
            result["provider"] = f"IBM watsonx.ai (ibm/granite-13b-instruct-v2, project: {project_id})"
            result["ibm_narrative"] = raw_text.strip()
            return result
        except Exception as e:
            print(f"[advisor] watsonx.ai inference failed, using local fallback: {e}")
    return _local_advisory(asset, sensor, weather, incidents)
