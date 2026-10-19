using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services;

public sealed class RoomUsageService(
    ApplicationDbContext database, ReservationCompletion completion, ReservationLock reservationLock, TimeProvider clock)
{
    public async Task<IReadOnlyList<RoomUsageResponse>> GetAsync(
        DateRangeFilter filter, CancellationToken cancellationToken = default)
    {
        TimeInterval.ValidateRange(filter.From, filter.To);
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        await completion.FinalizeExpiredAsync(clock.GetUtcNow(), cancellationToken);
        var rooms = await database.Rooms.AsNoTracking().OrderBy(room => room.Name).ToListAsync(cancellationToken);
        var reservations = await database.Reservations.AsNoTracking().ToListAsync(cancellationToken);
        var byRoom = reservations.Where(reservation => TimeInterval.Intersects(
            reservation.StartTime, reservation.EndTime, filter.From, filter.To)).ToLookup(reservation => reservation.RoomId);
        return rooms.Select(room => Calculate(room, byRoom[room.Id].ToList(), filter)).ToList();
    }

    private static RoomUsageResponse Calculate(Room room, List<Reservation> reservations, DateRangeFilter filter)
    {
        var bookedHours = reservations.Where(reservation => reservation.Status != ReservationStatus.Cancelled)
            .Sum(reservation => TimeInterval.HoursWithin(reservation.StartTime, reservation.EndTime, filter.From, filter.To));
        var completed = reservations.Where(reservation => reservation.Status == ReservationStatus.Completed).ToList();
        var confirmedHours = completed.Where(reservation => reservation.ActualEndTime.HasValue)
            .Sum(reservation => TimeInterval.HoursWithin(reservation.StartTime,
                reservation.ActualEndTime!.Value, filter.From, filter.To));
        var estimatedHours = completed.Where(reservation => !reservation.ActualEndTime.HasValue)
            .Sum(reservation => TimeInterval.HoursWithin(reservation.StartTime, reservation.EndTime, filter.From, filter.To));

        return new RoomUsageResponse(room.Id, room.Name, reservations.Count,
            reservations.Count(reservation => reservation.Status == ReservationStatus.Cancelled), completed.Count,
            bookedHours, confirmedHours, estimatedHours, bookedHours > 0 ? confirmedHours / bookedHours * 100 : 0);
    }
}
