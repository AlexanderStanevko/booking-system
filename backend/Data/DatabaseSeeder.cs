using MeetingRooms.Api.Data.Seeds;
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

        var rooms = RoomSeedData.Create();
        var users = UserSeedData.Create();
        database.Rooms.AddRange(rooms);
        database.Users.AddRange(users);
        database.Reservations.AddRange(ReservationSeedData.Create(rooms, users, clock.GetUtcNow()));
        await database.SaveChangesAsync(cancellationToken);
    }
}
