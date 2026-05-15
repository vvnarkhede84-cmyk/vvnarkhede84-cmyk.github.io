#!/usr/bin/env python3
"""
National AQI Live-Mapping Terminal - Data Fetcher
Fetches real-time AQI data from WAQI API for top 50 Indian cities
and writes it to a structured JSON file for frontend consumption.
"""

import os
import json
import requests
from datetime import datetime, timezone
from typing import List, Dict, Optional

# Top 50 Indian cities with coordinates and population
CITIES_MATRIX = [
    {"name": "Mumbai", "state": "Maharashtra", "population": "21,291,000", "coordinates": [19.0760, 72.8777]},
    {"name": "New Delhi", "state": "Delhi", "population": "33,807,000", "coordinates": [28.6139, 77.2090]},
    {"name": "Bangalore", "state": "Karnataka", "population": "12,476,000", "coordinates": [12.9716, 77.5946]},
    {"name": "Hyderabad", "state": "Telangana", "population": "10,123,000", "coordinates": [17.3850, 78.4867]},
    {"name": "Chennai", "state": "Tamil Nadu", "population": "7,088,000", "coordinates": [13.0827, 80.2707]},
    {"name": "Kolkata", "state": "West Bengal", "population": "15,133,000", "coordinates": [22.5726, 88.3639]},
    {"name": "Pune", "state": "Maharashtra", "population": "6,430,000", "coordinates": [18.5204, 73.8567]},
    {"name": "Ahmedabad", "state": "Gujarat", "population": "8,450,000", "coordinates": [23.0225, 72.5714]},
    {"name": "Jaipur", "state": "Rajasthan", "population": "4,850,000", "coordinates": [26.9124, 75.7873]},
    {"name": "Lucknow", "state": "Uttar Pradesh", "population": "3,382,000", "coordinates": [26.8467, 80.9462]},
    {"name": "Kanpur", "state": "Uttar Pradesh", "population": "3,226,000", "coordinates": [26.4499, 80.3319]},
    {"name": "Nagpur", "state": "Maharashtra", "population": "2,405,000", "coordinates": [21.1458, 79.0882]},
    {"name": "Indore", "state": "Madhya Pradesh", "population": "1,984,000", "coordinates": [22.7196, 75.8615]},
    {"name": "Surat", "state": "Gujarat", "population": "6,081,000", "coordinates": [21.1702, 72.8311]},
    {"name": "Bhopal", "state": "Madhya Pradesh", "population": "2,357,000", "coordinates": [23.1815, 79.9864]},
    {"name": "Vadodara", "state": "Gujarat", "population": "2,065,000", "coordinates": [22.3072, 73.1812]},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "population": "1,729,000", "coordinates": [28.6692, 77.4538]},
    {"name": "Ludhiana", "state": "Punjab", "population": "1,618,000", "coordinates": [30.9010, 75.8573]},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "population": "1,730,000", "coordinates": [17.6869, 83.2185]},
    {"name": "Patna", "state": "Bihar", "population": "1,684,000", "coordinates": [25.5941, 85.1376]},
    {"name": "Vellore", "state": "Tamil Nadu", "population": "561,000", "coordinates": [12.9689, 79.1288]},
    {"name": "Nashik", "state": "Maharashtra", "population": "1,486,000", "coordinates": [19.9975, 73.7898]},
    {"name": "Aurangabad", "state": "Maharashtra", "population": "1,173,000", "coordinates": [19.8762, 75.3433]},
    {"name": "Dhanbad", "state": "Jharkhand", "population": "1,196,000", "coordinates": [23.7957, 86.4304]},
    {"name": "Amritsar", "state": "Punjab", "population": "1,317,000", "coordinates": [31.6340, 74.8723]},
    {"name": "Navi Mumbai", "state": "Maharashtra", "population": "1,120,000", "coordinates": [19.0330, 73.0297]},
    {"name": "Allahabad", "state": "Uttar Pradesh", "population": "1,215,000", "coordinates": [25.4358, 81.8463]},
    {"name": "Ranchi", "state": "Jharkhand", "population": "1,440,000", "coordinates": [23.3441, 85.3096]},
    {"name": "Howrah", "state": "West Bengal", "population": "1,007,000", "coordinates": [22.5958, 88.2636]},
    {"name": "Coimbatore", "state": "Tamil Nadu", "population": "1,930,000", "coordinates": [11.0066, 76.9655]},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "population": "1,360,000", "coordinates": [23.1815, 79.9864]},
    {"name": "Guwahati", "state": "Assam", "population": "1,063,000", "coordinates": [26.1445, 91.7362]},
    {"name": "Chandigarh", "state": "Chandigarh", "population": "1,055,000", "coordinates": [30.7333, 76.7794]},
    {"name": "Solapur", "state": "Maharashtra", "population": "951,000", "coordinates": [17.6599, 75.9064]},
    {"name": "Hubballi", "state": "Karnataka", "population": "943,000", "coordinates": [15.3647, 75.1240]},
    {"name": "Thiruvananthapuram", "state": "Kerala", "population": "957,000", "coordinates": [8.5241, 76.9366]},
    {"name": "Kochi", "state": "Kerala", "population": "677,000", "coordinates": [9.9312, 76.2673]},
    {"name": "Meerut", "state": "Uttar Pradesh", "population": "1,423,000", "coordinates": [28.9845, 77.7064]},
    {"name": "Belgaum", "state": "Karnataka", "population": "608,000", "coordinates": [15.8497, 74.5021]},
    {"name": "Akola", "state": "Maharashtra", "population": "385,000", "coordinates": [20.7127, 77.0249]},
    {"name": "Thane", "state": "Maharashtra", "population": "2,331,000", "coordinates": [19.2183, 72.9781]},
    {"name": "Faridabad", "state": "Haryana", "population": "1,809,000", "coordinates": [28.4089, 77.3178]},
    {"name": "Vadodara", "state": "Gujarat", "population": "1,780,000", "coordinates": [22.3072, 73.1812]},
    {"name": "Guwahati", "state": "Assam", "population": "1,063,000", "coordinates": [26.1445, 91.7362]},
    {"name": "Yamunanagar", "state": "Haryana", "population": "651,000", "coordinates": [29.1530, 77.2668]},
    {"name": "Bikaner", "state": "Rajasthan", "population": "651,000", "coordinates": [28.0229, 71.8315]},
    {"name": "Jodhpur", "state": "Rajasthan", "population": "1,033,000", "coordinates": [26.2389, 73.0243]},
    {"name": "Madurai", "state": "Tamil Nadu", "population": "1,465,000", "coordinates": [9.9252, 78.1198]},
    {"name": "Alappuzha", "state": "Kerala", "population": "360,000", "coordinates": [9.4981, 76.3367]},
    {"name": "Asansol", "state": "West Bengal", "population": "1,347,000", "coordinates": [23.6836, 86.9656]},
    {"name": "Durgapur", "state": "West Bengal", "population": "579,000", "coordinates": [23.5000, 87.3000]},
]

