using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MeetingRooms.Api.Common.Time;

public sealed class UtcTimestampModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext context)
    {
        var value = context.ValueProvider.GetValue(context.ModelName);
        if (value == ValueProviderResult.None)
        {
            return Task.CompletedTask;
        }

        context.ModelState.SetModelValue(context.ModelName, value);
        if (UtcTimestamp.TryParse(value.FirstValue, out var timestamp))
        {
            context.Result = ModelBindingResult.Success(timestamp);
        }
        else
        {
            context.ModelState.TryAddModelError(context.ModelName, "Timestamps must include Z or an explicit UTC offset.");
        }

        return Task.CompletedTask;
    }
}
