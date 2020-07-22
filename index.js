const Discord = require('discord.js');
const textToImage = require('text-to-image');
const imageconvert = require("image-data-uri");
const Jimp = require("jimp");
const request = require("request");
const rover = require('rover-api');
const fs = require("fs");
const fetch = require("node-fetch");
const figlet = require('figlet');
const googleTTS = require("google-tts-api");
const RichEmbed = require('discord.js');
const moment = require('moment')
const superagent = require("superagent");

var settings = JSON.parse(fs.readFileSync("settings.json"))
var guildid = settings.guild;
var webhook;
var loggerwebhook;
var announcewebhook;
var changelogwebhook;
var prefix = "%";
var img;
var infoimg;
var devimg;
var version = "BETA-0.0.1"

const client = new Discord.Client({
    messageSweepInterval:240,
    messageCacheLifetime:1200,
    disabledEvents:['TYPING_START','USER_UPDATE','VOICE_SERVER_UPDATE','CHANNEL_PINS_UPDATE','GUILD_DELETE','CHANNEL_UPDATE','GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'CHANNEL_PINS_UPDATE',
    'USER_NOTE_UPDATE', 'USER_SETTINGS_UPDATE', 'PRESENCE_UPDATE', 'VOICE_STATE_UPDATE','RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE']
})

function getSong(name){
    return new Promise(async function (resolve, reject) {
        var response = await fetch(`https://some-random-api.ml/lyrics/?title=${name}`)
        response = await response.json()
        resolve(response)
    })
}

function applyCharMap(map, text) {
    let out = "";
     for(let c of text.split("")) {
       if(map[c] !== undefined) out += map[c];
       else if(map[c.toLowerCase()] !== undefined) out += map[c.toLowerCase()];
       else out += c;
     }
    return out;
  }

function getimage(url){
    return new Promise((resolve) => {
        fetch(url)
            .then(response => response.buffer())
            .then(buffer => resolve(buffer))
        })
}

