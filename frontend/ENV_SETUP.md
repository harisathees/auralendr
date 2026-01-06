# Environment Configuration

## Setup Instructions

1. Create a `.env` file in the `frontend` directory (same level as `package.json`)

2. Add the following content to the `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

3. Update the `VITE_API_BASE_URL` value according to your backend API URL

4. Restart your development server after creating/updating the `.env` file

## Notes

- All environment variables in Vite must be prefixed with `VITE_` to be accessible in the frontend code
- The `.env` file should not be committed to version control (should be in `.gitignore`)
- Use `.env.example` as a template for other developers

