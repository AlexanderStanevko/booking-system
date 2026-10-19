using MeetingRooms.Api.Data;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationCompletion(ApplicationDbContext database)
{
    public async Task FinalizeExpiredAsync(DateTimeOffset now, CancellationToken cancellationToken = default)
    {
        var expired = await database.Reservations
            .Where(reservation => reservation.Status == ReservationStatus.Booked && reservation.EndTime <= now)
            .ToListAsync(cancellationToken);

        if (expired.Count == 0)
        {
            return;
        }

        foreach (var reservation in expired)
        {
            reservation.Status = ReservationStatus.Completed;
        }

        await database.SaveChangesAsync(cancellationToken);
    }
}
