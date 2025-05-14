using backend.DTOs;
using backend.Entities;

namespace backend.Extensions // usa il namespace giusto
{
    public static class CocktailExtensions
    {
        public static Cocktails ToEntity(this CocktailDto dto, User createdBy)
        {
            var cocktail = new Cocktails
            {
                IdDrink = Guid.NewGuid().ToString(),
                StrDrink = dto.StrDrink,
                StrCategory = dto.StrCategory,
                StrAlcoholic = dto.StrAlcoholic,
                StrGlass = dto.StrGlass,
                StrInstructions = dto.StrInstructions,
                StrDrinkThumb = dto.StrDrinkThumb,
                CreatedBy = createdBy
            };

            for (int i = 1; i <= 15; i++)
            {
                typeof(Cocktails).GetProperty($"StrIngredient{i}")?.SetValue(cocktail,
                    typeof(CocktailDto).GetProperty($"StrIngredient{i}")?.GetValue(dto));
                typeof(Cocktails).GetProperty($"StrMeasure{i}")?.SetValue(cocktail,
                    typeof(CocktailDto).GetProperty($"StrMeasure{i}")?.GetValue(dto));
            }

            return cocktail;
        }

        public static CocktailDto ToDto(this Cocktails c)
        {
            var dto = new CocktailDto
            {
                IdDrink = c.IdDrink,
                StrDrink = c.StrDrink,
                StrCategory = c.StrCategory,
                StrAlcoholic = c.StrAlcoholic,
                StrGlass = c.StrGlass,
                StrInstructions = c.StrInstructions,
                StrDrinkThumb = c.StrDrinkThumb,
                UserId = c.CreatedBy?.Id ?? 0,
                Popularity = c.FavoritedBy?.Count ?? 0,
                ReviewsCount = c.Reviews?.Count ?? 0
            };

            for (int i = 1; i <= 15; i++)
            {
                typeof(CocktailDto).GetProperty($"StrIngredient{i}")?.SetValue(dto,
                    typeof(Cocktails).GetProperty($"StrIngredient{i}")?.GetValue(c));
                typeof(CocktailDto).GetProperty($"StrMeasure{i}")?.SetValue(dto,
                    typeof(Cocktails).GetProperty($"StrMeasure{i}")?.GetValue(c));
            }

            return dto;
        }
    }
}
