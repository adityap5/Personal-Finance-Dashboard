# Personal Finance Visualizer

A comprehensive web application for tracking personal finances, built with Next.js and MongoDB Atlas. Features transaction management, category-wise spending analysis, budgeting tools, and interactive visualizations.

## Features

### 🏦 Transaction Management
- **Add/Edit/Delete Transactions**: Complete CRUD operations for income and expenses
- **Transaction List View**: Searchable and filterable transaction history
- **Form Validation**: Client-side validation with error handling
- **Real-time Updates**: Instant UI updates after transaction operations

### 📊 Data Visualization
- **Monthly Expenses Chart**: Bar chart showing spending patterns over 6 months
- **Category Pie Chart**: Visual breakdown of expenses by category
- **Budget vs Actual Comparison**: Track spending against set budgets
- **Responsive Charts**: Built with Recharts for optimal viewing on all devices

### 🎯 Budget Management
- **Set Monthly Budgets**: Create category-wise spending limits
- **Budget Tracking**: Visual progress indicators for each category
- **Spending Insights**: Automated alerts for over-budget categories
- **Budget Analytics**: Detailed comparison charts and recommendations

### 📱 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Skeleton loaders and loading indicators
- **Indian Context**: Currency formatting and culturally relevant data

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, JavaScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts library
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account and cluster
- Git for version control

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd personal-finance-visualizer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   Create a \`.env.local\` file in the root directory:
   \`\`\`env
   MONGODB_URI=your_mongodb_atlas_connection_string
   \`\`\`

4. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Replace \`<password>\` with your database user password
   - Replace \`<dbname>\` with \`finance_tracker\`

5. **Seed the Database** (Optional)
   \`\`\`bash
   node scripts/seed-database.js
   \`\`\`

6. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to \`http://localhost:3000\`

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── transactions/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   └── budgets/
│   │       └── route.js
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── ui/                    
│   ├── transaction-form.jsx
│   ├── transaction-list.jsx
│   ├── monthly-expenses-chart.jsx
│   ├── category-pie-chart.jsx
│   ├── budget-form.jsx
│   └── budget-comparison.jsx
├── scripts/
│   └── seed-database.js
├── mock-data.json
└── README.md
\`\`\`

## API Endpoints

### Transactions
- \`GET /api/transactions\` - Fetch all transactions
- \`POST /api/transactions\` - Create new transaction
- \`PUT /api/transactions/[id]\` - Update transaction
- \`DELETE /api/transactions/[id]\` - Delete transaction

### Budgets
- \`GET /api/budgets\` - Fetch all budgets
- \`POST /api/budgets\` - Create/update budget

## Database Schema

### Transactions Collection
\`\`\`javascript
{
  _id: ObjectId,
  amount: Number,
  description: String,
  category: String,
  type: "income" | "expense",
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Budgets Collection
\`\`\`javascript
{
  _id: ObjectId,
  category: String,
  amount: Number,
  month: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Features in Detail

### Dashboard Overview
- **Summary Cards**: Total income, expenses, net balance, and top spending category
- **Recent Transactions**: Latest 5 transactions with quick actions
- **Visual Charts**: Monthly trends and category breakdowns
- **Responsive Grid**: Adapts to different screen sizes

### Transaction Management
- **Smart Forms**: Auto-validation and error handling
- **Category System**: Predefined categories for consistent tracking
- **Date Handling**: Indian date format support
- **Search & Filter**: Find transactions by description, category, or type

### Budget System
- **Monthly Budgets**: Set spending limits for each category
- **Progress Tracking**: Visual indicators showing budget utilization
- **Smart Alerts**: Warnings for categories approaching or exceeding limits
- **Historical Data**: Track budget performance over time

### Data Visualization
- **Interactive Charts**: Hover effects and detailed tooltips
- **Color Coding**: Consistent color scheme across all visualizations
- **Responsive Design**: Charts adapt to container size
- **Export Ready**: Charts optimized for screenshots and reports

## Customization

### Adding New Categories
Edit the \`CATEGORIES\` array in:
- \`components/transaction-form.jsx\`
- \`components/budget-form.jsx\`

### Modifying Chart Colors
Update the \`COLORS\` array in \`components/category-pie-chart.jsx\`

### Changing Currency Format
The app uses Indian Rupee (₹) formatting. To change:
1. Update \`toLocaleString('en-IN')\` calls
2. Replace \`IndianRupee\` icon imports
3. Modify currency symbols in components

## Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
\`\`\`env
MONGODB_URI=your_production_mongodb_uri
\`\`\`

## Performance Optimizations

- **Server Components**: Leverages Next.js App Router for optimal performance
- **Database Indexing**: Recommended indexes for common queries
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for faster page loads
- **Caching**: API route caching for improved response times

## Security Features

- **Input Validation**: Server-side validation for all API endpoints
- **Error Handling**: Secure error messages without sensitive data exposure
- **Database Security**: MongoDB connection with authentication
- **CORS Protection**: Built-in Next.js security features

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the API endpoints for integration help

## Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Recharts** for powerful charting capabilities
- **Framer Motion** for smooth animations
- **MongoDB Atlas** for reliable database hosting
- **Vercel** for seamless deployment platform
