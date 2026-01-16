import type { RecipeSchemaData } from '../types';

export function buildRecipeSchema(data: RecipeSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Recipe',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.image) {
		schema.image = data.image;
	}

	if (data.author) {
		schema.author = {
			'@type': 'Person',
			name: data.author,
		};
	}

	if (data.prepTime) {
		schema.prepTime = data.prepTime;
	}

	if (data.cookTime) {
		schema.cookTime = data.cookTime;
	}

	if (data.totalTime) {
		schema.totalTime = data.totalTime;
	}

	if (data.recipeYield) {
		schema.recipeYield = data.recipeYield;
	}

	if (data.recipeIngredient && data.recipeIngredient.length > 0) {
		schema.recipeIngredient = data.recipeIngredient;
	}

	if (data.recipeInstructions && data.recipeInstructions.length > 0) {
		schema.recipeInstructions = data.recipeInstructions.map((instruction, index) => ({
			'@type': 'HowToStep',
			position: index + 1,
			text: instruction,
		}));
	}

	if (data.nutrition?.calories) {
		schema.nutrition = {
			'@type': 'NutritionInformation',
			calories: data.nutrition.calories,
		};
	}

	return schema;
}
