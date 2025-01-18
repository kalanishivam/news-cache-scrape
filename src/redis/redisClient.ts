import { createClient , RedisClientType} from "redis";

// const redisClient = createClient();

// const getRedisClient = async()=>{
//     try{
//         if(!redisClient.isOpen){
//             await redisClient.connect();
//         }
//         console.log(`connected to the redis client`);
//         return redisClient;
//     }catch(error){
//         console.log(`error connecting to the redis client`)
//         console.log(error);
//     }
// }

export class RedisSingleton{  // I have created a singlton pattern for redis to ensure no multiple instances of the class or the redis is created
    private static instance: RedisSingleton;
    private client: RedisClientType | null = null;
    private constructor(){
        // this.client = createClient();
    }
    public static getInstance(): RedisSingleton{
        if(!RedisSingleton.instance){
            RedisSingleton.instance = new RedisSingleton();
        }
        return RedisSingleton.instance;
    }

    public async getClient() : Promise<RedisClientType>{
        try{
            if(!this.client){
                this.client = await createClient();
                console.log(`redis client created`);
                await this.client.connect();
                console.log(`connected to the redis client`);
            }
            return this.client;
        }catch(error){
            this.client = null;
            console.log(`error in redis get client function`);
            console.log(error)
            throw new Error("error in redis get client function");
        }
    }

}
