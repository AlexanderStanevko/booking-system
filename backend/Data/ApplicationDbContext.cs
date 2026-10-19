using Microsoft.EntityFrameworkCore;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>().Property(room => room.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Room>().Property(room => room.Location).IsRequired().HasMaxLength(200);
        modelBuilder.Entity<User>().Property(user => user.FirstName).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<User>().Property(user => user.LastName).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Reservation>().Property(reservation => reservation.Title).IsRequired().HasMaxLength(200);
        modelBuilder.Entity<Reservation>().HasOne(reservation => reservation.Room)
            .WithMany(room => room.Reservations).HasForeignKey(reservation => reservation.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Reservation>().HasOne(reservation => reservation.Organizer)
            .WithMany(user => user.Reservations).HasForeignKey(reservation => reservation.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
