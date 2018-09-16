const TelegramBot               = require('node-telegram-bot-api');
var adapter					    =	require('../../adapter-lib.js');
var telegram					=	new adapter("telegram");

// replace the value below with the Telegram token you receive from @BotFather
const token = '367772499:AAH37llKnAYwUzfIKqVV-k0gKj64TCd7V0Q';
 
// Create a bot that uses 'polling' to fetch new updates
try{
    const bot = new TelegramBot(token, {polling: true});
    process.send({"statusMessage": "Verbunden"});
}catch(error){
    process.send({"statusMessage": "Konnte keine Verbingung herstellen"});
}
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
 
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
 
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});
 
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
 
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});