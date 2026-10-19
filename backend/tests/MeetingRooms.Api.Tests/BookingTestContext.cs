using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;
using MeetingRooms.Api.Services;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Time.Testing;
using Microsoft.Extensions.Options;

namespace MeetingRooms.Api.Tests;

public sealed class BookingTestContext : IAsyncDisposable
{
    public FakeTimeProvider Clock { get; } = new(new DateTimeOffset(2030, 1, 10, 12, 0, 0, TimeSpan.Zero));
    public BookingOptions Limits { get; } = new();
    public ReservationLock Gate { get; } = new();
    public DbContextOptions<ApplicationDbContext> DatabaseOptions { get; } =
        new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
    public ApplicationDbContext Database { get; }
    public Room FirstRoom { get; } = new()
    {
        Id = Guid.NewGuid(),
        Name = "Amber",
        Location = "East",
        Capacity = 10,
        Floor = 1,
        Equipment = Equipment.Projector | Equipment.Whiteboard,
        IsActive = true
    };
    public Room SecondRoom { get; } = new()
    {
        Id = Guid.NewGuid(),
        Name = "Birch",
        Location = "West",
        Capacity = 20,
        Floor = 2,
        Equipment = Equipment.TvScreen,
        IsActive = true
    };
    public Room InactiveRoom { get; } = new()
    {
        Id = Guid.NewGuid(),
        Name = "Cedar",
        Location = "East",
        Capacity = 8,
        Floor = 1,
        IsActive = false
    };
    public User FirstUser { get; } = new() { Id = Guid.NewGuid(), FirstName = "Alex", LastName = "Reed" };
    public User SecondUser { get; } = new() { Id = Guid.NewGuid(), FirstName = "Maya", LastName = "Hall" };
    public ReservationService Reservations => CreateService(Database);
    public ReservationQueryService Queries => new(Database, new(Database), Gate, Clock);
    public UserService Users => new(Database, new(Database), Gate, Clock);
    public RoomUsageService Reports => new(Database, new(Database), Gate, Clock);
    public RoomService Rooms => new(Database);

    public BookingTestContext()
    {
        Database = new ApplicationDbContext(DatabaseOptions);
        Database.Rooms.AddRange(FirstRoom, SecondRoom, InactiveRoom);
        Database.Users.AddRange(FirstUser, SecondUser);
        Database.SaveChanges();
    }

    public CreateReservationRequest ValidRequest => new()
    {
        RoomId = FirstRoom.Id,
        OrganizerId = FirstUser.Id,
        Title = "Design review",
        StartTime = Clock.GetUtcNow().AddDays(1),
        EndTime = Clock.GetUtcNow().AddDays(1).AddHours(1),
        AttendeeCount = 5
    };

    public UpdateReservationRequest UpdateRequest => new()
    {
        RoomId = ValidRequest.RoomId,
        OrganizerId = ValidRequest.OrganizerId,
        Title = ValidRequest.Title,
        StartTime = ValidRequest.StartTime,
        EndTime = ValidRequest.EndTime,
        AttendeeCount = ValidRequest.AttendeeCount
    };

    public ReservationService CreateService(ApplicationDbContext database)
        => new(database, new(database, Options.Create(Limits), new(database)), new(database), Gate, Clock);

    public async Task<Reservation> AddReservationAsync(Action<Reservation>? configure = null)
    {
        var request = ValidRequest;
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            RoomId = request.RoomId,
            OrganizerId = request.OrganizerId,
            Title = request.Title,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            AttendeeCount = request.AttendeeCount,
            Status = ReservationStatus.Booked
        };
        configure?.Invoke(reservation);
        reservation.Room = Database.Rooms.Local.Single(room => room.Id == reservation.RoomId);
        reservation.Organizer = Database.Users.Local.Single(user => user.Id == reservation.OrganizerId);
        Database.Reservations.Add(reservation);
        await Database.SaveChangesAsync();
        return reservation;
    }

    public async ValueTask DisposeAsync()
    {
        await Database.DisposeAsync();
        Gate.Dispose();
    }
}
