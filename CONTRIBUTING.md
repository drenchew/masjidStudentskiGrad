# Contributing to Masjid Studentski Grad

First off, thank you for considering contributing to Masjid Studentski Grad! It's people like you that make this project better for the Muslim community.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards others
- Accept constructive criticism gracefully

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When you create a bug report, include as many details as possible:
- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, browser, versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:
- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message
6. Update documentation as needed

## Development Process

### Backend (Java/Spring Boot)

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following Java/Spring Boot best practices:
   - Use meaningful variable and method names
   - Add JavaDoc comments for public methods
   - Follow SOLID principles
   - Use Lombok to reduce boilerplate

3. Test your changes:
   ```bash
   cd backend
   mvn test
   ```

4. Build to ensure no compilation errors:
   ```bash
   mvn clean package
   ```

### Frontend (React)

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following React best practices:
   - Use functional components with hooks
   - Follow the existing component structure
   - Use meaningful component and variable names
   - Keep components small and focused
   - Use Tailwind CSS for styling

3. Lint your code:
   ```bash
   cd frontend
   npm run lint
   ```

4. Test the build:
   ```bash
   npm run build
   ```

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
Add prayer time notification feature

Implement email notifications for prayer times.
Users can now opt-in to receive prayer time reminders.

Fixes #123
```

## Style Guidelines

### Java Code Style

- Follow standard Java naming conventions
- Use 4 spaces for indentation
- Maximum line length: 120 characters
- Use Spring Boot annotations appropriately
- Handle exceptions properly

### JavaScript/React Code Style

- Use ES6+ features
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Follow Airbnb React style guide
- Use arrow functions for callbacks

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Use responsive design classes
- Follow mobile-first approach

## Project Structure

Please maintain the existing project structure:

```
backend/
  src/main/java/com/masjid/
    config/       - Configuration classes
    controller/   - REST controllers
    model/        - JPA entities
    repository/   - Data repositories
    service/      - Business logic
    security/     - Security config
    dto/          - Data transfer objects

frontend/
  src/
    api/          - API client
    components/   - Reusable components
    pages/        - Page components
    context/      - React context
    hooks/        - Custom hooks
    locales/      - Translations
```

## Testing

### Backend Tests

```bash
cd backend
mvn test
```

Write unit tests for:
- Service layer logic
- Repository queries
- Controller endpoints
- Security configurations

### Frontend Tests

```bash
cd frontend
npm run test
```

Write tests for:
- Component rendering
- User interactions
- API calls
- State management

## Documentation

- Update README.md if you add features
- Update API_ENDPOINTS.md for new endpoints
- Add JSDoc/JavaDoc comments for new functions
- Update DEPLOYMENT_GUIDE.md if deployment process changes

## Review Process

1. Create a pull request with a clear description
2. Link any related issues
3. Wait for review from maintainers
4. Address any requested changes
5. Once approved, your PR will be merged

## Community

- Join discussions in GitHub Issues
- Help others with their questions
- Share your ideas and feedback

## Need Help?

- Check the [README.md](README.md)
- Read the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Open an issue with the "question" label
- Reach out to maintainers

Thank you for contributing! 🙏
