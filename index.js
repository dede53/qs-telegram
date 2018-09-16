const TelegramBot               = require('node-telegram-bot-api');
var adapter					    =	require('../../adapter-lib.js');
var telegram					=	new adapter("telegram");

// replace the value below with the Telegram token you receive from @BotFather
var token = '367772499:AAH37llKnAYwUzfIKqVV-k0gKj64TCd7V0Q';

process.on('message', function(data) {
	var data = JSON.parse(data);
	telegram.log.error(data.protocol);
	switch(data.protocol){
		case "setSetting":
			telegram.setSetting(data.setSetting.name, data.setSetting.status);
			break;
		case "send":
			sendMessage(data);
		default:
			telegram.log.error(data);
			break;
	}
});

/**********************
 * 
 * 
 * { 
 *      message_id: 324,
 *      from: { 
 *          id: 358212108,
 *          is_bot: false,
 *          first_name: 'Daniel',
 *          language_code: 'de-DE' 
 *      },
 *      chat: { id: 358212108, first_name: 'Daniel', type: 'private' },
 *      date: 1537122795,
 *      text: 'Moin' 
 * }
 *
 * 
 * 
 * *****************************/

// Create a bot that uses 'polling' to fetch new updates
try{
    var bot = new TelegramBot(token, {polling: true});
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
    if(chatId == telegram.settings.familyGroup){
        var data = {};
        data.author = msg.from.first_name;
        data.message = msg.text;
        if(msg.entities[0].type == "url"){
            data.type = 2;
        }else{
            data.type = 1;
        }
        process.send({"chatMessage": JSON.stringify(data)});
    }
 
  // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
});

function sendMessage(data){
    switch(data.type){
        case "photo":
            bot.sendPhoto(data.id, data.data);
            break;
        default:
            bot.sendMessage(data.id, data.data.toString());
            break;
    }
}