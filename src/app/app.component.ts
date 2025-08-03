import { Component } from "@angular/core";
import { TweetFeedComponent } from "./components/tweet-feed/tweet-feed.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";

@Component({
    selector: "app-root",
    imports: [TweetFeedComponent, SignInComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {}
