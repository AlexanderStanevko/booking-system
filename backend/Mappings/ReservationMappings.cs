using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Mappings;

public static class ReservationMappings
{
    public static ReservationResponse ToResponse(this Reservation reservation)
        => new(reservation.Id, reservation.RoomId, reservation.Room.Name,
            reservation.OrganizerId, $"{reservation.Organizer.FirstName} {reservation.Organizer.LastName}",
            reservation.Title, reservation.StartTime, reservation.EndTime,
            reservation.AttendeeCount, reservation.Status, reservation.ActualEndTime);

    public static Reservation ToEntity(this CreateReservationRequest request)
        => new()
        {
            Id = Guid.NewGuid(),
            RoomId = request.RoomId,
            OrganizerId = request.OrganizerId,
            Title = request.Title?.Trim() ?? string.Empty,
            StartTime = request.StartTime.ToUniversalTime(),
            EndTime = request.EndTime.ToUniversalTime(),
            AttendeeCount = request.AttendeeCount,
            Status = ReservationStatus.Booked
        };

    public static Reservation ToEntity(this UpdateReservationRequest request, Guid id)
        => new()
        {
            Id = id,
            RoomId = request.RoomId,
            OrganizerId = request.OrganizerId,
            Title = request.Title?.Trim() ?? string.Empty,
            StartTime = request.StartTime.ToUniversalTime(),
            EndTime = request.EndTime.ToUniversalTime(),
            AttendeeCount = request.AttendeeCount,
            Status = ReservationStatus.Booked
        };
}
