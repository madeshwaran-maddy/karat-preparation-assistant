# Karat Preparation Assistant

A web application for candidate interview preparation, mock assessments, coding exercises, progress tracking, and reviewer reports.

## Tech Stack

- **Framework:** Next.js 16 with the App Router
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, and Next Font (Geist)
- **Code editor:** Monaco Editor via `@monaco-editor/react`
- **Database:** DynamoDB through the AWS SDK for JavaScript v3
- **Code execution:** Judge0 Extra CE for Java submissions
- **Spreadsheet support:** SheetJS (`xlsx`)
- **Quality tools:** ESLint 9 and the Next.js ESLint configuration

## Prerequisites

- Node.js 20.9 or later
- npm
- A DynamoDB instance for database-backed features:
	- DynamoDB Local at `http://localhost:8000`, or
	- An AWS DynamoDB account and credentials
- Internet access for the Judge0 code-execution API

## Project Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd karat-preparation-assistant
npm install
```

Create a `.env.local` file in the project root if you need to override the local DynamoDB defaults:

```env
AWS_REGION=ap-south-1
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
```

The local values above are suitable for DynamoDB Local. For AWS DynamoDB, remove `DYNAMODB_ENDPOINT` and provide valid AWS credentials using your preferred secure AWS credential configuration. Do not commit `.env.local` or credentials to source control.

## Database Setup

The application expects these DynamoDB tables:

- `candidates`
- `assessments`
- `questions`
- `evaluations`
- `learning_progress`

The table definitions and indexes are in `lib/dynamodb.ts`. The initialization route in `src/app/api/setup/route.ts` is currently disabled, so table creation must be enabled through that route or performed with a separate setup script before using database-backed workflows.
Uncomment the code in route.ts and execute 
https://endpoint_url.com/api/setup/route.ts in browser

## Run the Project

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available commands:

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm start      # Serve the production build
```

To run the production server locally:

```bash
npm run build
npm start
```

## Application Areas

- Candidate dashboard and preparation rounds
- Practice and mock assessments
- Debugging and coding exercises
- Learning progress tracking
- Reviewer candidate information and reports
- Authentication API routes for login and signup
