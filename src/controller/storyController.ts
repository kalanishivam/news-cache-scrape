import db from '../db';
import { StoryData } from '../types';

// export const countNumberOfStoriesPostedInTheLastFiveMinutes = async()=>{
//     try{
//         const numberOfStories = await db.story.count({
//             where : {
//                 storyPublishedAt :{
//                     gte : new Date(Date.now() - 5*60*1000)
//                 }
//             }
//         });
//         return numberOfStories;
//     }catch(error){
//         console.log(error)
//     }
// }

// export const saveStoryToDatabase = async(title : string , link : string , timestamp : Date)=>{
//     try{
//         const story = await db.story.create({
//             data : {
//                 title ,
//                 link ,
//                 storyPublishedAt : timestamp
//             }
//         });
//         return story.title;
//     }catch(error){
//         console.log(error);
//     }
// }

export const saveMultipleStoriesToDatabase = async(stories : StoryData[])=>{
    try{
        const story = await db.story.createMany({
            data : stories,
            skipDuplicates : true,
        });
        return story;
    }catch(error){
        console.log(error);
    }
}

export const getTheLatestStoryTime = async()=>{
    try{
        const story = await db.story.findFirst({
            orderBy : {
                storyPublishedAt : 'desc'
            }, 
            select : {
                storyPublishedAt : true
            }
        });
        if(!story){
            return null;
        }
        return story.storyPublishedAt;
    }catch(error){
        console.log(`error in getting the latest story time`)
        console.log(error);
        throw new Error('Error getting the latest story time')
    }
}