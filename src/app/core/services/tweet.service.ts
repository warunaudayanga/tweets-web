// noinspection JSUnusedGlobalSymbols

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SuccessResponse, Tweet, TweetLike, TweetReply } from "../interfaces";
import { Observable } from "rxjs";
import { CreateTweetDto, CreateTweetReplyDto, UpdateTweetDto } from "../interfaces/dtos";
import { EntityId } from "../types";

@Injectable({
    providedIn: "root",
})
export class TweetService {
    private readonly baseUrl = "tweet"; // Update this to match your environment config if needed

    constructor(private readonly http: HttpClient) {}

    create(dto: CreateTweetDto): Observable<Tweet> {
        return this.http.post<Tweet>(`${this.baseUrl}`, dto);
    }

    get(id: EntityId): Observable<Tweet> {
        return this.http.get<Tweet>(`${this.baseUrl}/${id}`);
    }

    getAll(): Observable<Tweet[]> {
        return this.http.get<Tweet[]>(`${this.baseUrl}`);
    }

    getMyTweets(): Observable<Tweet[]> {
        return this.http.get<Tweet[]>(`${this.baseUrl}/user`);
    }

    getUserTweets(authorId: EntityId): Observable<Tweet[]> {
        return this.http.get<Tweet[]>(`${this.baseUrl}/user/${authorId}`);
    }

    update(id: EntityId, dto: UpdateTweetDto): Observable<Tweet> {
        return this.http.put<Tweet>(`${this.baseUrl}/${id}`, dto);
    }

    delete(id: EntityId): Observable<SuccessResponse> {
        return this.http.delete<SuccessResponse>(`${this.baseUrl}/${id}`);
    }

    toggleLike(id: EntityId): Observable<TweetLike> {
        return this.http.post<TweetLike>(`${this.baseUrl}/${id}/like`, {});
    }

    replyToTweet(id: EntityId, dto: CreateTweetReplyDto): Observable<TweetReply> {
        return this.http.post<TweetReply>(`${this.baseUrl}/${id}/reply`, dto);
    }

    getReplies(id: EntityId): Observable<TweetReply[]> {
        return this.http.get<TweetReply[]>(`${this.baseUrl}/${id}/replies`);
    }

    deleteReply(tweetId: EntityId, replyId: EntityId): Observable<SuccessResponse> {
        return this.http.delete<SuccessResponse>(`${this.baseUrl}/${tweetId}/reply/${replyId}`);
    }
}
