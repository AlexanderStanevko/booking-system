using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Data.Seeds;

public static class UserSeedData
{
    public static List<User> Create() =>
    [
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
            FirstName = "Alex",
            LastName = "Morgan"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
            FirstName = "Maya",
            LastName = "Patel"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000003"),
            FirstName = "Daniel",
            LastName = "Reed"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000004"),
            FirstName = "Emma",
            LastName = "Wilson"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000005"),
            FirstName = "Oliver",
            LastName = "Bennett"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000006"),
            FirstName = "Sofia",
            LastName = "Martin"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000007"),
            FirstName = "Lukas",
            LastName = "Clark"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000008"),
            FirstName = "Amelia",
            LastName = "Walker"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000009"),
            FirstName = "Noah",
            LastName = "Young"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000010"),
            FirstName = "Isabella",
            LastName = "Hall"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000011"),
            FirstName = "Leo",
            LastName = "Allen"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000012"),
            FirstName = "Charlotte",
            LastName = "King"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000013"),
            FirstName = "Ethan",
            LastName = "Wright"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000014"),
            FirstName = "Ava",
            LastName = "Scott"
        },
        new()
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000015"),
            FirstName = "James",
            LastName = "Green"
        }
    ];
}
