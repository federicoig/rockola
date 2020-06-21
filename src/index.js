const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("../config/config.json");
const { toLowerCase } = require("ffmpeg-static");

bot.login(config.token)

bot.once("ready", () => {
    console.log("We're ready to go!")
})

let queue = []

bot.on("message", async message => {
    const ytdl = require("ytdl-core");

    if (!message.guild) return;


    if (message.content.match(/^\$play https:\/\/www.youtube.com\//i)){

        if (message.member.voice.channel) {
            const song = message.content.slice(6)
            const connection = await message.member.voice.channel.join();
            const stream = ytdl(queue[0], {filter: "audioonly"})
            const dispatcher = connection.play(stream)

            console.log(`I'm going to play ${song}`)

            if (queue[0]){
                queue.push(song)
            }
            else {
                queue.push(song)
                connection.play(stream)
            }
            
            dispatcher.on("finish", () => {
                queue.shift()

                if(queue.length >= 1){
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

    } else {
        message.reply("You have to be in a voice channel!")
        }
    }

    if (message.content.toLowerCase() === "$leave"){
        message.member.voice.channel.leave();
    }

})


