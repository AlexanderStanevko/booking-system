using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Mappings;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationService(
    ApplicationDbContext database, ReservationValidator validator, ReservationCompletion completion,
    ReservationLock reservationLock, TimeProvider clock)
{
    public async Task<ReservationResponse> CreateAsync(
        CreateReservationRequest request, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);

        var reservation = request.ToEntity();
        (reservation.Room, reservation.Organizer) = await validator.ValidateAsync(reservation, now, cancellationToken);
        database.Reservations.Add(reservation);
        await database.SaveChangesAsync(cancellationToken);
        return reservation.ToResponse();
    }

    public async Task<ReservationResponse> UpdateAsync(
        Guid id, UpdateReservationRequest request, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);
        var reservation = await FindAsync(id, cancellationToken);
        RequireUpcoming(reservation, now);

        var updated = request.ToEntity(id);
        var (room, organizer) = await validator.ValidateAsync(updated, now, cancellationToken);
        database.Entry(reservation).CurrentValues.SetValues(updated);
        reservation.Room = room;
        reservation.Organizer = organizer;
        await database.SaveChangesAsync(cancellationToken);
        return reservation.ToResponse();
    }

    public async Task<ReservationResponse> CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);
        var reservation = await FindAsync(id, cancellationToken);
        RequireUpcoming(reservation, now);

        reservation.Status = ReservationStatus.Cancelled;
        await database.SaveChangesAsync(cancellationToken);
        return reservation.ToResponse();
    }

    public async Task<ReservationResponse> CompleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var lease = await reservationLock.AcquireAsync(cancellationToken);
        var now = clock.GetUtcNow();
        await completion.FinalizeExpiredAsync(now, cancellationToken);
        var reservation = await FindAsync(id, cancellationToken);

        if (reservation.Status != ReservationStatus.Booked || reservation.StartTime > now || reservation.EndTime <= now)
        {
            throw new AppException(ErrorCodes.InvalidReservationStatus,
                "Only an ongoing booked meeting can be ended early.", StatusCodes.Status409Conflict);
        }

        reservation.Status = ReservationStatus.Completed;
        reservation.ActualEndTime = now;
        await database.SaveChangesAsync(cancellationToken);
        return reservation.ToResponse();
    }

    private async Task<Reservation> FindAsync(Guid id, CancellationToken cancellationToken)
        => await database.Reservations.Include(reservation => reservation.Room)
            .Include(reservation => reservation.Organizer)
            .SingleOrDefaultAsync(reservation => reservation.Id == id, cancellationToken)
            ?? throw new AppException(ErrorCodes.ReservationNotFound,
                "The requested reservation does not exist.", StatusCodes.Status404NotFound);

    private static void RequireUpcoming(Reservation reservation, DateTimeOffset now)
    {
        if (reservation.Status != ReservationStatus.Booked || reservation.StartTime <= now)
        {
            throw new AppException(ErrorCodes.InvalidReservationStatus,
                "Only an upcoming booked reservation can be edited or cancelled.", StatusCodes.Status409Conflict);
        }
    }
}
