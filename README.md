# hockeyplaydate_xt
Hockey Playdate is a community of friends, organized to joyfully play hockey and support each other on our hockey/life journeys. Hockeyplaydate.com is our app to manage it all. 

# Developer Notes
This repository/app will not function in any environment without the following files re-created/saved at the root of the project, containing variables specific to your local/deployed instance of the application. 

### 1. .env

Create a `.env.` file, and populate with these variables, and set those variables to these values or whatever is applicable to your instance of the project:

```
NEXT_PUBLIC_APP_NAME="Hockey Playdate"

NEXT_PUBLIC_APP_DESCRIPTION="Make friends, play hockey, be happy."

NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

DATABASE_URL="postgresql://postgresDbusername:correspondingPw@your-endpoint.rds.amazonaws.com:5432/myapp_dev"
#in above, replace 'postgresDbusername' and 'correspondingPw' and 'our-endpoint.rds.amazonaws.com' with values from your own AWS RDS postgresQL database instance
```

### 2. .env.local

Create a `.env.local` file, and populate with these variables, and set those variables to these values or whatever is applicable to your instance of the project:

```
AUTH0_DOMAIN='https://apple.us.auth0.com'
#for development/testing, replace above with your development tenant>>application from Auth0. 
#for deployment/production, replace above with your production tenant>>application from Auth0. 

AUTH0_CLIENT_ID='banana'
#for development/testing, replace above with your development tenant>>application from Auth0. 
#for deployment/production, replace above with your production tenant>>application from Auth0. 

AUTH0_CLIENT_SECRET='carrot'
#for development/testing, replace above with your development tenant>>application from Auth0. 
#for deployment/production, replace above with your production tenant>>application from Auth0. 

AUTH0_SECRET='daikon' 
# run [openssl rand -hex 32] to generate a 32 bytes value, place that value here

APP_BASE_URL='http://localhost:3000' 
#for deployment/production, replace this  value with the 'https://...' value that is your deployed domain, which you acquired/set up through AWS or similar means
```
