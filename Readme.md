## Run this App

Clone Repo
```
$ git clone https://github.com/codebudy5247/ecfile-task.git
```

### Run the app
```
// In root Dir
$ npm install
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