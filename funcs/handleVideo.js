module.exports = async function (video, message, voiceChannel, client, playlist = false) {
    const Discord = require('discord.js');
    let song = {
        id: video.id,
        title: Discord.Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    }
    const serverQueue = client.queue.get(message.guild.id);
    if (client.global.db.guilds[message.guild.id].defaultVolume === undefined) {
        client.global.db.guilds[message.guild.id] = {
            prefix: client.global.db.guilds[message.guild.id].prefix,
            defaultVolume: 5,
        };
        return message.channel.send(':x: `Error:` the default volume is undefined for this server. Please try again after a while.');
    }
    if (!serverQueue) {
        const construct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: client.global.db.guilds[message.guild.id].defaultVolume,
            playing: true,
            looping: false
        };
        construct.songs.push(song);
        client.queue.set(message.guild.id, construct);
        try {
            var connection = await voiceChannel.join();
            construct.connection = connection;
            client.funcs.play(message.guild, construct.songs[0], client, message, 0);
        } catch (error) {
            client.queue.delete(message.guild.id);
            return message.channel.send(`:x: An error occured: ${error}`);
        }
    } else {
        serverQueue.songs.push(song);
        if (serverQueue.looping) {
            client.secondaryQueue.push(song);
        }
        if (playlist) return undefined;
        return message.channel.send(`:white_check_mark: **${song.title}** has been added to the queue!`);
    }
    return undefined;
}