/* eslint-disable */
import { Component, inject, signal, WritableSignal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthState } from "../../core/state";
import { AuthService } from "../../core/services";

@Component({
    selector: "app-login",
    templateUrl: "./auth.component.html",
    imports: [ReactiveFormsModule],
})
export class AuthComponent {
    authState = inject(AuthState);

    loginForm: FormGroup;

    registerForm: FormGroup;

    loading: WritableSignal<boolean> = signal(false);

    error: WritableSignal<string | null> = signal(null);

    isLoginForm: WritableSignal<boolean> = signal(true);

    constructor(
        private fb: FormBuilder,
        private readonly authService: AuthService,
    ) {
        this.loginForm = this.fb.group({
            email: ["", [Validators.required, Validators.email]],
            password: ["", Validators.required],
        });

        this.registerForm = this.fb.group({
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
            email: ["", [Validators.required, Validators.email]],
            password: ["", Validators.required],
        });
    }

    private markFormDirtyAndTouched(form: FormGroup): void {
        Object.values(form.controls).forEach(control => {
            control.markAsDirty();
            control.markAsTouched();
        });
    }

    login(): void {
        this.markFormDirtyAndTouched(this.loginForm);
        if (this.loginForm.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.authState.login(this.loginForm.value).subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err.error?.message || null);
                this.loading.set(false);
            },
        });
    }

    register(): void {
        this.markFormDirtyAndTouched(this.registerForm);
        if (this.registerForm.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.loading.set(false);
                this.isLoginForm.set(true); // auto switch to login if needed
                window.alert(
                    'Registration successful and verification email sent. Please verify your email to continue.',
                );
            },
            error: err => {
                this.error.set(err.error?.message || null);
                this.loading.set(false);
            },
        });
    }

    logout(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authState.logout().subscribe({
            next: () => this.loading.set(false),
            error: err => {
                this.error.set(err.error?.message || null);
                this.loading.set(false);
            },
        });
    }
}
