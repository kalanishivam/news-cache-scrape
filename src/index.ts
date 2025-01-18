import { WebSocketServer } from 'ws';
import { numberOfStoriesPostedInTheLastFiveMinutes, scrapeStory } from './scraper';
import { RedisSingleton } from './redis/redisClient';
import { StoryData } from './types';

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", async (socket) => {
    try {
        console.log("connected");
        const redisClient = await RedisSingleton.getInstance().getClient();
        const stories = await redisClient.get('stories');
        socket.send(`Hello , the number of stories posted in the last five mintues is : ${numberOfStoriesPostedInTheLastFiveMinutes}`)
        setInterval(async () => {
            let storiesToSend : StoryData[] = [];
        if(stories){
            storiesToSend = await JSON.parse(stories);
        }else{
            await scrapeStory();
            const storiesFromCache = await redisClient.get('stories');
            if(!storiesFromCache){
                console.log(`no stories found in the cache this must never happen`);
                return;
            }
            storiesToSend = await JSON.parse(storiesFromCache);

        }
           wss.clients.forEach((client) => {
            client.send(JSON.stringify(storiesToSend));
           })
         }, 5 * 60 * 1000);
        socket.on("message", (message) => {
            console.log(message.toString());
        })
    } catch (error) {
        console.log(error);
    }
})
