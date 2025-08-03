import { EntityId } from "../../types";

export interface CreateTweetReplyDto {
    content: string;
    tweetId: EntityId;
}
