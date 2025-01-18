import db from '../db';
import { StoryData } from '../types';


export const saveMultipleStoriesToDatabase = async (stories: StoryData[]) => {
    try {
        const story = await db.story.createMany({
            data: stories,
            skipDuplicates: true,
        });
        return story;
    } catch (error) {
        console.log(error);
    }
}

export const getTheLatestStoryTime = async () => {  // returns the time of the latest story so that only new stories are added in the future
    try {
        const story = await db.story.findFirst({
            orderBy: {
                storyPublishedAt: 'desc'
            },
            select: {
                storyPublishedAt: true
            }
        });
        if (!story) {
            return null;
        }
        return story.storyPublishedAt;
    } catch (error) {
        console.log(`error in getting the latest story time`)
        console.log(error);
        throw new Error('Error getting the latest story time')
    }
}