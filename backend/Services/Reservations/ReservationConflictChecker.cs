using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationConflictChecker(ApplicationDbContext database)
{
    public async Task ValidateAsync(Reservation candidate, CancellationToken cancellationToken = default)
    {
        var reservations = await database.Reservations.AsNoTracking()
            .Where(reservation => reservation.Id != candidate.Id
                && reservation.Status != ReservationStatus.Cancelled
                && (reservation.RoomId == candidate.RoomId || reservation.OrganizerId == candidate.OrganizerId))
            .ToListAsync(cancellationToken);

        var overlaps = reservations.Where(reservation => TimeInterval.Overlaps(
            candidate.StartTime, candidate.EndTime, reservation.StartTime,
            reservation.ActualEndTime ?? reservation.EndTime)).ToList();

        if (overlaps.Any(reservation => reservation.RoomId == candidate.RoomId))
        {
            throw new AppException(ErrorCodes.RoomAlreadyBooked,
                "This room is already booked during the selected time range.", StatusCodes.Status409Conflict);
        }

        if (overlaps.Any(reservation => reservation.OrganizerId == candidate.OrganizerId))
        {
            throw new AppException(ErrorCodes.OrganizerAlreadyBooked,
                "This organizer already has a booking during the selected time range.", StatusCodes.Status409Conflict);
        }
    }
}
