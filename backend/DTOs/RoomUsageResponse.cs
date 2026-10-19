namespace MeetingRooms.Api.DTOs;

public sealed record RoomUsageResponse(
    Guid RoomId, string RoomName, int TotalReservations, int CancelledReservations, int CompletedReservations,
    double TotalBookedHours, double RecordedUsageHours, double EstimatedUsedHours, double RecordedUsageRate);
