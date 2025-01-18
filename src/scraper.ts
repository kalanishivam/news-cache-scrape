import * as cheerio from 'cheerio';
import axios from 'axios';
import { StoryData } from './types';
import { RedisSingleton } from './redis/redisClient';
import { getTheLatestStoryTime, saveMultipleStoriesToDatabase } from './controller/storyController';

export let numberOfStoriesPostedInTheLastFiveMinutes = 0; // inintiaing the numberof stories posted in last 5 mintues to 0
// stories are scraped every 5 mintues
export const scrapeStory = async () => {
    let storiesArr: StoryData[] = []
    try {
        const { data } = await axios.get('https://news.ycombinator.com/');
        const $ = cheerio.load(data);

        $('tr.athing.submission').each((index, element) => {
            // parsing the title, link and timestamp of the stories
            const title = $(element).find('.title .titleline > a').text() ?? '';
            const link = $(element).find('.title .titleline > a').attr('href') ?? '';
            const timestamp: string = $(element).next('tr').find('.subtext .age').attr('title') ?? '';

            const [dateString, unixTimestamp] = timestamp.split(' ');
            const unixDate = new Date(parseInt(unixTimestamp) * 1000);
            let tempStoriesPostedInTheLastFiveMinutes = 0;
            if ((Date.now() - unixDate.getTime()) / 1000 / 60 <= 5) { // countes the number of stories posted in the last 5 mintues
                tempStoriesPostedInTheLastFiveMinutes = tempStoriesPostedInTheLastFiveMinutes + 1;
            }
            numberOfStoriesPostedInTheLastFiveMinutes = tempStoriesPostedInTheLastFiveMinutes;
            const dateOfTimestamp = new Date(timestamp)
            let newLink = link; // Some links that are part of Y combinator do not start with http but only have the last part of the url
            if (!link.startsWith('http')) {
                newLink = `https://news.ycombinator.com/${link}`;
            }
            storiesArr.push({ title, link: newLink, storyPublishedAt: new Date(parseInt(unixTimestamp) * 1000) });
        })
        const redisClient = await RedisSingleton.getInstance().getClient();
        const latestStoryTime = await getTheLatestStoryTime(); // gets the latest story time from the database
        if (latestStoryTime) {
            let newStoriesArr: StoryData[] = storiesArr.filter((story) => {   // This is done to ensure that (after the first time when the databse is populated with old stories) only new stories that are not yet brodcasted are added to the cache
                return new Date(story.storyPublishedAt) > new Date(latestStoryTime);
            })
            await redisClient.setEx('stories', 300, JSON.stringify(newStoriesArr)); // cache will expire after 5 mintues
        } else {
            await redisClient.setEx('stories', 300, JSON.stringify(storiesArr)); // here i have set the stories to expire after 5 mintues
        }
        await saveMultipleStoriesToDatabase(storiesArr); // the array will be then stored in the database duplicate is marked as false therefore only new stories will be pushed 
        // only the new stories are pushed to the database
    } catch (error) {
        console.log(error);
        console.log(`in the error clause`);
    }
}