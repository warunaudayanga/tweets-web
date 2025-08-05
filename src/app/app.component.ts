/* eslint-disable */
import { Component } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { AuthService } from "./core/services";

@Component({
    selector: "app-root",
    imports: [RouterOutlet],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {
    constructor(
        readonly router: Router,
        readonly authService: AuthService,
    ) {
        router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                const rgxArr = /\/auth\/verify-email\/([\w.]+@[\w.]+\.\w+)\/(\w+)/.exec(e.url);
                if (rgxArr) {
                    const [, , token] = rgxArr;
                    authService.verifyEmail(token).subscribe({
                        next: (res) => {
                            window.alert(res ? "Email verified successfully!" : "Email verification failed.");
                        },
                        error: err => {
                            console.log(err);
                            window.alert(
                                "There was an error verifying your email. Please try again or contact support.",
                            );
                        },
                    });
                }
            }
        });
    }
}
