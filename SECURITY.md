# Security Policy

## Supported Versions

The following versions of the Telegram-Web3 Wallet Bridge are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Considerations

### Web3 Wallet Integration
- All private keys must remain client-side and never be transmitted to the server
- Transactions must be signed locally using the user's Web3 wallet
- All transaction data must be transmitted over HTTPS
- Smart contract interactions should be verified on the client side before signing

### Telegram Bot Security
- Bot tokens must be stored securely and never exposed in client-side code
- All bot-user communications should be authenticated
- Deep linking parameters must be validated and sanitized
- Rate limiting should be implemented to prevent abuse

### API Endpoints
- CORS policies must be properly configured for the callback endpoints
- All endpoints must validate the source and authenticity of requests
- Request parameters must be sanitized to prevent injection attacks
- Rate limiting should be implemented on all endpoints

## Reporting a Vulnerability

We take security vulnerabilities seriously. Please report them following these guidelines:

1. **DO NOT** create a public GitHub issue for security vulnerabilities

2. Send a detailed report to [security@your-domain.com] including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

3. You can expect an initial response within 48 hours

4. We will provide updates on the status of your report within 5 business days

### What to Expect
- Acknowledgment of your report within 48 hours
- Verification and assessment of the reported issue
- Regular updates on the progress of addressing the vulnerability
- Credit for the discovery (if desired) after the issue is fixed

### Disclosure Policy
- Please allow us 90 days before disclosing the issue publicly
- We will notify you when the vulnerability has been fixed
- We may request an additional embargo period in special circumstances

## Best Practices for Users

1. **Wallet Security**
   - Always verify transaction details before signing
   - Never share your private keys or seed phrases
   - Use hardware wallets when possible
   - Keep your Web3 wallet software updated

2. **Telegram Security**
   - Verify you're interacting with the official bot
   - Don't share sensitive information in Telegram chats
   - Enable two-factor authentication for your Telegram account

3. **General Security**
   - Keep your operating system and browsers updated
   - Use strong, unique passwords
   - Enable two-factor authentication where available
   - Report any suspicious activity immediately

