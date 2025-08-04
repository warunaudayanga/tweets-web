import { Component, inject } from "@angular/core";
import { TweetFeedComponent } from "./components/tweet-feed/tweet-feed.component";
import { AuthComponent } from "./components/auth/auth.component";
import { AuthState } from "./core/state";

@Component({
    selector: "app-root",
    imports: [TweetFeedComponent, AuthComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {
    authState = inject(AuthState);
}
