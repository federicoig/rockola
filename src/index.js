const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("../config/config.json");
const { toLowerCase } = require("ffmpeg-static");

bot.login(config.token)

bot.once("ready", () => {
    console.log("We're ready to go!")
})

bot.on("message", async message => {
    const ytdl = require("ytdl-core");
    let queue = {
        songs: []
    }

    if (!message.guild) return;


    if (message.content.match(/^\$play https:\/\/www.youtube.com\//i)){

        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            let song = message.content.slice(6)

            queue.songs.push(song)

            console.log(`I'm going to play ${song}`)
            const stream = ytdl(song, {filter: "audioonly"})
            const dispatcher = connection.play(stream)

            dispatcher.on("finish", () => {
                console.log("Finished playing the queue songs!")
                setTimeout( () => {
                    message.member.voice.channel.leave()
                }, 3000)
            })
    
    } else {
        message.reply("You have to be in a voice channel!")
        }
    }

    if (message.content.toLowerCase() === "$leave"){
        message.member.voice.channel.leave();
    }

})


