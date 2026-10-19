using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.DTOs;

public sealed class ReservationFilter
{
    public Guid? RoomId { get; init; }
    public Guid? OrganizerId { get; init; }
    public ReservationStatus? Status { get; init; }

    [ModelBinder(BinderType = typeof(UtcTimestampModelBinder))]
    public DateTimeOffset? From { get; init; }

    [ModelBinder(BinderType = typeof(UtcTimestampModelBinder))]
    public DateTimeOffset? To { get; init; }
}
