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
    var response = context.HttpContext.Response.StatusCode switch
    {
        StatusCodes.Status404NotFound => new ApiErrorResponse(
            ErrorCodes.EndpointNotFound, "The requested endpoint does not exist."),
        StatusCodes.Status405MethodNotAllowed => new ApiErrorResponse(
            ErrorCodes.MethodNotAllowed, "This HTTP method is not supported by the requested endpoint."),
        _ => new ApiErrorResponse(ErrorCodes.InvalidRequest, "The request could not be processed.")
    };
    await context.HttpContext.Response.WriteAsJsonAsync(response);
});

if (app.Environment.IsDevelopment())
{
    app.UseCors("Frontend");
}

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    await scope.ServiceProvider.GetRequiredService<DatabaseSeeder>().SeedAsync();
}

await app.RunAsync();
