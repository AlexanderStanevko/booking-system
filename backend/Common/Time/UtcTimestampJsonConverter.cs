using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MeetingRooms.Api.Common.Time;

public sealed class UtcTimestampJsonConverter : JsonConverter<DateTimeOffset>
{
    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String || !UtcTimestamp.TryParse(reader.GetString(), out var value))
        {
            throw new JsonException("Timestamps must include Z or an explicit UTC offset.");
        }

        return value;
    }

    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture));
}
