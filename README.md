
## A simple Node.js Capybara API

![Capybara](https://static.wixstatic.com/media/ae3aab_a2bbc493ebba4116a0b03c9dc5467fe0~mv2.png)

This is a sample Node.js application that relies on environment variables available on a [CPS1](https://cps1.tech) Workspace, which make configuration to a Resource like a PostgreSQL database much easier.

Follow these steps to set up and run this application:

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Run database migrations**
   ```bash
   npm run migrate
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## About CPS1

CPS1 (Cloud Programming Shell) is a CDE (Cloud Development Environment) self-hosted system that extends a Kubernetes cluster.

Refer to [CPS1 Offical Documentation](https://docs.cps1.tech/) to know more.
