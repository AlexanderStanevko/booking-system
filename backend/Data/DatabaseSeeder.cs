using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Data;

public sealed class DatabaseSeeder(ApplicationDbContext database, TimeProvider clock)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await database.Database.EnsureCreatedAsync(cancellationToken);
        if (await database.Rooms.AnyAsync(cancellationToken))
        {
            return;
        }

        var rooms = CreateRooms();
        var users = CreateUsers();
        database.Rooms.AddRange(rooms);
        database.Users.AddRange(users);
        database.Reservations.AddRange(CreateReservations(rooms, users, clock.GetUtcNow()));
        await database.SaveChangesAsync(cancellationToken);
    }

    private static List<Room> CreateRooms()
    {
        string[] names = ["Amber", "Birch", "Cedar", "Delta", "Elm", "Forest", "Grove", "Harbor", "Iris", "Juniper"];
        int[] capacities = [4, 6, 8, 12, 16, 20, 6, 10, 8, 14];
        return names.Select((name, index) => new Room
        {
            Id = StableId(1, index),
            Name = name,
            Capacity = capacities[index],
            Floor = index / 4 + 1,
            Location = $"Kaunas office, {(index % 2 == 0 ? "east" : "west")} wing",
            Equipment = Equipment.Whiteboard | (index % 2 == 0 ? Equipment.Projector : Equipment.TvScreen)
                | (index % 3 == 0 ? Equipment.VideoConferencing : Equipment.None),
            IsActive = index < 8
        }).ToList();
    }

    private static List<User> CreateUsers()
    {
        string[] firstNames = ["Alex", "Maya", "Daniel", "Emma", "Oliver", "Sofia", "Lukas", "Amelia",
            "Noah", "Isabella", "Leo", "Charlotte", "Ethan", "Ava", "James"];
        string[] lastNames = ["Morgan", "Patel", "Reed", "Wilson", "Bennett", "Martin", "Clark", "Walker",
            "Young", "Hall", "Allen", "King", "Wright", "Scott", "Green"];
        return firstNames.Select((name, index) => new User
        {
            Id = StableId(2, index),
            FirstName = name,
            LastName = lastNames[index]
        }).ToList();
    }

    private static List<Reservation> CreateReservations(List<Room> rooms, List<User> users, DateTimeOffset now)
    {
        string[] titles = ["Sprint planning", "Design review", "Team retrospective", "Project kickoff",
            "Customer workshop", "Architecture review", "Weekly team sync", "Interview panel"];
        var reservations = new List<Reservation>();
        for (var index = 0; index < 24; index++)
        {
            var upcoming = index < 8;
            var cancelled = index is >= 16 and < 20;
            var earlyCompleted = index >= 20;
            var room = rooms[index % 8];
            var user = users[index % users.Count];
            var start = index == 0 ? now.AddMinutes(-30)
                : upcoming || cancelled ? now.AddHours(1 + index * 2) : now.AddDays(-1 - index).AddHours(1);
            reservations.Add(new Reservation
            {
                Id = StableId(3, index),
                RoomId = room.Id,
                OrganizerId = user.Id,
                Room = room,
                Organizer = user,
                Title = titles[index % titles.Length],
                StartTime = start,
                EndTime = start.AddHours(2),
                AttendeeCount = Math.Min(room.Capacity, 3 + index % 6),
                Status = cancelled ? ReservationStatus.Cancelled
                    : upcoming ? ReservationStatus.Booked : ReservationStatus.Completed,
                ActualEndTime = earlyCompleted ? start.AddMinutes(45) : null
            });
        }

        return reservations;
    }

    private static Guid StableId(int category, int index)
        => Guid.Parse($"{category}0000000-0000-0000-0000-{index + 1:D12}");
}
