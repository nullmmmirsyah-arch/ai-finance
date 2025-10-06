# GEMINI.md

## Project Overview

This is a personal finance tracker application built with Next.js, TypeScript, and Tailwind CSS. It allows users to track their expenses, analyze their spending patterns, and gain insights into their financial habits. The application uses Clerk for user authentication, Prisma as the ORM for a PostgreSQL database, and Chart.js/Recharts for data visualization. It also integrates with the OpenAI API to provide AI-powered financial insights.

The project follows the Next.js App Router paradigm, with a clear separation of concerns between UI components, server-side actions, and database models.

## Building and Running

To get the application up and running, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project and add the following environment variables:

    ```
    # Prisma
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY"
    CLERK_SECRET_KEY="YOUR_CLERK_SECRET_KEY"

    # OpenAI
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

3.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

### Other Commands

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    ```bash
    npm run start
    ```

*   **Lint the Code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** Components are organized in the `components` directory. Reusable UI components are located in `components/ui`.
*   **Data Fetching:** Data fetching and mutations are handled through Next.js Server Actions, located in the `app/actions` directory.
*   **Database:** The database schema is defined in `prisma/schema.prisma`. Prisma Client is used to interact with the database.
*   **Authentication:** User authentication is handled by Clerk.
*   **Linting:** The project uses ESLint to enforce code quality.
*   **Types:** TypeScript is used for static typing. Type definitions are located in the `types` directory.

## Don't

*   Don't change styling, like color and className. If there are some new page, component, etc follow the color and styling from existing file. If really needed to change the style make sure to inform user and make the user change it manually.
