using Chamomile.API.Hubs;
using Chamomile.API.Workers;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var CORS = "CORS";

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(o => {
    o.SwaggerDoc("1", new OpenApiInfo {
        Version = "1",
        Title = "Chamomile",
        Description = "Chamomile wraps around A1111 and makes it easier to generate images",
    });

});

builder.Services.AddSingleton<ImageGeneratorWorker>();
builder.Services.AddSignalR();

builder.Services.AddCors(o => {
    o.AddPolicy(name: CORS,
    builder => {
        builder.AllowAnyHeader();
        builder.AllowAnyMethod();
        builder.SetIsOriginAllowed(origin => true);
    });
});

builder.WebHost.ConfigureKestrel(serverOptions => {
    serverOptions.Limits.MaxRequestBodySize = null; // Disable limit
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI(options => options.SwaggerEndpoint($"/swagger/1/swagger.json", "Chamomile"));
    app.UseDeveloperExceptionPage();
}

app.UseCors(CORS);

app.UseHttpsRedirection();

//app.UseAuthorization();

app.MapControllers();
app.MapHub<ImageGenerateHub>("/api/imageHub");


app.Run();
