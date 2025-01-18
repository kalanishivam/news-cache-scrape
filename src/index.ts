import { WebSocketServer } from 'ws';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { scrapeStory } from './scraper';

// const wss = new WebSocketServer({ port: 8080 });


// const url = 'https://news.ycombinator.com/';

const testfunction = async (timef: Date) => {
    return Date.now() - timef.getTime();
}

// wss.on("connection", async (socket) => {
//     try {
//         console.log("connected");
//         const getNews = async () => {
//             const ans = await testfunction(new Date())
//             socket.send(`the number of stroeis posted in the past five mintues is : ${ans}`);
//         }
//         getNews();
//         wss.clients.forEach((client) => {
//             client.send("hello from the loop");
//         })
//         socket.on("message", (message) => {
//             console.log(message.toString());
//         })
//     } catch (error) {
//         console.log(error);
//     }
// })

// async function getNews() {
//     try {
//         const { data } = await axios.get('https://news.ycombinator.com/');
//         // console.log(html);
//         console.log(`this was the data`);
//         const $ = cheerio.load(data);
//         console.log(`reached here by the loaded data`);
//         // table tr td.title .titleline > a
//         // $('tr.athing.submission').length;

//         $('tr.athing.submission').each((index, element) => {
//             //     const title = $(element).text();
//             // const link = $(element).attr('href');
//             const title = $(element).find('.title .titleline > a').text();
//             const link = $(element).find('.title .titleline > a').attr('href');
//             const timestamp = $(element).next('tr').find('.subtext .age').attr('title');
//             console.log(`the title -- ${title}`);
//             console.log(`the link -- ${link}`);
//             console.log(`the timestamp -- ${timestamp?.toString()}`);
//             console.log(`the type of timestamp -- ${new Date(timestamp?.toString().toString() ?? '')}`);
//         })
//         console.log(`the lengh of the tabel is ${$('tr.athing.submission').length}`)

//     } catch (error) {
//         console.log(error);
//         console.log(`in the error clause`);
//     }
// }

scrapeStory();
// getNews();

