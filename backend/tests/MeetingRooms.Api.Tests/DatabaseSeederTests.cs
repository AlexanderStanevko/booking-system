using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Time.Testing;

namespace MeetingRooms.Api.Tests;

public sealed class DatabaseSeederTests
{
    [Fact]
    public async Task Seed_is_idempotent_and_internally_consistent()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        await using var database = new ApplicationDbContext(options);
        var clock = new FakeTimeProvider(new DateTimeOffset(2030, 1, 1, 12, 0, 0, TimeSpan.Zero));
        var seeder = new DatabaseSeeder(database, clock);
        await seeder.SeedAsync();
        await seeder.SeedAsync();
        var rooms = await database.Rooms.ToListAsync();
        var users = await database.Users.ToListAsync();
        var reservations = await database.Reservations.ToListAsync();
        Assert.Equal(10, rooms.Count);
        Assert.Equal(15, users.Count);
        Assert.Equal(24, reservations.Count);
        Assert.Contains(rooms, room => !room.IsActive);
        Assert.Contains(reservations, reservation => reservation.ActualEndTime.HasValue);
        Assert.Contains(reservations, reservation => reservation.Status == ReservationStatus.Cancelled);
        Assert.All(reservations, reservation =>
        {
            Assert.Contains(rooms, room => room.Id == reservation.RoomId);
            Assert.Contains(users, user => user.Id == reservation.OrganizerId);
            Assert.True(reservation.StartTime < reservation.EndTime);
            Assert.InRange(reservation.AttendeeCount, 1, reservation.Room.Capacity);
            Assert.Equal(TimeSpan.Zero, reservation.StartTime.Offset);
            if (reservation.ActualEndTime.HasValue)
            {
                Assert.Equal(ReservationStatus.Completed, reservation.Status);
                Assert.InRange(reservation.ActualEndTime.Value, reservation.StartTime, reservation.EndTime);
            }
        });
        var active = reservations.Where(reservation => reservation.Status == ReservationStatus.Booked).ToList();
        Assert.All(active, reservation =>
        {
            Assert.True(reservation.Room.IsActive);
            Assert.True(reservation.EndTime > clock.GetUtcNow());
            Assert.DoesNotContain(active, other => other.Id != reservation.Id
                && (other.RoomId == reservation.RoomId || other.OrganizerId == reservation.OrganizerId)
                && TimeInterval.Overlaps(reservation.StartTime, reservation.EndTime, other.StartTime, other.EndTime));
        });
    }
}
