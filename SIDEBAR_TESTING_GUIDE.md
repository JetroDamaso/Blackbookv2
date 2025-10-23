# Sidebar Testing Guide

## Overview

This guide covers testing the enhanced sidebar functionality with user information display, conditional visibility, and integrated logout functionality.

## 🎯 Features to Test

### 1. Conditional Sidebar Visibility
- ✅ Sidebar hidden on `/login` page
- ✅ Sidebar visible on authenticated pages
- ✅ Sidebar appears after successful login
- ✅ Sidebar disappears after logout

### 2. User Information Display
- ✅ User avatar (User icon with primary background)
- ✅ Full name display
- ✅ Employee ID (first 8 characters of UUID)
- ✅ Role badge with shield icon
- ✅ Proper text truncation for long names

### 3. Logout Functionality
- ✅ Logout button styling (red color scheme)
- ✅ Loading state during logout process
- ✅ Successful redirect to `/login`
- ✅ Session clearing
- ✅ Sidebar disappears after logout

## 🧪 Test Scenarios

### Scenario 1: Initial Page Load (Unauthenticated)

**Steps:**
1. Open browser and navigate to any protected route (e.g., `/event_calendar`)
2. Observe automatic redirect to `/login`

**Expected Results:**
- [ ] Redirected to `/login` page
- [ ] No sidebar visible
- [ ] Login form displayed properly
- [ ] No user information visible anywhere

### Scenario 2: Login Process

**Steps:**
1. On `/login` page, enter valid credentials:
   - Employee ID: First 8 characters of UUID (e.g., `a1b2c3d4`)
   - Password: Valid employee password
2. Click "Login" button
3. Observe the transition

**Expected Results:**
- [ ] Loading state shows during authentication
- [ ] Successful redirect to `/event_calendar`
- [ ] Sidebar appears on the left
- [ ] User info section visible at bottom of sidebar

### Scenario 3: User Information Display

**Prerequisites:** User must be logged in

**Steps:**
1. Navigate to `/event_calendar` or any authenticated page
2. Scroll to bottom of sidebar
3. Examine user information section

**Expected Results:**
- [ ] User avatar displayed (User icon in circular background)
- [ ] Full name visible and properly formatted
- [ ] Employee ID shows first 8 characters of UUID
- [ ] Role badge displays with shield icon
- [ ] Information fits properly within sidebar width
- [ ] Text truncation works for long names/IDs

### Scenario 4: Logout Process

**Prerequisites:** User must be logged in

**Steps:**
1. Locate logout button at bottom of sidebar
2. Click "Sign Out" button
3. Observe the logout process

**Expected Results:**
- [ ] Button shows loading state ("Signing Out...")
- [ ] LogOut icon rotates during loading
- [ ] Successful redirect to `/login`
- [ ] Sidebar disappears completely
- [ ] User session cleared (cannot access protected routes)

### Scenario 5: Navigation with Sidebar

**Prerequisites:** User must be logged in

**Steps:**
1. Navigate between different pages using sidebar menu
2. Check user info persistence
3. Test different routes

**Expected Results:**
- [ ] User info remains consistent across all pages
- [ ] Sidebar state maintains during navigation
- [ ] Active menu items highlight correctly
- [ ] User info always visible at sidebar bottom

### Scenario 6: Responsive Design

**Steps:**
1. Test on different screen sizes
2. Check mobile responsiveness
3. Verify user info section layout

**Expected Results:**
- [ ] User info section adapts to sidebar width changes
- [ ] Text truncation works properly on narrow screens
- [ ] Logout button remains accessible
- [ ] Avatar size adjusts appropriately

## 🔧 Manual Testing Checklist

### Authentication State Management
- [ ] Sidebar hidden when `status === "unauthenticated"`
- [ ] Sidebar visible when `status === "authenticated"`
- [ ] Loading state shown when `status === "loading"`
- [ ] Proper handling of session transitions

### User Information Accuracy
- [ ] Name matches logged-in employee record
- [ ] Employee ID shows correct UUID prefix
- [ ] Role displays employee's assigned role
- [ ] All information updates if user data changes

### Visual Design
- [ ] User avatar has proper styling (primary color scheme)
- [ ] Badge styling consistent with design system
- [ ] Logout button has appropriate danger styling
- [ ] Separator line appears above user section
- [ ] Spacing and padding look correct

### Interaction Design
- [ ] Logout button has hover effects
- [ ] Loading states provide clear feedback
- [ ] Smooth transitions during state changes
- [ ] No flickering or layout shifts

## 🚨 Common Issues & Troubleshooting

### Issue: Sidebar Shows on Login Page
**Solution:** Check `ConditionalLayout` logic for pathname detection

### Issue: User Info Not Displaying
**Possible Causes:**
- Session not properly initialized
- Missing user data in session
- NextAuth configuration issues

### Issue: Logout Not Working
**Debug Steps:**
1. Check browser console for errors
2. Verify NextAuth signOut function
3. Confirm redirect logic in handleLogout

### Issue: Layout Shifts During Login
**Solution:** Ensure proper loading states in ConditionalLayout

## 🔍 Browser Console Checks

### During Login
```
// Should see session creation
console.log(session);
// Should show user object with: id, name, email, role, employeeId
```

### During Logout
```
// Should see session clearing
console.log("Logout initiated");
// Should show navigation to /login
```

### Session Persistence
```
// Check if session persists across page refreshes
useSession() // Should return consistent data
```

## 📱 Mobile Testing

### Additional Mobile Checks
- [ ] Sidebar collapses properly on mobile
- [ ] User info section remains accessible
- [ ] Touch interactions work for logout button
- [ ] Text sizing appropriate for mobile screens

## ⚡ Performance Considerations

### Loading Time Checks
- [ ] Sidebar renders quickly after authentication
- [ ] User info loads without delay
- [ ] No unnecessary re-renders during navigation
- [ ] Smooth logout transition

## 📊 Accessibility Testing

### Screen Reader Compatibility
- [ ] User information properly labeled
- [ ] Logout button has clear aria labels
- [ ] Navigation structure makes sense
- [ ] Focus management during transitions

### Keyboard Navigation
- [ ] Tab order includes user info section
- [ ] Logout button accessible via keyboard
- [ ] Focus indicators visible and clear

---

## ✅ Sign-off Checklist

Before marking sidebar implementation as complete:

- [ ] All test scenarios pass
- [ ] No console errors during normal usage
- [ ] Mobile responsiveness verified
- [ ] Accessibility requirements met
- [ ] Performance benchmarks satisfied
- [ ] Security considerations addressed

**Tested by:** ___________________
**Date:** ___________________
**Version:** ___________________
**Notes:** ___________________
