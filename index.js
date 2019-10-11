const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true, disabledEvents: ['TYPING_START'] });
const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBLTOKEN, client);
const fs = require('fs');
const dotenv = require('dotenv');
const firebase = require('firebase/app');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
require('dotenv/config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

client.db = admin.firestore();
client.db.FieldValue = require('firebase-admin').firestore.FieldValue;
client.global = {
  db: {
    guilds: {},
  },
};

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.queue = new Map();
client.secondaryQueue = [];
client.funcs = {};

client.funcs.handleVideo = require('./funcs/handleVideo.js');
client.funcs.play = require('./funcs/play.js');
client.funcs.msToTime = require('./funcs/msToTime.js');
client.funcs.dbget = require('./funcs/dbget.js');

client.config = {
  token: process.env.TOKEN,
  apikey: process.env.API_KEY,
  prefix: '>',
  test: 'success',
};
const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
const eventFiles = fs.readdirSync('./events/').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.events.set(event.name, event);
}

client.on('ready', async () => {
  const eventName = 'ready';
  const event = client.events.get(eventName) || client.events.find(ent => ent.aliases && ent.aliases.includes(eventName));
  event.execute(client, dbl);
});

client.on('message', message => {
  const eventName = 'message';
  const event = client.events.get(eventName) || client.events.find(ent => ent.aliases && ent.aliases.includes(eventName));
  event.execute(client, message, Discord);
});

client.on('guildCreate', async (guild) => {
  const eventName = 'guildcreate';
  const event = client.events.get(eventName) || client.events.find(ent => ent.aliases && ent.aliases.includes(eventName));
  event.execute(client, guild);
});
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', error => {
  console.log(`Error with DBL! ${error}`);
})

client.login(client.config.token).catch(err => { console.log('- Failed To Login -> ' + err); });
