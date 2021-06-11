import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
// import { Recipe } from "../recipe.model";
import { RecipeService } from "../recipe.service";

@Component({
    selector: "app-recipe-edit",
    templateUrl: "./recipe-edit.component.html",
    styleUrls: ["./recipe-edit.component.css"],
})
export class RecipeEditComponent implements OnInit {
    id: number;
    editMode = false;
    recipeForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private recipeService: RecipeService,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.id = +params.id;
            this.editMode = params.id != null;
            this.initForm();
        });
    }

    private initForm = () => {
        let recipeName = "";
        let recipeImagePath = "";
        let recipeDescription = "";
        const recipeIngredients = new FormArray([]);

        if (this.editMode) {
            const recipe = this.recipeService.getRecipe(this.id);
            recipeName = recipe.name;
            recipeImagePath = recipe.imagePath;
            recipeDescription = recipe.description;
            if (recipe.ingredients) {
                recipe.ingredients.forEach((ingredient) => {
                    recipeIngredients.push(
                        new FormGroup({
                            name: new FormControl(
                                ingredient.name,
                                Validators.required
                            ),
                            amount: new FormControl(ingredient.amount, [
                                Validators.required,
                                Validators.pattern(/^[1-9]+[0-9]*$/),
                            ]),
                        })
                    );
                });
            }
        }

        this.recipeForm = new FormGroup({
            name: new FormControl(recipeName, Validators.required),
            imagePath: new FormControl(recipeImagePath, Validators.required),
            description: new FormControl(
                recipeDescription,
                Validators.required
            ),
            ingredients: recipeIngredients,
        });
    };

    onSubmit = () => {
        // const newRecipe = new Recipe(
        //     this.recipeForm.value.name,
        //     this.recipeForm.value.description,
        //     this.recipeForm.value.imagePath,
        //     this.recipeForm.value.ingrredients
        // );

        if (this.editMode) {
            this.recipeService.updateRecipe(this.id, this.recipeForm.value);
        } else {
            this.recipeService.addRecipe(this.recipeForm.value);
        }

        this.router.navigate(["../"], { relativeTo: this.route });
    };

    onAddIngredient = () => {
        (this.recipeForm.get("ingredients") as FormArray).push(
            new FormGroup({
                name: new FormControl(null, Validators.required),
                amount: new FormControl(null, [
                    Validators.required,
                    Validators.pattern(/^[1-9]+[0-9]*$/),
                ]),
            })
        );
    };

    get ingredientsControls() {
        return (this.recipeForm.get("ingredients") as FormArray).controls;
    }

    onCancel = () => {
        this.router.navigate(["../"], { relativeTo: this.route });
    };

    onDeleteIngredient = (index: number) => {
        (this.recipeForm.get("ingredients") as FormArray).removeAt(index);
    };
}
