var TelegramBot					=	require('node-telegram-bot-api');
var fs							=	require('fs');
var express						=	require('express.oi');
var adapter						=	require('../../adapter-lib.js');
var telegram					=	new adapter("telegram");
var app							=	express().http().io();

app.use(express.static(__dirname + '/dist'));

telegram.on('telegram', function(data) {
	switch(data.protocol){
		case "setSetting":
			telegram.log.debug("process.on.settSetting");
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
	var bot = new TelegramBot(telegram.settings.token, {polling: true});
	process.send({"statusMessage": "Verbunden"});
}catch(error){
	process.send({"statusMessage": "Konnte keine Verbingung herstellen"});
}

createDir(__dirname + '/dist');

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

bot.on('photo', (msg) => {
	const chatId = msg.chat.id;
	console.log(msg);
	if(chatId == telegram.settings.familyGroup){
		bot.downloadFile(msg.photo[msg.photo.length - 1].file_id, __dirname + '/dist').then((fileName) => {
			var data = {};
			data.type		= 3;
			data.author		= msg.from.first_name;
			data.message	= 'http://' + telegram.settings.localIp + ':' + telegram.settings.port + '/' + fileName.split('/').pop();
			process.send({"chatMessage": data});
		});
	}else{
	  telegram.log.error(chatId);
	}
});

bot.getMe().then( (user) => {
	telegram.settings.botId = user.id;
	telegram.setSettings(telegram.settings);
});

bot.on('new_chat_members', (msg) => {
	if(msg.new_chat_participant.id == telegram.settings.botId){
		telegram.settings.familyGroup = msg.chat.id;
		telegram.setSettings(telegram.settings);
		telegram.log.debug("Bot wurde in " + msg.chat.title + " eingeladen");
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

function createDir(name){
	if(!fs.existsSync(name)){
		fs.mkdirSync(name, 0766, function(err){
			if(err){
				adapter.log.error("mkdir " + name + ": failed: " + err);
			}else{
				adapter.log.info(name + " wurde erstellt");
			}
		});
	}
}

try{
	app.listen(telegram.settings.port, function(){
		process.send({"statusMessage": "Läut auf Port:" + telegram.settings.port});
	});
}catch(e){
    telegram.log.error("Port besetzt");
}