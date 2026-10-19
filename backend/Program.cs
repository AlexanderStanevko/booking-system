using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMeetingRoomServices(builder.Configuration);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("MeetingRooms"));

builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
            .WithMethods(HttpMethods.Get, HttpMethods.Post, HttpMethods.Put)
            .AllowAnyHeader()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages(async context =>
{
    var notFound = context.HttpContext.Response.StatusCode == StatusCodes.Status404NotFound;
    await context.HttpContext.Response.WriteAsJsonAsync(new ApiErrorResponse(
        notFound ? ErrorCodes.EndpointNotFound : ErrorCodes.InvalidRequest,
        notFound ? "The requested endpoint does not exist." : "The request could not be processed."));
});

if (app.Environment.IsDevelopment())
{
    app.UseCors("Frontend");
}

app.MapGet("/api/health", () => Results.Ok(new { status = "running" }));
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    await scope.ServiceProvider.GetRequiredService<DatabaseSeeder>().SeedAsync();
}

await app.RunAsync();
