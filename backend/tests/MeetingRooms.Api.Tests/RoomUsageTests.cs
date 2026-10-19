using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Tests;

public sealed class RoomUsageTests
{
    [Fact]
    public async Task Report_distinguishes_booked_confirmed_and_estimated_hours()
    {
        await using var context = new BookingTestContext();
        await AddReportDataAsync(context);
        var report = (await context.Reports.GetAsync(new())).Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(4, report.TotalReservations);
        Assert.Equal(1, report.CancelledReservations);
        Assert.Equal(2, report.CompletedReservations);
        Assert.Equal(6, report.TotalBookedHours);
        Assert.Equal(1, report.ConfirmedUsedHours);
        Assert.Equal(2, report.EstimatedUsedHours);
        Assert.Equal(100d / 6, report.ConfirmedUsageRate, 8);
    }

    [Fact]
    public async Task Report_clips_all_durations_to_the_requested_period()
    {
        await using var context = new BookingTestContext();
        await AddReportDataAsync(context);
        var now = context.Clock.GetUtcNow();
        var report = (await context.Reports.GetAsync(new() { From = now.AddHours(-5), To = now.AddHours(2) }))
            .Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(4, report.TotalReservations);
        Assert.Equal(4, report.TotalBookedHours);
        Assert.Equal(1, report.ConfirmedUsedHours);
        Assert.Equal(1, report.EstimatedUsedHours);
        Assert.Equal(25, report.ConfirmedUsageRate);
    }

    [Fact]
    public async Task Unused_scheduled_remainder_has_no_confirmed_hours()
    {
        await using var context = new BookingTestContext();
        await AddReportDataAsync(context);
        var now = context.Clock.GetUtcNow();
        var report = (await context.Reports.GetAsync(new() { From = now.AddHours(-2.5), To = now.AddHours(-2) }))
            .Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(1, report.TotalReservations);
        Assert.Equal(0.5, report.TotalBookedHours);
        Assert.Equal(0, report.ConfirmedUsedHours);
        Assert.Equal(0, report.EstimatedUsedHours);
        Assert.Equal(0, report.ConfirmedUsageRate);
    }

    [Fact]
    public async Task Empty_rooms_are_included_without_division_by_zero()
    {
        await using var context = new BookingTestContext();
        var reports = await context.Reports.GetAsync(new());
        Assert.Equal(3, reports.Count);
        Assert.All(reports, report =>
        {
            Assert.Equal(0, report.TotalReservations);
            Assert.Equal(0, report.TotalBookedHours);
            Assert.Equal(0, report.ConfirmedUsageRate);
        });
    }

    [Fact]
    public async Task Invalid_report_period_is_rejected()
    {
        await using var context = new BookingTestContext();
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reports.GetAsync(new()
        {
            From = context.Clock.GetUtcNow(),
            To = context.Clock.GetUtcNow().AddHours(-1)
        }));
        Assert.Equal(ErrorCodes.InvalidTimeRange, error.Code);
    }

    private static async Task AddReportDataAsync(BookingTestContext context)
    {
        var now = context.Clock.GetUtcNow();
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-6);
            reservation.EndTime = now.AddHours(-4);
        });
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-4);
            reservation.EndTime = now.AddHours(-2);
            reservation.ActualEndTime = now.AddHours(-3);
            reservation.Status = ReservationStatus.Completed;
        });
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-2);
            reservation.EndTime = now.AddHours(-1);
            reservation.Status = ReservationStatus.Cancelled;
        });
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(1);
            reservation.EndTime = now.AddHours(3);
        });
    }
}
