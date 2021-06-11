import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService, AuthResponseData } from "./auth.service";

@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html",
})
export class AuthComponent implements OnInit {
    isLoginMode = true;
    isLoading = false;
    error: string = null;

    onSwitchMode = () => {
        this.isLoginMode = !this.isLoginMode;
    };

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {}

    onSubmit = (form: NgForm) => {
        let authObs: Observable<AuthResponseData>;
        this.isLoading = true;

        if (this.isLoginMode) {
            authObs = this.authService.login(
                form.value.email,
                form.value.password
            );
        } else {
            authObs = this.authService.signup(
                form.value.email,
                form.value.password
            );
        }

        authObs.subscribe(
            (resData) => {
                console.log(resData);
                this.isLoading = false;
                this.router.navigate(["/recipes"]);
            },
            (errorMessage) => {
                console.log(errorMessage);
                this.error = errorMessage;
                this.isLoading = false;
            }
        );

        form.reset();
    };
}
