import React,{useState} from 'react';
import Starfield from "./Startfield";
import { Link } from 'react-router-dom';

function Home() {
  const [showImage, setShowImage] = useState(false);
  return (
    
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 flex items-center justify-center">
      <div className="w-full max-w-5xl p-6">
       

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-6 shadow-md rounded-lg mb-6 text-center">
          
          <Starfield starCount={120} />
          <h1 className="text-4xl font-bold mb-1">Intelligent Water Quality Monitoring System</h1>
          <p className="text-sm opacity-90">
            Built with React, Node.js, MongoDB, and Azure
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-white shadow-md rounded-lg p-10 text-center">
        <div className="glow-overlay"></div>
          <img
            src="https://tse3.mm.bing.net/th?id=OIP.3ASqjQJIsJRf8ZskxftNLQHaHa&pid=Api&P=0&h=180"
            alt="Water Quality Icon"
            className="mx-auto mb-6 w-24 h-24 rounded-full shadow"
          />

          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Welcome to the Monitoring Portal</h2>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Monitoring water quality in real-time using IoT sensors for advanced analytics.
            Our system provides insights into temperature, turbidity, pH, and TDS levels.
            Empower sustainability and safety with intelligent environmental monitoring.
          </p>
          <Link
            to="/sensorboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:scale-105"
          >
            📊 View Sensor Dashboard
          </Link>
        </main>

       
        {/* Flowchart Section with Show/Hide Button */}
        <section className="mt-10 bg-blue-50 p-6 rounded-lg shadow-inner text-center">
          <button
            onClick={() => setShowImage((prev) => !prev)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            {showImage ? "Hide Flowchart ▲" : "Show Flowchart ▼"}
          </button>
          {showImage && (
            <img
              src="/flowchart.png"
              alt="Flowchart of the Intelligent Water Quality Monitoring System"
              className="mx-auto mb-4 w-full max-w-2xl rounded-lg shadow"
              style={{ objectFit: 'contain' }}
            />
          )}
  <h3 className="text-xl font-semibold text-blue-700 mb-3">🔍 About This Project</h3>
  <p className="text-gray-700 leading-relaxed">
    STM32 collects data from sensors (temperature, turbidity, pH, TDS) and sends it via ESP32 to the Node.js backend.
    Azure and MongoDB enable real-time storage and display of data in an integrated dashboard using React.js.
  </p>
</section>

        {/* Contact */}
        <section className="mt-10 text-center">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">📬 Contact Us</h3>
          <p className="text-gray-700 mb-1">Have questions or feedback? Reach out:</p>
          <a href="https://outlook.live.com" className="text-blue-600 hover:underline">
            b022210122@student.edu.my
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 p-4">
          &copy; 2025 IDP Team – Universiti Teknologi Malaysia Melaka.All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Home;
