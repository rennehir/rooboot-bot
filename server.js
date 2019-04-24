var express = require("express");
var app = express();
var bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TELEGRAM_TOKEN;
const url = 'https://mk-telegram-bot.eu-gb.mybluemix.net';
var port = process.env.PORT || 3000;

// FUNCTIONS FROM UTILS
const { getPiato, getLozzi, getMaija, getLibri, getTilia, getSyke, getRentukka, getYlisto, getFiilu, getIlokivi} = require(__dirname + '/utils/semma');
const getLaulukirja = require(__dirname + '/utils/laulukirja');
const getFullEvents = require(__dirname + '/utils/events');
var lk_obj;

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

// ladataan laulukirja kun botti käynnistyy
const startBot = async () => {
  lk_obj = await getLaulukirja();
};

/**  START ---  SEMMA RESTAURANTS --- */
bot.onText(/\/piato/, async (msg, match) => {      
  const chatId = msg.chat.id;
  var obj = await getPiato();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/lozzi/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getLozzi();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/maija/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getMaija();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/libri/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getLibri();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/tilia/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getTilia();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/syke/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getSyke();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/rentukka/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getRentukka();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/ylisto/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getYlisto();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/fiilu/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getFiilu();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
bot.onText(/\/ilokivi/, async (msg, match) => {
  const chatId = msg.chat.id;
  var obj = await getIlokivi();
  var responseTxt = parseSemma(msg, obj);

  bot.sendMessage(chatId, responseTxt, {parse_mode: 'Markdown'});
});
/** END --- SEMMA RESTAURANTS --- */

/** START --- LAULUKIRJA --- */
bot.onText(/\/laulukategoriat/), async (msg, match) => {
  const chatId = msg.chat.id;
  var responseTxt = '';
  const laulut = lk_obj.Laulukirja;
  for(var laulu of laulut) {
    if(!responseTxt.includes(laulu.kategoria)) responseTxt += laulu.kategoria + '\r\n';
  };

  if(responseTxt == '') responseTxt = 'Ei löydy!';
  bot.sendMessage(chatId, responseTxt, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
}

bot.onText(/\/laulu(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  var responseTxt = '';
  const haku = msg.text.split(' ')[1]; // Tämä voi olla numero tai nimi
  const laulut = lk_obj.Laulukirja;
  if(haku.match(/^\d+$/)) { // Haetaan numerolla
    for(var laulu of laulut) {
      if(laulu.numero == haku) {
        responseTxt += '*'+laulu.numero+'. ' + laulu.nimi +'*\r\n'; // 1. Finlandia-hymni
        for(var sae of laulu.sanat) {
          responseTxt += sae.replace('*', '\\*')+'\r\n'; // We need to escape * or markdown will brake
        }
      }
    }
  } else { // Haetaan nimellä
    for(var laulu of laulut) {
      if(laulu.nimi.toLowerCase().includes(haku.toLowerCase())) {
        responseTxt += '*'+laulu.numero+'. ' + laulu.nimi +'*\r\n'; // 1. Finlandia-hymni
        for(var sae of laulu.sanat) {
          responseTxt += sae+'\r\n';
        }
        break;
      }
    }
  }
  if(responseTxt == '') responseTxt = 'Ei löydy!';
  bot.sendMessage(chatId, responseTxt, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
});
/** END --- LAULUKIRJA --- */
/** START --- AUDIO --- */
bot.onText(/\/vappubanger/, async(msg, match) => {
  const chatId = msg.chat.id;
  //const stream = fs.createReadStream(__dirname + '/media/vappubanger.mp3');
  const stream = 'http://users.jyu.fi/~mawakove/musat/När Börjar x Mibetti-Vappubängeri 2019.mp3';
  const options = {
    caption: '🔥🔥🔥',
    duration: 228,
    performer: 'När Börjar x Mibetti',
    title: 'Vappubängeri 2019'
  };
  bot.sendAudio(chatId, stream, options);
});

bot.onText(/\/bisnestä/, async(msg, match) => {
  const chatId = msg.chat.id;
  //const stream = fs.createReadStream(__dirname + '/media/vappubanger.mp3');
  const stream = 'http://users.jyu.fi/~mawakove/musat/Bisnestä.mp3';
  const options = {
    caption: '💰💰💰',
    duration: 283,
    performer: 'Börs',
    title: 'Bisnestä'
  };
  bot.sendAudio(chatId, stream, options);
});
/** END --- AUDIO --- */

/** START --- DUMPPI TAPAHTUMAT */
bot.onText(/\/tapahtumat/, async msg => {
  const chatId = msg.chat.id;
  responseTxt = "";
  const events = await getFullEvents();
  //console.log(events);
  for(var event of events.Tapahtumat) {
    responseTxt += '_'+event.ajankohta.trim()+ '_ *'+event.kapasiteetti+'*\r\n';
    responseTxt += '[' +event.nimi+ '](' +event.linkki +')\r\n';
    responseTxt += event.sijainti === ' ' ? '\r\n' : '_' +event.sijainti+'_\r\n\r\n';
  };
  bot.sendMessage(chatId, responseTxt, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
});
/** END --- DUMPPI TAPAHTUMAT  */

// Supporting function to easily parse Semma API objects
function parseSemma(msg, obj) {
  var num = 0;
  let lause = msg.text.split(' ');
  if(lause[1] !== undefined) {
      if (lause[1].trim() === "h") num = 1; // HUOMENNA
      else if (lause[1].trim() === "yh") num = 2; // YLIHUOMENNA
  };
  var restaurant_name = obj.RestaurantName;
  var week = obj.MenusForDays;

  var day = week[0];
  var open_time = day.LunchTime;
  var food = day.SetMenus;

  var dayTxt = "_Tänään_";
  if (num == 1) dayTxt = "_Huomenna_";
  else if (num == 2) dayTxt = "_Ylihuomenna_";
  var responseTxt = '*' + restaurant_name + '* ' + dayTxt + '\r\n';
  if (open_time !== null) {
    responseTxt += 'Lounas: ' + open_time + '\r\n';
    for (i = 0; i < food.length; i++) {
      responseTxt += '*' + food[i].Name + '* ';
      responseTxt += '_' + food[i].Price + '_\r\n';
      for (y = 0; y < food[i].Components.length; y++) {
        responseTxt += food[i].Components[y].replace('*', '\\*') + '\r\n';
      }
    }
  } else {
    responseTxt += "Kiinni :(";
  }
  return responseTxt;
};

startBot();