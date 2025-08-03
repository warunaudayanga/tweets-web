import { CommonModule, DatePipe } from "@angular/common";
import { EntityId } from "../../core/types";
import { Component, computed, inject, OnInit, Signal, signal } from "@angular/core";
import { AuthState } from "../../core/state";
import { Tweet, TweetLike } from "../../core/interfaces";
import { TweetService } from "../../core/services";
import { CreateTweetReplyDto } from "../../core/interfaces/dtos";

@Component({
    selector: "app-tweet-feed",
    standalone: true,
    templateUrl: "./tweet-feed.component.html",
    styleUrls: ["./tweet-feed.component.scss"],
    imports: [CommonModule, DatePipe],
})
export class TweetFeedComponent implements OnInit {
    authState = inject(AuthState);

    readonly tweets = signal<Tweet[]>([]);

    readonly visibleReplies = signal<Set<EntityId>>(new Set());

    readonly replyInputs = signal<Record<EntityId, string>>({});

    readonly showAllTweets = signal(true);

    readonly filteredTweets = computed(() => {
        const all = this.tweets();
        return this.showAllTweets() ? all : all.filter(t => t.author?.id === this.authState.userId());
    });

    constructor(private readonly tweetService: TweetService) {}

    ngOnInit(): void {
        this.setShowAllTweets(true);
    }

    setShowAllTweets(value: boolean): void {
        this.showAllTweets.set(value);
        const source$ = value ? this.tweetService.getAll() : this.tweetService.getMyTweets();

        source$.subscribe({
            next: tweets => this.tweets.set(tweets),
            // eslint-disable-next-line no-console
            error: err => console.error(err),
        });
    }

    toggleReplies(id: EntityId): void {
        const current = new Set(this.visibleReplies());
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
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
            // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
            error: err => console.error(err),
        });
    }

    deleteTweet(id: EntityId): void {
        // eslint-disable-next-line no-alert
        if (!window.confirm("Are you sure you want to delete this tweet?")) return;

        this.tweetService.delete(id).subscribe({
            next: () => {
                this.tweets.set(this.tweets().filter(tweet => tweet.id !== id));
            },
            // eslint-disable-next-line no-console
            error: err => console.error(err),
        });
    }

    deleteReply(tweetId: EntityId, replyId: EntityId): void {
        // eslint-disable-next-line no-alert
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
            // eslint-disable-next-line no-console
            error: err => console.error(err),
        });
    }
}
