using System.Globalization;
using System.Text.RegularExpressions;

namespace MeetingRooms.Api.Common.Time;

public static class UtcTimestamp
{
    public static bool TryParse(string? value, out DateTimeOffset timestamp)
    {
        timestamp = default;
        if (value is null || !Regex.IsMatch(value, @"(?:[zZ]|[+-]\d{2}:\d{2})$"))
        {
            return false;
        }

        if (!DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return false;
        }

        timestamp = parsed.ToUniversalTime();
        return true;
    }
}
