import { Component, inject } from "@angular/core";
import { AuthComponent } from "../auth/auth.component";
import { TweetFeedComponent } from "../tweet-feed/tweet-feed.component";
import { AuthState } from "../../core/state";

@Component({
    selector: "app-layout",
    imports: [AuthComponent, TweetFeedComponent],
    templateUrl: "./layout.component.html",
    styleUrl: "./layout.component.scss",
})
export class LayoutComponent {
    authState = inject(AuthState);
}
