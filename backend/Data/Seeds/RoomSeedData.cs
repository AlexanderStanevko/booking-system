using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Data.Seeds;

public static class RoomSeedData
{
    public static List<Room> Create() =>
    [
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
            Name = "Amber",
            Capacity = 4,
            Floor = 1,
            Location = "Kaunas office, east wing",
            Equipment = Equipment.Projector | Equipment.VideoConferencing | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
            Name = "Birch",
            Capacity = 6,
            Floor = 1,
            Location = "Kaunas office, west wing",
            Equipment = Equipment.TvScreen | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
            Name = "Cedar",
            Capacity = 8,
            Floor = 1,
            Location = "Kaunas office, east wing",
            Equipment = Equipment.Projector | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
            Name = "Delta",
            Capacity = 12,
            Floor = 1,
            Location = "Kaunas office, west wing",
            Equipment = Equipment.TvScreen | Equipment.VideoConferencing | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
            Name = "Elm",
            Capacity = 16,
            Floor = 2,
            Location = "Kaunas office, east wing",
            Equipment = Equipment.Projector | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000006"),
            Name = "Forest",
            Capacity = 20,
            Floor = 2,
            Location = "Kaunas office, west wing",
            Equipment = Equipment.TvScreen | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000007"),
            Name = "Grove",
            Capacity = 6,
            Floor = 2,
            Location = "Kaunas office, east wing",
            Equipment = Equipment.Projector | Equipment.VideoConferencing | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000008"),
            Name = "Harbor",
            Capacity = 10,
            Floor = 2,
            Location = "Kaunas office, west wing",
            Equipment = Equipment.TvScreen | Equipment.Whiteboard,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000009"),
            Name = "Iris",
            Capacity = 8,
            Floor = 3,
            Location = "Kaunas office, east wing",
            Equipment = Equipment.Projector | Equipment.Whiteboard,
            IsActive = false
        },
        new()
        {
            Id = Guid.Parse("10000000-0000-0000-0000-000000000010"),
            Name = "Juniper",
            Capacity = 14,
            Floor = 3,
            Location = "Kaunas office, west wing",
            Equipment = Equipment.TvScreen | Equipment.VideoConferencing | Equipment.Whiteboard,
            IsActive = false
        }
    ];
}
