using MeetingRooms.Api.Common.Time;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.DTOs;

public sealed class DateRangeFilter
{
    [ModelBinder(BinderType = typeof(UtcTimestampModelBinder))]
    public DateTimeOffset? From { get; init; }

    [ModelBinder(BinderType = typeof(UtcTimestampModelBinder))]
    public DateTimeOffset? To { get; init; }
}
