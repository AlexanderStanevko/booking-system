using System.Text.Json;
using MeetingRooms.Api.Common.Time;

namespace MeetingRooms.Api.Tests;

public sealed class TimestampTests
{
    [Fact]
    public void Timestamp_parsing_preserves_the_instant_and_normalizes_to_utc()
    {
        foreach (var text in new[] { "2030-01-10T12:00:00Z", "2030-01-10T15:00:00+03:00", "2030-01-10T07:00:00-05:00" })
        {
            Assert.True(UtcTimestamp.TryParse(text, out var timestamp));
            Assert.Equal(new DateTimeOffset(2030, 1, 10, 12, 0, 0, TimeSpan.Zero), timestamp);
            Assert.Equal(TimeSpan.Zero, timestamp.Offset);
        }
    }

    [Fact]
    public void Ambiguous_or_invalid_timestamps_are_rejected()
    {
        var options = new JsonSerializerOptions();
        options.Converters.Add(new UtcTimestampJsonConverter());
        foreach (var text in new[] { "2030-01-10T12:00:00", "2030-01-10", "invalid", "2030-01-10T12:00:00+25:00" })
        {
            Assert.False(UtcTimestamp.TryParse(text, out _));
            Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<DateTimeOffset>(JsonSerializer.Serialize(text), options));
        }
    }

    [Fact]
    public void Zero_length_effective_intervals_never_block_other_bookings()
    {
        var start = new DateTimeOffset(2030, 1, 10, 12, 0, 0, TimeSpan.Zero);
        Assert.False(TimeInterval.Overlaps(start, start, start.AddHours(-1), start.AddHours(1)));
    }
}
