# EmailJS Contact Form Setup

The contact form in the About page uses EmailJS to send messages directly to your email.

## Current Configuration

Your EmailJS credentials are already configured:
- **Service ID**: `service_x5t6vxy`
- **Template ID**: `template_390ggkw`
- **Public Key**: `5QQACvSQe3-5qwT99`

## How It Works

1. User fills out the contact form (name, email, subject, message)
2. Form submits via EmailJS API
3. Email is sent to your configured email address
4. User sees success confirmation

## Template Variables

Your EmailJS template should include these variables:
- `{{from_name}}` - User's name
- `{{from_email}}` - User's email address
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{to_name}}` - "Credence Team"

## Testing

1. Start the frontend: `npm run dev`
2. Navigate to `/about`
3. Scroll to the contact form
4. Fill out and submit
5. Check your email inbox

## Troubleshooting

If emails aren't arriving:
1. Check EmailJS dashboard for delivery status
2. Verify template ID matches your EmailJS template
3. Check spam/junk folder
4. Verify service is active in EmailJS dashboard
5. Check browser console for errors

## Environment Variables

Credentials are stored in `.env` and fall back to hardcoded values if not set:
```
VITE_EMAILJS_SERVICE_ID=service_x5t6vxy
VITE_EMAILJS_TEMPLATE_ID=template_390ggkw
VITE_EMAILJS_PUBLIC_KEY=5QQACvSQe3-5qwT99
```
