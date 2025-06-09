import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';

// Register Chart.js components
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
  const channelID = '2972454';
  const apiKey = 'CSI9TQECFXYFBE2S';

  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [TdsData, setTdsData] = useState([]);
  const [pHData, setpHData] = useState([]);

  // 🟢 Fetch from your Node.js backend
  const fetchData = async () => {
    try {
     // const response = await fetch('http://localhost:5000/fetch-data');

      const response = await fetch('https://idpwaterqualitymonitoring-egabc8esavczf2bz.eastasia-01.azurewebsites.net/fetch-data');
      const json = await response.json();
      console.log(json); // For debugging
      const feeds = json.data || [];

      if (feeds.length === 0) {
        console.warn('No data returned from backend');
        return;
      }

      setLabels(feeds.map(entry => new Date(entry.timestamp).toLocaleTimeString()));
      setTemperatureData(feeds.map(entry => entry.temperature));
      setHumidityData(feeds.map(entry => entry.turbidity));
      setTdsData(feeds.map(entry => entry.tds));
      setpHData(feeds.map(entry => entry.ph));
    } catch (error) {
      console.error('Error fetching backend data:', error);
    }
  };

  // Call fetchData when component mounts and refresh every 15 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1);
    return () => clearInterval(interval);
  }, []);

  const createChartData = (data, label, color) => ({
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        fill: false,
        tension: 0.3,
      },
    ],
  });

  const chartOptions = (label) => ({
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Time' },
      },
      y: {
        title: { display: true, text: label },
      },
    },
  });

return (
  <div className="p-10 font-sans bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold text-center mb-8">📊 Sensor Dashboard (ThingSpeak + Backend)</h1>

    {/* 🖼️ Sensor Image */}
    <div className="flex justify-center mb-8">
      <img
        src="/images/sensor-setup.jpg"
        alt="Sensor setup"
        className="w-full max-w-xl rounded-lg shadow-lg"
      />
    </div>

    {/* 🔍 Summary Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500">Temperature</h3>
        <p className="text-2xl font-bold text-red-500">{temperatureData.at(-1)}°C</p>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500">Turbidity</h3>
        <p className="text-2xl font-bold text-blue-500">{humidityData.at(-1)} NTU</p>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Warning</span>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500">TDS</h3>
        <p className="text-2xl font-bold text-green-600">{TdsData.at(-1)} ppm</p>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Normal</span>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500">pH</h3>
        <p className="text-2xl font-bold text-orange-500">{pHData.at(-1)}</p>
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>
      </div>
    </div>

    {/* 🔵 ThingSpeak Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[1, 2, 3, 4].map(field => (
        <div key={field} className="bg-white shadow-md rounded-xl overflow-hidden">
          <iframe
            width="100%"
            height="200"
            className="border-0"
            src={`https://thingspeak.com/channels/${channelID}/charts/${field}?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15${apiKey ? '&api_key=' + apiKey : ''}`}
            title={`Chart ${field}`}
          />
        </div>
      ))}
    </div>

    {/* 🟢 MongoDB-based Charts */}
    <div className="max-w-5xl mx-auto space-y-10">
      {[
        { title: '🌡 Temperature (°C)', data: temperatureData, color: 'red', label: 'Temperature (°C)' },
        { title: '💧 Turbidity (NTU)', data: humidityData, color: 'blue', label: 'Turbidity (NTU)' },
        { title: '🧪 Total Dissolved Solids (TDS)', data: TdsData, color: 'green', label: 'TDS (ppm)' },
        { title: '⚗️ pH Level', data: pHData, color: 'orange', label: 'pH' },
      ].map((chart, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{chart.title}</h2>
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <Line
            data={createChartData(chart.data, chart.label, chart.color)}
            options={chartOptions(chart.label)}
            width={600}
            height={200}
          />
        </div>
      ))}
    </div>
  </div>
);

};

export default Sensorboard;