using System.Text.Json;
using MeetingRooms.Api.Common.Time;

namespace MeetingRooms.Api.Tests;

public sealed class TimestampTests
{
    [Theory]
    [InlineData("2030-01-10T12:00:00Z")]
    [InlineData("2030-01-10T15:00:00+03:00")]
    [InlineData("2030-01-10T07:00:00-05:00")]
    public void Timestamp_parsing_preserves_the_instant_and_normalizes_to_utc(string text)
    {
        Assert.True(UtcTimestamp.TryParse(text, out var timestamp));
        Assert.Equal(new DateTimeOffset(2030, 1, 10, 12, 0, 0, TimeSpan.Zero), timestamp);
        Assert.Equal(TimeSpan.Zero, timestamp.Offset);
    }

    [Theory]
    [InlineData("2030-01-10T12:00:00")]
    [InlineData("2030-01-10")]
    [InlineData("invalid")]
    [InlineData("2030-01-10T12:00:00+25:00")]
    public void Ambiguous_or_invalid_timestamps_are_rejected(string text)
    {
        Assert.False(UtcTimestamp.TryParse(text, out _));
        var options = new JsonSerializerOptions();
        options.Converters.Add(new UtcTimestampJsonConverter());
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<DateTimeOffset>(JsonSerializer.Serialize(text), options));
    }

    [Fact]
    public void Zero_length_effective_intervals_never_block_other_bookings()
    {
        var start = new DateTimeOffset(2030, 1, 10, 12, 0, 0, TimeSpan.Zero);
        Assert.False(TimeInterval.Overlaps(start, start, start.AddHours(-1), start.AddHours(1)));
    }
}
