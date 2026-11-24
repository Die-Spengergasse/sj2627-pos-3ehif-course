package at.spengergasse.pos3.testingdesign.recipebook;

import java.util.List;

public record Recipe(String name, int servings, List<Ingredient> ingredients) {

    public Recipe {
        // TODO validate with Require and store an unmodifiable copy of the list
    }

    public Recipe(String name, int servings) {
        this(name, servings, List.of());
    }

    public Recipe withIngredient(Ingredient ingredient) {
        throw new UnsupportedOperationException("TODO");
    }

    public int totalGrams() {
        throw new UnsupportedOperationException("TODO");
    }

    public Recipe scaledBy(int factor) {
        throw new UnsupportedOperationException("TODO");
    }

    public boolean contains(String ingredientName) {
        throw new UnsupportedOperationException("TODO");
    }
}
