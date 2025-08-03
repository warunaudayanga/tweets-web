import { BaseModel } from "./base.model";
import { Tweet, TweetLike, TweetReply } from "./tweet.interfaces";

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    emailVerified: boolean;
    tweets: Tweet[];
    tweetReplies: TweetReply[];
    tweetLikes: TweetLike[];
}
