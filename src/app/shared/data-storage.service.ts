import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";
import { map, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";

@Injectable({ providedIn: "root" })
export class DataStorageService {
    dbUrl =
        "https://ng-course-recipe-book-7b5a0-default-rtdb.europe-west1.firebasedatabase.app/";

    constructor(
        private http: HttpClient,
        private recipeService: RecipeService,
        private authService: AuthService
    ) {}

    storeRecipes = () => {
        const recipes = this.recipeService.getRecipes();
        this.http
            .put(this.dbUrl + "recipes.json", recipes)
            .subscribe((response) => {
                // console.log(response);
            });
    };

    fetchData = () => {
        return this.http.get<Recipe[]>(this.dbUrl + "recipes.json").pipe(
            map((recipes) => {
                return recipes.map((recipe) => {
                    return {
                        ...recipe,
                        ingredients: recipe.ingredients
                            ? recipe.ingredients
                            : [],
                    };
                });
            }),
            tap((recipes) => {
                this.recipeService.setRecipes(recipes);
            })
        );
    };
}
