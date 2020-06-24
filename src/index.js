const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("../config/config.json");
const ytsr = require('ytsr');
const ytdl = require("ytdl-core");

bot.login(config.token)

bot.once("ready", () => {
    console.log("We're ready to go!")
})

let queue = []

function removeSong(){
    return queue = queue.slice(1)
}

bot.on("message", async message => {
    bot.user.setActivity("Use $commands"); 

    if (!message.guild) return;

    if (message.content.match(/^\$play /i)){
        if (message.member.voice.channel) {

            const connection = await message.member.voice.channel.join();
            const song = message.content.slice(6)

            ytsr(song, (err, result) => {
                const title = result.items[0].title
                const url = result.items[0].link

                function checkQueue(queue){
                    if(queue.length >= 1){
                        console.log(`${title} added to queue!`)
                        message.channel.send(`**${title}** added to queue!`)

                        queue.push(url)
                    }
                    else{
                        queue.push(url)

                        console.log(`I'm going to play ${title}`)
                        message.channel.send(`I'm going to play **${title}!**`)
                        play(connection, title)  
                    }
                }

                checkQueue(queue)
            })
        }
        else {
            message.reply("You have to be in a voice channel!")
        }
    }

    function play(connection, song){

        const stream = ytdl(queue[0], {filter: "audioonly", highWaterMark: 1<<25})
        connection.play(stream)
    
        const dispatcher = connection.play(stream)
    
        dispatcher.on("finish", () => {
            removeSong()
    
            if(queue.length >= 1){
                message.channel.send(`Now playing... **${queue[0]}**`)
                console.log("Next song!")
                play(connection, song)
            }
            else{
                message.channel.send(`There's no songs left, bye bye`)
                
                setTimeout( () => {
                    message.member.voice.channel.leave();
                }, 3000)
            }
        })    
    }
    

    if (message.content.toLowerCase() === "$commands"){
        message.channel.send({embed: {
            color: 10038562,
            title: "Bot commands",
            description: "Rockola is a music bot, enjoy!",
            fields: [{
                name: "Search in youtube and play the song title you wrote",
                value: "$play [song title]"
              },
              {
                name: "Go to the next song in queue",
                value: "$skip"
              },
              {
                name: "What song is currently playing?!?",
                value: "$current"
              },
              {
                name: "The bot will leave the voice channel",
                value: "$leave"
              }
            ]
          }
        });
    }

    if (message.content.toLowerCase() === "$current"){
        message.channel.send(`**The current song is...** ${queue[0]}`)
    }

    if (message.content.toLowerCase() === "$skip"){

        if (queue.length === 0){
            message.channel.send(`There are no songs playing right now!`)
        }
        else{
            removeSong()
            message.channel.send(`The song has been skipped!`)

            const connection = await message.member.voice.channel.join();
            connection.play(ytdl(queue[0], {filter: "audioonly", highWaterMark: 1<<25}))
            
            message.channel.send(`Now playing... **${queue[0]}**`)
        }
    }

    if (message.content.toLowerCase() === "$leave"){
        queue = []
        message.member.voice.channel.leave();
    }

})

