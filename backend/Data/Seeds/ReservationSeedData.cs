using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Data.Seeds;

public static class ReservationSeedData
{
    private static readonly TimeSpan ScheduledDuration = TimeSpan.FromHours(2);
    private static readonly TimeSpan RecordedUsageDuration = TimeSpan.FromMinutes(45);

    public static List<Reservation> Create(List<Room> rooms, List<User> users, DateTimeOffset now)
    {
        var roomsByName = rooms.ToDictionary(room => room.Name);
        var usersByFirstName = users.ToDictionary(user => user.FirstName);
        now = now.ToUniversalTime();
        return
        [
            .. CreateOngoingReservations(roomsByName, usersByFirstName, now),
            .. CreateUpcomingReservations(roomsByName, usersByFirstName, now),
            .. CreateCompletedReservations(roomsByName, usersByFirstName, now),
            .. CreateCancelledReservations(roomsByName, usersByFirstName, now),
            .. CreateEarlyCompletedReservations(roomsByName, usersByFirstName, now)
        ];
    }

    private static List<Reservation> CreateOngoingReservations(
        Dictionary<string, Room> rooms, Dictionary<string, User> users, DateTimeOffset now) =>
    [
        Create("30000000-0000-0000-0000-000000000001", rooms["Amber"], users["Alex"],
            "Sprint planning", now.AddMinutes(-30), attendeeCount: 3)
    ];

    private static List<Reservation> CreateUpcomingReservations(
        Dictionary<string, Room> rooms, Dictionary<string, User> users, DateTimeOffset now) =>
    [
        Create("30000000-0000-0000-0000-000000000002", rooms["Birch"], users["Maya"],
            "Design review", now.AddHours(3), attendeeCount: 4),
        Create("30000000-0000-0000-0000-000000000003", rooms["Cedar"], users["Daniel"],
            "Team retrospective", now.AddHours(5), attendeeCount: 5),
        Create("30000000-0000-0000-0000-000000000004", rooms["Delta"], users["Emma"],
            "Project kickoff", now.AddHours(7), attendeeCount: 6),
        Create("30000000-0000-0000-0000-000000000005", rooms["Elm"], users["Oliver"],
            "Customer workshop", now.AddHours(9), attendeeCount: 7),
        Create("30000000-0000-0000-0000-000000000006", rooms["Forest"], users["Sofia"],
            "Architecture review", now.AddHours(11), attendeeCount: 8),
        Create("30000000-0000-0000-0000-000000000007", rooms["Grove"], users["Lukas"],
            "Weekly team sync", now.AddHours(13), attendeeCount: 3),
        Create("30000000-0000-0000-0000-000000000008", rooms["Harbor"], users["Amelia"],
            "Interview panel", now.AddHours(15), attendeeCount: 4)
    ];

    private static List<Reservation> CreateCompletedReservations(
        Dictionary<string, Room> rooms, Dictionary<string, User> users, DateTimeOffset now)
    {
        List<Reservation> reservations =
        [
            Create("30000000-0000-0000-0000-000000000009", rooms["Amber"], users["Noah"],
                "Sprint planning", now.AddDays(-9).AddHours(1), attendeeCount: 4),
            Create("30000000-0000-0000-0000-000000000010", rooms["Birch"], users["Isabella"],
                "Design review", now.AddDays(-10).AddHours(1), attendeeCount: 6),
            Create("30000000-0000-0000-0000-000000000011", rooms["Cedar"], users["Leo"],
                "Team retrospective", now.AddDays(-11).AddHours(1), attendeeCount: 7),
            Create("30000000-0000-0000-0000-000000000012", rooms["Delta"], users["Charlotte"],
                "Project kickoff", now.AddDays(-12).AddHours(1), attendeeCount: 8),
            Create("30000000-0000-0000-0000-000000000013", rooms["Elm"], users["Ethan"],
                "Customer workshop", now.AddDays(-13).AddHours(1), attendeeCount: 3),
            Create("30000000-0000-0000-0000-000000000014", rooms["Forest"], users["Ava"],
                "Architecture review", now.AddDays(-14).AddHours(1), attendeeCount: 4),
            Create("30000000-0000-0000-0000-000000000015", rooms["Grove"], users["James"],
                "Weekly team sync", now.AddDays(-15).AddHours(1), attendeeCount: 5),
            Create("30000000-0000-0000-0000-000000000016", rooms["Harbor"], users["Alex"],
                "Interview panel", now.AddDays(-16).AddHours(1), attendeeCount: 6)
        ];
        reservations.ForEach(reservation => reservation.Status = ReservationStatus.Completed);
        return reservations;
    }

    private static List<Reservation> CreateCancelledReservations(
        Dictionary<string, Room> rooms, Dictionary<string, User> users, DateTimeOffset now)
    {
        List<Reservation> reservations =
        [
            Create("30000000-0000-0000-0000-000000000017", rooms["Amber"], users["Maya"],
                "Sprint planning", now.AddHours(33), attendeeCount: 4),
            Create("30000000-0000-0000-0000-000000000018", rooms["Birch"], users["Daniel"],
                "Design review", now.AddHours(35), attendeeCount: 6),
            Create("30000000-0000-0000-0000-000000000019", rooms["Cedar"], users["Emma"],
                "Team retrospective", now.AddHours(37), attendeeCount: 3),
            Create("30000000-0000-0000-0000-000000000020", rooms["Delta"], users["Oliver"],
                "Project kickoff", now.AddHours(39), attendeeCount: 4)
        ];
        reservations.ForEach(reservation => reservation.Status = ReservationStatus.Cancelled);
        return reservations;
    }

    private static List<Reservation> CreateEarlyCompletedReservations(
        Dictionary<string, Room> rooms, Dictionary<string, User> users, DateTimeOffset now)
    {
        List<Reservation> reservations =
        [
            Create("30000000-0000-0000-0000-000000000021", rooms["Elm"], users["Sofia"],
                "Customer workshop", now.AddDays(-21).AddHours(1), attendeeCount: 5),
            Create("30000000-0000-0000-0000-000000000022", rooms["Forest"], users["Lukas"],
                "Architecture review", now.AddDays(-22).AddHours(1), attendeeCount: 6),
            Create("30000000-0000-0000-0000-000000000023", rooms["Grove"], users["Amelia"],
                "Weekly team sync", now.AddDays(-23).AddHours(1), attendeeCount: 6),
            Create("30000000-0000-0000-0000-000000000024", rooms["Harbor"], users["Noah"],
                "Interview panel", now.AddDays(-24).AddHours(1), attendeeCount: 8)
        ];
        foreach (var reservation in reservations)
        {
            reservation.Status = ReservationStatus.Completed;
            reservation.ActualEndTime = reservation.StartTime.Add(RecordedUsageDuration);
        }

        return reservations;
    }

    private static Reservation Create(
        string id, Room room, User organizer, string title, DateTimeOffset startTime, int attendeeCount) => new()
        {
            Id = Guid.Parse(id),
            RoomId = room.Id,
            OrganizerId = organizer.Id,
            Room = room,
            Organizer = organizer,
            Title = title,
            StartTime = startTime,
            EndTime = startTime.Add(ScheduledDuration),
            AttendeeCount = attendeeCount,
            Status = ReservationStatus.Booked
        };
}
