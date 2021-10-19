import {
    Component,
    ComponentFactoryResolver,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthService, AuthResponseData } from "./auth.service";

@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html",
})
export class AuthComponent implements OnInit, OnDestroy {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective, { static: false })
    alertHost: PlaceholderDirective;

    private closeSub: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    ngOnInit(): void {}

    onSwitchMode = () => {
        this.isLoginMode = !this.isLoginMode;
    };

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
                this.showErrorAlert(errorMessage);
                this.isLoading = false;
            }
        );

        form.reset();
    };

    onHandleError = () => {
        this.error = null;
    };

    private showErrorAlert = (message: string) => {
        const AlertCmpFactory =
            this.componentFactoryResolver.resolveComponentFactory(
                AlertComponent
            );

        const hostViewContainerRef = this.alertHost.viewContainerRef;
        hostViewContainerRef.clear();

        const componentRef =
            hostViewContainerRef.createComponent(AlertCmpFactory);

        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        });
    };

    ngOnDestroy() {
        if (this.closeSub) this.closeSub.unsubscribe();
    }
}
