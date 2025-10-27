
# RBAC System User Guide

## Introduction

Welcome to the Role-Based Access Control (RBAC) system user guide. This document explains how your roles and permissions work in the application and how to troubleshoot common issues.

## Understanding Your Roles

### What Are Roles?

Roles are sets of permissions that determine what you can see and do in the application. Common roles include:

- **Admin**: Full system access
- **Therapist**: Access to patient records and therapy tools
- **Patient**: Access to personal records and appointments
- **Support**: Limited access for customer support functions

### Viewing Your Current Roles

To see what roles are assigned to your account:

1. Click on your profile icon in the top-right corner
2. Select "My Profile" from the dropdown menu
3. Navigate to the "Roles & Permissions" tab

Your current roles will be displayed with descriptions of what they allow you to do.

## Access Control in Action

### Navigation and Menus

The navigation menu adapts to your roles. Items you don't have permission to access will either:

- Not appear in the menu
- Appear grayed-out with a lock icon
- Show a tooltip explaining required permissions when hovered

### Form Fields

When working with forms, you may notice that some fields behave differently based on your roles:

- **Read-Only Fields**: These fields show data but cannot be edited
- **Hidden Fields**: These fields are completely hidden from your view
- **Masked Fields**: These fields show only placeholders (like •••••••) to protect sensitive data

### Actions and Buttons

Buttons and action links may be disabled or hidden based on your permissions. If you believe you should have access to a particular action, see the troubleshooting section.

## Common Role-Related Issues

### Missing Access

If you can't access a page or feature you believe you should have access to:

1. Check your current roles in your profile
2. Try logging out and logging back in
3. Contact your administrator if you believe you need additional roles

### Recently Changed Roles

If your roles were recently changed:

1. Log out and log back in to refresh your session
2. Clear your browser cache if you still don't see the changes
3. Use the "Refresh Roles" button in your profile page

### Multiple Roles

If you have multiple roles assigned:

- You'll have all permissions from all assigned roles
- There are no conflicts between roles - you get the most permissive access
- You can view the combined effect of your roles in your profile

## Role Troubleshooter

The application includes a built-in troubleshooter to help diagnose and fix role-related issues:

1. Navigate to "Help" in the main menu
2. Select "Role Troubleshooter"
3. Follow the prompts to diagnose your issue

The troubleshooter can:
- Check for role synchronization issues
- Test your access to specific resources
- Provide recommendations to fix common problems
- Generate a report you can share with support

## Getting Help

If you continue to experience role-related issues:

1. Use the Role Troubleshooter to generate a diagnostic report
2. Contact your system administrator with:
   - Your username
   - A description of what you're trying to access
   - Any error messages you receive
   - The diagnostic report from the troubleshooter

## Frequently Asked Questions

### Q: Why can't I see a specific feature that a colleague can access?
A: You may have different roles assigned. Check your profile to see your current roles and contact your administrator if you need additional access.

### Q: Why are some form fields read-only for me?
A: Your role may allow viewing but not editing certain fields. This is often the case for sensitive information or when you have a supporting role.

### Q: What should I do if I lose access to features I previously had?
A: First try logging out and back in. If the issue persists, your roles may have changed. Contact your administrator for clarification.

### Q: Can I have temporary access to additional features?
A: Yes, administrators can grant temporary role assignments. Contact your administrator with your specific needs and timeframe.

### Q: How secure is the role-based system?
A: The system implements security at multiple levels, both in what you see (client-side) and what you can actually do (server-side). All role changes are logged for security purposes.
