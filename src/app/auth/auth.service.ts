import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({ providedIn: "root" })
export class AuthService {
    firebaseAuthBaseUrl = "https://identitytoolkit.googleapis.com/v1/accounts";
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router) {}

    signup = (email: string, password: string) => {
        return this.http
            .post<AuthResponseData>(
                this.firebaseAuthBaseUrl +
                    ":signUp?key=AIzaSyAp-_IiMOyXvn0yPn6INNJgn29U15k-Z0U",
                {
                    email,
                    password,
                    returnSecureToken: true,
                }
            )
            .pipe(
                catchError(this.handleError),
                tap((resData) => {
                    this.handleAuthentification(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                })
            );
    };

    autoLogin = () => {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem("userData"));

        if (!userData) return;

        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration =
                new Date(userData._tokenExpirationDate).getTime() -
                new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    };

    login = (email: string, password: string) => {
        return this.http
            .post<AuthResponseData>(
                this.firebaseAuthBaseUrl +
                    ":signInWithPassword?key=AIzaSyAp-_IiMOyXvn0yPn6INNJgn29U15k-Z0U",
                {
                    email,
                    password,
                    returnSecureToken: true,
                }
            )
            .pipe(
                catchError(this.handleError),
                tap((resData) => {
                    this.handleAuthentification(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                })
            );
    };

    autoLogout = (expirationDuration: number) => {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    };

    logout = () => {
        this.user.next(null);
        this.router.navigate(["/auth"]);
        localStorage.removeItem("userData");

        if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer);

        this.tokenExpirationTimer = null;
    };

    private handleAuthentification = (
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ) => {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem("userData", JSON.stringify(user));
    };

    private handleError = (errorRes: HttpErrorResponse) => {
        let errorMessage = "An error has occurred";

        if (!errorRes.error || !errorRes.error.error) throwError(errorMessage);

        switch (errorRes.error.error.message) {
            case "EMAIL_EXISTS":
                errorMessage = "This email already exists";
                break;
            case "EMAIL_NOT_FOUND":
                errorMessage = "This email does not exist";
                break;
            case "INVALID_PASSWORD":
                errorMessage = "This password is invalid";
                break;
            default:
                errorMessage = "An unknown error occurred";
        }
        return throwError(errorMessage);
    };
}