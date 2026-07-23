FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

# Install dependencies using pnpm workspace
RUN pnpm install --frozen-lockfile

# Extract UI components if they were zipped to save file count
RUN cd artifacts/ms-admin/src/components && unzip ui.zip && rm ui.zip

# Build the project
RUN pnpm run build

# Start the server (Assuming it's a Node app or serving static files)
# You might need to adjust the start command based on the actual entry point
CMD ["pnpm", "start"]
