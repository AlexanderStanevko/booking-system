using MeetingRooms.Api.Common.Errors;

namespace MeetingRooms.Api.Common.Time;

public static class TimeInterval
{
    public static bool Overlaps(
        DateTimeOffset startA, DateTimeOffset endA, DateTimeOffset startB, DateTimeOffset endB)
        => startA < endA && startB < endB && startA < endB && startB < endA;

    public static bool Intersects(
        DateTimeOffset start, DateTimeOffset end, DateTimeOffset? from, DateTimeOffset? to)
        => Overlaps(start, end, from ?? DateTimeOffset.MinValue, to ?? DateTimeOffset.MaxValue);

    public static double HoursWithin(
        DateTimeOffset start, DateTimeOffset end, DateTimeOffset? from, DateTimeOffset? to)
    {
        var clippedStart = from.HasValue && from > start ? from.Value : start;
        var clippedEnd = to.HasValue && to < end ? to.Value : end;
        return Math.Max(0, (clippedEnd - clippedStart).TotalHours);
    }

    public static void ValidateRange(DateTimeOffset? from, DateTimeOffset? to)
    {
        if (from.HasValue && to.HasValue && to <= from)
        {
            throw new AppException(ErrorCodes.InvalidTimeRange, "The range end must be later than its start.");
        }
    }
}
