using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options);
