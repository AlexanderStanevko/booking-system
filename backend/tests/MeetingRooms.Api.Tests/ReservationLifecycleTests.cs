using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class ReservationLifecycleTests
{
    [Fact]
    public async Task Cancellation_preserves_history_and_repeated_cancellation_conflicts()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var cancelled = await context.Reservations.CancelAsync(existing.Id);
        Assert.Equal(ReservationStatus.Cancelled, cancelled.Status);
        Assert.Null(cancelled.ActualEndTime);
        Assert.Equal(ReservationStatus.Cancelled, (await context.Queries.GetAsync(existing.Id)).Status);
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CancelAsync(existing.Id));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
        Assert.Equal(StatusCodes.Status409Conflict, error.StatusCode);
    }

    [Fact]
    public async Task Nonbooked_reservations_cannot_be_completed()
    {
        foreach (var status in new[] { ReservationStatus.Cancelled, ReservationStatus.Completed })
        {
            await using var context = new BookingTestContext();
            var existing = await context.AddReservationAsync(reservation => reservation.Status = status);
            var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CompleteAsync(existing.Id));
            Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
        }
    }

    [Fact]
    public async Task Ongoing_meeting_can_end_early_including_at_its_start()
    {
        foreach (var startMinutes in new[] { -30, 0 })
        {
            await using var context = new BookingTestContext();
            var now = context.Clock.GetUtcNow();
            var existing = await context.AddReservationAsync(reservation =>
            {
                reservation.StartTime = now.AddMinutes(startMinutes);
                reservation.EndTime = now.AddHours(1);
            });
            var scheduledEnd = existing.EndTime;
            var result = await context.Reservations.CompleteAsync(existing.Id);
            Assert.Equal(ReservationStatus.Completed, result.Status);
            Assert.Equal(now, result.ActualEndTime);
            Assert.Equal(TimeSpan.Zero, result.ActualEndTime!.Value.Offset);
            Assert.Equal(scheduledEnd, result.EndTime);
            Assert.Contains(await context.Queries.ListAsync(new()), entry => entry.Id == existing.Id);
        }
    }

    [Fact]
    public async Task A_future_meeting_cannot_end_early()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CompleteAsync(existing.Id));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
        Assert.Null(existing.ActualEndTime);
    }

    [Fact]
    public async Task Ongoing_meetings_cannot_be_cancelled()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = context.Clock.GetUtcNow();
            reservation.EndTime = context.Clock.GetUtcNow().AddHours(1);
        });
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CancelAsync(existing.Id));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
    }

    [Fact]
    public async Task Reads_finalize_bookings_exactly_at_scheduled_end_without_confirming_usage()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        context.Clock.SetUtcNow(existing.EndTime.AddTicks(-1));
        Assert.Equal(ReservationStatus.Booked, (await context.Queries.GetAsync(existing.Id)).Status);
        context.Clock.Advance(TimeSpan.FromTicks(1));
        var result = await context.Queries.GetAsync(existing.Id);
        Assert.Equal(ReservationStatus.Completed, result.Status);
        Assert.Null(result.ActualEndTime);
        Assert.Equal(ReservationStatus.Completed, existing.Status);
    }

    [Fact]
    public async Task Completion_at_scheduled_end_is_automatic_and_cannot_record_an_actual_end()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        context.Clock.SetUtcNow(existing.EndTime);
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CompleteAsync(existing.Id));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
        Assert.Equal(ReservationStatus.Completed, existing.Status);
        Assert.Null(existing.ActualEndTime);
    }

    [Fact]
    public async Task Missing_reservation_returns_not_found()
    {
        await using var context = new BookingTestContext();
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CancelAsync(Guid.NewGuid()));
        Assert.Equal(ErrorCodes.ReservationNotFound, error.Code);
        Assert.Equal(StatusCodes.Status404NotFound, error.StatusCode);
    }
}
