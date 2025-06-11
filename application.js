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

function sendTelegramAlert(level, details, channelId) {
  const chatId = userChannels[channelId];
  if (!chatId) return; // No user registered for this channel
  const now = new Date().toLocaleString();
  const message = 
    `🚨 *${level} ALERT* 🚨\n\n` +
    `*Time:* ${now}\n` +
    `*Details:*\n\n${details}\n\n` +
    `Please check your water quality immediately!`;
  telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

// Shared function to process feeds, send alerts, and store in MongoDB
async function processFeeds(feeds, channelId = 2972454) {
  const dataToInsert = feeds.map(feed => ({
    temperature: parseFloat(feed.field1),
    turbidity: parseFloat(feed.field2),
    tds: parseFloat(feed.field3),
    ph: parseFloat(feed.field4),
    timestamp: feed.created_at ? new Date(feed.created_at) : new Date(),
    channel_id: feed.channel_id || channelId,
  }));
  console.log('Data to insert:', dataToInsert);

  const THRESHOLDS = {
    high_temperature: 30,
    low_temperature: 10,
    critical_turbidity: 10,
    warning_tds: 500,
    critical_tds: 1000,
    warning_ph_low: 5.0,
    warning_ph_high: 10.0,
    warning_ph_range_low: 6.5,
    warning_ph_range_high: 8.0
  };

  dataToInsert.forEach(entry => {
    let warnings = 0;
    let critical = false;
    let messages = [];

    // Temperature
    if (entry.temperature >= THRESHOLDS.high_temperature) {
      warnings++;
      messages.push('Temperature is high\n');
    }
    if (entry.temperature < THRESHOLDS.low_temperature) {
      warnings++;
      messages.push('Temperature is low\n');
    }

    // Turbidity
    if (entry.turbidity >= THRESHOLDS.critical_turbidity) {
      critical = true;
      messages.push('Turbidity is CRITICAL\n');
    } else if (entry.turbidity >= 5) {
      warnings++;
      messages.push('Turbidity is high\n');
    }

    // TDS
    if (entry.tds >= THRESHOLDS.critical_tds) {
      critical = true;
      messages.push('TDS is CRITICAL\n');
    } else if (entry.tds >= THRESHOLDS.warning_tds) {
      warnings++;
      messages.push('TDS is high\n');
    }

    // pH
    if (entry.ph < THRESHOLDS.warning_ph_low || entry.ph >= THRESHOLDS.warning_ph_high) {
      warnings++;
      messages.push('pH is out of safe range\n');
    } else if (entry.ph < THRESHOLDS.warning_ph_range_low || entry.ph >= THRESHOLDS.warning_ph_range_high) {
      warnings++;
      messages.push('pH is slightly out of optimal range\n');
    }

    // Send alerts
    if (critical) {
      sendTelegramAlert('CRITICAL', messages.join(''), entry.channel_id);
    } else if (warnings >= 2) {
      sendTelegramAlert('WARNING', messages.join(''), entry.channel_id);
    }
    // else: ignore
  });

  // Store all data in MongoDB (no duplicate check)
  const collection = db.collection('date');
    await collection.insertMany(dataToInsert);
    
  


  const MAX_DOCS = 10000;
  const count = await collection.countDocuments();
  if (count > MAX_DOCS) {
    const toDelete = await collection.find({})
      .sort({ timestamp: 1 }) // oldest first
      .limit(count - MAX_DOCS)
      .toArray();
    const ids = toDelete.map(doc => doc._id);
    if (ids.length > 0) {
      await collection.deleteMany({ _id: { $in: ids } });
      console.log(`Deleted ${ids.length} old documents to maintain max limit of ${MAX_DOCS}`);
    }
  }

  return dataToInsert;
}

// GET endpoint: fetch from ThingSpeak
Approuter.get('/fetch-data', async (req, res) => {
  // const apiKey = 'CSI9TQECFXYFBE2S';
  // const channelId = 2972454;
  // const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=4`;

  try {
     // Get the latest 4 entries, sorted by timestamp descending
    const collection = db.collection('date');
    const latestData = await collection.find({})
      .sort({ timestamp: -1 })
      .limit(30)
      .toArray();
    
      console.log(latestData.map(doc => doc.timestamp));
    res.json({
      message: 'Fetched latest processed data from database',
      count: latestData.length,
      data: latestData,
    });
  } catch (error) {
    console.error('Error fetching latest data from DB:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint for debugging with Postman
Approuter.post('/fetch-data', async (req, res) => {
  try {
    const feeds = req.body.feeds;
    if (!feeds || !Array.isArray(feeds)) {
      return res.status(400).json({ error: 'feeds must be an array' });
    }
    const dataToInsert = await processFeeds(feeds);

    res.json({
      message: 'Test data processed',
      count: dataToInsert.length,
      data: dataToInsert,
    });
  } catch (error) {
    console.error('Error in POST /fetch-data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// // Automatic fetch and process every 3 minutes
async function autoFetchAndProcess() {
  const apiKey = 'CSI9TQECFXYFBE2S';
  const channelId = 2972454;
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=1`;

  try {
    const response = await axios.get(url);
    const feeds = response.data.feeds;
    await processFeeds(feeds, channelId);
    console.log(`[Auto Fetch] Data fetched and processed at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('[Auto Fetch] Error fetching ThingSpeak data:', error.message);
  }
}

// Start the interval (every 3 minutes = 180000 ms)
//setInterval(autoFetchAndProcess, 180000);
// Optionally, run once at startup
autoFetchAndProcess();

