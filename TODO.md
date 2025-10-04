# E-Commerce App Enhancements TODO

## 1. Hide Components Before Login
- [x] Modify frontend/src/App.jsx to conditionally show Products, Cart, and Admin links only when user is logged in.

## 2. Add OAuth Login
- [x] Install backend dependencies: passport-google-oauth20, passport
- [x] Update backend/src/routes/auth.js to add Google OAuth routes
- [x] Update frontend/src/pages/Login.jsx to include Google OAuth button
- [x] Update authSlice.js if needed for OAuth

## 3. Send Order Details to Gmail After Placing Order
- [x] Install backend dependencies: nodemailer
- [x] Update backend/src/utils/notify.js to use nodemailer for real email sending
- [x] Update backend/src/routes/payments.js to send email with order details after successful payment

## 4. Generate PDF Receipt
- [x] Install backend dependencies: pdfkit
- [x] Update backend/src/routes/payments.js to generate PDF receipt with book details, price, GST (18%), and attach to email

## Followup Steps
- [ ] Test OAuth login functionality
- [ ] Test email sending with PDF attachment
- [ ] Verify GST calculation and PDF content
