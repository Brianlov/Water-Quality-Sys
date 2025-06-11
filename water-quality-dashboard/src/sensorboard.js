import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import { Sparklines, SparklinesLine } from 'react-sparklines';
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
//import { Line } from 'react-chartjs-2';

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
  // const channelID = '2972454';
  // const apiKey = 'CSI9TQECFXYFBE2S';

  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [TdsData, setTdsData] = useState([]);
  const [pHData, setpHData] = useState([]);

  // 🟢 Fetch from your Node.js backend
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/fetch-data');

      //const response = await fetch('https://idpwaterqualitymonitoring-egabc8esavczf2bz.eastasia-01.azurewebsites.net/fetch-data');
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

  // Call fetchData when component mounts and refresh every 1 second
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // const createChartData = (data, label, color) => ({
  //   labels,
  //   datasets: [
  //     {
  //       label,
  //       data,
  //       borderColor: color,
  //       fill: false,
  //       tension: 0.3,
  //     },
  //   ],
  // });

  // const chartOptions = (label) => ({
  //   responsive: true,
  //   scales: {
  //     x: {
  //       title: { display: true, text: 'Time' },
  //     },
  //     y: {
  //       title: { display: true, text: label },
  //     },
  //   },
  // });

return (
  <div className="min-h-screen p-10 font-sans bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient">
  <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 drop-shadow">📊 Sensor Dashboard (ThingSpeak + Backend)</h1>

    {/* 🖼️ Sensor Image */}
    <div className="flex justify-center mb-8">
      <img
        src="http://2.bp.blogspot.com/-YOBYivWTsLU/TWaaIkWecCI/AAAAAAAAEzY/i80B4_qauJM/s1600/Utem_B.png"
        alt="Utem setup"
        className="w-full max-w-60 max-h-60 rounded-lg shadow-lg"
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

   {/* 🔵 ThingSpeak Charts (customized) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  <div className="bg-white shadow-md rounded-xl overflow-hidden">
    <iframe
      width="100%"
      height="260"
      style={{ border: '1px solid #cccccc' }}
      src="https://thingspeak.com/channels/2972454/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&timescale=15&title=Temperature&type=column&yaxis=degree%28%C2%B0C%29&yaxismax=50"
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
      src="https://thingspeak.com/channels/2972454/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&title=TDS&type=line&xaxis=Date&yaxis=Ppm&yaxismax=5000&yaxismin=0"
      title="TDS"
    />
  </div>
  <div className="bg-white shadow-md rounded-xl overflow-hidden">
    <iframe
      width="100%"
      height="260"
      style={{ border: '1px solid #cccccc' }}
      src="https://thingspeak.com/channels/2972454/charts/4?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=200&title=PH&type=line&xaxis=Date&yaxis=pH&yaxismax=14&yaxismin=0"
      title="PH"
    />
  </div>
</div>

    {/* 🟢 MongoDB-based Charts */}
<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Temperature Sparkline */}
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-700">🌡 Temperature (°C)</h2>
      <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
    </div>
    <Sparklines data={temperatureData} width={100} height={40}>
      <SparklinesLine color="red" />
    </Sparklines>
    <div className="text-2xl font-bold text-red-500 mt-2">{temperatureData.at(-1)}°C</div>
  </div>

  {/* NTU Gauge */}
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-700">💧 Turbidity (NTU)</h2>
      <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
    </div>
    <GaugeChart
      id="gauge-ntu"
      nrOfLevels={10}
      percent={Math.min((humidityData.at(-1) || 0) / 100, 1)}
      textColor="#222"
      formatTextValue={value => `${humidityData.at(-1) || 0} NTU`}
      colors={['#00ff00', '#ffff00', '#ff0000']}
      arcWidth={0.3}
    />
  </div>

  {/* TDS Gauge */}
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-700">🧪 Total Dissolved Solids (TDS)</h2>
      <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
    </div>
    <GaugeChart
      id="gauge-tds"
      nrOfLevels={10}
      percent={Math.min((TdsData.at(-1) || 0) / 1000, 1)}
      textColor="#222"
      formatTextValue={value => `${TdsData.at(-1) || 0} ppm`}
      colors={['#00ff00', '#ffff00', '#ff0000']}
      arcWidth={0.3}
    />
  </div>

  {/* pH Sparkline */}
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-700">⚗️ pH Level</h2>
      <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
    </div>
    <Sparklines data={pHData} width={100} height={40}>
      <SparklinesLine color="orange" />
    </Sparklines>
    <div className="text-2xl font-bold text-orange-500 mt-2">{pHData.at(-1)}</div>
  </div>
</div>
 </div> ); }
export default Sensorboard;