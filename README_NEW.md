# ING Credit Card Application System

A modern, feature-rich credit card application portal built with React, TypeScript, Redux Toolkit, and Ant Design. This system provides a complete digital onboarding experience with eligibility validation, risk assessment, and real-time form handling.

## 🚀 Features

### User Flow
- **Phone-based Login**: OTP-based authentication using phone number
- **Session Management**: Automatic session save/restore with cookie persistence
- **Multi-step Application**: Guided 5-step process for credit card application
- **Auto-save Drafts**: All form data saved to localStorage automatically
- **Continue from Last Step**: Resume application from where user left off

### Application Steps
1. **Login** - Phone number + OTP verification
2. **KYC Details** - PAN, personal information, address
3. **Employment** - Job details and experience
4. **Income** - Annual and monthly income verification
5. **Review** - Full application review with eligibility & risk assessment
6. **Confirmation** - Application submission confirmation

### Advanced Features
- ✅ Eligibility Validation with credit limit calculation
- ✅ Risk Assessment with credit score simulation
- ✅ Validation for all edge cases and failure scenarios
- ✅ Proper error handling and user feedback
- ✅ Responsive design for mobile and desktop
- ✅ Session expiry handling
- ✅ OTP verification with demo mode
- ✅ Faker.js for demo data generation

## 📋 Tech Stack

- **Frontend Framework**: React 19.2
- **Language**: TypeScript 5.9
- **State Management**: Redux Toolkit 1.9
- **UI Components**: Ant Design 5.8
- **Form Handling**: Ant Design Forms
- **Routing**: React Router DOM 6.14
- **Data Generation**: Faker.js 8.0
- **Utilities**: Day.js, UUID, js-cookie
- **Build Tool**: Vite 7.3

## 🎨 Project Structure

```
src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # Redux Provider setup
├── index.css                        # Global styles
│
├── components/
│   ├── Header.tsx                  # Navigation header
│   ├── Header.css
│   └── ApplicationStepper.tsx       # Step indicator
│
├── pages/
│   ├── LoginPage.tsx               # Phone & OTP login
│   ├── LoginPage.css
│   ├── ApplicationDashboardPage.tsx # Application home
│   ├── ApplicationDashboardPage.css
│   ├── KYCDetailsPage.tsx          # KYC form
│   ├── EmploymentDetailsPage.tsx   # Employment form
│   ├── IncomeDetailsPage.tsx       # Income form
│   ├── ReviewPage.tsx              # Review & submit
│   ├── ReviewPage.css
│   ├── ConfirmationPage.tsx        # Success page
│   ├── ConfirmationPage.css
│   └── FormPages.css               # Shared form styles
│
├── store/
│   └── index.ts                    # Redux store config
│
├── slices/
│   ├── authSlice.ts                # Auth state & actions
│   └── applicationSlice.ts         # Application state
│
├── services/
│   ├── fakerService.ts             # Demo data generation
│   └── otpService.ts               # OTP handling
│
├── hooks/
│   └── useRedux.ts                 # Custom Redux hooks
│
├── utils/
│   ├── validation.ts               # Form validation
│   ├── helpers.ts                  # Utility functions
│   └── sessionStorage.ts           # Session management
│
└── types/
    └── index.ts                    # TypeScript interfaces
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### Demo Credentials
The application uses FakerJS for demo data and in-memory OTP storage in development.

**To login:**
1. Enter any 10-digit phone number starting with 6-9 (e.g., `9876543210`)
2. Click "Send OTP"
3. **Demo OTP will appear in an info alert** (also stored in localStorage)
4. Enter the OTP and click "Verify OTP"
5. Complete the application steps

### Session Persistence
- Sessions are automatically saved to localStorage and cookies
- Upon returning to the app, you'll be automatically logged in if session is valid
- Sessions expire after 24 hours
- Logout clears all session data

### Application Drafts
- All form data is auto-saved to localStorage under `drafts_<customerId>`
- If you logout and login again, your draft will be restored
- You can edit any previous step by clicking "Edit" on the review page
- Drafts expire after 7 days

## 🔐 Security Features

- ✅ Session token storage in secure cookies
- ✅ Session expiry validation
- ✅ Protected routes requiring authentication
- ✅ HTTPS-ready (in production)
- ✅ Input validation and sanitization

## 📊 Validation & Rules

### KYC Validation
- PAN format: `AAAPL5055K` (10 characters, specific pattern)
- Age: Must be 18+ years
- Pincode: 6 digits
- All mandatory fields required

### Income Validation
- Minimum annual income: ₹3,00,000
- Automatic calculation of credit limits
- Terms acceptance required

### Eligibility Check
- Income threshold validation
- Credit limit calculation (50% of income, max ₹5,00,000)
- Recommended limit (25% of income)

### Risk Assessment
- Credit score generation (600-850 range)
- Debt-to-income ratio calculation
- Risk level determination (LOW/MEDIUM/HIGH)
- Decision recommendation (AUTO_APPROVE/REVIEW/AUTO_REJECT)

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Linting
npm run preview  # Preview production build
```

## 📞 OTP Integration

The application is ready for integration with free OTP providers. Currently uses in-memory storage for demo.

**To integrate real OTP service**, update `src/services/otpService.ts`:

```typescript
// Example: Twilio Integration
import twilio from 'twilio';

const client = twilio(accountSid, authToken);

export const sendOTP = async (phoneNumber: string) => {
  const otp = generateOTP();
  await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: twilioNumber,
    to: `+91${phoneNumber}`,
  });
};
```

**Free OTP Providers:**
- Firebase Authentication (free SMS tier)
- Twilio (free trial)
- Vonage/Nexmo (free SMS)
- Plivo (free credits)
- AWS SNS (free tier)

## 🧪 Test Scenarios

1. **Valid Application**: Complete all steps with valid data
2. **Income Below Threshold**: Use income < ₹3,00,000
3. **Session Persistence**: Login → Logout → Login again
4. **Validation Errors**: Try invalid PAN, pincode, etc.
5. **Edge Cases**: Special characters, extremely long names, etc.

## 📈 Performance

- Lazy loading with React Router
- Code splitting with Vite
- Local storage for draft persistence
- Optimized re-renders with Redux

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 📝 Next Steps

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Test the application** with demo data
4. **Integrate real OTP provider** for production
5. **Connect to backend API** for data persistence
6. **Deploy** to your hosting platform

## 🎯 Future Enhancements

- [ ] Document upload verification
- [ ] Real bank API integration
- [ ] Advanced KYC verification
- [ ] Real-time credit score check
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Notification system (Email/SMS)
- [ ] Admin dashboard for reviews

---

Built with ❤️ for seamless credit card applications
