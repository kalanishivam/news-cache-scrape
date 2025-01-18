import { WebSocketServer } from 'ws';
import { numberOfStoriesPostedInTheLastFiveMinutes, scrapeStory } from './scraper';
import { RedisSingleton } from './redis/redisClient';
import { StoryData } from './types';

const wss = new WebSocketServer({ port: 8080 });

scrapeStory().then(async () => {
    setInterval(async () => {
        try {
            const redisClient = await RedisSingleton.getInstance().getClient();
            const stories = await redisClient.get('stories');

            let storiesToSend: StoryData[] = [];
            if (stories) {
                storiesToSend = await JSON.parse(stories);
            } else {
                await scrapeStory(); // if no cahce found , scraping the stories then retirving from the cache
                const storiesFromCache = await redisClient.get('stories');
                if (!storiesFromCache) return;
                storiesToSend = await JSON.parse(storiesFromCache);
            }
            wss.clients.forEach((client) => { // sends the new posted stories every 5 mintues
                client.send(JSON.stringify(storiesToSend)); //If no new stories are posted, then an empty array is sent
            })
        } catch (error) {
            console.log(error)
            console.log(`error in the scrape story function`)
        }
    }, 5 * 60 * 1000); // set interval function runs after every 5 mintues and sends the data to all the clients


    wss.on("connection", async (socket) => {
        try {
            console.log("New User Connected");
            socket.send(`Hello , the number of stories posted in the last five mintues is : ${numberOfStoriesPostedInTheLastFiveMinutes}`)
        } catch (error) {
            console.log(error);
        }
    })

}).catch((error) => {
    console.log(`error in the scrape story function`)
})