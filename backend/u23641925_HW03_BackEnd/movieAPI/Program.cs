using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using movieAPI.Data;
using System.Text;
using movieAPI.Repositories;
using Microsoft.EntityFrameworkCore;
using movieAPI.Services;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//builder for database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IMovieRepository, MovieRepository>();

//builder for api service
builder.Services.AddHttpClient<OMDbService>();

//builder for jwt
builder.Services.AddScoped<JWTService>();

builder.Services.AddAuthentication(options =>
    {
        //configure authenitication by setting - use bearer token authentication - tells code to use JWTAt
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; //how user is identified 
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme; //what happens when user is not authenticated (invalid token/none)
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; //if nothiing is specified - use JWTB - default security method

        //actual JWTB security config - tell code how to use JWTAt
    }).AddJwtBearer(options =>  
        {
            options.RequireHttpsMetadata = false; //controls whether https is required - false to avoid https metadata issues 
            options.SaveToken = true; //save validated token for later use if needed
            options.TokenValidationParameters = new TokenValidationParameters //what must be checked for validationg tokens
            {
                ValidIssuer = builder.Configuration["JwtConfig:Issuer"], //did server create token
                ValidAudience = builder.Configuration["JwtConfig:Audience"], //was token for app
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtConfig:Key"]!)), //secret key to sign and validate tokens - only signed are trusted
                //enforce checking of issue and audience
                ValidateIssuer = true,
                ValidateAudience = true,
                //check if token is still valid/expired > 30 no longer works 
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true //check if it atches key in appsettings.json
            };
        });
//builder for authorization
builder.Services.AddAuthorization();

//builder for OMBD service
builder.Services.AddHttpClient<OMDbService>();

//builder to add cors to stop api from blocking requests
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowIonic", policy =>
    {
        policy.WithOrigins("http://localhost:8100") //MARKER - CHANGE THIS TO YOUR LOCALHOST
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowIonic");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
