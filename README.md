# Krili - Peer-to-Peer Rental Marketplace

Krili is a modern, peer-to-peer rental marketplace designed to connect people who have items to rent with those who need them. Whether it's tools, electronics, vehicles, or recreational equipment, Krili makes it easy to list, discover, and rent items within your local community.

![Krili Homepage](/public/og-homepage.jpg)

## 🚀 Features

-   **User Authentication**: Secure sign-up and login using NextAuth.js.
-   **Browse & Search**: Powerful search functionality to find items by category, location, or keyword.
-   **Detailed Listings**: Rich item descriptions with images, pricing, and availability.
-   **Categories**: Organized browsing through categories like Tools, Electronics, Sports, and Vehicles.
-   **User Dashboard**: Manage your listings, rentals, and profile settings.
-   **Responsive Design**: Built with a mobile-first approach for a seamless experience on any device.
-   **SEO Optimized**: Integrated structured data and meta tags for better visibility.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Authentication**: [NextAuth.js v5](https://authjs.dev/)
-   **Database**: [MySQL](https://www.mysql.com/) (via `mysql2`)
-   **Forms**: React Hook Form + Zod

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js**: v18 or higher
-   **MySQL**: A running MySQL instance

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/krili.git
    cd krili
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database
    DATABASE_URL="mysql://user:password@host:port/database_name"

    # Authentication (NextAuth.js)
    AUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32
    AUTH_URL="http://localhost:3000" # Optional in some environments
    ```

4.  **Database Setup:**

    Ensure your MySQL database is running and accessible. You can initialize the database schema using the provided SQL script (if available) or by ensuring your database matches the expected schema in `database/init.sql`.

5.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
krili/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable UI components
├── database/         # Database scripts and configurations
├── lib/              # Utility functions and database connections
├── public/           # Static assets
└── styles/           # Global styles
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
