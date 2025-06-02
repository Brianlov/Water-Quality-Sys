import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 flex items-center justify-center">
      <div className="w-full max-w-5xl p-6">

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-6 shadow-md rounded-lg mb-6 text-center">
          <h1 className="text-4xl font-bold mb-1">AI-Enhanced Water Quality Monitoring System</h1>
          <p className="text-sm opacity-90">
            Built with Node.js, ESP32, Azure, and Machine Learning
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-white shadow-md rounded-lg p-10 text-center">
          <img
            src="https://tse3.mm.bing.net/th?id=OIP.3ASqjQJIsJRf8ZskxftNLQHaHa&pid=Api&P=0&h=180"
            alt="Water Quality Icon"
            className="mx-auto mb-6 w-24 h-24 rounded-full shadow"
          />

          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Welcome to the Monitoring Portal</h2>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Monitor water quality in real-time using IoT sensors and AI-powered insights.
            Empower sustainability and safety with intelligent environmental monitoring.
          </p>

          <Link
            to="/sensorboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:scale-105"
          >
            📊 View Sensor Dashboard
          </Link>
        </main>

        {/* About Section */}
        <section className="mt-10 bg-blue-50 p-6 rounded-lg shadow-inner text-center">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">🔍 About This Project</h3>
          <p className="text-gray-700 leading-relaxed">
            STM32 collects data from sensors (temperature, turbidity, pH, TDS) and sends it via ESP32 to the Node.js backend.
            Azure and MongoDB enable real-time storage and display of data in an integrated dashboard.
          </p>
        </section>

        {/* Contact */}
        <section className="mt-10 text-center">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">📬 Contact Us</h3>
          <p className="text-gray-700 mb-1">Have questions or feedback? Reach out:</p>
          <a href="mailto:teamidp@example.com" className="text-blue-600 hover:underline">
            teamidp@example.com
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 p-4">
          &copy; 2025 IDP Team – Universiti Teknologi Malaysia.All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Home;
