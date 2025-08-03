import { Component, inject, signal, WritableSignal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthState } from "../../core/state";

@Component({
    selector: "app-sign-in",
    templateUrl: "./sign-in.component.html",
    imports: [ReactiveFormsModule],
})
export class SignInComponent {
    authState = inject(AuthState);

    form: FormGroup;

    loading: WritableSignal<boolean> = signal(false);

    error: WritableSignal<string | null> = signal<string | null>(null);

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email: ["", [Validators.required, Validators.email]],
            password: ["", Validators.required],
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.authState.signIn(this.form.value).subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err.error?.message || null);
                this.loading.set(false);
            },
        });
    }

    signOut(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authState.signOut().subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err.error?.message || null);
                this.loading.set(false);
            },
        });
    }
}