WAQI_BASE_URL = "https://api.waqi.info/feed"


def fetch_aqi_data(city_name: str, token: str) -> Optional[Dict]:
    """
    Fetch AQI data from WAQI API for a single city.
    
    Args:
        city_name: Name of the city to fetch data for
        token: WAQI API token
    
    Returns:
        Dictionary with AQI data or None if request fails
    """
    try:
        url = f"{WAQI_BASE_URL}/{city_name}/?token={token}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data.get("status") == "ok":
            return data.get("data", {})
        else:
            print(f"⚠️  Error fetching {city_name}: {data.get('data', 'Unknown error')}")
            return None
    except requests.RequestException as e:
        print(f"❌ Request failed for {city_name}: {str(e)}")
        return None


def extract_aqi_info(aqi_data: Dict) -> tuple[Optional[int], Optional[str]]:
    """
    Extract AQI value and dominant pollutant from API response.
    
    Args:
        aqi_data: Raw data from WAQI API
    
    Returns:
        Tuple of (aqi_value, dominant_pollutant)
    """
    aqi = aqi_data.get("aqi")
    
    # Extract dominant pollutant from iaqi (Individual Air Quality Index)
    iaqi = aqi_data.get("iaqi", {})
    dominant_pollutant = None
    max_level = -1
    
    pollutant_map = {
        "pm25": "pm25",
        "pm10": "pm10",
        "o3": "o3",
        "no2": "no2",
        "so2": "so2",
        "co": "co",
    }
    
    for key, short_name in pollutant_map.items():
        if key in iaqi:
            level = iaqi[key].get("v", -1)
            if level > max_level:
                max_level = level
                dominant_pollutant = short_name
    
    return aqi, dominant_pollutant


def aggregate_cities_data(token: str) -> List[Dict]:
    """
    Fetch and aggregate AQI data for all cities.
    
    Args:
        token: WAQI API token
    
    Returns:
        List of city records with AQI data
    """
    cities_data = []
    
    for idx, city_info in enumerate(CITIES_MATRIX, 1):
        print(f"[{idx}/{len(CITIES_MATRIX)}] Fetching data for {city_info['name']}...", end=" ")
        
        aqi_data = fetch_aqi_data(city_info["name"], token)
        if aqi_data:
            aqi, pollutant = extract_aqi_info(aqi_data)
            if aqi is not None:
                city_record = {
                    "name": city_info["name"],
                    "state": city_info["state"],
                    "population": city_info["population"],
                    "coordinates": city_info["coordinates"],
                    "aqi": aqi,
                    "dominant_pollutant": pollutant or "unknown",
                }
                cities_data.append(city_record)
                print(f"✅ AQI: {aqi}")
            else:
                print("⚠️  No AQI value")
        else:
            print("❌ Failed")
    
    return cities_data


def write_snapshot(cities_data: List[Dict], output_path: str) -> None:
    """
    Write aggregated AQI data to JSON file.
    
    Args:
        cities_data: List of city records with AQI data
        output_path: Path to write the JSON snapshot
    """
    snapshot = {
        "last_updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "cities": cities_data,
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(snapshot, f, indent=2)
    
    print(f"\n✅ Data snapshot written to {output_path}")
    print(f"📊 Total cities processed: {len(cities_data)}")


def main():
    """Main entry point for the data fetcher."""
    # Get API token from environment variable
    token = os.getenv("WAQI_TOKEN")
    if not token:
        raise ValueError("WAQI_TOKEN environment variable is not set")
    
    print("🌍 National AQI Live-Mapping Terminal - Data Fetcher")
    print("=" * 50)
    print(f"🕐 Started at {datetime.now(timezone.utc).isoformat()}")
    print()
    
    # Aggregate data for all cities
    cities_data = aggregate_cities_data(token)
    
    # Write snapshot to file
    output_path = "data/aqi_snapshot.json"
    write_snapshot(cities_data, output_path)
    
    print()
    print("✨ AQI data fetch completed successfully!")


if __name__ == "__main__":
    main()