const commands = {
    "lyrics": async function(msg, args, send){
        if(args[0]){
            var song = args.join(" ")
            var info = await getSong(song);
            var lyrics = "```" + info.lyrics + "```"
            console.log(info)
            var embed = {
                "color": 0xB3CFDD,
                "title": "Lyrics",
                "description": "We searched the Internet and found the following Lyrics for you!",
                "thumbnail": {
                  "url": info.thumbnail.genius
                },
                "fields": [
                  {
                    "name": "Title",
                    "value": info.title
                  },
                  {
                    "name": "Author",
                    "value": info.author
                  },
                ]
              }
            if(lyrics.length < 1000){
                embed.fields.push({
                    "name": "Lyrics",
                    "value": lyrics
                  })
            }else{
                var Attachment = new Discord.Attachment(Buffer.from(info.lyrics), "lyrics.txt")
                embed.fields.push({
                    "name": "Lyrics",
                    "value": "You can find the Lyrics in the attached Textdocument."
                  })
                send({embed: embed, file: Attachment})
                msg.delete()
                return
            }
            if(info.error){
                embed = {
                    "color": 0xB3CFDD,
                    "title": "Lyrics",
                    "description": info.error
                }
            }
            send({embed: embed})
            msg.delete()
        }
    },
    "ascii": async function(msg, args, send){
        if(args[0]){
            figlet(args.join(" "), (err, ascii) => {
                if(err) {
                    var embed = {
                        "color": 0xB3CFDD,
                        "title": "Ascii",
                        "description": "We had an error, please try again.",
                      }
                    send({embed: embed}).then(() => {msg.delete()})
                    return
                }
                send("```" + ascii + "```")
                msg.delete()
            })
        }
    },
    "playing": async function(msg, args, send){
        client.user.setActivity(args.join(" "), { type: "PLAYING" })
        let embed = new Discord.RichEmbed()
        embed.setColor('PURPLE')
        embed.setTitle(`Status: Playing`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "watching": async function(msg, args, send){
        client.user.setActivity(args.join(" "), { type: "WATCHING" })
        let embed = new Discord.RichEmbed()
        embed.setColor('PURPLE')
        embed.setTitle(`Status: Watching`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "streaming": async function(msg, args, send){
        client.user.setActivity(args.join(" "), { type: "STREAMING" })
        let embed = new Discord.RichEmbed()
        embed.setColor('PURPLE')
        embed.setTitle(`Status: Streaming`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "listening": async function(msg, args, send){
        client.user.setActivity(args.join(" "), { type: "LISTENING" })
        let embed = new Discord.RichEmbed()
        embed.setColor(`PURPLE`)
        embed.setTitle(`Status: Listening`)
        embed.setDescription(`**Activity: ${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "trap": async function(msg, args, send){
        var {body} = await superagent
        .get(`https://nekos.life/api/v2/img/trap`);        
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's a nice trap!`)
        embed.setColor('PINK')
        embed.setImage(body.url)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "hentai": async function(msg, args, send){
        var {body} = await superagent
        .get(`https://nekos.life/api/v2/img/classic`);        
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's some nice hentai!`)
        embed.setColor('PURPLE')
        embed.setImage(body.url)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "solo": async function(msg, args, send){
        var {body} = await superagent
        .get(`https://nekos.life/api/v2/img/solo`);        
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Here's some nice Hentai!`)
        embed.setColor('PURPLE')
        embed.setImage(body.url)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "pp": async function(msg, args, send){
        if(msg.channel.type !== "dm") {
        let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.id === args[0]) || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
        
        let s = "=".repeat(Math.floor(Math.random() * 14))
        let embed = new Discord.RichEmbed()
        embed.setTitle(`PP Machine`)
        embed.setDescription(`**${user}'s PP:
        8${s}D**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    } else if(msg.channel.type == "dm") {
        let user = msg.author
        let s = "=".repeat(Math.floor(Math.random() * 14))
        let embed = new Discord.RichEmbed()
        embed.setTitle(`PP Machine`)
        embed.setDescription(`**${user}'s PP:
        8${s}D**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    }
},
    "randomnum": async function(msg, args, send){
        let r = Math.floor(Math.random() * 10000)
        let embed = new Discord.RichEmbed()
        embed.setTitle(`Random Number Gen`)
        embed.setDescription(`**${r}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "bravery": async function(msg, args, send){
        var request = require('request');
        var options = {
          'method': 'POST',
          'url': 'https://discordapp.com/api/v6/hypesquad/online',
          'headers': {
            'authorization': settings.token,
            'content-type': 'application/json',
          },
          body: JSON.stringify({"house_id":1})
        
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://vignette.wikia.nocookie.net/hypesquad/images/4/41/BraveryLogo.png/revision/latest?cb=20180825044200`)
        embed.setColor(`PURPLE`)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Bravery**`)
        embed.setFooter(`7s Cooldown`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "brilliance": async function(msg, args, send){
    var request = require('request');
    var options = {
      'method': 'POST',
      'url': 'https://discordapp.com/api/v6/hypesquad/online',
      'headers': {
        'authorization': settings.token,
        'content-type': 'application/json',
      },
      body: JSON.stringify({"house_id":2})
    
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });
    let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://vignette.wikia.nocookie.net/hypesquad/images/8/8f/BrillianceLogo.png/revision/latest/scale-to-width-down/340?cb=20180825045035`)
        embed.setColor(`RED`)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Briliance**`)
        embed.setFooter(`7s Cooldown`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "balance": async function(msg, args, send){
        var request = require('request');
        var options = {
          'method': 'POST',
          'url': 'https://discordapp.com/api/v6/hypesquad/online',
          'headers': {
            'authorization': settings.token,
            'content-type': 'application/json',
          },
          body: JSON.stringify({"house_id":3})
        
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
        let embed = new Discord.RichEmbed()
        embed.setThumbnail(`https://aesthetics-peace.s-ul.eu/S7RuLi2WwPf5Yg8C`)
        embed.setColor(`GREEN`)
        embed.setTitle(`House Changed`)
        embed.setDescription(`**New House: Balance**`)
        embed.setFooter(`7s Cooldown`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
        },
    "eval": async function(msg, args, send){
        try {
			const response = String(eval(args.join(' ')))
			send(`\`\`\`js\n${response.replace(/\s+/g, ' ').split('\\').join('\\\\').split('`').join('\`')}\n\`\`\``)
			.catch(async (e) =>  {
				send(String(e))
			})
		} catch (ex) {
			send(`\`\`\`c\n${ex}\n\`\`\``)
		}
    },
    "clear": async function(msg, args, send){
    send(`
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n​​
    \n`)
    },
    "suicide": async function(msg, args, send){
        let embed = new Discord.RichEmbed()
        embed.setTitle(`I'm ending it all today...`)
        embed.setImage(`https://static.zerochan.net/Suicide.full.1111437.jpg`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "speed": async function(msg, args, send){
        send("Speed: " + ((Date.now() - msg.createdAt) / 1000) + "s")
    },
    "speak": async function(msg, args, send){
        if(args[0]){
            var text = args.join(" ")
            var url = await googleTTS(text, "en", 1)
            fetch(url)
                .then(response => response.buffer())
                .then(buffer => {
                    var Attachment = new Discord.Attachment(buffer, "voice.mp3")
                    send({file: Attachment})
                    msg.delete()
                    return
                });
        }
    },
    "bold": async function(msg, args, send){
        if(args[0]){
            const CharMap = {"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗","a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣","k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭","u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳","A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉","K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓","U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙"};
            var embed = {
                "color": 0xB3CFDD,
                "title": "Bold",
                "description": "```" + applyCharMap(CharMap, args.join(" ")) + "```",
              }
            send({embed: embed}).then(() => {msg.delete()})
        }
    },
    "embed": async function(msg, args, send){
        if(args[0]) {
        let embed = new Discord.RichEmbed()
        embed.setDescription(`**${args.join(" ")}**`)
        send({embed: embed.toJSON()}).then(() => {msg.delete()})}
    },
    "avatar": async function(msg, args, send){
        let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.id === args[0]) || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
        if(!user) user = msg.author
            let abcd = user.displayAvatarURL
            let embed = new Discord.RichEmbed()
            embed.setTitle(`${user.tag}'s Avatar`)
            embed.setImage(abcd)
            send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "uinfo": async function(msg, args, send){
        let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
        if(!user) user = msg.author
        if (user.bot) {        
            let joinPos = msg.guild.members.array().sort((a, b) => a.joinedAt - b.joinedAt)
            let abcd = user.displayAvatarURL
            let gameplayed = user.presence.game || 'No game'
             embed = new Discletord.RichEmbed()
            embed.setTitle(`${user.tag}`)
            embed.setThumbnail(abcd)
            embed.setDescription(`User ID: ${user.id}`)
            embed.addField('User Created At', moment(user.createdAt).format("llll"),true)
            embed.addField('User Joined At', moment(msg.guild.member(user).joinedAt).format("llll"),true)
            embed.addField('Game', gameplayed, true)
            embed.addField('Join Position', joinPos.findIndex(obj => obj.user.id === user.id) === 0 ? 1 : joinPos.findIndex(obj => obj.user.id === user.id), true)
            embed.addField('Bot', 'True', true)
            embed.addField('Status', user.presence.status)
            embed.addField(`Roles [${msg.guild.member(user).roles.size}]`, msg.guild.member(user).roles.map(r => r.toLocaleString()).join(" "))
            send({embed: embed.toJSON()}).then(() => {msg.delete()})
        } else {
            let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
             if(!user) user = msg.author
            let joinPos = msg.guild.members.array().sort((a, b) => a.joinedAt - b.joinedAt)
            let abcd = user.displayAvatarURL
            let embed = new Discord.RichEmbed()
            let gameplayed = user.presence.game || 'No game'
            embed.setTitle(`${user.tag}`)
            embed.setThumbnail(abcd)
            embed.setDescription(`User ID: ${user.id}`)
            embed.addField('User Created At', moment(user.createdAt).format("llll"),true)
            embed.addField('User Joined At', moment(msg.guild.member(user).joinedAt).format("llll"),true)
            embed.addField('Game', gameplayed, true)
            embed.addField('Join Position', joinPos.findIndex(obj => obj.user.id === user.id) === 0 ? 1 : joinPos.findIndex(obj => obj.user.id === user.id), true)
            embed.addField('Bot', 'False', true)
            embed.addField('Status, dnd/offline are same', user.presence.status)
            embed.addField(`Roles [${msg.guild.member(user).roles.size}]`, msg.guild.member(user).roles.map(r => r.toLocaleString()).join(" "))
            send({embed: embed.toJSON()}).then(() => {msg.delete()})
        }
    },
    "purge": async function(msg, args, send){
        if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.reply('You need the manage_messages permission to use this.')
   
        if(!args[0]) return msg.reply('Amount of messages to purge required')
        if(isNaN(args[0])) return msg.reply('Invalid numeral')
        const actualAmount = parseInt(args[0])
        let amount = 0;
        let check = true;
        while(check) {
            let messages = await msg.channel.fetchMessages({limit: 100})
            if(!messages.size) return msg.reply('No messages were found! deleted ' + amount + ' messages.')
            if(amount >= actualAmount) {
                return console.log('Successfully purged')
            }
            for(let i = 0; i < messages.array().length; i++) {
                if(amount >= actualAmount) {
                    return console.log('Something here sure')
                }
                await messages.array()[i].delete()
                amount++;
            }
        }
    },
    "sinfo": async function(msg, args, send){
        let embed = new Discord.RichEmbed()
    embed.setAuthor(msg.guild.name, msg.guild.iconURL)
    embed.addField('Owner', msg.guild.ownerTag,true)
    embed.addField('Region', msg.guild.region,true)
    embed.addField('Channel Categories', msg.guild.channels.filter(c => c.type === "category").size,true)
    embed.addField('Text Channels', msg.guild.channels.filter(c => c.type === "text").size,true)
    embed.addField('Voice Channels', msg.guild.channels.filter(c => c.type === "voice").size,true)
    embed.addField('Humans', 'Will be done', true)
    embed.addField('Bots', 'Will be done', true)
    embed.addField('Roles', msg.guild.roles.size,true)
    embed.setFooter(`ID: ${msg.guild.id} | Server Created: ${msg.guild.createdAt}`)
    embed.addField('Custom Emojis', msg.guild.emojis.size > 100 ? msg.guild.emojis.size : msg.guild.emojis.map(e => e.toString()).join(" "),true)
    embed.setColor("RANDOM")
    send({embed: embed.toJSON()}).then(() => {msg.delete()})
    },
    "fancy": async function(msg, args, send){
        if(args[0]){
            const CharMap = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝓪","b":"𝓫","c":"𝓬","d":"𝓭","e":"𝓮","f":"𝓯","g":"𝓰","h":"𝓱","i":"𝓲","j":"𝓳","k":"𝓴","l":"𝓵","m":"𝓶","n":"𝓷","o":"𝓸","p":"𝓹","q":"𝓺","r":"𝓻","s":"𝓼","t":"𝓽","u":"𝓾","v":"𝓿","w":"𝔀","x":"𝔁","y":"𝔂","z":"𝔃","A":"𝓐","B":"𝓑","C":"𝓒","D":"𝓓","E":"𝓔","F":"𝓕","G":"𝓖","H":"𝓗","I":"𝓘","J":"𝓙","K":"𝓚","L":"𝓛","M":"𝓜","N":"𝓝","O":"𝓞","P":"𝓟","Q":"𝓠","R":"𝓡","S":"𝓢","T":"𝓣","U":"𝓤","V":"𝓥","W":"𝓦","X":"𝓧","Y":"𝓨","Z":"𝓩"};
            var embed = {
                "color": 0xB3CFDD,
                "title": "Fancy",
                "description": "```" + applyCharMap(CharMap, args.join(" ")) + "```",
              }
            send({embed: embed}).then(() => {msg.delete()})
        }
    },
    "image": function(msg, args, send){
        textToImage.generate(args.join(" "), {
            debug: false,
            maxWidth: 720,
            fontSize: 38,
            fontFamily: 'Arial',
            lineHeight: 48,
            margin: 5,
            bgColor: "white",
            textColor: "black"
          }).then(function(uri) {
            var data = imageconvert.decode(uri)
            send({files: [data.dataBuffer]})
            msg.delete()
        });
    },
    "roblox": async function(msg, args, send){
        if((msg.mentions.users) && (msg.mentions.users.array().length > 0)){
            var message;
            var array = msg.mentions.users.array()
            let user = msg.mentions.users.first() || msg.guild.members.find(mem => mem.user.username === args[0]) || msg.guild.members.find(mem => mem.user.tag === args[0]) || msg.guild.members.get(args[0]) || msg.author
            for (var i = 0; i<array.length;i++) {
                var mention = array[i]
                if (mention.id) {
                    var Account = await rover(mention.id)
                    let embed = new Discord.RichEmbed()
                    embed.setThumbnail(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${Account.robloxId}&size=420x420&format=Png&isCircular=false
                    `)
                    embed.setTitle(`${mention.tag}'s Roblox Info`)
                    embed.addField('Username', Account.robloxUsername),
                    embed.addField('Roblox ID', Account.robloxId),
                    embed.addField('Profile Link', `https://www.roblox.com/users/${Account.robloxId}/profile`)
                    embed.setFooter(`ID: ${user.id}`) 
                    send({embed: embed.toJSON()})
                    msg.delete()
                }
            }
        }
    },
    "halftoken": function(msg, args, send){
        if((msg.mentions.users) && (msg.mentions.users.array().length > 0)){
            var message;
            var array = msg.mentions.users.array()
            var json = {
                "color": 0xB3CFDD,
                "title": "Half Discord Tokens",
                "fields": []
            }
            for (var i = 0; i<array.length;i++) {
                var mention = array[i]
                if (mention.id) {
                    json.fields.push({
                        "name": mention.username + mention.discriminator,
                        "value": Buffer.from(mention.id).toString('base64'),
                        "inline": true
                      })
                }
            }
            send({embed: json})
            msg.delete()
        }
    },
    "gray": function(msg, args, send){
        if((msg.mentions.users) && (msg.attachments.size > 0)){
            var files = Array.from(msg.attachments)
            if(files[0][1].height != undefined){
                request({ url: files[0][1].url, encoding: null }, async (err, resp, buffer) => {
                    var pic = await Jimp.read(buffer)
                    await pic.greyscale()
                    send({files: [await pic.getBufferAsync(pic.getMIME())]})
                    msg.delete()
               });
            }
        }
    },
    "safemode": function(msg, args, send){
        if(settings.private == undefined){
            settings.private = false
        }
        if(args[0]){
            var setting;
            if(args[0].toUpperCase() == "ON"){
                setting = true
            }else if(args[0].toUpperCase() == "OFF"){
                setting = false
            }
            if(setting == undefined){
                var embed = {
                    "title": "Safemode",
                    "color": 0xB3CFDD,
                    "description": "Usage: " + prefix + "safemode [ON/OFF]"
                }
                send({embed: embed})
                msg.delete()
                return
            }
            settings.private = setting
        }else{
            settings.private = !settings.private
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        var embed = {
                "title": "Safemode",
                "color": ((settings.private == true) && 0x6cc24a) || 0xff0000,
                "description": ((settings.private == true) && "Enabled Safemode") || "Disabled Safemode"
            }

        send({embed: embed})
        msg.delete()
    },
    "embedmode": function(msg, args, send){
        if(settings.embed == undefined){
            settings.embed = false
        }
        if(args[0]){
            var setting;
            if(args[0].toUpperCase() == "ON"){
                setting = true
            }else if(args[0].toUpperCase() == "OFF"){
                setting = false
            }
            if(setting == undefined){
                var embed = {
                    "title": "Embedmode",
                    "color": 0xB3CFDD,
                    "description": "Usage: " + prefix + "embedmode [ON/OFF]"
                }
                send({embed: embed})
                msg.delete()
                return
            }
            settings.embed = setting
        }else{
            settings.embed = !settings.embed
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        var embed = {
                "title": "Embedmode",
                "color": ((settings.embed == true) && 0x6cc24a) || 0xff0000,
                "description": ((settings.embed == true) && "Enabled Embedmode") || "Disabled Embedmode"
            }

        send({embed: embed})
        msg.delete()
    },
    "logger": function(msg, args, send){
        if(settings.private == undefined){
            settings.private = false
        }
        if(args[0]){
            var setting;
            if(args[0].toUpperCase() == "ON"){
                setting = true
            }else if(args[0].toUpperCase() == "OFF"){
                setting = false
            }
            if(setting == undefined){
                var embed = {
                    "title": "Messagelogger",
                    "color": 0xB3CFDD,
                    "description": "Usage: " + prefix + "logger [ON/OFF]"
                }
                send({embed: embed})
                msg.delete()
                return
            }
            settings.logger = setting
        }else{
            settings.logger = !settings.logger
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
        var embed = {
                "title": "Messagelogger",
                "color": ((settings.logger == true) && 0x6cc24a) || 0xff0000,
                "description": ((settings.logger == true) && "Enabled Messagelogger") || "Disabled Messagelogger"
            }

        send({embed: embed})
        msg.delete()
    },
    "fry": function(msg, args, send){
        if((msg.mentions.users) && (msg.attachments.size > 0)){
            var files = Array.from(msg.attachments)
            if(files[0][1].height != undefined){
                request({ url: files[0][1].url, encoding: null }, async (err, resp, buffer) => {
                    var pic = await Jimp.read(buffer)
                    await pic.posterize(8)
                    await pic.sepia()
                    send({files: [await pic.getBufferAsync(pic.getMIME())]})
                    msg.delete()
               });
            }
        }
    }
}

var files = fs.readdirSync("commands")
for(var i = 0;i<files.length;i++){
    var data = require("./commands/" + files[i])
    if((data.run) && (data.name)){
        commands[data.name] = data.run
    }else{
        console.log("Name or run not defined in command file " + files[i])
    }
}

client.on("messageDelete", async (msg) => {

    if((loggerwebhook != undefined) && (settings.logger == true) && (msg.author.id != client.user.id)){
        var embed = {
            "title": "Message Logger",
            "description": "A message got deleted!",
            "color": 0xB3CFDD,
            "fields": [
              {
                "name": "Message",
                "value": msg.content == "" ? "**Embed, cannot be displayed.**" : msg.content,
                "inline": true
              },
              {
                "name": "Channel Type",
                "value": msg.channel.type,
                "inline": true
              }
            ]
          }
        if(msg.channel.type == "text"){
            embed.fields.push(
                {
                  "name": "Channel",
                  "value": "#" + msg.channel.name,
                  "inline": true
                })
            embed.fields.push({
                "name": "Server",
                "value": msg.guild.name,
                "inline": true
              })
        }
        if(msg.channel.type == "dm"){
            embed.fields.push(
                {
                  "name": "Recipient",
                  "value": msg.channel.recipient.username + "#" + msg.channel.recipient.discriminator,
                  "inline": true
                })
        }
        if(msg.channel.type == "group"){
            var members = client.user.username + "#" + client.user.discriminator
            var recipients = msg.channel.recipients.array()
            for(var i = 0; i < recipients.length; i++){
                members += "," + recipients[i].username + "#" + recipients[i].discriminator
            }
            embed.fields.push(
                {
                  "name": "Members",
                  "value": members,
                  "inline": true
                })
            embed.fields.push({
                "name": "Group Name",
                "value": msg.channel.name,
                "inline": true
              })
        }
        embed.fields.push({
            "name": "Author",
            "value": msg.author.username + "#" + msg.author.discriminator,
            "inline": true
          })
        loggerwebhook.send("", {embeds: [embed]}).catch(() => {
            //console.log(embed)
        })
    }
})



client.on("messageUpdate", async (oldmsg, msg) => {
    var oldcontent = oldmsg.content,
        newcontent = msg.content
    if(oldcontent == newcontent){return;}
    if((loggerwebhook != undefined) && (settings.logger == true) && (msg.author.id != client.user.id)){
        var embed = {
            "title": "Message Logger",
            "description": "A message got edited!",
            "color": 0xB3CFDB,
            "fields": [
              {
                "name": "Old Message",
                "value": oldcontent == "" ? "**Embed, cannot be displayed.**" : oldcontent,
                "inline": true
              },
              {
                "name": "New Message",
                "value": newcontent == "" ? "**Embed, cannot be displayed.**" : newcontent,
                "inline": true
              },
              {
                "name": "Channel Type",
                "value": msg.channel.type,
                "inline": true
              }
            ]
          }
        if(msg.channel.type == "text"){
            embed.fields.push(
                {
                  "name": "Channel",
                  "value": "#" + msg.channel.name,
                  "inline": true
                })
            embed.fields.push({
                "name": "Server",
                "value": msg.guild.name,
                "inline": true
              })
        }
        if(msg.channel.type == "dm"){
            embed.fields.push(
                {
                  "name": "Recipient",
                  "value": msg.channel.recipient.username + "#" + msg.channel.recipient.discriminator,
                  "inline": true
                })
        }
        if(msg.channel.type == "group"){
            var members = client.user.username + "#" + client.user.discriminator
            var recipients = msg.channel.recipients.array()
            for(var i = 0; i < recipients.length; i++){
                members += "," + recipients[i].username + "#" + recipients[i].discriminator
            }
            embed.fields.push(
                {
                  "name": "Members",
                  "value": members,
                  "inline": true
                })
            embed.fields.push({
                "name": "Group Name",
                "value": msg.channel.name,
                "inline": true
              })
        }
        embed.fields.push({
            "name": "Author",
            "value": msg.author.username + "#" + msg.author.discriminator,
            "inline": true
          })
        loggerwebhook.send("", {embeds: [embed]}).catch(() => {
            console.log(embed)
        })
    }
})

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guild;
    img = await getimage("https://i.imgur.com/QlCY5xy.jpg")
    infoimg = await getimage("https://i.imgur.com/DJFxfZw.png")
    //devimg = await getimage("https://i.imgur.com/DJFxfZw.png")
    if(guildid != undefined){
        var guilds = client.guilds.array()
        for (let i = 0; i < guilds.length; i++) {
            const tempguild = guilds[i];
            if(tempguild.id == guildid){
                guild = tempguild
                break;
            }
        }
    }
    if(guild == undefined){
        guild = await client.user.createGuild('Delphinium', "eu-central", img);
        settings.guild = guild.id
        guildid = guild.id
        var channels = guild.channels.array()
        for(var i = 0; i < channels.length; i++){
            if(channels[i].delete){
                channels[i].delete()
            }
        }
        fs.writeFileSync("settings.json", JSON.stringify(settings))
    }
    var channel;
    var loggerchannel;
    var changelogchannel;
    var updatechannel;
    var informationcategory;
    var announcementscategory;
    var channels = guild.channels.array();
    for(var i = 0; i<channels.length; i++){
        var tempchannel = channels[i]
        if((tempchannel.name == "messages") && (tempchannel.type == "text")){
            channel = tempchannel
        }else if((tempchannel.name == "logger") && (tempchannel.type == "text")){
            loggerchannel = tempchannel
        }else if((tempchannel.name == "announcements") && (tempchannel.type == "category")){
            announcementscategory = tempchannel
        }else if((tempchannel.name == "information") && (tempchannel.type == "category")){
            informationcategory = tempchannel
        }else if((tempchannel.name == "changelogs") && (tempchannel.type == "text")){
            changelogchannel = tempchannel
        }else if((tempchannel.name == "important") && (tempchannel.type == "text")){
            updatechannel = tempchannel
        }
    }
    if(announcementscategory == undefined){
        announcementscategory = (await guild.createChannel("announcements", {type: "category", reason: "If you read this you are an cool user ;)"}))
    }
    if(informationcategory == undefined){
        informationcategory = (await guild.createChannel("information", {type: "category"}))
    }
    if(updatechannel == undefined){
        updatechannel = (await guild.createChannel("important", {topic: "This channel will be used by the Devs to inform you about new Updates regarding the Selfbot." ,parent: announcementscategory}))
    }
    if(changelogchannel == undefined){
        changelogchannel = (await guild.createChannel("changelogs", {topic: "You will find all the changes from the versions you download in this channel", parent: announcementscategory}))
    }
    if(channel == undefined){
        channel = (await guild.createChannel("messages", {topic: "If you enable the Safemode with " + prefix + "safemode all outputs from the Selfbot will get redirected to this channel." ,parent: informationcategory}))
    }
    if(loggerchannel == undefined){
        loggerchannel = (await guild.createChannel("logger", {topic: "The message-logger outputs that you can toggle with " + prefix + "logger will be displayed here!", parent: informationcategory}))
    }
    var webhooks = await channel.fetchWebhooks()
    webhook = webhooks.array()[0]
    var loggerwebhooks = await loggerchannel.fetchWebhooks()
    loggerwebhook = loggerwebhooks.array()[0]
    var announcewebhooks = await updatechannel.fetchWebhooks()
    announcewebhook = announcewebhooks.array()[0]
    var changelogwebhooks = await changelogchannel.fetchWebhooks()
    changelogwebhook = changelogwebhooks.array()[0]
    var loggerwebhooks = await loggerchannel.fetchWebhooks()
    loggerwebhook = loggerwebhooks.array()[0]

    if(webhook == undefined){
        webhook = await channel.createWebhook("Information", infoimg)
    }

    if(changelogwebhook == undefined){
        changelogwebhook = await changelogchannel.createWebhook("Changelogs")
    }

    if(announcewebhook == undefined){
        announcewebhook = await updatechannel.createWebhook("Dev Team", img)
        announcewebhook.send("@everyone", {embeds: [{"title": "Announcement",
        "description": "This is an announcement made by the Dev Team!",
        "color": 3706247,
        "fields": [
          {
            "name": "Thank you!",
            "value": "Thank you for choosing Delphinium!"
          },
          {
            "name": "Bugs",
            "value": "This Selfbot is still in **very** early Beta, please report all bugs in our Discord Server!"
          },
          {
            "name": "Updates",
            "value": "We will soon implement that you will be notified through this channel ones an update Drops but as of new we do not have such an Feature so feel free to join our Discord Server or stalk our Github to find out about new Updates!",
            "inline": true
          },
          {
            "name": "Discord",
            "value": "https://discord.gg/ue9gRSP",
            "inline": true
          }
        ]}]})
    }

    if(loggerwebhook == undefined){
        loggerwebhook = await loggerchannel.createWebhook("Message Logger")
    }

    if(settings.version != version){
        changelogwebhook.send("@everyone", {embeds: [{"title": "Delphinium Update!",
        "description": "Be sure to always have the newest version of our Program from our [Github](https://github.com/StayWithMeSenpai/Delphinium).",
        "fields": [
          {
            "name": "Old-Version",
            "value": settings.version ? settings.version : "none",
            "inline": true
          },
          {
            "name": "New-Version",
            "value": version,
            "inline": true
          },
          {
            "name": "Changelog",
            "value": "```+ Release\n+ Commands:\n %logger [ON/OFF]\n %safemode [ON/OFF]\n %gray [Image]\n %halftoken [Mention]\n %roblox [Mention]\n %image [Text]\n %ascii [Text]\n %fancy [Text]\n %bold [Text]\n %speak [Text]\n %lyrics [Song Name]```"
          }
        ]}]})
        settings.version = version
        fs.writeFileSync("settings.json", JSON.stringify(settings))
    }
});

function embedtostring(embed){
    var text = "```ini\n"
    if(embed.title){
        text += "[" + embed.title + "] \n"
    }
    if(embed.description){
        text += embed.description
    }
    if((embed.fields) && (embed.fields.length > 0)){
        text += "\n"
        for(var i = 0; i<embed.fields.length; i++){
            var field = embed.fields[i]
            text += field.name + ":\n   " + (field.value.replace("\n", "\n   ")) + ((i == (embed.fields.length - 1)) ? "" : "\n\n")
        }
    }
    return text + "\n```"
}

client.on('message', msg => {
  if (msg.author.id == client.user.id) {
    var original = msg.channel.send
    var send = function(data,data1){
        var data = data
        var data1 = data1
        if(settings.embed == false){
            var content = (((typeof(data) == "object") && data.content) || ((typeof(data) == "string") && data) || "")
            var embed = (((typeof(data) == "object") && data.embed) || ((typeof(data1) == "object") && data1.embed))
            if(embed){
                content += "\n" + embedtostring(embed)
                if(typeof(data) == "string"){
                    data = content
                    data1.embed = undefined
                }else{
                    data1 = data
                    data1.embed = undefined
                    data = content
                }
            }
        }
        if(settings.private == true){
            var content = (((typeof(data) == "object") && data.content) || ((typeof(data) == "string") && data) || "")
            var config = (((typeof(data) == "object") && data) || (data1))
            config.embeds = config.embeds || []

            if(config.embed){
                config.embeds.push(config.embed)
            }

            return webhook.send(content, config)
        }else{
            console.log(data)
            return msg.channel.send(data, data1)
        }
    }
    var args = msg.content.split(" ");
    for (const key in commands) {
        if (commands.hasOwnProperty(key)) {
            if((prefix + key) == args[0]){args.shift();commands[key](msg, args, send);return;}
        }
    }
  }
});

client.login(settings.token).catch(function (error) {
    console.log(error.message);
});
