using System.Text.Json;
using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Tests;

public sealed class RoomUsageTests
{
    [Fact]
    public async Task Report_distinguishes_booked_recorded_and_estimated_hours()
    {
        await using var context = new BookingTestContext();
        await AddReportDataAsync(context);
        var report = (await context.Reports.GetAsync(new())).Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(4, report.TotalReservations);
        Assert.Equal(1, report.CancelledReservations);
        Assert.Equal(2, report.CompletedReservations);
        Assert.Equal(6, report.TotalBookedHours);
        Assert.Equal(1, report.RecordedUsageHours);
        Assert.Equal(2, report.EstimatedUsedHours);
        Assert.Equal(100d / 6, report.RecordedUsageRate, 8);
        var json = JsonSerializer.SerializeToElement(report, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.Equal(report.RecordedUsageHours, json.GetProperty("recordedUsageHours").GetDouble());
        Assert.Equal(report.RecordedUsageRate, json.GetProperty("recordedUsageRate").GetDouble());
    }

    [Fact]
    public async Task Report_clips_durations_and_excludes_unused_scheduled_time_from_usage()
    {
        await using var context = new BookingTestContext();
        await AddReportDataAsync(context);
        var now = context.Clock.GetUtcNow();
        var report = (await context.Reports.GetAsync(new() { From = now.AddHours(-5), To = now.AddHours(2) }))
            .Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(4, report.TotalReservations);
        Assert.Equal(4, report.TotalBookedHours);
        Assert.Equal(1, report.RecordedUsageHours);
        Assert.Equal(1, report.EstimatedUsedHours);
        Assert.Equal(25, report.RecordedUsageRate);
        report = (await context.Reports.GetAsync(new() { From = now.AddHours(-2.5), To = now.AddHours(-2) }))
            .Single(room => room.RoomId == context.FirstRoom.Id);
        Assert.Equal(1, report.TotalReservations);
        Assert.Equal(0.5, report.TotalBookedHours);
        Assert.Equal(0, report.RecordedUsageHours);
        Assert.Equal(0, report.EstimatedUsedHours);
        Assert.Equal(0, report.RecordedUsageRate);
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
            Assert.Equal(0, report.RecordedUsageRate);
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
