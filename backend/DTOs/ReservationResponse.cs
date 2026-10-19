using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.DTOs;

public sealed record ReservationResponse(
    Guid Id, Guid RoomId, string RoomName, Guid OrganizerId, string OrganizerName, string Title,
    DateTimeOffset StartTime, DateTimeOffset EndTime, int AttendeeCount,
    ReservationStatus Status, DateTimeOffset? ActualEndTime);
