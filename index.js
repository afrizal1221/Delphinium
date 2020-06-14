const Discord = require('discord.js');
const textToImage = require('text-to-image');
const imageconvert = require("image-data-uri");
const Jimp = require("jimp");
const request = require("request");
const rover = require('rover-api');
const fs = require("fs");
const fetch = require("node-fetch");
const ascii_art = require("ascii-art")
const googleTTS = require("google-tts-api");

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
            ascii_art.font(args.join(" "), "Doom", (err, ascii) => {
                send("```" + ascii + "```")
                msg.delete()
            })
        }
    },
    "speak": async function(msg, args, send){
        if(args[0]){
            var text = args.join(" ")
            var url = await googleTTS(text, "en", 1)
            fetch(url)
                .then(response => response.buffer())
                .then(buffer => {
                    var Attachment = new Discord.Attachment(buffer, "voice.mp3")
                    var embed = {
                        "color": 0xB3CFDD,
                        "title": "Text2Speech",
                        "description": "You can find the spoken Text as an Attached mp3.",
                      }
                    send({embed: embed, file: Attachment})
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
            var json = {
                "color": 0xB3CFDD,
                "title": "Roblox Usernames",
                "fields": []
            }
            for (var i = 0; i<array.length;i++) {
                var mention = array[i]
                if (mention.id) {
                    var Account = await rover(mention.id)
                    json.fields.push({
                        "name": mention.username,
                        "value": ((Account.robloxUsername != undefined) && ("Username: " + Account.robloxUsername + "\nUser-Id: " + Account.robloxId)) || "Could not find an Roblox account, sorry!",
                        "inline": true
                      })
                }
            }
            send({embed: json})
            msg.delete()
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
                        "name": mention.username,
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
            console.log(embed)
        })
    }
})

client.on("messageUpdate", async (oldmsg, msg) => {
    var oldcontent = oldmsg.content,
        newcontent = msg.content
    console.log(oldcontent,newcontent)
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

client.on('message', msg => {
  if (msg.author.id == client.user.id) {
    var original = msg.channel.send
    var send = function(data,data1){
        if(settings.private == true){
            var content = (((typeof(data) == "object") && data.content) || ((typeof(data) == "string") && data) || "")
            var config = (((typeof(data) == "object") && data) || (data1))
            config.embeds = config.embeds || []

            if(config.embed){
                config.embeds.push(config.embed)
            }

            return webhook.send(content, config)
        }else{
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