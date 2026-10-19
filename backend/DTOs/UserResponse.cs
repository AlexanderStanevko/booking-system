namespace MeetingRooms.Api.DTOs;

public sealed record UserResponse(Guid Id, string FirstName, string LastName, int ActiveReservationCount);
