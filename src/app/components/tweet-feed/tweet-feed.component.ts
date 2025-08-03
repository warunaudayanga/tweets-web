/* eslint-disable */
import { CommonModule, DatePipe } from "@angular/common";
import { Component, Signal, WritableSignal, computed, inject, signal, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TweetService } from "../../core/services";
import { Tweet, TweetLike } from "../../core/interfaces";
import { CreateTweetReplyDto, CreateTweetDto } from "../../core/interfaces/dtos";
import { EntityId } from "../../core/types";
import { AuthState } from "../../core/state";

type Tab = "all" | "my" | "create";

@Component({
    selector: "app-tweet-feed",
    standalone: true,
    templateUrl: "./tweet-feed.component.html",
    styleUrls: ["./tweet-feed.component.scss"],
    imports: [CommonModule, FormsModule, DatePipe],
})
export class TweetFeedComponent implements OnInit {
    authState = inject(AuthState);

    tweetService = inject(TweetService);

    readonly tweets: WritableSignal<Tweet[]> = signal<Tweet[]>([]);

    readonly visibleReplies: WritableSignal<Set<EntityId>> = signal(new Set());

    readonly replyInputs: WritableSignal<Record<EntityId, string>> = signal({});

    readonly tab: WritableSignal<Tab> = signal("all");

    newTweetContent = "";

    ngOnInit(): void {
        this.selectTab("all");
    }

    selectTab(tab: Tab): void {
        this.tab.set(tab);

        if (tab !== "create") {
            const source$ = tab === "all" ? this.tweetService.getAll() : this.tweetService.getMyTweets();

            source$.subscribe({
                next: tweets => this.tweets.set(tweets),
                error: err => console.error(err),
            });
        }
    }

    toggleReplies(id: EntityId): void {
        const current = new Set(this.visibleReplies());
        current.has(id) ? current.delete(id) : current.add(id);
        this.visibleReplies.set(current);
    }

    isRepliesVisible = (id: EntityId): Signal<boolean> => computed(() => this.visibleReplies().has(id));

    updateReplyInput(id: EntityId, value: string): void {
        this.replyInputs.set({ ...this.replyInputs(), [id]: value });
    }

    sendReply(id: EntityId): void {
        const content = this.replyInputs()[id]?.trim();
        if (!content) return;

        const dto: CreateTweetReplyDto = { content, tweetId: id };
        this.tweetService.replyToTweet(id, dto).subscribe({
            next: reply => {
                const updatedTweets = this.tweets().map(tweet =>
                    tweet.id === id ? { ...tweet, replies: [...(tweet.replies || []), reply] } : tweet,
                );
                this.tweets.set(updatedTweets);
                const inputs = { ...this.replyInputs() };
                delete inputs[id];
                this.replyInputs.set(inputs);
            },
            error: err => console.error(err),
        });
    }

    likeTweet(id: EntityId): void {
        this.tweetService.toggleLike(id).subscribe({
            next: (like: TweetLike) => {
                const updatedTweets = this.tweets().map(tweet => {
                    if (tweet.id !== id) return tweet;
                    const alreadyLiked = tweet.likes?.some(l => l.userId === this.authState.userId());
                    const updatedLikes = alreadyLiked
                        ? tweet.likes?.filter(l => l.userId !== this.authState.userId()) || []
                        : [...(tweet.likes || []), like];
                    return { ...tweet, likes: updatedLikes };
                });
                this.tweets.set(updatedTweets);
            },
            error: err => console.error(err),
        });
    }

    deleteTweet(id: EntityId): void {
        if (!window.confirm("Are you sure you want to delete this tweet?")) return;

        this.tweetService.delete(id).subscribe({
            next: () => {
                this.tweets.set(this.tweets().filter(tweet => tweet.id !== id));
            },
            error: err => console.error(err),
        });
    }

    deleteReply(tweetId: EntityId, replyId: EntityId): void {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;

        this.tweetService.deleteReply(tweetId, replyId).subscribe({
            next: () => {
                const updatedTweets = this.tweets().map(tweet => {
                    if (tweet.id !== tweetId) return tweet;
                    const updatedReplies = (tweet.replies || []).filter(r => r.id !== replyId);
                    return { ...tweet, replies: updatedReplies };
                });
                this.tweets.set(updatedTweets);
            },
            error: err => console.error(err),
        });
    }

    createTweet(): void {
        const content = this.newTweetContent.trim();
        if (!content) return;

        const dto: CreateTweetDto = { content };

        this.tweetService.create(dto).subscribe({
            next: tweet => {
                this.tweets.set([tweet, ...this.tweets()]);
                this.newTweetContent = "";
                this.selectTab("all"); // Optionally auto-switch to All Tweets
            },
            error: err => console.error(err),
        });
    }
}
