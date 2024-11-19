# Authenticating Users for Access Control with RAG for LangChain in JavaScript

An example webapp demonstrating how to integrate Pangea's [AuthN][] and
[AuthZ][] services into a LangChain app to filter out RAG documents based on
user permissions.

## Prerequisites

- Node.js v20 or v22.
- A [Pangea account][Pangea signup] with AuthN and AuthZ enabled. Optionally,
  AI Guard and Prompt Guard may also be enabled.
- An [OpenAI API key][OpenAI API keys].
- A Google Drive folder containing spreadsheets

  - Note down the ID of the folder for later (see [the LangChain docs][retrieve-the-google-docs]
    for a guide on how to get the ID from the URL).
  - Each spreadsheet should be named after a user and have two rows. For example:

    Alice PTO

    | Employee | Hours |
    | -------- | ----- |
    | Alice    | 25    |

    Bob PTO

    | Employee | Hours |
    | -------- | ----- |
    | Bob      | 100   |

- Two Google Identities (i.e. Alice and Bob)
  - One user (i.e. Alice) will act as the admin and own the folder and have full
    access to all spreadsheets within
  - The other user (i.e. Bob) will act as an employee with read access to their
    single spreadsheet
- A Google Cloud project with the [Google Drive API][] and [Google Sheets API][] enabled.
- A Google service account:

  1. In your Google Cloud project, go to IAM & Admin > Service Accounts (using the navigation menu in the top left) and create a new service account.
  2. On the service accounts page, select your new service account, click KEYS, and add a new key. Save the key file as `credentials.json` in the root folder of your application.

     Your `credentials.json` file should look similar to this:

     ```json
     {
       "type": "service_account",
       "project_id": "my-project",
       "private_key_id": "l3JYno7aIrRSZkAGFHSNPcjYS6lrpL1UnqbkWW1b",
       "private_key": "-----BEGIN PRIVATE KEY-----\n[...]\n-----END PRIVATE KEY-----\n",
       "client_email": "my-service-account@my-project.iam.gserviceaccount.com",
       "client_id": "1234567890",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/my-service-account%40my-project.iam.gserviceaccount.com",
       "universe_domain": "googleapis.com"
     }
     ```

  3. Share the Google Drive folder with the service account's email - noted as `client_email` in the `credentials.json` file - granting it Editor access so it can query file permissions as needed.

## Setup

### Pangea AuthN

After activating AuthN:

1. Under AuthN > General> Signup Settings, enable "Allow Signups". This way
   users won't need to be manually added.
2. Under AuthN > General > Redirect (Callback) Settings,
   add `http://localhost:3000` as a redirect.
3. Under AuthN > General > Social (OAuth), enable Google.
4. Under AuthN > Overview, note the "Client Token" and "Hosted Login" values for
   later.

### Pangea AuthZ

This app assumes that the authorization schema is set to the built-in
[File Drive][reset-authorization-schema] schema.

### Repository

```shell
git clone https://github.com/pangeacyber/authz-rag-webapp.git
cd authz-rag-webapp
npm install
cp .env.example .env
```

There are several values that need to be filled out in `.env`:

- `NEXT_PUBLIC_AUTHN_CLIENT_TOKEN`: This should be the AuthN "Client Token" that
  was noted earlier.
- `NEXT_PUBLIC_AUTHN_HOSTED_LOGIN`: This should be the AuthN "Hosted Login" that
  was noted earlier.
- `PANGEA_SERVICE_TOKEN`: Pangea API token with access to at least AuthN and
  AuthZ. The app has optional support for AI Guard and Prompt Guard, so include
  those as well if desired.
- `OPENAI_API_KEY`: OpenAI API key.
- `GOOGLE_DRIVE_FOLDER_ID`: Google Drive folder ID.

## Usage

Fetching the Google Drive file permissions and propagating them to AuthZ is its
own step that only needs to be executed once, or whenever file permissions
change. To run the process, do:

```
npm run create-authz-tuples
```

After AuthZ tuples have been created, the app can be started like so:

```
npm start
```

Then navigate to <http://localhost:3000>.

[AuthN]: https://pangea.cloud/docs/authn/
[AuthZ]: https://pangea.cloud/docs/authz/
[Pangea AuthZ Settings]: https://console.pangea.cloud/service/authz/settings
[Pangea signup]: https://pangea.cloud/signup
[reset-authorization-schema]: https://pangea.cloud/docs/authz/general#reset-authorization-schema
[OpenAI API keys]: https://platform.openai.com/api-keys
[Google Drive API]: https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com
[Google Sheets API]: https://console.cloud.google.com/flows/enableapi?apiid=sheets.googleapis.com
[retrieve-the-google-docs]: https://python.langchain.com/docs/integrations/retrievers/google_drive/#retrieve-the-google-docs
