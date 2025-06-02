const express = require('express');
const axios = require('axios');
const Approuter = express.Router();
module.exports = Approuter;
const { ObjectId } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const client = require(`./database`);

let db = client.db("water_db");



const userChannels = {
  2972454: '1283197435', // channelId: chatId
  // Add more: channelId2: chatId2, ...
};

//telegream bot
const TELEGRAM_TOKEN = '7049704862:AAFMYW7vhGGbUkBZ4RhJ9suEJ_adOz11V0k'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '1283197435'; // Replace with your chat ID
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

telegramBot.onText(/\/start/, (msg) => {
  telegramBot.sendMessage(
    msg.chat.id,
    `👋 Hello! Your chat ID is: ${msg.chat.id}\nSend this chat ID to the admin to receive sensor alerts.`
  );
});

function sendTelegramAlert(sensor, value,channelId) {
  const chatId = userChannels[channelId];
  if (!chatId) return; // No user registered for this channel
  const message = `🚨 Alert: ${sensor} value is ${value}, which is above the threshold!`;
  telegramBot.sendMessage(chatId, message);
}

Approuter.get('/fetch-data', async (req, res) => {
  const apiKey = 'CSI9TQECFXYFBE2S';
  const channelId = 2972454;
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=4`;

  try {
    const response = await axios.get(url);
    const feeds = response.data.feeds;

    const dataToInsert = feeds.map(feed => ({
      temperature: parseFloat(feed.field1),
      turbidity: parseFloat(feed.field2),
      tds: parseFloat(feed.field3),
      ph: parseFloat(feed.field4),
      timestamp: new Date(feed.created_at),
      channel_id: channelId,
    }));
    console.log('Data to insert:', dataToInsert);

    // ...existing code...

    //telegram alert thresholds start
const THRESHOLDS = {
  temperature: 20, // example threshold
  turbidity: 5,
  tds: 1000,
  ph: 8
};

dataToInsert.forEach(entry => {
  if (entry.temperature > THRESHOLDS.temperature) {
    sendTelegramAlert('Temperature', entry.temperature,entry.channel_id);
  }
  if (entry.turbidity > THRESHOLDS.turbidity) {
    sendTelegramAlert('Turbidity', entry.turbidity,entry.channel_id);
  }
  if (entry.tds > THRESHOLDS.tds) {
    sendTelegramAlert('TDS', entry.tds,entry.channel_id);
  }
  if (entry.ph > THRESHOLDS.ph) {
    sendTelegramAlert('pH', entry.ph,entry.channel_id);
  }
});

//telegram alert end

    // Store all data in MongoDB (no duplicate check)
    const collection = db.collection('date');
    if (dataToInsert.length > 0) {
      await collection.insertMany(dataToInsert);
    }

    // Send the fetched data directly to the frontend
    res.json({
      message: 'Fetched, stored, and sent data',
      count: dataToInsert.length,
      data: dataToInsert,
    });
  } catch (error) {
    console.error('Error fetching ThingSpeak data:', error.message);
    res.status(500).json({ error: error.message });
  }
});