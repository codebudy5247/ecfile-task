## Run this App

Clone Repo
```
$ git clone https://github.com/codebudy5247/ecfile-task.git
```

### Run the app
```
// In root Dir
$ npm install

// create a .env file with these given fields
NODE_ENV=development
DB_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15
REFRESH_TOKEN_EXPIRY=59

SMPT_SERVICE = 
EMAIL_HOST = 
EMAIL_PORT =  
EMAIL_PASS = 
EMAIL_USER = 


$ npm run dev


# Server started on 1337 PORT
```

### API endpoints

Base URL: http://localhost:1337

| APIs | VERB | Parameters | Description |
| --- | --- | --- | --- |
| /api/users/register | POST | username,email,phone,password | Register user. |
| /api/users/verify-email/:verificationToken | GET |  | Verify Email |
| /api/users/login | POST | phone,password | Login user |
| /api/users//avatar-image | POST | Image File("avatar) | Update user avatar |
| /api/users/me | GET |  | USer Profile |
| /api/users/admin | GET |  | Get List Of Users |