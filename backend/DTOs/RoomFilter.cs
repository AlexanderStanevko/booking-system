using System.ComponentModel.DataAnnotations;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.DTOs;

public sealed class RoomFilter
{
    [Range(1, int.MaxValue)]
    public int? MinCapacity { get; init; }

    public Equipment? Equipment { get; init; }
    public int? Floor { get; init; }
}
