const TelegramBot               = require('node-telegram-bot-api');
var adapter					    =	require('../../adapter-lib.js');
var telegram					=	new adapter("telegram");

// replace the value below with the Telegram token you receive from @BotFather
var token = '367772499:AAH37llKnAYwUzfIKqVV-k0gKj64TCd7V0Q';

process.on('message', function(data) {
  switch(data.protocol){
    case "setSetting":
      telegram.setSetting(data.setSetting.name, data.setSetting.status);
      break;
    case "send":
      sendMessage(data);
      break;
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

bot.on('text', (msg) => {
    const chatId = msg.chat.id;
    if(chatId == telegram.settings.familyGroup){
        var data = {};
        data.author = msg.from.first_name;
        data.message = msg.text;
        if(msg.entities && msg.entities[0].type == "url"){
             data.type = 2;
        }else{
             data.type = 1;
        }
        process.send({"chatMessage": data});
    }else{
      telegram.log.error(chatId);
    }
});

function sendMessage(data){
    if(!data.receiver){
      data.receiver = telegram.settings.familyGroup;
    }
    switch(data.type){
        case "photo":
            bot.sendPhoto(data.receiver, data);
            break;
        default:
            bot.sendMessage(data.receiver, data.message.toString());
            break;
    }
}