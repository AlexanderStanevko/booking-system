using System.ComponentModel.DataAnnotations;

namespace MeetingRooms.Api.DTOs;

public sealed record CreateReservationRequest
{
    public required Guid RoomId { get; init; }
    public required Guid OrganizerId { get; init; }

    [Required, StringLength(200)]
    public required string Title { get; init; }

    public required DateTimeOffset StartTime { get; init; }
    public required DateTimeOffset EndTime { get; init; }
    public required int AttendeeCount { get; init; }
}
