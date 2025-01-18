import * as cheerio from 'cheerio';
import axios from 'axios';
import { StoryData } from './types';
import { RedisSingleton } from './redis/redisClient';
import { getTheLatestStoryTime, saveMultipleStoriesToDatabase } from './controller/storyController';

export let numberOfStoriesPostedInTheLastFiveMinutes = 0; // inintiaing the numberof stories posted in las 5 mintues to 0

export const scrapeStory = async () => {
    let storiesArr: StoryData[] = []
    try {
        const { data } = await axios.get('https://news.ycombinator.com/');
        console.log(`this was the data`);
        const $ = cheerio.load(data);
        console.log(`reached here by the loaded data`);
        // table tr td.title .titleline > a
        // $('tr.athing.submission').length;

        $('tr.athing.submission').each((index, element) => {
            //     const title = $(element).text();
            // const link = $(element).attr('href');
            const title = $(element).find('.title .titleline > a').text() ?? '';
            const link = $(element).find('.title .titleline > a').attr('href') ?? '';
            const timestamp: string = $(element).next('tr').find('.subtext .age').attr('title') ?? '';
            console.log(`the title -- ${title}`);
            console.log(`the link -- ${link}`);
            const [dateString, unixTimestamp] = timestamp.split(' ');
            // const dateOfTimestampFromString = new Date(dateString);
           
            // console.log(`unix timestamp is : ${unixTimestamp}`)
            const unixDate = new Date(parseInt(unixTimestamp) * 1000);
            // console.log(`Unix Date object: ${unixDate}`);
           
            console.log(`this was posted this many minutes ago by unix : ${(Date.now() - unixDate.getTime()) / 1000 / 60}`);
            let tempStoriesPostedInTheLastFiveMinutes = 0;
            if((Date.now() - unixDate.getTime()) / 1000 / 60 <= 5){
                console.log(`a new stroiy posted here bro`)
                tempStoriesPostedInTheLastFiveMinutes = tempStoriesPostedInTheLastFiveMinutes + 1;
            }
            numberOfStoriesPostedInTheLastFiveMinutes = tempStoriesPostedInTheLastFiveMinutes;
            const dateOfTimestamp = new Date(timestamp)
           let newLink = link; // Some links that are part of Y combinator do not start with http but only have the last part of the url
           if (!link.startsWith('http')) {
            newLink = `https://news.ycombinator.com/${link}`;
          }
           if(!title.startsWith('http'))
            storiesArr.push({
                title,
                link : newLink,
                storyPublishedAt: new Date(parseInt(unixTimestamp) * 1000)
            })
        })
        // await saveMultipleStoriesToDatabase(storiesArr); // the array will be then stored in the database
        const redisClient = await RedisSingleton.getInstance().getClient();
        const latestStoryTime = await getTheLatestStoryTime();
        if(latestStoryTime){
            let newStoriesArr : StoryData[] = storiesArr.filter((story)=>{   // This is done to ensure that (after the first time when the databse is populated with old stories) only new stories that are not yet brodcasted are added to the cache
                return new Date(story.storyPublishedAt) > new Date(latestStoryTime);
            })
            await redisClient.setEx('stories', 300, JSON.stringify(newStoriesArr));
        }else{
        await redisClient.setEx('stories', 300, JSON.stringify(storiesArr)); // here i have set the stories to expire after 5 mintues
        }
        console.log(`the lengh of the table is ${$('tr.athing.submission').length}`)
    } catch (error) {
        console.log(error);
        console.log(`in the error clause`);
    }
}