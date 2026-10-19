using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Mappings;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationQueryService(
    ApplicationDbContext database, ReservationCompletion completion, ReservationLock reservationLock, TimeProvider clock)
{
    public async Task<IReadOnlyList<ReservationResponse>> ListAsync(
        ReservationFilter filter, CancellationToken cancellationToken = default)
    {
        TimeInterval.ValidateRange(filter.From, filter.To);
        if (filter.Status.HasValue && !Enum.IsDefined(filter.Status.Value))
        {
            throw new AppException(ErrorCodes.InvalidRequest, "The reservation status is invalid.");
        }

        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        await completion.FinalizeExpiredAsync(clock.GetUtcNow(), cancellationToken);
        var query = database.Reservations.AsNoTracking()
            .Include(reservation => reservation.Room).Include(reservation => reservation.Organizer).AsQueryable();

        if (filter.RoomId.HasValue)
        {
            query = query.Where(reservation => reservation.RoomId == filter.RoomId);
        }

        if (filter.OrganizerId.HasValue)
        {
            query = query.Where(reservation => reservation.OrganizerId == filter.OrganizerId);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(reservation => reservation.Status == filter.Status);
        }

        var reservations = await query.OrderBy(reservation => reservation.StartTime)
            .ThenBy(reservation => reservation.Id).ToListAsync(cancellationToken);
        return reservations.Where(reservation => (!filter.From.HasValue && !filter.To.HasValue)
                || TimeInterval.Intersects(reservation.StartTime,
                    reservation.ActualEndTime ?? reservation.EndTime, filter.From, filter.To))
            .Select(reservation => reservation.ToResponse()).ToList();
    }

    public async Task<ReservationResponse> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        await completion.FinalizeExpiredAsync(clock.GetUtcNow(), cancellationToken);
        var reservation = await database.Reservations.AsNoTracking().Include(reservation => reservation.Room)
            .Include(reservation => reservation.Organizer)
            .SingleOrDefaultAsync(reservation => reservation.Id == id, cancellationToken)
            ?? throw new AppException(ErrorCodes.ReservationNotFound,
                "The requested reservation does not exist.", StatusCodes.Status404NotFound);
        return reservation.ToResponse();
    }
}
