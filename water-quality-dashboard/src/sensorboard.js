import Starfield from "./Startfield";
import React, { useEffect, useState, useCallback } from 'react';
import GaugeChart from 'react-gauge-chart';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Sensorboard = () => {
  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [TdsData, setTdsData] = useState([]);
  const [pHData, setpHData] = useState([]);

  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [lastWarningMsg, setLastWarningMsg] = useState('');

  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(0);

  const [showThingSpeak, setShowThingSpeak] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('https://idpwaterqualitymonitoring-egabc8esavczf2bz.eastasia-01.azurewebsites.net/fetch-data');
      const json = await response.json();
      const feeds = json.data || [];
      const feedsReversed = [...feeds].reverse();

      if (feeds.length === 0) {
        console.warn('No data returned from backend');
        return;
      }

      setLabels(feedsReversed.map(entry => new Date(entry.timestamp).toLocaleString()));
      setTemperatureData(feedsReversed.map(entry => entry.temperature));
      setHumidityData(feedsReversed.map(entry => entry.turbidity));
      setTdsData(feedsReversed.map(entry => entry.tds));
      setpHData(feedsReversed.map(entry => entry.ph));
    } catch (error) {
      console.error('Error fetching backend data:', error);
    }
  }, [setLabels, setTemperatureData, setHumidityData, setTdsData, setpHData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    setEndIdx(labels.length > 0 ? labels.length - 1 : 0);
  }, [labels]);

  const filteredLabels = labels.slice(startIdx, endIdx + 1);
  const filteredTemperature = temperatureData.slice(startIdx, endIdx + 1);
  const filteredHumidity = humidityData.slice(startIdx, endIdx + 1);
  const filteredTds = TdsData.slice(startIdx, endIdx + 1);
  const filteredPh = pHData.slice(startIdx, endIdx + 1);
  const [warningTimeout, setWarningTimeout] = useState(null);

  useEffect(() => {
    let msg = '';
    if (filteredTemperature.at(-1) > 33) {
      msg += 'Temperature is above safe threshold!\n';
    }
    if (filteredTds.at(-1) > 1000) {
      msg += 'TDS is above safe threshold!\n';
    }
    if (filteredHumidity.at(-1) > 800) {
      msg += 'Turbidity is above safe threshold!\n';
    }
    if (filteredPh.at(-1) > 10 || filteredPh.at(-1) < 4) {
      msg += 'pH is outside safe range!\n';
    }
    if (msg && msg !== lastWarningMsg) {
      setWarningMsg(msg);
      setShowWarning(true);
      setLastWarningMsg(msg);
      if (warningTimeout) {
        clearTimeout(warningTimeout);
        setWarningTimeout(null);
      }
    }
    if (!msg && lastWarningMsg && !warningTimeout) {
      const timeout = setTimeout(() => {
        setShowWarning(false);
        setWarningMsg('');
        setLastWarningMsg('');
        setWarningTimeout(null);
      }, 20000);
      setWarningTimeout(timeout);
    }
    return () => {
      if (warningTimeout) {
        clearTimeout(warningTimeout);
        setWarningTimeout(null);
      }
    };
  }, [filteredTemperature, filteredTds, filteredHumidity, filteredPh, lastWarningMsg, warningTimeout]);

  return (
    <div className="bg-animated-gradient p-10 font-sans">
      <div className="glow-overlay"></div>
      <Starfield starCount={120} />
      <h1
        style={{
          fontFamily: `'Impact', 'Arial Black', 'sans-serif'`,
          fontSize: '3rem',
          color: '#fff',
          letterSpacing: '1px',
          textShadow: '2px 2px 5px rgba(0,0,0,0.5)',
          marginBottom: '2rem',
        }}
      >
        📊 Sensor Dashboard
      </h1>

      {/* 🖼️ Sensor Image & Slogan */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <img
          src="https://ftkek.utem.edu.my/templates/yootheme/cache/48/FTKEK_INDIGO-48a5adb5.png"
          alt="Utem setup"
          className="w-40 h-40 rounded-lg shadow-lg object-contain"
        />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Real-Time Water Quality Monitoring
          </h2>
          <p className="text-lg text-blue-100 font-semibold italic">
            Clean Water, Healthy Life
          </p>
        </div>
      </div>

      {/* 🕒 Time Range Filter */}
      <div className="flex gap-4 mb-8 items-center justify-end text-white ">
        <label className="font-semibold text-white-700">Start Time:</label>
        <select
          value={startIdx}
          onChange={e => setStartIdx(Number(e.target.value))}
          className="border rounded px-2 py-1 text-white bg-gray-800"
        >
          {labels.map((label, idx) => (
            <option key={label + idx} value={idx}>{label}</option>
          ))}
        </select>
        <label className="font-semibold">End Time:</label>
        <select
          value={endIdx}
          onChange={e => setEndIdx(Number(e.target.value))}
          className="border rounded px-2 py-1 text-white bg-gray-800"
        >
          {labels.map((label, idx) => (
            <option key={label + idx} value={idx}>{label}</option>
          ))}
        </select>
      </div>

      {/* ⚠️ Warning Message */}
      {showWarning && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-yellow-200 border-l-4 border-yellow-600 text-yellow-800 p-6 rounded shadow-lg">
            <strong>Warning!</strong>
            <pre className="whitespace-pre-wrap">{warningMsg}</pre>
            <button
              className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded"
              onClick={() => setShowWarning(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowThingSpeak((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          {showThingSpeak ? "Hide histories graphs ▲" : "Show histories graphs ▼"}
        </button>
      </div>

      {/* 🔵 ThingSpeak Charts (customized) */}
      {showThingSpeak && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="260"
              style={{ border: '1px solid #cccccc' }}
              src="https://thingspeak.mathworks.com/channels/2972454/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&timescale=daily&title=Temperature&type=column&xaxis=Date&yaxis=degree%28%C2%B0C%29&yaxismax=50"
              title="Temperature"
            />
          </div>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="260"
              style={{ border: '1px solid #cccccc' }}
              src="https://thingspeak.com/channels/2972454/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&timescale=daily&title=Turbidility&type=column&yaxis=NTU&yaxismax=10K&yaxismin=0"
              title="Turbidity"
            />
          </div>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="260"
              style={{ border: '1px solid #cccccc' }}
              src="https://thingspeak.mathworks.com/channels/2972454/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&timescale=daily&title=TDS&type=line&xaxis=Date&yaxis=Ppm&yaxismax=5000&yaxismin=0"
              title="TDS"
            />
          </div>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="260"
              style={{ border: '1px solid #cccccc' }}
              src="https://thingspeak.mathworks.com/channels/2972454/charts/4?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&timescale=daily&title=PH&type=line&xaxis=Date&yaxis=pH&yaxismax=14&yaxismin=0"
              title="PH"
            />
          </div>
        </div>
      )}

      {/* 🔍 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {/* Temperature */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">Temperature</h3>
          <p className="text-2xl font-bold text-black">
            {filteredTemperature.at(-1)}°C
          </p>
          {filteredTemperature.at(-1) === 0 ? (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          ) : filteredTemperature.at(-1) > 33 ? (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>
          ) : filteredTemperature.at(-1) >= 23 && filteredTemperature.at(-1) <= 33 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          )}
        </div>
        {/* Turbidity (PPM) */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">Turbidity</h3>
          <p className="text-2xl font-bold text-black">
            {filteredHumidity.at(-1)} NTU
          </p>
          {filteredHumidity.at(-1) === 0 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : filteredHumidity.at(-1) > 800 ? (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>
          ) : filteredHumidity.at(-1) < 800 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          )}
        </div>
        {/* TDS */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">TDS</h3>
          <p className="text-2xl font-bold text-black">
            {filteredTds.at(-1)} ppm
          </p>
          {filteredTds.at(-1) === 0 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : filteredTds.at(-1) > 1000 ? (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>
          ) : filteredTds.at(-1) < 1000 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          )}
        </div>
        {/* pH */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">pH</h3>
          <p className="text-2xl font-bold text-black">
            {typeof filteredPh.at(-1) === 'number' && !isNaN(filteredPh.at(-1))
              ? filteredPh.at(-1).toFixed(2)
              : '-'}
          </p>
          {filteredPh.at(-1) === 0 ? (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          ) : filteredPh.at(-1) > 10 || filteredPh.at(-1) < 4 ? (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>
          ) : filteredPh.at(-1) >= 6 && filteredPh.at(-1) <= 9 ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
          )}
        </div>
      </div>

      {/* 🟢 MongoDB-based Charts */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Temperature Gauge */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">🌡 Temperature (°C)</h2>
            <span className="text-sm text-gray-500 items-center">Last updated: {filteredLabels.at(-1)}</span>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <GaugeChart
              id="gauge-temperature"
              nrOfLevels={10}
              percent={Math.min((filteredTemperature.at(-1) || 0) / 50, 1)}
              textColor="#222"
              formatTextValue={value =>
                typeof filteredTemperature.at(-1) === 'number' && !isNaN(filteredTemperature.at(-1))
                  ? filteredTemperature.at(-1).toFixed(2) + ' °C'
                  : '-'
              }
              arcsLength={[0.66, 0.34]}
              colors={['#00ff00', '#ff0000']}
              arcWidth={0.3}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span>Threshold: </span>
              <span className="font-bold text-red-600">33°C</span>
            </div>
          </div>
        </div>

        {/* NTU Gauge */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">💧 Turbidity (NTU)</h2>
            <span className="text-sm text-gray-500">Last updated: {filteredLabels.at(-1)}</span>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <GaugeChart
              id="gauge-ntu"
              nrOfLevels={10}
              percent={Math.min((filteredHumidity.at(-1) || 0) / 100, 1)}
              textColor="#222"
              formatTextValue={value =>
                typeof filteredHumidity.at(-1) === 'number' && !isNaN(filteredHumidity.at(-1))
                  ? filteredHumidity.at(-1).toFixed(2) + ' NTU'
                  : '-'
              }
              colors={['#00ff00', '#ffff00', '#ff0000']}
              arcWidth={0.3}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span>Threshold: </span>
              <span className="font-bold text-red-600">800 NTU</span>
            </div>
          </div>
        </div>

        {/* TDS Gauge */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">🧪 Total Dissolved Solids (TDS)</h2>
            <span className="text-sm text-gray-500">Last updated: {filteredLabels.at(-1)}</span>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <GaugeChart
              id="gauge-tds"
              nrOfLevels={10}
              percent={Math.min((filteredTds.at(-1) || 0) / 1000, 1)}
              textColor="#222"
              formatTextValue={value =>
                typeof filteredTds.at(-1) === 'number' && !isNaN(filteredTds.at(-1))
                  ? filteredTds.at(-1).toFixed(2) + ' ppm'
                  : '-'
              }
              colors={['#00ff00', '#ffff00', '#ff0000']}
              arcWidth={0.3}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span>Threshold: </span>
              <span className="font-bold text-red-600">1000 ppm</span>
            </div>
          </div>
        </div>

        {/* pH Gauge */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">⚗️ pH Level</h2>
            <span className="text-sm text-gray-500">Last updated: {filteredLabels.at(-1)}</span>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <GaugeChart
              id="gauge-ph"
              nrOfLevels={10}
              percent={Math.min((filteredPh.at(-1) || 0) / 14, 1)}
              textColor="#222"
              formatTextValue={value =>
                typeof filteredPh.at(-1) === 'number' && !isNaN(filteredPh.at(-1))
                  ? filteredPh.at(-1).toFixed(2) + ' pH'
                  : '-'
              }
              colors={['#ff0000', '#ffff00', '#00ff00']}
              arcWidth={0.3}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span>Threshold: </span>
              <span className="font-bold text-red-600">4-10 pH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sensorboard;