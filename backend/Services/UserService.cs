using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Mappings;
using MeetingRooms.Api.Models;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services;

public sealed class UserService(
    ApplicationDbContext database, ReservationCompletion completion, ReservationLock reservationLock, TimeProvider clock)
{
    public async Task<IReadOnlyList<UserResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);
        var users = await database.Users.AsNoTracking().OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName).ToListAsync(cancellationToken);
        var counts = await database.Reservations.AsNoTracking()
            .Where(reservation => reservation.Status == ReservationStatus.Booked && reservation.EndTime > now)
            .GroupBy(reservation => reservation.OrganizerId)
            .Select(group => new { Id = group.Key, Count = group.Count() }).ToDictionaryAsync(
                entry => entry.Id, entry => entry.Count, cancellationToken);
        return users.Select(user => user.ToResponse(counts.GetValueOrDefault(user.Id))).ToList();
    }

    public async Task<UserResponse> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);
        var user = await database.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Id == id, cancellationToken)
            ?? throw new AppException(ErrorCodes.UserNotFound, "The requested user does not exist.", StatusCodes.Status404NotFound);
        var count = await database.Reservations.CountAsync(reservation => reservation.OrganizerId == id
            && reservation.Status == ReservationStatus.Booked && reservation.EndTime > now, cancellationToken);
        return user.ToResponse(count);
    }
}
