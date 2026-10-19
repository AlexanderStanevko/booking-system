using System.ComponentModel.DataAnnotations;

namespace MeetingRooms.Api.Configuration;

public sealed class BookingOptions
{
    [Range(1, int.MaxValue)]
    public int MaxDurationDays { get; set; } = 7;

    [Range(1, int.MaxValue)]
    public int MaxAdvanceBookingDays { get; set; } = 90;

    [Range(1, int.MaxValue)]
    public int CompletionIntervalSeconds { get; set; } = 30;
}
