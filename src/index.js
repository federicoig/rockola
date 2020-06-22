const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("../config/config.json");
const ytsr = require('ytsr');

bot.login(config.token)

bot.once("ready", () => {
    console.log("We're ready to go!")
})

let queue = []

bot.on("message", async message => {
    const ytdl = require("ytdl-core");

    if (!message.guild) return;

    if (message.content.match(/^\$play /i)){
        if (message.member.voice.channel) {

            const connection = await message.member.voice.channel.join();
            const song = message.content.slice(6)

            ytsr(song, (err, result) => {
                console.log(err)

                const title = result.items[0].title
                const url = result.items[0].link

                queue.push(url)

                console.log(`${url} added to queue!`)
                const stream = ytdl(queue[0], {filter: "audioonly"})

                if(queue.length > 1){
                    message.channel.send(`${title} **added to queue!**`)
                }
                else if (queue.length === 1){
                    message.channel.send(`**I'm going to play** ${title}!`)
                    connection.play(stream)

                    const dispatcher = connection.play(stream)

                    dispatcher.on("finish", () => {
                        queue = queue.slice(1)
        
                        if(queue[0]){
                            message.channel.send(`Next song!`)
                            connection.play(ytdl(queue[0], {filter: "audioonly"}))
                            console.log(`Finished playing ${song}`)
                        }
                        else{
                            setTimeout( () => {
                                message.member.voice.channel.leave();
                            }, 3000)
                        }
                    })    
                }
            })

    } else {
        message.reply("You have to be in a voice channel!")
        }
    }

    if (message.content.toLowerCase() === "$leave"){
        queue = []
        message.member.voice.channel.leave();
    }

})


