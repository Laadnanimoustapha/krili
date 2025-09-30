# Krili - Peer-to-Peer Rental Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-000000)](https://ui.shadcn.com/)

Krili is a modern, peer-to-peer rental marketplace that connects people who want to rent items with those who have items to rent. Whether you're looking to rent tools, electronics, vehicles, sports equipment, or anything else, Krili makes it easy to find and rent from your local community.

## 🌟 Features

- **Peer-to-Peer Rentals**: Connect directly with local renters and owners
- **Wide Range of Categories**: Tools, electronics, cameras, vehicles, sports equipment, and more
- **Advanced Search & Filters**: Find exactly what you need with powerful search capabilities
- **User Profiles & Reviews**: Build trust with verified profiles and user reviews
- **Real-time Messaging**: Communicate securely with potential renters
- **Wishlist & Favorites**: Save items for later
- **Responsive Design**: Optimized for all devices
- **Multi-language Support**: Internationalization ready
- **Dark/Light Mode**: Theme toggle for better user experience
- **SEO Optimized**: Built-in SEO features for better discoverability

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod validation
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: Custom scroll reveal and floating elements
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/krili.git
   cd krili
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables (API keys, database URLs, etc.)

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code linting

## 📁 Project Structure

```
krili-react-ts/
├── app/                    # Next.js app directory
│   ├── (pages)/           # Route groups for different sections
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── styles/               # Additional stylesheets
├── public/               # Static assets
└── ...
```

## 🎨 UI Components

This project uses shadcn/ui components, which are built on top of Radix UI primitives. The design system follows the "New York" style with:

- Neutral color palette
- CSS variables for theming
- Accessible components
- Consistent spacing and typography

## 🌐 Internationalization

The app includes basic internationalization support with:

- Language context provider
- Translation files in `lib/translations.ts`
- Language selector component

## 🔧 Customization

### Adding New Components

```bash
# Add a new shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

### Styling

- Modify `app/globals.css` for global styles
- Use Tailwind CSS classes for component styling
- CSS variables are defined for theming

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📞 Contact

For questions or support, please reach out to our team.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.